import { Request, Response } from 'express';
import { RecommendationsService } from './recommendations.service';
import { sendSuccess } from '../../utils/response';
import { asyncHandler, AppError } from '../../utils/errors';

export const analyzeHandler = asyncHandler(async (req: Request, res: Response) => {
  const ownerId = req.user!.id;
  const { farmId, cropId } = req.body;

  if (!farmId) {
    throw new AppError('farmId is required for AI analysis', 400, 'VALIDATION_ERROR');
  }

  const recommendation = await RecommendationsService.analyzeAndRecommend(ownerId, farmId, cropId);
  return sendSuccess(res, recommendation, 201);
});

export const getRecommendationsHandler = asyncHandler(async (req: Request, res: Response) => {
  const ownerId = req.user!.id;
  const farmId = req.query.farmId as string;
  const list = await RecommendationsService.getRecommendationsByUser(ownerId, farmId);
  return sendSuccess(res, list);
});

export const getRecommendationByIdHandler = asyncHandler(async (req: Request, res: Response) => {
  const ownerId = req.user!.id;
  const { id } = req.params;
  const item = await RecommendationsService.getRecommendationById(id, ownerId);
  return sendSuccess(res, item);
});

export const markReviewedHandler = asyncHandler(async (req: Request, res: Response) => {
  const ownerId = req.user!.id;
  const { id } = req.params;
  const item = await RecommendationsService.markReviewed(id, ownerId);
  return sendSuccess(res, item);
});
