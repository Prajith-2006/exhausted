import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { collections } from '../../config/db';
import { config } from '../../config/env';
import { AppError } from '../../utils/errors';
import { UserDoc } from '../../types/models';
import { ObjectId } from 'mongodb';

// In-memory OTP storage for demo & verification (phone -> { code, expiresAt })
const otpStore = new Map<string, { code: string; expiresAt: number }>();

function normalizePhone(phone: string): string {
  let cleaned = phone.replace(/[\s\-\(\)]/g, '');
  if (!cleaned.startsWith('+')) {
    cleaned = '+' + cleaned;
  }
  return cleaned;
}

export class AuthService {
  static async sendOtp(phone: string) {
    const normalized = normalizePhone(phone);
    // For demo purposes, use '123456' as standard static OTP or 6-digit code
    const otp = '123456';
    const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes

    otpStore.set(normalized, { code: otp, expiresAt });

    const userExists = !!(await collections.users().findOne({ phone: normalized }));

    return {
      phone: normalized,
      otp,
      userExists,
      message: `OTP sent successfully to ${normalized}`
    };
  }

  static async register(data: {
    name: string;
    phone: string;
    password?: string;
    otp?: string;
    role?: 'FARMER' | 'ADMIN' | 'AGRONOMIST';
    preferredLanguage?: string;
  }) {
    const normalizedPhone = normalizePhone(data.phone);

    // Verify OTP if provided
    if (data.otp) {
      this.verifyOtpCode(normalizedPhone, data.otp);
    }

    const existingUser = await collections.users().findOne({ phone: normalizedPhone });
    if (existingUser) {
      throw new AppError('A user with this phone number already exists', 400, 'USER_EXISTS');
    }

    const passwordHash = data.password 
      ? await bcrypt.hash(data.password, 10) 
      : await bcrypt.hash('OTP_AUTHENTICATED_USER', 10);

    const newUser: UserDoc = {
      name: data.name,
      phone: normalizedPhone,
      passwordHash,
      role: data.role || 'FARMER',
      preferredLanguage: data.preferredLanguage || 'en',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const result = await collections.users().insertOne(newUser);
    const userId = result.insertedId.toString();

    const token = jwt.sign(
      {
        id: userId,
        phone: newUser.phone,
        role: newUser.role,
        name: newUser.name
      },
      config.jwtSecret,
      { expiresIn: '7d' }
    );

    return {
      user: {
        id: userId,
        name: newUser.name,
        phone: newUser.phone,
        role: newUser.role,
        preferredLanguage: newUser.preferredLanguage
      },
      token
    };
  }

  static async login(phone: string, password?: string, otp?: string) {
    const normalizedPhone = normalizePhone(phone);
    let user = await collections.users().findOne({ phone: normalizedPhone });

    // If OTP is provided
    if (otp) {
      this.verifyOtpCode(normalizedPhone, otp);

      // Auto-register demo/new farmer if logging in with OTP and not yet registered
      if (!user) {
        const newUser: UserDoc = {
          name: `Farmer (${normalizedPhone.slice(-4)})`,
          phone: normalizedPhone,
          passwordHash: await bcrypt.hash('OTP_AUTHENTICATED_USER', 10),
          role: 'FARMER',
          preferredLanguage: 'en',
          createdAt: new Date(),
          updatedAt: new Date()
        };
        const res = await collections.users().insertOne(newUser);
        user = { ...newUser, _id: res.insertedId };
      }
    } else if (password) {
      if (!user) {
        throw new AppError('Invalid phone number or password', 401, 'INVALID_CREDENTIALS');
      }
      const isMatch = await bcrypt.compare(password, user.passwordHash);
      if (!isMatch) {
        throw new AppError('Invalid phone number or password', 401, 'INVALID_CREDENTIALS');
      }
    } else {
      throw new AppError('Password or OTP required for login', 400, 'VALIDATION_ERROR');
    }

    const userId = user._id!.toString();

    const token = jwt.sign(
      {
        id: userId,
        phone: user.phone,
        role: user.role,
        name: user.name
      },
      config.jwtSecret,
      { expiresIn: '7d' }
    );

    return {
      user: {
        id: userId,
        name: user.name,
        phone: user.phone,
        role: user.role,
        preferredLanguage: user.preferredLanguage
      },
      token
    };
  }

  private static verifyOtpCode(phone: string, inputOtp: string) {
    // Standard demo bypass: '123456' is always valid for seamless testing
    if (inputOtp === '123456') return true;

    const record = otpStore.get(phone);
    if (!record) {
      throw new AppError('OTP expired or not requested. Please request a new OTP code.', 400, 'INVALID_OTP');
    }
    if (Date.now() > record.expiresAt) {
      otpStore.delete(phone);
      throw new AppError('OTP expired. Please request a new code.', 400, 'OTP_EXPIRED');
    }
    if (record.code !== inputOtp) {
      throw new AppError('Invalid OTP code. Please enter the 6-digit code received.', 400, 'INVALID_OTP');
    }
    otpStore.delete(phone);
    return true;
  }

  static async me(userId: string) {
    const user = await collections.users().findOne({ _id: new ObjectId(userId) });
    if (!user) {
      throw new AppError('User not found', 404, 'USER_NOT_FOUND');
    }

    return {
      id: user._id!.toString(),
      name: user.name,
      phone: user.phone,
      role: user.role,
      preferredLanguage: user.preferredLanguage,
      createdAt: user.createdAt
    };
  }
}

