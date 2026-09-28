import { Request, Response } from 'express';
import { CropsService } from './crops.service';
import { sendSuccess } from '../../utils/response';
import { asyncHandler, AppError } from '../../utils/errors';

export const getCropsHandler = asyncHandler(async (req: Request, res: Response) => {
  const ownerId = req.user!.id;
  const farmId = req.query.farmId as string;
  const crops = await CropsService.getCropsByUser(ownerId, farmId);
  return sendSuccess(res, crops);
});

export const getCropByIdHandler = asyncHandler(async (req: Request, res: Response) => {
  const ownerId = req.user!.id;
  const { id } = req.params;
  const crop = await CropsService.getCropById(id, ownerId);
  return sendSuccess(res, crop);
});

export const createCropHandler = asyncHandler(async (req: Request, res: Response) => {
  const ownerId = req.user!.id;
  const { farmId, fieldId, cropType, variety, plantingDate, expectedHarvestDate, growthStage, area, status, notes } = req.body;

  if (!farmId || !fieldId || !cropType) {
    throw new AppError('farmId, fieldId, and cropType are required', 400, 'VALIDATION_ERROR');
  }

  const crop = await CropsService.createCrop(ownerId, {
    farmId,
    fieldId,
    cropType,
    variety,
    plantingDate,
    expectedHarvestDate,
    growthStage,
    area,
    status,
    notes
  });
  return sendSuccess(res, crop, 201);
});

export const updateCropHandler = asyncHandler(async (req: Request, res: Response) => {
  const ownerId = req.user!.id;
  const { id } = req.params;
  const crop = await CropsService.updateCrop(id, ownerId, req.body);
  return sendSuccess(res, crop);
});

export const deleteCropHandler = asyncHandler(async (req: Request, res: Response) => {
  const ownerId = req.user!.id;
  const { id } = req.params;
  const result = await CropsService.deleteCrop(id, ownerId);
  return sendSuccess(res, result);
});
