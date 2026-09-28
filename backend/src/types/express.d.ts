import { ObjectId } from 'mongodb';
import { UserRole } from './models';

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        _id?: ObjectId;
        phone: string;
        role: UserRole;
        name: string;
      };
    }
  }
}
