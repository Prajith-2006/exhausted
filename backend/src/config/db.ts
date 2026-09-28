import { MongoClient, Db, Collection, ObjectId } from 'mongodb';
import bcrypt from 'bcryptjs';
import { config } from './env';
import {
  UserDoc,
  FarmDoc,
  FieldDoc,
  CropDoc,
  SensorDoc,
  SensorReadingDoc,
  PestRecordDoc,
  WeatherRecordDoc,
  RecommendationDoc,
  AlertDoc,
  ReportDoc
} from '../types/models';

let client: MongoClient | null = null;
let db: Db | null = null;
let isInMemory = false;

// In-Memory Database Engine Fallback
function matchValue(actual: any, expected: any): boolean {
  if (expected === undefined) return true;
  if (expected instanceof ObjectId) {
    return actual?.toString() === expected.toString();
  }
  if (typeof expected === 'object' && expected !== null && !Array.isArray(expected)) {
    if ('$in' in expected && Array.isArray(expected.$in)) {
      const targetStr = actual?.toString();
      return expected.$in.some((item: any) => item?.toString() === targetStr || item === actual);
    }
    if ('$gte' in expected || '$lte' in expected || '$gt' in expected || '$lt' in expected) {
      let match = true;
      if ('$gte' in expected) match = match && actual >= expected.$gte;
      if ('$lte' in expected) match = match && actual <= expected.$lte;
      if ('$gt' in expected) match = match && actual > expected.$gt;
      if ('$lt' in expected) match = match && actual < expected.$lt;
      return match;
    }
  }
  if (actual instanceof ObjectId) {
    return actual.toString() === expected.toString();
  }
  return actual === expected;
}

function matchDoc(doc: any, query: any): boolean {
  if (!query || Object.keys(query).length === 0) return true;
  for (const key of Object.keys(query)) {
    if (!matchValue(doc[key], query[key])) return false;
  }
  return true;
}

class InMemoryCursor {
  private items: any[];
  constructor(items: any[]) {
    this.items = [...items];
  }
  sort(sortObj: any) {
    const key = Object.keys(sortObj)[0];
    if (key) {
      const dir = sortObj[key];
      this.items.sort((a, b) => {
        const valA = a[key];
        const valB = b[key];
        if (valA < valB) return dir === 1 ? -1 : 1;
        if (valA > valB) return dir === 1 ? 1 : -1;
        return 0;
      });
    }
    return this;
  }
  limit(n: number) {
    this.items = this.items.slice(0, n);
    return this;
  }
  async toArray() {
    return this.items;
  }
}

class InMemoryCollection<T = any> {
  public docs: any[] = [];

  find(query: any = {}) {
    const matched = this.docs.filter(d => matchDoc(d, query));
    return new InMemoryCursor(matched);
  }

  async findOne(query: any): Promise<any> {
    return this.docs.find(d => matchDoc(d, query)) || null;
  }

  async insertOne(doc: any) {
    const _id = doc._id || new ObjectId();
    const newDoc = { ...doc, _id };
    this.docs.push(newDoc);
    return { insertedId: _id, acknowledged: true };
  }

  async insertMany(docs: any[]) {
    const insertedIds: any = {};
    docs.forEach((doc, idx) => {
      const _id = doc._id || new ObjectId();
      doc._id = _id;
      this.docs.push(doc);
      insertedIds[idx] = _id;
    });
    return { insertedIds, acknowledged: true };
  }

  async updateOne(query: any, update: any) {
    const doc = await this.findOne(query);
    if (doc && update.$set) {
      Object.assign(doc, update.$set);
    }
    return { modifiedCount: doc ? 1 : 0 };
  }

  async updateMany(query: any, update: any) {
    const matched = this.docs.filter(d => matchDoc(d, query));
    if (update.$set) {
      matched.forEach(doc => Object.assign(doc, update.$set));
    }
    return { modifiedCount: matched.length };
  }

  async deleteOne(query: any) {
    const idx = this.docs.findIndex(d => matchDoc(d, query));
    if (idx !== -1) {
      this.docs.splice(idx, 1);
      return { deletedCount: 1 };
    }
    return { deletedCount: 0 };
  }

