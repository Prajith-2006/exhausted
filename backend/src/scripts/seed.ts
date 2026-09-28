import bcrypt from 'bcryptjs';
import { ObjectId } from 'mongodb';
import { connectDB, closeDB, collections } from '../config/db';

async function seed() {
  console.log('[Seed] Starting database seed process...');
  await connectDB();

  // Clear existing collections
  await collections.users().deleteMany({});
  await collections.farms().deleteMany({});
  await collections.fields().deleteMany({});
  await collections.crops().deleteMany({});
  await collections.sensors().deleteMany({});
  await collections.sensorReadings().deleteMany({});
  await collections.pestRecords().deleteMany({});
  await collections.weatherRecords().deleteMany({});
  await collections.recommendations().deleteMany({});
  await collections.alerts().deleteMany({});
  await collections.reports().deleteMany({});

  console.log('[Seed] Cleared existing database records.');

  // 1. Create Demo Farmer
  const passwordHash = await bcrypt.hash('Password123!', 10);
  const farmerDoc = {
    _id: new ObjectId(),
    name: 'Robert Miller (Demo Farmer)',
    phone: '+919876543210',
    passwordHash,
    role: 'FARMER' as const,
    preferredLanguage: 'en',
    createdAt: new Date(),
    updatedAt: new Date()
  };
  await collections.users().insertOne(farmerDoc);
  const userId = farmerDoc._id;
  console.log(`[Seed] Created Demo Farmer: ${farmerDoc.name} (${farmerDoc.phone})`);

  // 2. Create Farms
  const farm1Doc = {
    _id: new ObjectId(),
    ownerId: userId,
    name: 'Green Valley Agro Farm',
    location: {
      latitude: 36.7783,
      longitude: -119.4179,
      address: '742 Evergreen Terrace, Fresno, CA'
    },
    totalArea: 45,
    areaUnit: 'acres' as const,
    soilType: 'Clay Loam',
    irrigationType: 'Drip Irrigation',
    notes: 'Primary grain and vegetable cultivation farm with automated drip system.',
    createdAt: new Date(),
    updatedAt: new Date()
  };

  const farm2Doc = {
    _id: new ObjectId(),
    ownerId: userId,
    name: 'Sunrise Organic Orchards',
    location: {
      latitude: 34.0522,
      longitude: -118.2437,
      address: '1090 Orchard Lane, Bakersfield, CA'
    },
    totalArea: 25,
    areaUnit: 'acres' as const,
    soilType: 'Sandy Loam',
    irrigationType: 'Sprinkler',
    notes: 'Organic certified fruit orchard and high-value cash crop fields.',
    createdAt: new Date(),
    updatedAt: new Date()
  };

  await collections.farms().insertMany([farm1Doc, farm2Doc]);
  console.log(`[Seed] Created 2 Farms: ${farm1Doc.name}, ${farm2Doc.name}`);

  // 3. Create Fields
  const field1 = {
    _id: new ObjectId(),
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
    _id: new ObjectId(),
    farmId: farm1Doc._id,
    name: 'South Plot B (Tomatoes)',
    area: 25,
    soilType: 'Silt Loam',
    irrigationType: 'Drip Irrigation',
    notes: 'Protected greenhouse border',
    createdAt: new Date(),
    updatedAt: new Date()
  };

  const field3 = {
    _id: new ObjectId(),
    farmId: farm2Doc._id,
    name: 'East Field 1 (Organic Cotton)',
    area: 15,
    soilType: 'Sandy Loam',
    irrigationType: 'Sprinkler',
    notes: 'Zero chemical pesticides allowed',
    createdAt: new Date(),
    updatedAt: new Date()
  };

  await collections.fields().insertMany([field1, field2, field3]);
  console.log('[Seed] Created 3 Fields.');

  // 4. Create Crops
  const crop1 = {
    _id: new ObjectId(),
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
    _id: new ObjectId(),
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

  const crop3 = {
    _id: new ObjectId(),
    farmId: farm2Doc._id,
    fieldId: field3._id,
    cropType: 'Organic Cotton',
    variety: 'Acala Max',
    plantingDate: '2026-04-20',
    expectedHarvestDate: '2026-11-01',
    growthStage: 'Boll Development',
    area: 15,
    status: 'ACTIVE' as const,
    notes: 'Premium organic strain',
    createdAt: new Date(),
    updatedAt: new Date()
  };

  await collections.crops().insertMany([crop1, crop2, crop3]);
  console.log('[Seed] Created 3 Active Crops.');

  // 5. Create Sensors
  const sensor1 = {
    _id: new ObjectId(),
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
    _id: new ObjectId(),
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

  const sensor3 = {
    _id: new ObjectId(),
    farmId: farm1Doc._id,
    fieldId: field2._id,
    deviceId: 'IOT-PH-003',
    name: 'Tomato Soil pH Meter',
    type: 'soil pH' as const,
    unit: 'pH',
    status: 'ACTIVE' as const,
    lastSeen: new Date(),
    createdAt: new Date(),
    updatedAt: new Date()
  };

  const sensor4 = {
    _id: new ObjectId(),
    farmId: farm2Doc._id,
    fieldId: field3._id,
    deviceId: 'IOT-HUM-004',
    name: 'Cotton Canopy Humidity Sensor',
    type: 'humidity' as const,
    unit: '%',
    status: 'ACTIVE' as const,
    lastSeen: new Date(),
    createdAt: new Date(),
    updatedAt: new Date()
  };

  await collections.sensors().insertMany([sensor1, sensor2, sensor3, sensor4]);
  console.log('[Seed] Created 4 IoT Sensors.');

  // 6. Create Time-Series Sensor Readings
  const readings = [];
  const now = Date.now();

  // Soil moisture readings (some low values to trigger alert)
  for (let i = 0; i < 15; i++) {
    readings.push({
      _id: new ObjectId(),
      sensorId: sensor1._id,
      timestamp: new Date(now - i * 3600000 * 2),
      value: i === 0 ? 18.5 : 22 + Math.floor(Math.sin(i) * 5),
      unit: '%',
      createdAt: new Date()
    });
  }

  // Temp readings
  for (let i = 0; i < 15; i++) {
    readings.push({
      _id: new ObjectId(),
      sensorId: sensor2._id,
      timestamp: new Date(now - i * 3600000 * 2),
      value: Math.round((26 + Math.cos(i) * 6) * 10) / 10,
      unit: '°C',
      createdAt: new Date()
    });
  }

  // pH readings
  for (let i = 0; i < 10; i++) {
    readings.push({
      _id: new ObjectId(),
      sensorId: sensor3._id,
      timestamp: new Date(now - i * 3600000 * 4),
      value: Math.round((6.4 + Math.sin(i) * 0.3) * 10) / 10,
      unit: 'pH',
      createdAt: new Date()
    });
  }

  // Humidity readings
  for (let i = 0; i < 10; i++) {
    readings.push({
      _id: new ObjectId(),
      sensorId: sensor4._id,
      timestamp: new Date(now - i * 3600000 * 4),
      value: Math.round((68 + Math.sin(i) * 10)),
      unit: '%',
      createdAt: new Date()
    });
  }

  await collections.sensorReadings().insertMany(readings);
  console.log(`[Seed] Created ${readings.length} Sensor Telemetry Readings.`);

  // 7. Create Pest Records
  const pest1 = {
    _id: new ObjectId(),
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

  const pest2 = {
    _id: new ObjectId(),
    cropId: crop2._id,
    farmId: farm1Doc._id,
    pestName: 'Early Blight (Alternaria solani)',
    severity: 'MEDIUM' as const,
    dateDetected: '2026-09-14',
    affectedArea: 0.8,
    treatment: 'Foliar copper fungicide spray applied.',
    notes: 'Lower leaves showing characteristic target spot lesions.',
    createdAt: new Date(),
    updatedAt: new Date()
  };

  await collections.pestRecords().insertMany([pest1, pest2]);
  console.log('[Seed] Created 2 Pest Records.');

  // 8. Create Weather Records
  const weatherRecords = [
    {
      _id: new ObjectId(),
      farmId: farm1Doc._id,
      temperature: 28.5,
      humidity: 62,
      rainfall: 0,
      precipitationProbability: 15,
      windSpeed: 11.2,
      weatherCondition: 'Sunny',
      forecastTime: new Date(),
      createdAt: new Date()
    },
    {
      _id: new ObjectId(),
      farmId: farm2Doc._id,
      temperature: 26.1,
      humidity: 71,
      rainfall: 2.4,
      precipitationProbability: 60,
      windSpeed: 14.8,
      weatherCondition: 'Light Rain',
      forecastTime: new Date(),
      createdAt: new Date()
    }
  ];
  await collections.weatherRecords().insertMany(weatherRecords);

  // 9. Create AI Recommendations
  const rec1 = {
    _id: new ObjectId(),
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

  const rec2 = {
    _id: new ObjectId(),
    farmId: farm1Doc._id,
    cropId: crop2._id,
    userId,
    type: 'PEST_RISK' as const,
    severity: 'MEDIUM' as const,
    title: 'Fungal Blight Containment Protocol',
    recommendation: 'Re-apply organic copper fungicide on Tomato Plot B within 48 hours to halt Alternaria spore progression.',
    reasons: [
      'Active Early Blight incident logged on 2026-09-14',
      'Relative humidity level of 62% favors pathogen sporulation'
    ],
    confidence: 0.91,
    reviewed: true,
    generatedAt: new Date(now - 86400000),
    createdAt: new Date(now - 86400000)
  };

  await collections.recommendations().insertMany([rec1, rec2]);
  console.log('[Seed] Created 2 AI Recommendations.');

  // 10. Create Alerts
  const alert1 = {
    _id: new ObjectId(),
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

  const alert2 = {
    _id: new ObjectId(),
    userId,
    farmId: farm1Doc._id,
    cropId: crop1._id,
    type: 'PEST_RISK' as const,
    severity: 'HIGH' as const,
    title: 'High Severity Fall Armyworm Alert',
    message: 'Fall Armyworm infestation reported on Maize Plot A.',
    read: true,
    createdAt: new Date(now - 172800000)
  };

  await collections.alerts().insertMany([alert1, alert2]);
  console.log('[Seed] Created 2 System Alerts.');

  console.log('\n======================================================');
  console.log(' SEED COMPLETE!');
  console.log(' Demo Login Phone: +15550192834');
  console.log(' Demo Login Password: Password123!');
  console.log('======================================================\n');

  await closeDB();
}

seed().catch(err => {
  console.error('[Seed Error]:', err);
  process.exit(1);
});
