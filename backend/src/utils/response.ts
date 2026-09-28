import { Response } from 'express';

export const sendSuccess = (res: Response, data: any = {}, statusCode: number = 200) => {
  return res.status(statusCode).json({
    success: true,
    data
  });
};

export const sendError = (
  res: Response, 
  message: string, 
  code: string = 'BAD_REQUEST', 
  statusCode: number = 400
) => {
  return res.status(statusCode).json({
    success: false,
    error: {
      code,
      message
    }
  });
};
