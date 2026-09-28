# Smart Farmer Platform — REST API Reference

Base URL: `http://localhost:5000/api/v1`

All responses follow a standard JSON response wrapper:
```json
{
  "success": true,
  "data": { ... },
  "error": null
}
```

---

## 1. Authentication (`/api/v1/auth`)

* `POST /api/v1/auth/register` — Register a new farmer account
  * Body: `{ "name": "John Doe", "phone": "+15550192834", "password": "Password123!", "preferredLanguage": "en" }`
* `POST /api/v1/auth/login` — Authenticate and retrieve JWT token
  * Body: `{ "phone": "+15550192834", "password": "Password123!" }`
* `GET /api/v1/auth/me` — Get current logged-in user profile (Requires Header `Authorization: Bearer <token>`)

---

## 2. Farms (`/api/v1/farms`)

* `GET /api/v1/farms` — List farms owned by farmer
* `POST /api/v1/farms` — Create a new farm
* `GET /api/v1/farms/:id` — Get farm details
* `PATCH /api/v1/farms/:id` — Update farm properties
* `DELETE /api/v1/farms/:id` — Delete farm and sub-resources

---

## 3. Fields (`/api/v1/fields` & `/api/v1/farms/:farmId/fields`)

* `GET /api/v1/farms/:farmId/fields` — List fields in farm
* `POST /api/v1/farms/:farmId/fields` — Create a new sub-plot field
* `PATCH /api/v1/fields/:id` — Update field specs
* `DELETE /api/v1/fields/:id` — Delete field

---

## 4. Crops (`/api/v1/crops`)

* `GET /api/v1/crops?farmId=<id>` — List active and historical crops
* `POST /api/v1/crops` — Register crop cultivation record
* `PATCH /api/v1/crops/:id` — Update growth stage or status (`PLANNED`, `ACTIVE`, `HARVESTED`, `FAILED`)
* `DELETE /api/v1/crops/:id` — Remove crop record

---

## 5. Sensors & Telemetry (`/api/v1/sensors`)

* `GET /api/v1/sensors?farmId=<id>` — List connected IoT sensors
* `POST /api/v1/sensors` — Register IoT sensor hardware
* `POST /api/v1/sensors/:id/readings` — Log telemetry reading (Triggers automated low-moisture alerts if value < 20%)
* `GET /api/v1/sensors/:id/readings` — Get time-series readings

---

## 6. Pest Records (`/api/v1/pests`)

* `GET /api/v1/pests?farmId=<id>` — List pest & disease history
* `POST /api/v1/pests` — Log pest incident (Triggers HIGH/CRITICAL alerts if severity high). Accepts optional `fieldId` and `aiAnalysis` metadata object.
* `POST /api/v1/pests/analyze` — Multimodal AI-assisted pest and disease identification endpoint.
  * Content-Type: `multipart/form-data` or `application/json`
  * Form Fields: `farmId`, `cropId`, `fieldId`, `symptoms`, `notes`, `initialSeverity`, `affectedArea`, `areaUnit`, `dateDetected`.
  * Upload Files: `pdf` (Inspection report PDF document, max 10MB), `image` (Camera or uploaded crop photo, max 10MB).
  * Returns structured advisory assessment with identification name, confidence percentage, severity rating, observed indicators, alternative causes, prioritized actions, and advisory disclaimers.

---

## 7. Weather (`/api/v1/weather`)

* `GET /api/v1/weather/farm/:farmId` — Get live weather metrics and 5-day forecast

---

## 8. AI Recommendations (`/api/v1/recommendations`)

* `POST /api/v1/recommendations/analyze` — Trigger context analysis and AI rule inference
  * Body: `{ "farmId": "<farmId>", "cropId": "<cropId>" }`
* `GET /api/v1/recommendations?farmId=<id>` — List generated recommendations
* `PATCH /api/v1/recommendations/:id/review` — Mark recommendation as reviewed

---

## 9. Alerts (`/api/v1/alerts`)

* `GET /api/v1/alerts?unread=true` — Fetch farmer alerts
* `PATCH /api/v1/alerts/:id/read` — Mark single alert read
* `PATCH /api/v1/alerts/read-all` — Mark all alerts read

---

## 10. Analytical Reports (`/api/v1/reports`)

* `GET /api/v1/reports/farm/:farmId` — Farm summary metrics
* `GET /api/v1/reports/crop/:cropId` — Crop stage & pest report
* `GET /api/v1/reports/sensors/:farmId` — Telemetry stats (Avg/Min/Max)
* `GET /api/v1/reports/weather/:farmId` — Weather history
* `GET /api/v1/reports/pests/:farmId` — Pest severity breakdown
* `GET /api/v1/reports/recommendations/:farmId` — Advisory audit log
