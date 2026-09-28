import { Request, Response } from 'express';
import { FieldsService } from './fields.service';
import { sendSuccess } from '../../utils/response';
import { asyncHandler, AppError } from '../../utils/errors';

export const getFieldsByFarmHandler = asyncHandler(async (req: Request, res: Response) => {
  const ownerId = req.user!.id;
  const { farmId } = req.params;
  const fields = await FieldsService.getFieldsByFarm(farmId, ownerId);
  return sendSuccess(res, fields);
});

export const getFieldByIdHandler = asyncHandler(async (req: Request, res: Response) => {
  const ownerId = req.user!.id;
  const { id } = req.params;
  const field = await FieldsService.getFieldById(id, ownerId);
  return sendSuccess(res, field);
});

export const createFieldHandler = asyncHandler(async (req: Request, res: Response) => {
  const ownerId = req.user!.id;
  const { farmId } = req.params;
  const { name, area, soilType, irrigationType, notes } = req.body;

  if (!name) {
    throw new AppError('Field name is required', 400, 'VALIDATION_ERROR');
  }

  const field = await FieldsService.createField(farmId, ownerId, {
    name,
    area,
    soilType,
    irrigationType,
    notes
  });
  return sendSuccess(res, field, 201);
});

export const updateFieldHandler = asyncHandler(async (req: Request, res: Response) => {
  const ownerId = req.user!.id;
  const { id } = req.params;
  const field = await FieldsService.updateField(id, ownerId, req.body);
  return sendSuccess(res, field);
});

export const deleteFieldHandler = asyncHandler(async (req: Request, res: Response) => {
  const ownerId = req.user!.id;
  const { id } = req.params;
  const result = await FieldsService.deleteField(id, ownerId);
  return sendSuccess(res, result);
});
