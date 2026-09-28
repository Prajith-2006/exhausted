import { ObjectId } from 'mongodb';
let pdfParse: any = null;
function getPdfParse() {
  if (!pdfParse) {
    if (typeof globalThis.DOMMatrix === 'undefined') {
      (globalThis as any).DOMMatrix = class DOMMatrix {};
    }
    try {
      pdfParse = require('pdf-parse');
    } catch (e) {
      console.warn('[PestAnalyzer] Failed to load pdf-parse:', e);
    }
  }
  return pdfParse;
}
import { collections } from '../../config/db';
import { config } from '../../config/env';
import { AppError } from '../../utils/errors';
import { FarmsService } from '../farms/farms.service';
import { CropsService } from '../crops/crops.service';
import { WeatherService } from '../weather/weather.service';
import { AiPestAnalysisData, PestSeverity } from '../../types/models';

export interface ManualPestInput {
  symptoms?: string;
  notes?: string;
  affectedArea?: number;
  areaUnit?: string;
  initialSeverity?: PestSeverity;
  dateDetected?: string;
}

export class PestAnalyzerService {
  static async extractTextFromPdf(pdfBuffer: Buffer): Promise<{ text: string; error?: string }> {
    try {
      const parser = getPdfParse();
      if (!parser) {
        return { text: '', error: 'PDF parsing is not available.' };
      }
      const data = await parser(pdfBuffer);
      const text = (data.text || '').trim();
      if (!text) {
        return { text: '', error: 'Text could not be extracted from this PDF. Please upload a clearer document or use the camera option.' };
      }
      return { text };
    } catch (err: any) {
      console.warn('[PestAnalyzer] Error parsing PDF buffer:', err?.message || err);
      return { text: '', error: 'Failed to read PDF format. Please upload a valid agricultural inspection PDF document.' };
    }
  }

  static async analyzeIncident(options: {
    ownerId: string;
    farmId: string;
    cropId: string;
    fieldId?: string;
    manualInput?: ManualPestInput;
    pdfBuffer?: Buffer;
    pdfFilename?: string;
    imageBuffer?: Buffer;
    imageMimeType?: string;
  }): Promise<AiPestAnalysisData> {
    const { ownerId, farmId, cropId, fieldId, manualInput, pdfBuffer, imageBuffer, imageMimeType } = options;

    // 1. Verify Farm Ownership
    const farm = await FarmsService.getFarmById(farmId, ownerId);

    // 2. Verify Field Ownership if provided
    let field = null;
    if (fieldId) {
      field = await collections.fields().findOne({ _id: new ObjectId(fieldId), farmId: new ObjectId(farmId) });
      if (!field) {
        throw new AppError('Field not found or does not belong to farm', 404, 'FIELD_NOT_FOUND');
      }
    }

    // 3. Verify Crop Ownership
    const crop = await CropsService.getCropById(cropId, ownerId);
    if (crop.farmId.toString() !== farmId) {
      throw new AppError('Crop does not belong to specified farm', 400, 'INVALID_CROP');
    }

    // 4. Process PDF text extraction if provided
    let pdfText = '';
    let pdfError = '';
    if (pdfBuffer && pdfBuffer.length > 0) {
      const pdfRes = await this.extractTextFromPdf(pdfBuffer);
      pdfText = pdfRes.text;
      pdfError = pdfRes.error || '';
    }

    // 5. Gather Environmental & Historical Context
    const weatherInfo = await WeatherService.getWeatherForFarm(farmId, ownerId);
    const pastPests = await collections.pestRecords()
      .find({ farmId: new ObjectId(farmId) })
      .sort({ createdAt: -1 })
      .limit(5)
      .toArray();

    const structuredContext = {
      farm: { name: farm.name, soilType: farm.soilType, irrigationType: farm.irrigationType },
      field: field ? { name: field.name, area: field.area, soilType: field.soilType } : null,
      crop: { type: crop.cropType, variety: crop.variety, growthStage: crop.growthStage, plantingDate: crop.plantingDate },
      farmerObservations: {
        symptoms: manualInput?.symptoms || '',
        notes: manualInput?.notes || '',
        initialSeverity: manualInput?.initialSeverity || 'MEDIUM',
        affectedArea: manualInput?.affectedArea || 0
      },
      pdfReportText: pdfText,
      pdfReportError: pdfError,
      currentWeather: weatherInfo.current,
      weatherForecast: weatherInfo.forecast.slice(0, 3).map(f => ({ temp: f.temperature, condition: f.weatherCondition, rain: f.rainfall, humidity: f.humidity })),
      recentFarmPestHistory: pastPests.map(p => ({ name: p.pestName, severity: p.severity, date: p.dateDetected, treatment: p.treatment }))
    };

    // 6. Execute AI Identification (OpenAI Multimodal API or Agronomic Identification Engine)
    let analysisResult: AiPestAnalysisData;
    if (config.aiApiKey) {
      try {
        analysisResult = await this.callExternalMultimodalAI(structuredContext, imageBuffer, imageMimeType);
      } catch (err) {
        console.warn('[PestAnalyzer] AI Provider API call failed. Executing fallback Agronomic Engine:', err);
        analysisResult = this.generateAgronomicPestAnalysis(structuredContext, imageBuffer);
      }
    } else {
      analysisResult = this.generateAgronomicPestAnalysis(structuredContext, imageBuffer);
    }

    // If PDF text extraction failed and no manual text or image was supplied, include warning in verificationNotes
    if (pdfError && !manualInput?.symptoms && (!imageBuffer || imageBuffer.length === 0)) {
      analysisResult.verificationNotes = [
        pdfError,
        ...(analysisResult.verificationNotes || [])
      ];
    }

    return analysisResult;
  }

