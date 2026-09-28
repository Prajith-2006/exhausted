import { ObjectId } from 'mongodb';
import { collections } from '../../config/db';
import { PestRecordDoc, PestSeverity } from '../../types/models';
import { AppError } from '../../utils/errors';
import { FarmsService } from '../farms/farms.service';
import { CropsService } from '../crops/crops.service';
import { AlertsService } from '../alerts/alerts.service';

export class PestsService {
  static async getPestsByUser(ownerId: string, farmId?: string) {
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

    return await collections.pestRecords().find(query).toArray();
  }

  static async getPestById(pestId: string, ownerId: string) {
    const pestObjId = new ObjectId(pestId);
    const pest = await collections.pestRecords().findOne({ _id: pestObjId });
    if (!pest) {
      throw new AppError('Pest record not found', 404, 'PEST_NOT_FOUND');
    }

    await FarmsService.getFarmById(pest.farmId.toString(), ownerId);
    return pest;
  }

  static async createPest(ownerId: string, data: {
    cropId: string;
    farmId: string;
    fieldId?: string;
    pestName: string;
    severity: PestSeverity;
    dateDetected?: string;
    affectedArea?: number;
    treatment?: string;
    notes?: string;
    aiAnalysis?: any;
  }) {
    await FarmsService.getFarmById(data.farmId, ownerId);
    await CropsService.getCropById(data.cropId, ownerId);

    const newPest: PestRecordDoc = {
      cropId: new ObjectId(data.cropId),
      farmId: new ObjectId(data.farmId),
      fieldId: data.fieldId ? new ObjectId(data.fieldId) : undefined,
      pestName: data.pestName,
      severity: data.severity || 'MEDIUM',
      dateDetected: data.dateDetected || new Date().toISOString().split('T')[0],
      affectedArea: data.affectedArea || 0,
      treatment: data.treatment || '',
      notes: data.notes || '',
      aiAnalysis: data.aiAnalysis || undefined,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const result = await collections.pestRecords().insertOne(newPest);

    // If severity is HIGH or CRITICAL, trigger alert automatically
    if (newPest.severity === 'HIGH' || newPest.severity === 'CRITICAL') {
      await AlertsService.createAlert({
        userId: ownerId,
        farmId: data.farmId,
        cropId: data.cropId,
        type: 'PEST_RISK',
        severity: newPest.severity,
        title: `Pest Incident: ${newPest.pestName}`,
        message: `${newPest.severity} severity infestation of ${newPest.pestName} detected.`
      });
    }

    return { ...newPest, _id: result.insertedId };
  }

  static async updatePest(pestId: string, ownerId: string, data: Partial<PestRecordDoc>) {
    await this.getPestById(pestId, ownerId);
    const pestObjId = new ObjectId(pestId);

    const { _id, farmId: _, createdAt, ...updateFields } = data as any;
    updateFields.updatedAt = new Date();

    if (updateFields.cropId && typeof updateFields.cropId === 'string') {
      updateFields.cropId = new ObjectId(updateFields.cropId);
    }

    await collections.pestRecords().updateOne(
      { _id: pestObjId },
      { $set: updateFields }
    );

    return await collections.pestRecords().findOne({ _id: pestObjId });
  }

  static async deletePest(pestId: string, ownerId: string) {
    await this.getPestById(pestId, ownerId);
    const pestObjId = new ObjectId(pestId);
    await collections.pestRecords().deleteOne({ _id: pestObjId });
    return { message: 'Pest record deleted successfully' };
  }
}