  async deleteMany(query: any = {}) {
    const initialLen = this.docs.length;
    this.docs = this.docs.filter(d => !matchDoc(d, query));
    return { deletedCount: initialLen - this.docs.length };
  }

  async countDocuments(query: any = {}): Promise<number> {
    return this.docs.filter(d => matchDoc(d, query)).length;
  }

  async createIndex() {
    return 'index_ok';
  }
}

const inMemoryStores: Record<string, InMemoryCollection> = {
  users: new InMemoryCollection<UserDoc>(),
  farms: new InMemoryCollection<FarmDoc>(),
  fields: new InMemoryCollection<FieldDoc>(),
  crops: new InMemoryCollection<CropDoc>(),
  sensors: new InMemoryCollection<SensorDoc>(),
  sensorReadings: new InMemoryCollection<SensorReadingDoc>(),
  pestRecords: new InMemoryCollection<PestRecordDoc>(),
  weatherRecords: new InMemoryCollection<WeatherRecordDoc>(),
  recommendations: new InMemoryCollection<RecommendationDoc>(),
  alerts: new InMemoryCollection<AlertDoc>(),
  reports: new InMemoryCollection<ReportDoc>()
};

async function seedInMemoryData() {
  console.log('[InMemoryDB] Auto-seeding initial agricultural demo data...');
  const passwordHash = await bcrypt.hash('Password123!', 10);
  const farmerDoc = {
    _id: new ObjectId('660000000000000000000001'),
    name: 'Robert Miller (Demo Farmer)',
    phone: '+919876543210',
    passwordHash,
    role: 'FARMER' as const,
    preferredLanguage: 'en',
    createdAt: new Date(),
    updatedAt: new Date()
  };
  await inMemoryStores.users.insertOne(farmerDoc);
  const userId = farmerDoc._id;

  const farm1Doc = {
    _id: new ObjectId('660000000000000000000002'),
    ownerId: userId,
    name: 'Green Valley Agro Farm',
    location: { latitude: 36.7783, longitude: -119.4179, address: '742 Evergreen Terrace, Fresno, CA' },
    totalArea: 45,
    areaUnit: 'acres' as const,
    soilType: 'Clay Loam',
    irrigationType: 'Drip Irrigation',
    notes: 'Primary grain and vegetable cultivation farm with automated drip system.',
    createdAt: new Date(),
    updatedAt: new Date()
  };

  const farm2Doc = {
    _id: new ObjectId('660000000000000000000003'),
    ownerId: userId,
    name: 'Sunrise Organic Orchards',
    location: { latitude: 34.0522, longitude: -118.2437, address: '1090 Orchard Lane, Bakersfield, CA' },
    totalArea: 25,
    areaUnit: 'acres' as const,
    soilType: 'Sandy Loam',
    irrigationType: 'Sprinkler',
    notes: 'Organic certified fruit orchard and high-value cash crop fields.',
    createdAt: new Date(),
    updatedAt: new Date()
  };
  await inMemoryStores.farms.insertMany([farm1Doc, farm2Doc]);

  const field1 = {
    _id: new ObjectId('660000000000000000000004'),
    farmId: farm1Doc._id,
    name: 'North Plot A (Maize)',
    area: 20,
    soilType: 'Clay Loam',
    irrigationType: 'Drip Irrigation',
    notes: 'High organic matter content',
    createdAt: new Date(),
    updatedAt: new Date()
  };
  const field2 = {
    _id: new ObjectId('660000000000000000000005'),
    farmId: farm1Doc._id,
    name: 'South Plot B (Tomatoes)',
    area: 25,
    soilType: 'Silt Loam',
    irrigationType: 'Drip Irrigation',
    notes: 'Protected greenhouse border',
    createdAt: new Date(),
    updatedAt: new Date()
  };
  await inMemoryStores.fields.insertMany([field1, field2]);

  const crop1 = {
    _id: new ObjectId('660000000000000000000006'),
    farmId: farm1Doc._id,
    fieldId: field1._id,
    cropType: 'Yellow Maize',
    variety: 'Pioneer 30Y87',
    plantingDate: '2026-05-15',
    expectedHarvestDate: '2026-10-10',
    growthStage: 'Tasseling / Flowering',
    area: 20,
    status: 'ACTIVE' as const,
    notes: 'Healthy stand, high density planting',
    createdAt: new Date(),
    updatedAt: new Date()
  };
  const crop2 = {
    _id: new ObjectId('660000000000000000000007'),
    farmId: farm1Doc._id,
    fieldId: field2._id,
    cropType: 'Roma Tomatoes',
    variety: 'San Marzano',
    plantingDate: '2026-06-01',
    expectedHarvestDate: '2026-09-30',
    growthStage: 'Fruit Setting',
    area: 12,
    status: 'ACTIVE' as const,
    notes: 'Requires close monitoring for early blight',
    createdAt: new Date(),
    updatedAt: new Date()
  };
  await inMemoryStores.crops.insertMany([crop1, crop2]);

  const sensor1 = {
    _id: new ObjectId('660000000000000000000008'),
    farmId: farm1Doc._id,
    fieldId: field1._id,
    deviceId: 'IOT-SM-001',
    name: 'Maize Soil Moisture Sensor #1',
    type: 'soil moisture' as const,
    unit: '%',
    status: 'ACTIVE' as const,
    lastSeen: new Date(),
    createdAt: new Date(),
    updatedAt: new Date()
  };
  const sensor2 = {
    _id: new ObjectId('660000000000000000000009'),
    farmId: farm1Doc._id,
    fieldId: field1._id,
    deviceId: 'IOT-TEMP-002',
    name: 'Green Valley Air Temp Sensor',
    type: 'temperature' as const,
    unit: '°C',
    status: 'ACTIVE' as const,
    lastSeen: new Date(),
    createdAt: new Date(),
    updatedAt: new Date()
  };
  await inMemoryStores.sensors.insertMany([sensor1, sensor2]);

  const readings = [];
  const now = Date.now();
  for (let i = 0; i < 15; i++) {
    readings.push({
      _id: new ObjectId(),
      sensorId: sensor1._id,
      timestamp: new Date(now - i * 3600000 * 2),
      value: i === 0 ? 18.5 : 22 + Math.floor(Math.sin(i) * 5),
      unit: '%',
      createdAt: new Date()
    });
    readings.push({
      _id: new ObjectId(),
      sensorId: sensor2._id,
      timestamp: new Date(now - i * 3600000 * 2),
      value: Math.round((26 + Math.cos(i) * 6) * 10) / 10,
      unit: '°C',
      createdAt: new Date()
    });
  }
  await inMemoryStores.sensorReadings.insertMany(readings);

  const pest1 = {
    _id: new ObjectId('660000000000000000000010'),
    cropId: crop1._id,
    farmId: farm1Doc._id,
    pestName: 'Fall Armyworm (Spodoptera frugiperda)',
    severity: 'HIGH' as const,
    dateDetected: '2026-09-10',
    affectedArea: 2.5,
    treatment: 'Applied Neem-based bio-insecticide and pheromone traps.',
    notes: 'Isolated to eastern edge of Plot A.',
    createdAt: new Date(),
    updatedAt: new Date()
  };
  await inMemoryStores.pestRecords.insertOne(pest1);

  const rec1 = {
    _id: new ObjectId('660000000000000000000011'),
    farmId: farm1Doc._id,
    cropId: crop1._id,
    userId,
    type: 'IRRIGATION' as const,
    severity: 'HIGH' as const,
    title: 'Low Soil Moisture Alert in Maize Plot',
    recommendation: 'Soil moisture is down to 18.5%. Schedule immediate drip irrigation of 35mm to protect corn tassel formation.',
    reasons: [
      'Soil moisture sensor #1 recorded 18.5% (below 25% threshold)',
      'High ambient daytime temp (28.5°C)',
      'Critical flowering stage requires uninterrupted water availability'
    ],
    confidence: 0.96,
    reviewed: false,
    generatedAt: new Date(),
    createdAt: new Date()
  };
  await inMemoryStores.recommendations.insertOne(rec1);

  const alert1 = {
    _id: new ObjectId('660000000000000000000012'),
    userId,
    farmId: farm1Doc._id,
    cropId: crop1._id,
    type: 'LOW_SOIL_MOISTURE' as const,
    severity: 'HIGH' as const,
    title: 'Soil Moisture Critical in North Plot A',
    message: 'Sensor IOT-SM-001 reading dropped to 18.5%. Immediate irrigation advised.',
    read: false,
    createdAt: new Date()
  };
  await inMemoryStores.alerts.insertOne(alert1);

  console.log('[InMemoryDB] Pre-seeded demo data successfully! Login: +15550192834 / Password123!');
}