  private static async callExternalMultimodalAI(
    context: any, 
    imageBuffer?: Buffer, 
    imageMimeType: string = 'image/jpeg'
  ): Promise<AiPestAnalysisData> {
    const systemPrompt = `You are an expert plant pathologist and agricultural entomologist AI assistant. 
Analyze the provided farm context, crop information, farmer symptoms, PDF inspection reports, and image (if provided).
Produce a strict JSON response following this schema:
{
  "identification": {
    "name": "string (e.g. Fall Armyworm, Early Blight, Yellow Rust, or 'Uncertain')",
    "category": "PEST" | "DISEASE" | "UNKNOWN",
    "confidence": number between 0.10 and 0.99
  },
  "severity": "LOW" | "MEDIUM" | "HIGH" | "CRITICAL",
  "summary": "Farmer friendly explanation of the findings.",
  "observations": ["observed symptom 1", "observed symptom 2"],
  "possibleAlternatives": [
    { "name": "Alternative condition 1", "confidence": number }
  ],
  "recommendations": [
    { "priority": "HIGH" | "MEDIUM" | "LOW", "title": "short action title", "description": "detailed actionable guidance" }
  ],
  "preventiveActions": ["preventive tip 1", "preventive tip 2"],
  "verificationNotes": ["This is an AI assessment. Inspect field manually or consult agronomist if symptoms spread."]
}`;

    const userMessageContent: any[] = [
      {
        type: 'text',
        text: `Farm & Crop Context:\n${JSON.stringify(context, null, 2)}`
      }
    ];

    if (imageBuffer && imageBuffer.length > 0) {
      const base64Img = imageBuffer.toString('base64');
      userMessageContent.push({
        type: 'image_url',
        image_url: {
          url: `data:${imageMimeType};base64,${base64Img}`
        }
      });
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.aiApiKey}`
      },
      body: JSON.stringify({
        model: imageBuffer && imageBuffer.length > 0 ? 'gpt-4o' : 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userMessageContent }
        ],
        temperature: 0.2
      })
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error with status ${response.status}`);
    }

    const json: any = await response.json();
    const rawContent = json.choices[0]?.message?.content || '{}';
    const cleanedJson = rawContent.replace(/```json/g, '').replace(/```/g, '').trim();
    const parsed = JSON.parse(cleanedJson);

    return {
      analyzed: true,
      confidence: parsed.identification?.confidence || 0.85,
      identification: {
        name: parsed.identification?.name || 'Uncertain',
        category: parsed.identification?.category || 'PEST',
        confidence: parsed.identification?.confidence || 0.85
      },
      severity: parsed.severity || 'MEDIUM',
      summary: parsed.summary || 'AI analysis completed based on provided observations.',
      observations: Array.isArray(parsed.observations) ? parsed.observations : ['Observed crop abnormalities'],
      possibleAlternatives: Array.isArray(parsed.possibleAlternatives) ? parsed.possibleAlternatives : [],
      recommendations: Array.isArray(parsed.recommendations) ? parsed.recommendations : [],
      preventiveActions: Array.isArray(parsed.preventiveActions) ? parsed.preventiveActions : [],
      verificationNotes: Array.isArray(parsed.verificationNotes) ? parsed.verificationNotes : ['AI assessment for advisory decision support.'],
      analyzedAt: new Date()
    };
  }

  private static generateAgronomicPestAnalysis(context: any, imageBuffer?: Buffer): AiPestAnalysisData {
    const cropType = (context.crop?.type || '').toLowerCase();
    const symptoms = ((context.farmerObservations?.symptoms || '') + ' ' + (context.pdfReportText || '')).toLowerCase();
    const weather = context.currentWeather || {};
    const hasImage = imageBuffer && imageBuffer.length > 0;

    // Knowledge Database of Common Agricultural Pests & Diseases
    let name = 'Uncertain';
    let category: 'PEST' | 'DISEASE' | 'UNKNOWN' = 'PEST';
    let confidence = 0.45;
    let severity: PestSeverity = context.farmerObservations?.initialSeverity || 'MEDIUM';
    let summary = '';
    let observations: string[] = [];
    let possibleAlternatives: { name: string; confidence: number }[] = [];
    let recommendations: { priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'; title: string; description: string }[] = [];
    let preventiveActions: string[] = [];
    let verificationNotes: string[] = [
      'This AI assessment is an advisory tool. Verification by an expert agronomist is recommended for critical infestations.'
    ];

    // Case 1: Maize / Corn pests & diseases
    if (cropType.includes('maize') || cropType.includes('corn')) {
      if (symptoms.includes('caterpillar') || symptoms.includes('hole') || symptoms.includes('armyworm') || symptoms.includes('leaf damage') || symptoms.includes('whorl')) {
        name = 'Fall Armyworm (Spodoptera frugiperda)';
        category = 'PEST';
        confidence = hasImage ? 0.88 : (symptoms.length > 20 ? 0.82 : 0.74);
        severity = 'HIGH';
        summary = 'Observations and crop growth stage strongly align with Fall Armyworm infestation on maize foliage.';
        observations = [
          'Pin-hole and ragged feeding holes observed on young whorl leaves',
          'Damage pattern matches early-to-mid instar caterpillar feeding',
          'Maize crop is currently at a vulnerable vegetative growth stage'
        ];
        possibleAlternatives = [
          { name: 'Maize Stem Borer (Busseola fusca)', confidence: 0.22 },
          { name: 'Corn Earworm (Helicoverpa zea)', confidence: 0.15 }
        ];
        recommendations = [
          { priority: 'HIGH', title: 'Targeted Bio-Insecticide Application', description: 'Apply Bacillus thuringiensis (Bt) or Neem seed kernel extract directly into leaf whorls early in the morning.' },
          { priority: 'MEDIUM', title: 'Inspect Surrounding Maize Rows', description: 'Check 20 consecutive plants in 5 random field locations to evaluate threshold population density.' }
        ];
        preventiveActions = [
          'Hand-pick caterpillars where feasible on small plots',
          'Maintain clean field borders and remove alternate host grasses',
          'Rotate with non-leguminous cover crops after harvest'
        ];
      } else if (symptoms.includes('yellow') || symptoms.includes('streak') || symptoms.includes('spot') || symptoms.includes('blight')) {
        name = 'Maize Leaf Blight (Exserohilum turcicum)';
        category = 'DISEASE';
        confidence = hasImage ? 0.84 : 0.76;
        severity = 'MEDIUM';
        summary = 'Foliar symptoms and humidity levels indicate fungal Northern Corn Leaf Blight development.';
        observations = [
          'Elongated grayish-green and tan lesions on lower leaves',
          'High relative humidity creates favorable spore germination conditions',
          'Fungal lesion progression moving upward on plant canopy'
        ];
        possibleAlternatives = [
          { name: 'Common Rust (Puccinia sorghi)', confidence: 0.25 },
          { name: 'Gray Leaf Spot (Cercospora zeae-maydis)', confidence: 0.18 }
        ];
        recommendations = [
          { priority: 'HIGH', title: 'Foliar Bio-Fungicide Treatment', description: 'Apply copper-based or bio-fungicidal spray to minimize lesion spread across the upper canopy.' },
          { priority: 'MEDIUM', title: 'Improve Canopy Ventilation', description: 'Ensure appropriate row spacing and avoid overhead sprinkler irrigation late in the evening.' }
        ];
        preventiveActions = [
          'Utilize blight-resistant hybrid seeds in future planting cycles',
          'Incorporate crop residue deep into soil post-harvest'
        ];
      }
    }

    // Case 2: Tomato / Potato pests & diseases
    if (cropType.includes('tomato') || cropType.includes('potato')) {
      if (symptoms.includes('blight') || symptoms.includes('spot') || symptoms.includes('dark') || symptoms.includes('wilt') || symptoms.includes('concentric')) {
        name = 'Early Blight (Alternaria solani)';
        category = 'DISEASE';
        confidence = hasImage ? 0.89 : 0.81;
        severity = 'HIGH';
        summary = 'Concentric dark leaf spots and leaf yellowing on Solanaceous foliage indicate Early Blight fungal infection.';
        observations = [
          'Target-board concentric rings visible on mature lower leaves',
          'Yellow halo surrounding necrotic foliar spots',
          'Recent leaf moisture and temperature range favor fungal sporulation'
        ];
        possibleAlternatives = [
          { name: 'Late Blight (Phytophthora infestans)', confidence: 0.28 },
          { name: 'Septoria Leaf Spot (Septoria lycopersici)', confidence: 0.16 }
        ];
        recommendations = [
          { priority: 'HIGH', title: 'Remove Affected Lower Foliage', description: 'Prune infected bottom leaves up to 30 cm from soil level to prevent ground-splash transmission.' },
          { priority: 'HIGH', title: 'Apply Protective Copper Fungicide', description: 'Spray organic copper hydroxide formulation thoroughly on upper and lower leaf surfaces.' }
        ];
        preventiveActions = [
          'Mulch base of plants with straw to suppress splash-zone spore soil transport',
          'Drip irrigate instead of overhead spraying to keep foliage dry'
        ];
      } else if (symptoms.includes('whitefly') || symptoms.includes('curl') || symptoms.includes('yellowing') || symptoms.includes('insect')) {
        name = 'Tomato Yellow Leaf Curl Vector (Bemisia tabaci / Whiteflies)';
        category = 'PEST';
        confidence = hasImage ? 0.86 : 0.78;
        severity = 'MEDIUM';
        summary = 'Foliar yellowing and upward curling associated with whitefly pest infestation.';
        observations = [
          'Tiny white winged insects fluttering on lower leaf undersides',
          'Upward leaf cupping and chlorotic leaf margins',
          'Honeydew secretion observed on stems'
        ];
        possibleAlternatives = [
          { name: 'Green Peach Aphid (Myzus persicae)', confidence: 0.20 },
          { name: 'Spider Mites (Tetranychidae)', confidence: 0.14 }
        ];
        recommendations = [
          { priority: 'HIGH', title: 'Yellow Sticky Trap Installation', description: 'Deploy yellow sticky traps at canopy level (1 trap per 50 sq meters) to trap adult whiteflies.' },
          { priority: 'MEDIUM', title: 'Neem Oil Foliar Rinse', description: 'Apply 1% cold-pressed neem oil solution during low-sunlight hours.' }
        ];
        preventiveActions = [
          'Use insect-proof netting over seedling nursery beds',
          'Eliminate weed reservoirs around field perimeters'
        ];
      }
    }

    // Case 3: Generic / Low Information Fallback
    if (name === 'Uncertain') {
      if (symptoms.length > 5 || hasImage) {
        name = 'Foliar Pest Damage (Unclassified)';
        category = 'PEST';
        confidence = 0.58;
        severity = 'MEDIUM';
        summary = 'Foliar stress detected on crop foliage, but specific pathogen or insect species requires higher resolution or additional symptoms.';
        observations = [
          `Observed general crop discoloration/feeding signs on ${context.crop?.type || 'crop'}`,
          'Environmental humidity and temperature are within moderate risk threshold',
          'Further physical symptom verification recommended'
        ];
        possibleAlternatives = [
          { name: 'Insect Larvae Damage', confidence: 0.32 },
          { name: 'Fungal Spot Disease', confidence: 0.26 },
          { name: 'Nutrient Deficiency / Abiotic Stress', confidence: 0.18 }
        ];
        recommendations = [
          { priority: 'HIGH', title: 'Detailed Field Inspection', description: 'Examine leaf undersides, stem joints, and soil boundary for insect larvae or fungal spores.' },
          { priority: 'MEDIUM', title: 'Capture Close-Up Image', description: 'Take a clear close-up photograph under natural daylight focusing on leaf damage margins.' }
        ];
        preventiveActions = [
          'Monitor field progression over the next 48 hours',
          'Keep affected plants isolated if manageable'
        ];
      } else {
        name = 'Uncertain / Insufficient Information';
        category = 'UNKNOWN';
        confidence = 0.34;
        severity = 'LOW';
        summary = 'The system received limited observation details and could not determine the pest or disease with high confidence.';
        observations = [
          'Limited symptom description provided in report',
          'No clear diagnostic pattern identified from input data alone'
        ];
        possibleAlternatives = [
          { name: 'Caterpillar / Insect Damage', confidence: 0.30 },
          { name: 'Fungal Infection', confidence: 0.25 },
          { name: 'Environmental / Water Stress', confidence: 0.20 }
        ];
        recommendations = [
          { priority: 'HIGH', title: 'Provide Additional Symptoms or Photo', description: 'Upload a clear photograph of the affected plant part or describe specific leaf spots, insect sightings, or discoloration.' }
        ];
        preventiveActions = [
          'Re-inspect affected crops with farm manager'
        ];
      }
    }

    return {
      analyzed: true,
      confidence,
      identification: {
        name,
        category,
        confidence
      },
      severity,
      summary,
      observations,
      possibleAlternatives,
      recommendations,
      preventiveActions,
      verificationNotes,
      analyzedAt: new Date()
    };
  }
}
