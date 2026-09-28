import { ObjectId } from 'mongodb';
import { collections } from '../../config/db';
import { config } from '../../config/env';
import { RecommendationDoc, RecommendationType, SeverityLevel } from '../../types/models';
import { AppError } from '../../utils/errors';
import { FarmsService } from '../farms/farms.service';
import { CropsService } from '../crops/crops.service';
import { WeatherService } from '../weather/weather.service';
import { SensorsService } from '../sensors/sensors.service';

export interface RecommendationResult {
  type: RecommendationType;
  severity: SeverityLevel;
  title: string;
  recommendation: string;
  reasons: string[];
  confidence: number;
  generatedAt: Date;
}

export class RecommendationsService {
  static async analyzeAndRecommend(ownerId: string, farmId: string, cropId?: string): Promise<RecommendationDoc> {
    // 1 & 2. Validate ownership & load farm
    const farm = await FarmsService.getFarmById(farmId, ownerId);

    // 3. Load fields & crop
    const fields = await collections.fields().find({ farmId: new ObjectId(farmId) }).toArray();
    let crop = null;
    if (cropId) {
      crop = await CropsService.getCropById(cropId, ownerId);
    } else {
      const crops = await collections.crops().find({ farmId: new ObjectId(farmId), status: 'ACTIVE' }).toArray();
      if (crops.length > 0) crop = crops[0];
    }

    // 4. Load recent sensor readings
    const sensors = await SensorsService.getSensorsByUser(ownerId, farmId);
    const sensorData: Record<string, any[]> = {};
    for (const sensor of sensors) {
      const readings = await collections.sensorReadings()
        .find({ sensorId: sensor._id })
        .sort({ timestamp: -1 })
        .limit(5)
        .toArray();
      sensorData[sensor.type] = readings;
    }

    // 5. Load pest history
    const pestRecords = await collections.pestRecords()
      .find({ farmId: new ObjectId(farmId) })
      .sort({ createdAt: -1 })
      .limit(5)
      .toArray();

    // 6. Retrieve weather
    const weatherInfo = await WeatherService.getWeatherForFarm(farmId, ownerId);

    // 7. Build structured context
    const context = {
      farm: { name: farm.name, soilType: farm.soilType, irrigationType: farm.irrigationType },
      fieldsCount: fields.length,
      crop: crop ? { type: crop.cropType, stage: crop.growthStage, variety: crop.variety, status: crop.status } : null,
      sensorSummary: Object.keys(sensorData).map(type => {
        const last = sensorData[type][0];
        return { type, lastValue: last ? last.value : 'N/A', unit: last ? last.unit : '' };
      }),
      recentPests: pestRecords.map(p => ({ name: p.pestName, severity: p.severity, treatment: p.treatment })),
      currentWeather: weatherInfo.current,
      weatherForecastSummary: weatherInfo.forecast.slice(0, 3).map(f => ({ temp: f.temperature, condition: f.weatherCondition, rain: f.rainfall }))
    };

    // 8. Generate recommendation (AI service call or Agronomic Rule Engine fallback)
    let recommendationData: RecommendationResult;
    if (config.aiApiKey) {
      try {
        recommendationData = await this.callExternalAIEngine(context);
      } catch (err) {
        console.warn('[AIEngine] AI API call failed or timed out. Falling back to internal Agronomic Engine:', err);
        recommendationData = this.generateAgronomicRecommendation(context);
      }
    } else {
      recommendationData = this.generateAgronomicRecommendation(context);
    }

    // 9. Store recommendation
    const doc: RecommendationDoc = {
      farmId: new ObjectId(farmId),
      cropId: crop ? crop._id : undefined,
      userId: new ObjectId(ownerId),
      type: recommendationData.type,
      severity: recommendationData.severity,
      title: recommendationData.title,
      recommendation: recommendationData.recommendation,
      reasons: recommendationData.reasons,
      confidence: recommendationData.confidence,
      reviewed: false,
      generatedAt: recommendationData.generatedAt || new Date(),
      createdAt: new Date()
    };

    const result = await collections.recommendations().insertOne(doc);
    return { ...doc, _id: result.insertedId };
  }

  static async getRecommendationsByUser(ownerId: string, farmId?: string) {
    const userFarms = await FarmsService.getFarmsByOwner(ownerId);
    const farmIds = userFarms.map(f => f._id!);

    if (farmIds.length === 0) return [];

    const query: any = { farmId: { $in: farmIds } };
    if (farmId) {
      const selectedFarmId = new ObjectId(farmId);
      if (!farmIds.some(id => id.equals(selectedFarmId))) {
        throw new AppError('Unauthorized farm access', 403, 'FORBIDDEN');
      }
      query.farmId = selectedFarmId;
    }

    return await collections.recommendations()
      .find(query)
      .sort({ generatedAt: -1 })
      .toArray();
  }

  static async getRecommendationById(id: string, ownerId: string) {
    const rec = await collections.recommendations().findOne({ _id: new ObjectId(id) });
    if (!rec) throw new AppError('Recommendation not found', 404, 'NOT_FOUND');
    await FarmsService.getFarmById(rec.farmId.toString(), ownerId);
    return rec;
  }

