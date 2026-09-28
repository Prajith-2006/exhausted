import { Request, Response } from 'express';
import { FarmsService } from './farms.service';
import { FarmVisionService } from './farms.vision';
import { sendSuccess } from '../../utils/response';
import { asyncHandler, AppError } from '../../utils/errors';

export const analyzeFarmPhotoHandler = asyncHandler(async (req: Request, res: Response) => {
  const file = req.file;
  const imageBuffer = file?.buffer;
  const mimeType = file?.mimetype || 'image/jpeg';
  const isFarmClient = req.body.isFarmClient;
  const clientError = req.body.clientError;

  if (isFarmClient === 'false') {
    return sendSuccess(res, {
      isFarm: false,
      error: clientError || 'Human face or non-farm image detected. Please capture a real farm field photo.',
      analyzedAt: new Date().toISOString()
    });
  }

  const result = await FarmVisionService.analyzeFarmPhoto(imageBuffer, mimeType);
  return sendSuccess(res, result);
});

export const getFarms = asyncHandler(async (req: Request, res: Response) => {
  const ownerId = req.user!.id;
  const farms = await FarmsService.getFarmsByOwner(ownerId);
  return sendSuccess(res, farms);
});

export const getFarmById = asyncHandler(async (req: Request, res: Response) => {
  const ownerId = req.user!.id;
  const { id } = req.params;
  const farm = await FarmsService.getFarmById(id, ownerId);
  return sendSuccess(res, farm);
});

export const createFarm = asyncHandler(async (req: Request, res: Response) => {
  const ownerId = req.user!.id;
  const { name, location, totalArea, areaUnit, soilType, irrigationType, notes } = req.body;
  if (!name) {
    throw new AppError('Farm name is required', 400, 'VALIDATION_ERROR');
  }

  const farm = await FarmsService.createFarm(ownerId, {
    name,
    location,
    totalArea,
    areaUnit,
    soilType,
    irrigationType,
    notes
  });
  return sendSuccess(res, farm, 201);
});

export const updateFarm = asyncHandler(async (req: Request, res: Response) => {
  const ownerId = req.user!.id;
  const { id } = req.params;
  const farm = await FarmsService.updateFarm(id, ownerId, req.body);
  return sendSuccess(res, farm);
});

export const deleteFarm = asyncHandler(async (req: Request, res: Response) => {
  const ownerId = req.user!.id;
  const { id } = req.params;
  const result = await FarmsService.deleteFarm(id, ownerId);
  return sendSuccess(res, result);
});
