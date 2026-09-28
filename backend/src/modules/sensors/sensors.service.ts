import { ObjectId } from 'mongodb';
import { collections } from '../../config/db';
import { SensorDoc, SensorReadingDoc, SensorType, SensorStatus } from '../../types/models';
import { AppError } from '../../utils/errors';
import { FarmsService } from '../farms/farms.service';
import { AlertsService } from '../alerts/alerts.service';

export class SensorsService {
  static async getSensorsByUser(ownerId: string, farmId?: string) {
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

    return await collections.sensors().find(query).toArray();
  }

  static async getSensorById(sensorId: string, ownerId: string) {
    const sensorObjId = new ObjectId(sensorId);
    const sensor = await collections.sensors().findOne({ _id: sensorObjId });
    if (!sensor) {
      throw new AppError('Sensor not found', 404, 'SENSOR_NOT_FOUND');
    }

    await FarmsService.getFarmById(sensor.farmId.toString(), ownerId);
    return sensor;
  }

  static async createSensor(ownerId: string, data: {
    farmId: string;
    fieldId?: string;
    deviceId: string;
    name: string;
    type: SensorType;
    unit: string;
    status?: SensorStatus;
  }) {
    await FarmsService.getFarmById(data.farmId, ownerId);

    const newSensor: SensorDoc = {
      farmId: new ObjectId(data.farmId),
      fieldId: data.fieldId ? new ObjectId(data.fieldId) : undefined,
      deviceId: data.deviceId,
      name: data.name,
      type: data.type,
      unit: data.unit,
      status: data.status || 'ACTIVE',
      lastSeen: new Date(),
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const result = await collections.sensors().insertOne(newSensor);
    return { ...newSensor, _id: result.insertedId };
  }

  static async updateSensor(sensorId: string, ownerId: string, data: Partial<SensorDoc>) {
    await this.getSensorById(sensorId, ownerId);
    const sensorObjId = new ObjectId(sensorId);

    const { _id, farmId: _, createdAt, ...updateFields } = data as any;
    updateFields.updatedAt = new Date();

    if (updateFields.fieldId && typeof updateFields.fieldId === 'string') {
      updateFields.fieldId = new ObjectId(updateFields.fieldId);
    }

    await collections.sensors().updateOne(
      { _id: sensorObjId },
      { $set: updateFields }
    );

    return await collections.sensors().findOne({ _id: sensorObjId });
  }

  static async deleteSensor(sensorId: string, ownerId: string) {
    await this.getSensorById(sensorId, ownerId);
    const sensorObjId = new ObjectId(sensorId);
    await collections.sensors().deleteOne({ _id: sensorObjId });
    await collections.sensorReadings().deleteMany({ sensorId: sensorObjId });
    return { message: 'Sensor deleted successfully' };
  }

  // Sensor Readings
  static async addReading(sensorId: string, ownerId: string, value: number, customUnit?: string) {
    const sensor = await this.getSensorById(sensorId, ownerId);
    const sensorObjId = new ObjectId(sensorId);

    const reading: SensorReadingDoc = {
      sensorId: sensorObjId,
      timestamp: new Date(),
      value,
      unit: customUnit || sensor.unit,
      createdAt: new Date()
    };

    const result = await collections.sensorReadings().insertOne(reading);

    // Update sensor lastSeen
    await collections.sensors().updateOne(
      { _id: sensorObjId },
      { $set: { lastSeen: new Date(), updatedAt: new Date() } }
    );

    // Evaluate sensor threshold alerts
    await AlertsService.evaluateSensorAlerts(sensor, value, ownerId);

    return { ...reading, _id: result.insertedId };
  }

  static async getReadings(sensorId: string, ownerId: string, limit: number = 50) {
    await this.getSensorById(sensorId, ownerId);
    return await collections.sensorReadings()
      .find({ sensorId: new ObjectId(sensorId) })
      .sort({ timestamp: -1 })
      .limit(limit)
      .toArray();
  }
}