export const connectDB = async (): Promise<Db> => {
  if (db) return db;

  try {
    client = new MongoClient(config.mongodbUri, { serverSelectionTimeoutMS: 2500 });
    await client.connect();
    db = client.db();
    console.log(`[MongoDB] Successfully connected to native database: ${db.databaseName}`);
    await createIndexes(db);
    return db;
  } catch (error) {
    console.warn('[MongoDB] Could not connect to local Mongo daemon. Switching to built-in In-Memory Database.');
    isInMemory = true;
    await seedInMemoryData();
    return null as any;
  }
};

export const getDB = (): Db => {
  if (isInMemory) {
    return null as any;
  }
  if (!db) {
    throw new Error('Database not initialized. Call connectDB first.');
  }
  return db;
};

export const closeDB = async (): Promise<void> => {
  if (client) {
    await client.close();
    client = null;
    db = null;
    console.log('[MongoDB] Connection closed.');
  }
};

const createIndexes = async (database: Db): Promise<void> => {
  try {
    await database.collection('users').createIndex({ phone: 1 }, { unique: true });
    await database.collection('farms').createIndex({ ownerId: 1 });
    await database.collection('fields').createIndex({ farmId: 1 });
    await database.collection('crops').createIndex({ farmId: 1, fieldId: 1 });
    await database.collection('sensors').createIndex({ farmId: 1, deviceId: 1 });
    await database.collection('sensorReadings').createIndex({ sensorId: 1, timestamp: -1 });
    await database.collection('pestRecords').createIndex({ farmId: 1, cropId: 1 });
    await database.collection('weatherRecords').createIndex({ farmId: 1, forecastTime: -1 });
    await database.collection('recommendations').createIndex({ farmId: 1, userId: 1 });
    await database.collection('alerts').createIndex({ userId: 1, read: 1 });
    await database.collection('reports').createIndex({ farmId: 1, type: 1 });
    console.log('[MongoDB] Collection indexes ensured.');
  } catch (err) {
    console.warn('[MongoDB] Warning creating indexes:', err);
  }
};

