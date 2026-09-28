import { ObjectId } from 'mongodb';
import { collections } from '../../config/db';
import { AlertDoc, AlertType, SeverityLevel, SensorDoc } from '../../types/models';
import { AppError } from '../../utils/errors';

export class AlertsService {
  static async createAlert(data: {
    userId: string;
    farmId?: string;
    cropId?: string;
    type: AlertType;
    severity: SeverityLevel;
    title: string;
    message: string;
  }) {
    const doc: AlertDoc = {
      userId: new ObjectId(data.userId),
      farmId: data.farmId ? new ObjectId(data.farmId) : undefined,
      cropId: data.cropId ? new ObjectId(data.cropId) : undefined,
      type: data.type,
      severity: data.severity,
      title: data.title,
      message: data.message,
      read: false,
      createdAt: new Date()
    };

    const result = await collections.alerts().insertOne(doc);
    return { ...doc, _id: result.insertedId };
  }

  static async getAlertsByUser(userId: string, unreadOnly: boolean = false) {
    const query: any = { userId: new ObjectId(userId) };
    if (unreadOnly) query.read = false;

    return await collections.alerts()
      .find(query)
      .sort({ createdAt: -1 })
      .toArray();
  }

  static async markAsRead(alertId: string, userId: string) {
    const alertObjId = new ObjectId(alertId);
    const alert = await collections.alerts().findOne({ _id: alertObjId, userId: new ObjectId(userId) });
    if (!alert) {
      throw new AppError('Alert not found or unauthorized', 404, 'ALERT_NOT_FOUND');
    }

    await collections.alerts().updateOne(
      { _id: alertObjId },
      { $set: { read: true } }
    );

    return { ...alert, read: true };
  }

  static async markAllAsRead(userId: string) {
    await collections.alerts().updateMany(
      { userId: new ObjectId(userId), read: false },
      { $set: { read: true } }
    );
    return { message: 'All alerts marked as read' };
  }

  static async evaluateSensorAlerts(sensor: SensorDoc, value: number, userId: string) {
    if (sensor.type === 'soil moisture' && value < 20) {
      await this.createAlert({
        userId,
        farmId: sensor.farmId.toString(),
        type: 'LOW_SOIL_MOISTURE',
        severity: 'HIGH',
        title: `Low Soil Moisture Alert: ${sensor.name}`,
        message: `Soil moisture dropped to ${value}% (${sensor.unit}). Irrigation required.`
      });
    } else if (sensor.type === 'temperature' && value > 35) {
      await this.createAlert({
        userId,
        farmId: sensor.farmId.toString(),
        type: 'HIGH_TEMPERATURE',
        severity: 'HIGH',
        title: `High Temperature Alert: ${sensor.name}`,
        message: `Ambient temperature reached ${value}°C. Ensure crop hydration.`
      });
    }
  }
}
