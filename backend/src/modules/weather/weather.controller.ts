import { Request, Response } from 'express';
import { WeatherService } from './weather.service';
import { sendSuccess } from '../../utils/response';
import { asyncHandler, AppError } from '../../utils/errors';

export const getWeatherForFarmHandler = asyncHandler(async (req: Request, res: Response) => {
  const ownerId = req.user!.id;
  const { farmId } = req.params;

  if (!farmId) {
    throw new AppError('farmId parameter is required', 400, 'VALIDATION_ERROR');
  }

  const weatherData = await WeatherService.getWeatherForFarm(farmId, ownerId);
  return sendSuccess(res, weatherData);
});
