import { ObjectId } from 'mongodb';

export type UserRole = 'FARMER' | 'ADMIN' | 'AGRONOMIST';

export interface UserDoc {
  _id?: ObjectId;
  name: string;
  phone: string;
  passwordHash: string;
  role: UserRole;
  preferredLanguage: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface FarmLocation {
  latitude: number;
  longitude: number;
  address: string;
}

export interface FarmDoc {
  _id?: ObjectId;
  ownerId: ObjectId;
  name: string;
  location: FarmLocation;
  totalArea: number;
  areaUnit: 'acres' | 'hectares' | 'sq_meters';
  soilType: string;
  irrigationType: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface FieldDoc {
  _id?: ObjectId;
  farmId: ObjectId;
  name: string;
  area: number;
  soilType: string;
  irrigationType: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export type CropStatus = 'PLANNED' | 'ACTIVE' | 'HARVESTED' | 'FAILED';

export interface CropDoc {
  _id?: ObjectId;
  farmId: ObjectId;
  fieldId: ObjectId;
  cropType: string;
  variety: string;
  plantingDate: string;
  expectedHarvestDate: string;
  growthStage: string;
  area: number;
  status: CropStatus;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export type SensorType = 'soil moisture' | 'temperature' | 'humidity' | 'soil pH' | 'rainfall';
export type SensorStatus = 'ACTIVE' | 'INACTIVE' | 'MAINTENANCE' | 'OFFLINE';

export interface SensorDoc {
  _id?: ObjectId;
  farmId: ObjectId;
  fieldId?: ObjectId;
  deviceId: string;
  name: string;
  type: SensorType;
  unit: string;
  status: SensorStatus;
  lastSeen?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface SensorReadingDoc {
  _id?: ObjectId;
  sensorId: ObjectId;
  timestamp: Date;
  value: number;
  unit: string;
  createdAt: Date;
}

export type PestSeverity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface PestIdentification {
  name: string;
  category: 'PEST' | 'DISEASE' | 'UNKNOWN';
  confidence: number;
}

export interface PestAnalysisAlternative {
  name: string;
  confidence: number;
}

export interface PestAnalysisRecommendation {
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  title: string;
  description: string;
}

export interface AiPestAnalysisData {
  analyzed: boolean;
  confidence: number;
  identification?: PestIdentification;
  severity?: PestSeverity;
  summary: string;
  observations: string[];
  possibleAlternatives?: PestAnalysisAlternative[];
  recommendations: PestAnalysisRecommendation[];
  preventiveActions?: string[];
  verificationNotes?: string[];
  analyzedAt: Date | string;
}

export interface PestRecordDoc {
  _id?: ObjectId;
  cropId: ObjectId;
  farmId: ObjectId;
  fieldId?: ObjectId;
  pestName: string;
  severity: PestSeverity;
  dateDetected: string;
  affectedArea?: number;
  treatment?: string;
  notes?: string;
  aiAnalysis?: AiPestAnalysisData;
  createdAt: Date;
  updatedAt: Date;
}

export interface WeatherRecordDoc {
  _id?: ObjectId;
  farmId: ObjectId;
  temperature: number;
  humidity: number;
  rainfall: number;
  precipitationProbability: number;
  windSpeed: number;
  weatherCondition: string;
  forecastTime: Date;
  createdAt: Date;
}

export type RecommendationType = 
  | 'IRRIGATION' 
  | 'CROP_HEALTH' 
  | 'PEST_RISK' 
  | 'DISEASE_RISK' 
  | 'WEATHER_RISK' 
  | 'FERTILIZER' 
  | 'GENERAL';

export type SeverityLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface RecommendationDoc {
  _id?: ObjectId;
  farmId: ObjectId;
  cropId?: ObjectId;
  userId: ObjectId;
  type: RecommendationType;
  severity: SeverityLevel;
  title: string;
  recommendation: string;
  reasons: string[];
  confidence: number;
  reviewed?: boolean;
  generatedAt: Date;
  createdAt: Date;
}

export type AlertType = 
  | 'LOW_SOIL_MOISTURE' 
  | 'HEAVY_RAIN' 
  | 'HIGH_TEMPERATURE' 
  | 'PEST_RISK' 
  | 'DISEASE_RISK' 
  | 'CROP_MILESTONE' 
  | 'HARVEST_REMINDER' 
  | 'WEATHER_WARNING';

export interface AlertDoc {
  _id?: ObjectId;
  userId: ObjectId;
  farmId?: ObjectId;
  cropId?: ObjectId;
  type: AlertType;
  severity: SeverityLevel;
  title: string;
  message: string;
  read: boolean;
  createdAt: Date;
}

export interface ReportDoc {
  _id?: ObjectId;
  farmId: ObjectId;
  type: 'SUMMARY' | 'CROP' | 'SENSOR' | 'WEATHER' | 'PEST' | 'RECOMMENDATION';
  data: any;
  generatedAt: Date;
}