export const collections = {
  users: (): Collection<UserDoc> => isInMemory ? (inMemoryStores.users as any) : getDB().collection<UserDoc>('users'),
  farms: (): Collection<FarmDoc> => isInMemory ? (inMemoryStores.farms as any) : getDB().collection<FarmDoc>('farms'),
  fields: (): Collection<FieldDoc> => isInMemory ? (inMemoryStores.fields as any) : getDB().collection<FieldDoc>('fields'),
  crops: (): Collection<CropDoc> => isInMemory ? (inMemoryStores.crops as any) : getDB().collection<CropDoc>('crops'),
  sensors: (): Collection<SensorDoc> => isInMemory ? (inMemoryStores.sensors as any) : getDB().collection<SensorDoc>('sensors'),
  sensorReadings: (): Collection<SensorReadingDoc> => isInMemory ? (inMemoryStores.sensorReadings as any) : getDB().collection<SensorReadingDoc>('sensorReadings'),
  pestRecords: (): Collection<PestRecordDoc> => isInMemory ? (inMemoryStores.pestRecords as any) : getDB().collection<PestRecordDoc>('pestRecords'),
  weatherRecords: (): Collection<WeatherRecordDoc> => isInMemory ? (inMemoryStores.weatherRecords as any) : getDB().collection<WeatherRecordDoc>('weatherRecords'),
  recommendations: (): Collection<RecommendationDoc> => isInMemory ? (inMemoryStores.recommendations as any) : getDB().collection<RecommendationDoc>('recommendations'),
  alerts: (): Collection<AlertDoc> => isInMemory ? (inMemoryStores.alerts as any) : getDB().collection<AlertDoc>('alerts'),
  reports: (): Collection<ReportDoc> => isInMemory ? (inMemoryStores.reports as any) : getDB().collection<ReportDoc>('reports')
};
