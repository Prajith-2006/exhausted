import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config/env';
import { AppError } from '../utils/errors';
import { ObjectId } from 'mongodb';

export interface JwtPayload {
  id: string;
  phone: string;
  role: 'FARMER' | 'ADMIN' | 'AGRONOMIST';
  name: string;
}

export const authenticate = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next(new AppError('Authentication required. Missing token.', 401, 'UNAUTHORIZED'));
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, config.jwtSecret) as JwtPayload;
    req.user = {
      ...decoded,
      _id: new ObjectId(decoded.id)
    };
    next();
  } catch (error) {
    return next(new AppError('Invalid or expired authentication token.', 401, 'INVALID_TOKEN'));
  }
};
