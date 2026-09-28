import { ObjectId } from 'mongodb';
import { collections } from '../../config/db';
import { FarmDoc } from '../../types/models';
import { AppError } from '../../utils/errors';

export class FarmsService {
  static async getFarmsByOwner(ownerId: string) {
    const ownerObjId = new ObjectId(ownerId);
    return await collections.farms().find({ ownerId: ownerObjId }).toArray();
  }

  static async getFarmById(farmId: string, ownerId: string) {
    const farmObjId = new ObjectId(farmId);
    const farm = await collections.farms().findOne({ _id: farmObjId });
    if (!farm) {
      throw new AppError('Farm not found', 404, 'FARM_NOT_FOUND');
    }

    if (farm.ownerId.toString() !== ownerId) {
      throw new AppError('Unauthorized access to farm', 403, 'FORBIDDEN');
    }

    return farm;
  }

  static async createFarm(ownerId: string, data: {
    name: string;
    location: { latitude: number; longitude: number; address: string };
    totalArea: number;
    areaUnit: 'acres' | 'hectares' | 'sq_meters';
    soilType: string;
    irrigationType: string;
    notes?: string;
  }) {
    const newFarm: FarmDoc = {
      ownerId: new ObjectId(ownerId),
      name: data.name,
      location: data.location || { latitude: 0, longitude: 0, address: 'Unknown' },
      totalArea: data.totalArea || 1,
      areaUnit: data.areaUnit || 'acres',
      soilType: data.soilType || 'Loam',
      irrigationType: data.irrigationType || 'Drip',
      notes: data.notes || '',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const result = await collections.farms().insertOne(newFarm);
    return { ...newFarm, _id: result.insertedId };
  }

  static async updateFarm(farmId: string, ownerId: string, data: Partial<FarmDoc>) {
    await this.getFarmById(farmId, ownerId);

    const farmObjId = new ObjectId(farmId);
    const { _id, ownerId: _, createdAt, ...updateFields } = data as any;
    updateFields.updatedAt = new Date();

    await collections.farms().updateOne(
      { _id: farmObjId },
      { $set: updateFields }
    );

    return await collections.farms().findOne({ _id: farmObjId });
  }

  static async deleteFarm(farmId: string, ownerId: string) {
    await this.getFarmById(farmId, ownerId);
    const farmObjId = new ObjectId(farmId);
    await collections.farms().deleteOne({ _id: farmObjId });
    // Cascade cleanup fields, crops, sensors
    await collections.fields().deleteMany({ farmId: farmObjId });
    await collections.crops().deleteMany({ farmId: farmObjId });
    await collections.sensors().deleteMany({ farmId: farmObjId });
    return { message: 'Farm deleted successfully' };
  }
}
