import { ObjectId } from 'mongodb';
import { collections } from '../../config/db';
import { FieldDoc } from '../../types/models';
import { AppError } from '../../utils/errors';
import { FarmsService } from '../farms/farms.service';

export class FieldsService {
  static async getFieldsByFarm(farmId: string, ownerId: string) {
    await FarmsService.getFarmById(farmId, ownerId);
    return await collections.fields().find({ farmId: new ObjectId(farmId) }).toArray();
  }

  static async getFieldById(fieldId: string, ownerId: string) {
    const fieldObjId = new ObjectId(fieldId);
    const field = await collections.fields().findOne({ _id: fieldObjId });
    if (!field) {
      throw new AppError('Field not found', 404, 'FIELD_NOT_FOUND');
    }

    // Verify ownership of the parent farm
    await FarmsService.getFarmById(field.farmId.toString(), ownerId);
    return field;
  }

  static async createField(farmId: string, ownerId: string, data: {
    name: string;
    area: number;
    soilType?: string;
    irrigationType?: string;
    notes?: string;
  }) {
    const farm = await FarmsService.getFarmById(farmId, ownerId);

    const newField: FieldDoc = {
      farmId: new ObjectId(farmId),
      name: data.name,
      area: data.area || 1,
      soilType: data.soilType || farm.soilType || 'Loam',
      irrigationType: data.irrigationType || farm.irrigationType || 'Drip',
      notes: data.notes || '',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const result = await collections.fields().insertOne(newField);
    return { ...newField, _id: result.insertedId };
  }

  static async updateField(fieldId: string, ownerId: string, data: Partial<FieldDoc>) {
    await this.getFieldById(fieldId, ownerId);
    const fieldObjId = new ObjectId(fieldId);

    const { _id, farmId: _, createdAt, ...updateFields } = data as any;
    updateFields.updatedAt = new Date();

    await collections.fields().updateOne(
      { _id: fieldObjId },
      { $set: updateFields }
    );

    return await collections.fields().findOne({ _id: fieldObjId });
  }

  static async deleteField(fieldId: string, ownerId: string) {
    await this.getFieldById(fieldId, ownerId);
    const fieldObjId = new ObjectId(fieldId);
    await collections.fields().deleteOne({ _id: fieldObjId });
    // Cleanup associated crops and sensors
    await collections.crops().deleteMany({ fieldId: fieldObjId });
    await collections.sensors().deleteMany({ fieldId: fieldObjId });
    return { message: 'Field deleted successfully' };
  }
}