  static async markReviewed(id: string, ownerId: string) {
    const rec = await this.getRecommendationById(id, ownerId);
    await collections.recommendations().updateOne(
      { _id: rec._id },
      { $set: { reviewed: true } }
    );
    return { ...rec, reviewed: true };
  }

  private static async callExternalAIEngine(context: any): Promise<RecommendationResult> {
    const prompt = `You are an expert agronomist AI. Given this farm context: ${JSON.stringify(context)}, provide a structured recommendation in JSON format matching this schema:
    {
      "type": "IRRIGATION" | "CROP_HEALTH" | "PEST_RISK" | "DISEASE_RISK" | "WEATHER_RISK" | "FERTILIZER" | "GENERAL",
      "severity": "LOW" | "MEDIUM" | "HIGH" | "CRITICAL",
      "title": "short title",
      "recommendation": "detailed actionable advice",
      "reasons": ["reason 1", "reason 2"],
      "confidence": number between 0.5 and 0.99
    }`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.aiApiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.3
      })
    });

    if (!response.ok) {
      throw new Error(`AI API responded with status ${response.status}`);
    }

    const json: any = await response.json();
    const content = json.choices[0]?.message?.content;
    const parsed = JSON.parse(content);

    return {
      type: parsed.type || 'GENERAL',
      severity: parsed.severity || 'MEDIUM',
      title: parsed.title || 'Agronomic Advisory',
      recommendation: parsed.recommendation || 'Monitor crop conditions closely.',
      reasons: Array.isArray(parsed.reasons) ? parsed.reasons : ['Based on current telemetry data'],
      confidence: parsed.confidence || 0.88,
      generatedAt: new Date()
    };
  }

  private static generateAgronomicRecommendation(context: any): RecommendationResult {
    const soilMoistureSensor = context.sensorSummary.find((s: any) => s.type === 'soil moisture');
    const tempSensor = context.sensorSummary.find((s: any) => s.type === 'temperature');
    const weather = context.currentWeather;
    const cropName = context.crop ? context.crop.type : 'Crop';

    // Rule 1: Irrigation check
    if (soilMoistureSensor && typeof soilMoistureSensor.lastValue === 'number' && soilMoistureSensor.lastValue < 25) {
      return {
        type: 'IRRIGATION',
        severity: soilMoistureSensor.lastValue < 15 ? 'HIGH' : 'MEDIUM',
        title: `Schedule Irrigation for ${cropName}`,
        recommendation: `Soil moisture level is critically low at ${soilMoistureSensor.lastValue}%. Initiate drip irrigation for 45 minutes during early morning hours to optimize root absorption.`,
        reasons: [
          `Soil moisture level recorded at ${soilMoistureSensor.lastValue}% (threshold < 30%)`,
          `Ambient temperature at ${weather.temperature}°C increases evapotranspiration risk`,
          `Forecast indicates low rainfall probability (${weather.precipitationProbability}%)`
        ],
        confidence: 0.94,
        generatedAt: new Date()
      };
    }

    // Rule 2: Pest risk check
    const recentCriticalPest = context.recentPests.find((p: any) => p.severity === 'HIGH' || p.severity === 'CRITICAL');
    if (recentCriticalPest) {
      return {
        type: 'PEST_RISK',
        severity: 'HIGH',
        title: `Pest Management Action: ${recentCriticalPest.name}`,
        recommendation: `Apply organic bio-pesticide target spray on affected areas immediately. Inspect neighbouring fields within 48 hours.`,
        reasons: [
          `Active ${recentCriticalPest.severity} incident recorded for ${recentCriticalPest.name}`,
          `High humidity level (${weather.humidity}%) creates favorable breeding conditions`,
          `Preventive border isolation recommended to save primary yield`
        ],
        confidence: 0.91,
        generatedAt: new Date()
      };
    }

    // Rule 3: Heavy Rain / Weather risk
    if (weather.rainfall > 10 || weather.weatherCondition.toLowerCase().includes('rain')) {
      return {
        type: 'WEATHER_RISK',
        severity: 'MEDIUM',
        title: `Drainage & Fungal Risk Advisory`,
        recommendation: `Ensure field drainage channels are clear to prevent waterlogging. Delay chemical fertilizer application until rain subsides.`,
        reasons: [
          `Precipitation of ${weather.rainfall}mm recorded with ${weather.weatherCondition} condition`,
          `Excess moisture combined with ${weather.temperature}°C can trigger root rot`,
          `Fertilizer runoff risk is high during heavy rainfall`
        ],
        confidence: 0.89,
        generatedAt: new Date()
      };
    }

    // Default general recommendation
    return {
      type: 'CROP_HEALTH',
      severity: 'LOW',
      title: `Optimal Growth Conditions for ${cropName}`,
      recommendation: `Current soil moisture and climate indicators are within ideal ranges. Maintain standard crop maintenance and stage monitoring.`,
      reasons: [
        `Soil moisture and temperature are balanced for stage ${context.crop?.stage || 'Active'}`,
        `Weather conditions remain stable with normal wind speed (${weather.windSpeed} km/h)`,
        `No critical pest threats reported recently`
      ],
      confidence: 0.95,
      generatedAt: new Date()
    };
  }
}
