import { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { sendSuccess } from '../../utils/response';
import { asyncHandler, AppError } from '../../utils/errors';

export const sendOtpHandler = asyncHandler(async (req: Request, res: Response) => {
  const { phone } = req.body;
  if (!phone) {
    throw new AppError('Phone number is required to send OTP', 400, 'VALIDATION_ERROR');
  }

  const result = await AuthService.sendOtp(phone);
  return sendSuccess(res, result, 200);
});

export const registerHandler = asyncHandler(async (req: Request, res: Response) => {
  const { name, phone, password, otp, role, preferredLanguage } = req.body;
  if (!name || !phone || (!password && !otp)) {
    throw new AppError('Name, phone, and password or OTP are required', 400, 'VALIDATION_ERROR');
  }

  const result = await AuthService.register({ name, phone, password, otp, role, preferredLanguage });
  return sendSuccess(res, result, 201);
});

export const loginHandler = asyncHandler(async (req: Request, res: Response) => {
  const { phone, password, otp } = req.body;
  if (!phone || (!password && !otp)) {
    throw new AppError('Phone and password or OTP are required', 400, 'VALIDATION_ERROR');
  }

  const result = await AuthService.login(phone, password, otp);
  return sendSuccess(res, result, 200);
});

export const meHandler = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const user = await AuthService.me(userId);
  return sendSuccess(res, user, 200);
});

