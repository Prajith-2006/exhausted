import { ObjectId } from 'mongodb';
import { collections } from '../../config/db';
import { AppError } from '../../utils/errors';
import { FarmsService } from '../farms/farms.service';
import { CropsService } from '../crops/crops.service';

export class ReportsService {
  static async getFarmReport(farmId: string, ownerId: string) {
    const farm = await FarmsService.getFarmById(farmId, ownerId);
    const farmObjId = new ObjectId(farmId);

    const fieldsCount = await collections.fields().countDocuments({ farmId: farmObjId });
    const crops = await collections.crops().find({ farmId: farmObjId }).toArray();
    const sensorsCount = await collections.sensors().countDocuments({ farmId: farmObjId });
    const pestRecordsCount = await collections.pestRecords().countDocuments({ farmId: farmObjId });
    const alertsCount = await collections.alerts().countDocuments({ farmId: farmObjId });

    return {
      farmId,
      farmName: farm.name,
      totalArea: `${farm.totalArea} ${farm.areaUnit}`,
      soilType: farm.soilType,
      irrigationType: farm.irrigationType,
      metrics: {
        fieldsCount,
        totalCrops: crops.length,
        activeCrops: crops.filter(c => c.status === 'ACTIVE').length,
        harvestedCrops: crops.filter(c => c.status === 'HARVESTED').length,
        sensorsCount,
        pestRecordsCount,
        alertsCount
      },
      cropsSummary: crops.map(c => ({
        id: c._id,
        cropType: c.cropType,
        variety: c.variety,
        stage: c.growthStage,
        status: c.status
      })),
      generatedAt: new Date()
    };
  }

  static async getCropReport(cropId: string, ownerId: string) {
    const crop = await CropsService.getCropById(cropId, ownerId);
    const cropObjId = new ObjectId(cropId);

    const pestHistory = await collections.pestRecords().find({ cropId: cropObjId }).toArray();
    const recommendations = await collections.recommendations().find({ cropId: cropObjId }).toArray();

    return {
      cropId: crop._id,
      cropType: crop.cropType,
      variety: crop.variety,
      growthStage: crop.growthStage,
      status: crop.status,
      plantingDate: crop.plantingDate,
      expectedHarvestDate: crop.expectedHarvestDate,
      area: crop.area,
      pestHistoryCount: pestHistory.length,
      pestHistory: pestHistory.map(p => ({
        name: p.pestName,
        severity: p.severity,
        dateDetected: p.dateDetected,
        treatment: p.treatment
      })),
      recommendationsCount: recommendations.length,
      recommendationsSummary: recommendations.map(r => ({
        type: r.type,
        severity: r.severity,
        title: r.title
      })),
      generatedAt: new Date()
    };
  }

  static async getSensorReport(farmId: string, ownerId: string) {
    await FarmsService.getFarmById(farmId, ownerId);
    const farmObjId = new ObjectId(farmId);

    const sensors = await collections.sensors().find({ farmId: farmObjId }).toArray();
    const sensorReports = [];

    for (const sensor of sensors) {
      const readings = await collections.sensorReadings()
        .find({ sensorId: sensor._id })
        .sort({ timestamp: -1 })
        .limit(10)
        .toArray();

      const values = readings.map(r => r.value);
      const avg = values.length > 0 ? (values.reduce((a, b) => a + b, 0) / values.length) : 0;
      const min = values.length > 0 ? Math.min(...values) : 0;
      const max = values.length > 0 ? Math.max(...values) : 0;

      sensorReports.push({
        sensorId: sensor._id,
        name: sensor.name,
        type: sensor.type,
        unit: sensor.unit,
        status: sensor.status,
        lastSeen: sensor.lastSeen,
        readingsCount: readings.length,
        averageValue: Math.round(avg * 10) / 10,
        minValue: min,
        maxValue: max,
        latestReading: readings[0] || null
      });
    }

    return {
      farmId,
      totalSensors: sensors.length,
      activeSensors: sensors.filter(s => s.status === 'ACTIVE').length,
      sensors: sensorReports,
      generatedAt: new Date()
    };
  }

  static async getWeatherReport(farmId: string, ownerId: string) {
    await FarmsService.getFarmById(farmId, ownerId);
    const farmObjId = new ObjectId(farmId);

    const records = await collections.weatherRecords()
      .find({ farmId: farmObjId })
      .sort({ forecastTime: -1 })
      .limit(30)
      .toArray();

    const temps = records.map(r => r.temperature);
    const avgTemp = temps.length > 0 ? (temps.reduce((a, b) => a + b, 0) / temps.length) : 0;
    const totalRainfall = records.reduce((sum, r) => sum + (r.rainfall || 0), 0);

    return {
      farmId,
      recordsCount: records.length,
      avgTemperature: Math.round(avgTemp * 10) / 10,
      totalRainfallRecorded: Math.round(totalRainfall * 10) / 10,
      history: records.slice(0, 10),
      generatedAt: new Date()
    };
  }

  static async getPestReport(farmId: string, ownerId: string) {
    await FarmsService.getFarmById(farmId, ownerId);
    const farmObjId = new ObjectId(farmId);

    const pests = await collections.pestRecords()
      .find({ farmId: farmObjId })
      .sort({ createdAt: -1 })
      .toArray();

    const bySeverity = {
      LOW: pests.filter(p => p.severity === 'LOW').length,
      MEDIUM: pests.filter(p => p.severity === 'MEDIUM').length,
      HIGH: pests.filter(p => p.severity === 'HIGH').length,
      CRITICAL: pests.filter(p => p.severity === 'CRITICAL').length
    };

    return {
      farmId,
      totalPestIncidents: pests.length,
      severityBreakdown: bySeverity,
      incidents: pests,
      generatedAt: new Date()
    };
  }

  static async getRecommendationReport(farmId: string, ownerId: string) {
    await FarmsService.getFarmById(farmId, ownerId);
    const farmObjId = new ObjectId(farmId);

    const recs = await collections.recommendations()
      .find({ farmId: farmObjId })
      .sort({ generatedAt: -1 })
      .toArray();

    const byType = recs.reduce((acc: any, r) => {
      acc[r.type] = (acc[r.type] || 0) + 1;
      return acc;
    }, {});

    return {
      farmId,
      totalRecommendations: recs.length,
      reviewedCount: recs.filter(r => r.reviewed).length,
      typeBreakdown: byType,
      recommendations: recs,
      generatedAt: new Date()
    };
  }
}
