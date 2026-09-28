/// <reference types="jest" />
import request from 'supertest';
import app from '../app';
import { connectDB, closeDB, collections } from '../config/db';

describe('Smart Farmer Platform Backend Integration Tests', () => {
  let authToken: string;
  let userId: string;
  let farmId: string;
  let fieldId: string;
  let cropId: string;
  let sensorId: string;

  beforeAll(async () => {
    await connectDB();
    // Clean test DB collections
    await collections.users().deleteMany({});
    await collections.farms().deleteMany({});
    await collections.fields().deleteMany({});
    await collections.crops().deleteMany({});
    await collections.sensors().deleteMany({});
    await collections.sensorReadings().deleteMany({});
    await collections.pestRecords().deleteMany({});
    await collections.recommendations().deleteMany({});
    await collections.alerts().deleteMany({});
  }, 30000);

  afterAll(async () => {
    await closeDB();
  });

  describe('1. Authentication Module', () => {
    it('should register a new farmer', async () => {
      const res = await request(app)
        .post('/api/v1/auth/register')
        .send({
          name: 'Test Farmer',
          phone: '+18881234567',
          password: 'TestPassword123!',
          preferredLanguage: 'en'
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.token).toBeDefined();
      expect(res.body.data.user.phone).toBe('+18881234567');
      authToken = res.body.data.token;
      userId = res.body.data.user.id;
    });

    it('should fail to register user with existing phone number', async () => {
      const res = await request(app)
        .post('/api/v1/auth/register')
        .send({
          name: 'Duplicate Farmer',
          phone: '+18881234567',
          password: 'Password123!'
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('USER_EXISTS');
    });

    it('should login farmer with correct credentials', async () => {
      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({
          phone: '+18881234567',
          password: 'TestPassword123!'
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.token).toBeDefined();
    });

    it('should get logged in profile with valid token', async () => {
      const res = await request(app)
        .get('/api/v1/auth/me')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.name).toBe('Test Farmer');
    });
  });

  describe('2. Farm & Ownership Management', () => {
    it('should create a farm for authenticated farmer', async () => {
      const res = await request(app)
        .post('/api/v1/farms')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Golden Wheat Farm',
          location: { latitude: 40.7128, longitude: -74.0060, address: 'New York Farm Road' },
          totalArea: 50,
          areaUnit: 'acres',
          soilType: 'Loam',
          irrigationType: 'Center Pivot'
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.name).toBe('Golden Wheat Farm');
      farmId = res.body.data._id;
    });

    it('should list farms owned by farmer', async () => {
      const res = await request(app)
        .get('/api/v1/farms')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.length).toBe(1);
    });

    it('should create a field within farm', async () => {
      const res = await request(app)
        .post(`/api/v1/farms/${farmId}/fields`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'East Wheat Field',
          area: 25,
          soilType: 'Loam'
        });

      expect(res.status).toBe(201);
      expect(res.body.data.name).toBe('East Wheat Field');
      fieldId = res.body.data._id;
    });
  });

  describe('3. Crops & Telemetry Sensors', () => {
    it('should create a crop', async () => {
      const res = await request(app)
        .post('/api/v1/crops')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          farmId,
          fieldId,
          cropType: 'Winter Wheat',
          variety: 'Hard Red',
          plantingDate: '2026-03-01',
          expectedHarvestDate: '2026-08-01',
          growthStage: 'Tillering',
          area: 25,
          status: 'ACTIVE'
        });

      expect(res.status).toBe(201);
      expect(res.body.data.cropType).toBe('Winter Wheat');
      cropId = res.body.data._id;
    });

    it('should register a sensor', async () => {
      const res = await request(app)
        .post('/api/v1/sensors')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          farmId,
          fieldId,
          deviceId: 'TEST-SM-100',
          name: 'Test Moisture Sensor',
          type: 'soil moisture',
          unit: '%',
          status: 'ACTIVE'
        });

      expect(res.status).toBe(201);
      expect(res.body.data.name).toBe('Test Moisture Sensor');
      sensorId = res.body.data._id;
    });

    it('should post a sensor reading and trigger alert if low', async () => {
      const res = await request(app)
        .post(`/api/v1/sensors/${sensorId}/readings`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          value: 15, // Low value < 20%
          unit: '%'
        });

      expect(res.status).toBe(201);
      expect(res.body.data.value).toBe(15);
    });
  });

  describe('4. Pest Records, Weather & AI Recommendations', () => {
    it('should record a pest incident', async () => {
      const res = await request(app)
        .post('/api/v1/pests')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          farmId,
          cropId,
          pestName: 'Wheat Rust',
          severity: 'HIGH',
          dateDetected: '2026-09-18',
          treatment: 'Apply systemic fungicide'
        });

      expect(res.status).toBe(201);
      expect(res.body.data.pestName).toBe('Wheat Rust');
    });

    it('should analyze pest/disease incident using AI endpoint', async () => {
      const res = await request(app)
        .post('/api/v1/pests/analyze')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          farmId,
          cropId,
          symptoms: 'Observed caterpillar feeding holes on maize foliage and whorl',
          initialSeverity: 'HIGH'
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.analyzed).toBe(true);
      expect(res.body.data.confidence).toBeGreaterThan(0.5);
      expect(res.body.data.identification.name).toBeDefined();
      expect(res.body.data.recommendations.length).toBeGreaterThan(0);
    });

    it('should save pest record with attached AI analysis metadata', async () => {
      const res = await request(app)
        .post('/api/v1/pests')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          farmId,
          cropId,
          fieldId,
          pestName: 'Fall Armyworm',
          severity: 'HIGH',
          dateDetected: '2026-09-19',
          treatment: 'Targeted Bio-Insecticide Application',
          notes: 'AI identified with high confidence',
          aiAnalysis: {
            analyzed: true,
            confidence: 0.88,
            summary: 'High probability Fall Armyworm',
            observations: ['Pin hole leaves'],
            recommendations: [{ priority: 'HIGH', title: 'Bio-pesticide', description: 'Apply Bt spray' }]
          }
        });

      expect(res.status).toBe(201);
      expect(res.body.data.pestName).toBe('Fall Armyworm');
      expect(res.body.data.aiAnalysis.analyzed).toBe(true);
      expect(res.body.data.aiAnalysis.confidence).toBe(0.88);
    });

    it('should fetch weather data for farm', async () => {
      const res = await request(app)
        .get(`/api/v1/weather/farm/${farmId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.current.temperature).toBeDefined();
      expect(res.body.data.forecast.length).toBe(5);
    });

    it('should trigger AI recommendation analysis', async () => {
      const res = await request(app)
        .post('/api/v1/recommendations/analyze')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          farmId,
          cropId
        });

      expect(res.status).toBe(201);
      expect(res.body.data.type).toBeDefined();
      expect(res.body.data.recommendation).toBeDefined();
      expect(res.body.data.confidence).toBeGreaterThan(0);
    });

    it('should fetch generated alerts for user', async () => {
      const res = await request(app)
        .get('/api/v1/alerts')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.length).toBeGreaterThan(0);
    });

    it('should generate analytical farm report', async () => {
      const res = await request(app)
        .get(`/api/v1/reports/farm/${farmId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.metrics.totalCrops).toBe(1);
    });
  });
});

