# Smart Farmer Platform — Architecture & Technical Specifications

## 1. Executive Summary
The **Smart Farmer Platform** is a full-stack, modular web application designed for agricultural monitoring, IoT telemetry tracking, weather forecasting, pest management, and AI-driven agronomic advisory.

The system is built with a **TypeScript Node.js/Express backend** utilizing the **Native MongoDB Driver**, paired with a **React (Vite / Vanilla CSS)** frontend.

---

## 2. System Architecture Diagram

```
+-------------------------------------------------------------------------+
|                              React Frontend                             |
|    (Vite / React Router / Vanilla CSS Design System / AuthContext)      |
+------------------------------------+------------------------------------+
                                     |  HTTPS / REST API
                                     v
+-------------------------------------------------------------------------+
|                            Node.js / Express                            |
|    (TypeScript / JWT Auth / Ownership Guard / Aggregation Engine)       |
+---------+------------------+-------------------+------------------+-----+
          |                  |                   |                  |
          v                  v                   v                  v
+------------------+ +---------------+ +------------------+ +-----------------+
|  MongoDB Native  | |  Weather Service| | AI Advisory Engine| | Threshold Alert |
|  Collection Driver| | (OpenWeather /| | (OpenAI / Agronomic| | Trigger Engine  |
|  (Indexes Enabled)| | Mock Fallback)| | Rule Engine)     | |                |
+------------------+ +---------------+ +------------------+ +-----------------+
```

---

## 3. Database Schema (11 MongoDB Collections)

The application relies on 11 collections defined in `backend/src/types/models.ts`:

1. **`users`**: Farmer credentials (hashed with bcrypt), roles, preferred language.
2. **`farms`**: Top-level farm boundary (total area, location coords, soil type, irrigation type).
3. **`fields`**: Sub-plot land divisions linked to `farmId`.
4. **`crops`**: Cultivated crops linked to `farmId` and `fieldId`, growth stages, planting schedule.
5. **`sensors`**: Registered IoT telemetry hardware (`soil moisture`, `temperature`, `soil pH`, `humidity`, `rainfall`).
6. **`sensorReadings`**: High-frequency time-series telemetry records linked to `sensorId`. Indexed by `(sensorId, timestamp)`.
7. **`pestRecords`**: Historical pest & disease outbreaks (`LOW`, `MEDIUM`, `HIGH`, `CRITICAL`), treatments applied.
8. **`weatherRecords`**: Cached micro-climate history & forecast snapshots.
9. **`recommendations`**: Generated AI agronomic insights with statistical confidence scores and reasoning lists.
10. **`alerts`**: Automated warnings triggered by sensor thresholds and pest severity.
11. **`reports`**: Aggregated analytical snapshots generated via MongoDB aggregation pipelines.

---

## 4. Security & Resource Ownership

* **JWT Authentication**: Tokens carry farmer identity (`id`, `role`, `phone`).
* **Resource Ownership Guard**: Every service layer method (`FarmsService`, `CropsService`, `SensorsService`, etc.) explicitly checks `ownerId === authenticatedUserId` before permitting reads, edits, or deletions.
* **Input Validation & Sanitization**: Enforced using custom HTTP error classes (`AppError`, `400 Bad Request`, `403 Forbidden`, `404 Not Found`).

---

## 5. Third-Party Resiliency & Fallback Adapters

* **Weather Adapter**: Intercepts missing API keys or external network failures by automatically switching to a deterministic agronomic climate simulation engine.
* **AI Recommendation Engine**: Combines context vectors (Soil moisture, temperature, pest history, crop stage) and runs an internal rule-based agronomic inference engine if external OpenAI endpoints are unreachable.

---

## 6. AI-Assisted Pest & Disease Identification Architecture

```
+-----------------------------------------------------------------------------+
|                      Farmer Incident Report Workflow                         |
|   [ 📝 Manual Details ]   [ 📄 PDF Document Upload ]   [ 📷 Live Camera ]   |
+--------------------------------------+--------------------------------------+
                                       |
                                       v
+-----------------------------------------------------------------------------+
|                     PestAnalyzerService (Backend Engine)                    |
|  - In-Memory PDF Text Extraction (pdf-parse)                               |
|  - Multipart File Validation (MIME / 10MB Limit / No Cloud Persistence)     |
|  - Context Aggregation: Crop Stage + Field Soil + Weather Forecast + History|
+--------------------------------------+--------------------------------------+
                                       |
                                       v
+-----------------------------------------------------------------------------+
|                    Multimodal AI Assessment & Review                        |
|  - Multimodal AI Vision/Text Prompting (OpenAI GPT-4o / Agronomic Engine)   |
|  - Advisory Output: Confidence Score, Identification, Severity & Actions     |
|  - Advisory Disclaimer: Farmer Review & Manual Edit Before MongoDB Persistence|
+-----------------------------------------------------------------------------+
```

* **Multi-Modal Data Ingestion**: Supports manual observation text, uploaded inspection PDFs, and camera photos.
* **Security & In-Memory Processing**: Uploaded files are validated for MIME type (`application/pdf`, `image/jpeg`, `image/png`, `image/webp`) and processed strictly in-memory without external third-party cloud storage dependency.
* **Advisory Decision Support**: All AI results include confidence scoring (e.g. 87%), observed indicators, alternative causes, and an explicit advisory disclaimer emphasizing farmer review before saving to MongoDB.
