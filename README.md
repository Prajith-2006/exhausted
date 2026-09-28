# Smart Farmer Platform — Production Build

A complete full-stack web application designed for farmers to manage farms, fields, crops, IoT telemetry sensors, weather forecasts, pest incidents, and AI-driven agronomic recommendations.

---

## 🚀 Key Features

* 🌾 **Farm & Field Management**: Full CRUD operations for farm land boundaries, soil properties, and sub-plots with strict resource ownership enforcement.
* 🌱 **Crop Lifecycle Tracker**: Track crop types, varieties, planting schedules, expected harvest dates, and real-time growth stages.
* 📡 **IoT Telemetry & Sensors**: Live ingestion of soil moisture, temperature, pH, humidity, and rainfall readings with threshold-based alert generation.
* 🌦️ **Weather Integration**: OpenWeatherMap integration with built-in agronomic fallback adapter for uninterrupted offline/local operation.
* 🤖 **AI Agronomic Advisory Engine**: Context-driven recommendation engine synthesizing multi-field data, weather forecasts, and pest history with OpenAI integration and rule-based fallback.
* 🐛 **AI Pest & Disease Identification**: Multimodal incident reporting workflow (Manual descriptions, PDF inspection reports, and Live Camera capture) powered by in-memory context analysis, confidence scoring (e.g. 87%), advisory disclaimers, and farmer review before persistence.
* 🔔 **Alert Center**: Automated alerts triggered by low soil moisture or critical pest incidents with browser notification support.
* 📊 **Analytical Aggregation Reports**: MongoDB aggregation pipelines providing structured analytical reports.
* 🎨 **Modern Liquid Glass Design System**: Deep dark mode UI built with Vanilla CSS design tokens, responsive cards, modals, and fluid micro-interactions.

---

## 🛠 Tech Stack

### Backend
* **Runtime**: Node.js with TypeScript
* **Framework**: Express.js
* **Database**: MongoDB (Native MongoDB Driver v6)
* **Authentication**: JSON Web Tokens (JWT) & bcryptjs
* **Testing**: Jest & Supertest

### Frontend
* **Library**: React 18
* **Build Tool**: Vite
* **Styling**: Vanilla CSS (Custom Design System, CSS Variables, Glassmorphic Aesthetics)
* **Routing**: React Router DOM v6
* **Icons**: Lucide React

---

## 📂 Project Structure

```
smart-farmer/
├── backend/
│   ├── src/
│   │   ├── config/          # DB connection, env variables, auto-indexing
│   │   ├── middleware/      # JWT Auth, ownership verification, error handling, request logging
│   │   ├── modules/         # Domain-driven modules (auth, farms, fields, crops, sensors, pests, weather, recommendations, alerts, reports)
│   │   ├── scripts/         # Seed script for demo database population
│   │   ├── tests/           # Integration & Unit test suite
│   │   ├── app.ts           # Express app setup
│   │   └── server.ts        # Entry point
│   ├── package.json
│   └── tsconfig.json
├── frontend/
│   ├── src/
│   │   ├── components/      # Glass cards, modals, badges, empty states, spinners, navbar, sidebar
│   │   ├── context/         # AuthContext, FarmContext
│   │   ├── layouts/         # MainLayout wrapper
│   │   ├── pages/           # Login, Register, Dashboard, Farms, Crops, Weather, Sensors, Pests, Recommendations, Alerts, Reports, Settings
│   │   ├── router/          # AppRouter with Auth Guards
│   │   ├── services/        # Central API client
│   │   ├── styles/          # Design tokens (variables.css) and global styling (index.css)
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── package.json
│   └── vite.config.js
├── docs/
│   ├── api.md               # API endpoint specifications
│   └── architecture.md      # Technical architecture documentation
└── README.md
```

---

## ⚙️ Quick Start Instructions

### 1. Environment Setup
Create a `.env` file in `smart-farmer/backend/.env`:
```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/smart_farmer
JWT_SECRET=super_secret_jwt_key_smart_farmer_2026
WEATHER_API_KEY=
AI_API_KEY=
```

### 2. Backend Setup & Seeding
```bash
cd backend
npm install
npm run seed       # Populates MongoDB with sample demo farmer, farms, crops, sensors, and readings
npm test           # Executes backend integration test suite
npm run dev        # Starts Express server on http://localhost:5000
```

### 3. Frontend Setup & Run
```bash
cd frontend
npm install
npm run dev        # Starts Vite dev server on http://localhost:3000
```

---

## 🔑 Demo Credentials

* **Phone Number**: `+919876543210`
* **Password**: `Password123!`
