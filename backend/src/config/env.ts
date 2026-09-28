import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

export const config = {
  port: parseInt(process.env.PORT || '5000', 10),
  mongodbUri: process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/smart_farmer',
  jwtSecret: process.env.JWT_SECRET || 'smart_farmer_super_secret_jwt_key_2026!',
  weatherApiKey: process.env.WEATHER_API_KEY || '',
  aiApiKey: process.env.AI_API_KEY || '',
  nodeEnv: process.env.NODE_ENV || 'development'
};
