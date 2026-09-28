import { Request, Response } from 'express';
import { AlertsService } from './alerts.service';
import { sendSuccess } from '../../utils/response';
import { asyncHandler } from '../../utils/errors';

export const getAlertsHandler = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const unreadOnly = req.query.unread === 'true';
  const alerts = await AlertsService.getAlertsByUser(userId, unreadOnly);
  return sendSuccess(res, alerts);
});

export const markReadHandler = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const { id } = req.params;
  const alert = await AlertsService.markAsRead(id, userId);
  return sendSuccess(res, alert);
});

export const markAllReadHandler = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const result = await AlertsService.markAllAsRead(userId);
  return sendSuccess(res, result);
});
