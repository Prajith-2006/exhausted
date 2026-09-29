# 🌿 Plant Disease Detection & Pesticide Recommendation System

An end-to-end AI-driven agricultural advisory system combining deep learning transfer learning (MobileNetV2) and bilingual agronomic intelligence (English + Telugu).

---

## 🎯 Architecture Overview

```
plant-disease-ai/
├── dataset/                         # Structured balanced dataset (3,000 images)
│   ├── train/                       # 70% split
│   │   ├── rice/                    # Brown Spot, Leaf Blast, Bacterial Blight, Healthy
│   │   ├── wheat/                   # Leaf Rust, Yellow Rust, Powdery Mildew, Healthy
│   │   ├── cotton/                  # Aphids, Whiteflies, Leaf Spot, Healthy
│   │   ├── tomato/                  # Early Blight, Late Blight, Leaf Curl, Healthy
│   │   └── potato/                  # Early Blight, Late Blight, Black Scurf, Healthy
│   ├── val/                         # 15% validation split
│   └── test/                        # 15% holdout test split
├── dataset_metadata.csv             # Full metadata registry (image_path, split, crop, disease)
├── generate_dataset.py              # Photorealistic leaf synthesis with lighting/angles/lesions
├── train_model.py                   # MobileNetV2 transfer learning training pipeline
├── pesticide_data.json              # Bilingual agronomic pesticide & organic remedy database
├── app.py                           # Flask REST API + UI server
├── templates/
│   └── index.html                   # Liquid glass responsive web interface
├── static/
│   ├── css/style.css                # Dark emerald glassmorphic stylesheet
│   └── js/main.js                   # Interactive client-side controller
├── requirements.txt                 # Dependencies
└── README.md                        # Documentation
```

---

## 🌾 Supported Crops & Diseases (20 Classes)

| Crop | Disease 1 | Disease 2 | Disease 3 | Control / Healthy |
| :--- | :--- | :--- | :--- | :--- |
| **Rice** | Brown Spot (*Bipolaris oryzae*) | Leaf Blast (*Magnaporthe oryzae*) | Bacterial Blight (*Xanthomonas*) | Healthy Canopy |
| **Wheat** | Leaf Rust (*Puccinia triticina*) | Yellow Rust (*P. striiformis*) | Powdery Mildew (*Blumeria*) | Healthy Wheat |
| **Cotton** | Aphids (*Aphis gossypii*) | Whiteflies (*Bemisia tabaci*) | Cercospora Leaf Spot | Healthy Cotton |
| **Tomato** | Early Blight (*Alternaria solani*) | Late Blight (*Phytophthora*) | Leaf Curl Virus (*ToLCV*) | Healthy Tomato |
| **Potato** | Early Blight (*Alternaria solani*) | Late Blight (*Phytophthora*) | Black Scurf (*Rhizoctonia*) | Healthy Foliage |

---

## 📊 Dataset Generation Strategy

Images are synthesized with agronomic realism:
1. **Morphology**: Exact botanical leaf contour profiles (elongated linear blades for Rice/Wheat, lobed for Cotton, serrated for Tomato, ovate clusters for Potato).
2. **Pathogen Lesions**: Target concentric rings, water-soaked margins, spindle lesions, powdery pustules, sclerotia crusts, and chlorotic halos.
3. **Lighting Variations**: Direct sun specular glare, overcast diffuse daylight, deep canopy shadows, and warm golden-hour shifts.
4. **Realistic Backgrounds**: Loam topsoil, open sky bokeh, farmer hand holding leaf, and field canopy.
5. **Perspective & Noise**: Rotational affine skews (-40° to +40°) and Gaussian optical sensor noise.

To generate or re-generate the dataset:
```bash
python3 generate_dataset.py --samples 150 --out dataset
```

---

## 🧠 Model Training (MobileNetV2)

The training pipeline employs **MobileNetV2** pretrained on ImageNet:
- **Input Dimension**: `224 x 224 x 3`
- **Data Augmentations**: Random horizontal flip, random rotation (±20°), color jitter (brightness, contrast, saturation)
- **Loss Function**: Categorical Cross-Entropy Loss
- **Optimizer**: Adam (`lr=0.001`) with `ReduceLROnPlateau` scheduler
- **Outputs**: `plant_model.pth`, `class_indices.json`, `confusion_matrix.png`, and `training_curves.png`

Run training:
```bash
python3 train_model.py --epochs 10 --batch-size 32 --dataset dataset
```

---

## 🌿 Pesticide Recommendation Engine

Every diagnosis maps to actionable bilingual agronomic intelligence:
- **Commercial & Active Ingredient**: Chemical classification (e.g. Carbendazim 50% WP, Mancozeb, Tilt, Ridomil MZ)
- **Calibrated Dosage**: Per liter and per acre water volume
- **Application Precautions**: Weather window, drift reduction, PPE gear
- **Eco-Friendly / Organic Alternative**: Neem oil, Trichoderma viride, fermented bio-solutions, buttermilk spray
- **Bilingual Output**: English & **తెలుగు (Telugu)**

---

## 🔌 Flask REST API Endpoints

### 1. Diagnostic Inference: `POST /predict`
**Request**: Multipart form with `image` file or JSON with base64 `image`.

**Response**:
```json
{
  "crop": "Rice",
  "crop_telugu": "వరి (Paddy)",
  "disease": "Brown Spot",
  "disease_telugu": "గోధుమ రంగు మచ్చ తెగులు (బ్రౌన్ స్పాట్)",
  "confidence": 94.5,
  "pathogen_type": "Fungal",
  "symptoms": "Small, oval, brown spots on leaves...",
  "symptoms_telugu": "ఆకులపై పసుపు రంగు వలయంతో కూడిన...",
  "pesticide": "Carbendazim 50% WP or Mancozeb 75% WP",
  "pesticide_telugu": "కార్బెండజిమ్ 50% WP లేదా మాంకోజెబ్ 75% WP",
  "dosage": "2 grams per liter of water (400-500g per acre)",
  "dosage_telugu": "లీటరు నీటికి 2 గ్రాములు (ఎకరానికి 400-500 గ్రాములు)",
  "precaution": "Avoid spraying during midday heat...",
  "precaution_telugu": "మధ్యాహ్నపు ఎండలో మందు చల్లరాదు...",
  "alternative": "Neem oil spray (5ml/L)...",
  "alternative_telugu": "వేప నూనె స్ప్రే (లీటరుకు 5 మి.లీ)...",
  "top3": [
    { "crop": "Rice", "disease": "Brown Spot", "confidence": 94.5 },
    { "crop": "Rice", "disease": "Leaf Blast", "confidence": 4.1 },
    { "crop": "Tomato", "disease": "Early Blight", "confidence": 1.4 }
  ],
  "low_confidence_warning": false
}
```

### 2. Full Directory: `GET /api/pesticides`
Returns the complete nested dictionary of crops and disease remedies.

### 3. Health Check: `GET /api/health`
Returns runtime status and active engine.

---

## 🚀 Running the Web Application

1. **Start the Flask Server**:
```bash
python3 app.py
```
2. **Open in Browser**:
Visit: `http://localhost:7000`

### Bonus Features Included:
- 🌐 **Instant English ↔ Telugu Language Switcher**
- 📷 **Live Camera Capture with Mobile/Webcam Support**
- 📊 **Animated Top-3 Differential Diagnoses Probabilities**
- ⚠️ **Low Confidence Scan (<60%) Warning Banner**
- ⚡ **1-Click Quick-Test Demo Samples**
- 📖 **Embedded Crop Protection Encyclopedia Modal**
