import { ObjectId } from 'mongodb';
import { collections } from '../../config/db';
import { CropDoc, CropStatus } from '../../types/models';
import { AppError } from '../../utils/errors';
import { FarmsService } from '../farms/farms.service';

export class CropsService {
  static async getCropsByUser(ownerId: string, farmId?: string) {
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

    return await collections.crops().find(query).toArray();
  }

  static async getCropById(cropId: string, ownerId: string) {
    const cropObjId = new ObjectId(cropId);
    const crop = await collections.crops().findOne({ _id: cropObjId });
    if (!crop) {
      throw new AppError('Crop not found', 404, 'CROP_NOT_FOUND');
    }

    await FarmsService.getFarmById(crop.farmId.toString(), ownerId);
    return crop;
  }

  static async createCrop(ownerId: string, data: {
    farmId: string;
    fieldId: string;
    cropType: string;
    variety: string;
    plantingDate: string;
    expectedHarvestDate: string;
    growthStage?: string;
    area: number;
    status?: CropStatus;
    notes?: string;
  }) {
    await FarmsService.getFarmById(data.farmId, ownerId);

    const newCrop: CropDoc = {
      farmId: new ObjectId(data.farmId),
      fieldId: new ObjectId(data.fieldId),
      cropType: data.cropType,
      variety: data.variety || 'Standard',
      plantingDate: data.plantingDate || new Date().toISOString().split('T')[0],
      expectedHarvestDate: data.expectedHarvestDate || new Date(Date.now() + 90 * 86400000).toISOString().split('T')[0],
      growthStage: data.growthStage || 'Vegetative',
      area: data.area || 1,
      status: data.status || 'ACTIVE',
      notes: data.notes || '',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const result = await collections.crops().insertOne(newCrop);
    return { ...newCrop, _id: result.insertedId };
  }

  static async updateCrop(cropId: string, ownerId: string, data: Partial<CropDoc>) {
    await this.getCropById(cropId, ownerId);
    const cropObjId = new ObjectId(cropId);

    const { _id, farmId: _, createdAt, ...updateFields } = data as any;
    updateFields.updatedAt = new Date();

    if (updateFields.fieldId && typeof updateFields.fieldId === 'string') {
      updateFields.fieldId = new ObjectId(updateFields.fieldId);
    }

    await collections.crops().updateOne(
      { _id: cropObjId },
      { $set: updateFields }
    );

    return await collections.crops().findOne({ _id: cropObjId });
  }

  static async deleteCrop(cropId: string, ownerId: string) {
    await this.getCropById(cropId, ownerId);
    const cropObjId = new ObjectId(cropId);
    await collections.crops().deleteOne({ _id: cropObjId });
    await collections.pestRecords().deleteMany({ cropId: cropObjId });
    return { message: 'Crop deleted successfully' };
  }
}
