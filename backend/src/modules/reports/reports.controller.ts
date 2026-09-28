import { Request, Response } from 'express';
import { ReportsService } from './reports.service';
import { sendSuccess } from '../../utils/response';
import { asyncHandler, AppError } from '../../utils/errors';

export const getFarmReportHandler = asyncHandler(async (req: Request, res: Response) => {
  const ownerId = req.user!.id;
  const { farmId } = req.params;
  const report = await ReportsService.getFarmReport(farmId, ownerId);
  return sendSuccess(res, report);
});

export const getCropReportHandler = asyncHandler(async (req: Request, res: Response) => {
  const ownerId = req.user!.id;
  const { cropId } = req.params;
  const report = await ReportsService.getCropReport(cropId, ownerId);
  return sendSuccess(res, report);
});

export const getSensorReportHandler = asyncHandler(async (req: Request, res: Response) => {
  const ownerId = req.user!.id;
  const { farmId } = req.params;
  const report = await ReportsService.getSensorReport(farmId, ownerId);
  return sendSuccess(res, report);
});

export const getWeatherReportHandler = asyncHandler(async (req: Request, res: Response) => {
  const ownerId = req.user!.id;
  const { farmId } = req.params;
  const report = await ReportsService.getWeatherReport(farmId, ownerId);
  return sendSuccess(res, report);
});

export const getPestReportHandler = asyncHandler(async (req: Request, res: Response) => {
  const ownerId = req.user!.id;
  const { farmId } = req.params;
  const report = await ReportsService.getPestReport(farmId, ownerId);
  return sendSuccess(res, report);
});

export const getRecommendationReportHandler = asyncHandler(async (req: Request, res: Response) => {
  const ownerId = req.user!.id;
  const { farmId } = req.params;
  const report = await ReportsService.getRecommendationReport(farmId, ownerId);
  return sendSuccess(res, report);
});
