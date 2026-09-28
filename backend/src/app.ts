import express from 'express';
import cors from 'cors';
import { requestLogger } from './middleware/logger.middleware';
import { errorHandler } from './middleware/error.middleware';
import authRoutes from './modules/auth/auth.routes';
import farmRoutes from './modules/farms/farms.routes';
import fieldRoutes from './modules/fields/fields.routes';
import cropRoutes from './modules/crops/crops.routes';
import sensorRoutes from './modules/sensors/sensors.routes';
import pestRoutes from './modules/pests/pests.routes';
import weatherRoutes from './modules/weather/weather.routes';
import recommendationRoutes from './modules/recommendations/recommendations.routes';
import alertRoutes from './modules/alerts/alerts.routes';
import reportRoutes from './modules/reports/reports.routes';

import { getFieldsByFarmHandler, createFieldHandler } from './modules/fields/fields.controller';
import { authenticate } from './middleware/auth.middleware';

const app = express();

app.use(cors());
app.use(express.json());
app.use(requestLogger);

// Health check
app.get('/api/v1/health', (req, res) => {
  res.status(200).json({ status: 'UP', service: 'smart-farmer-backend', timestamp: new Date() });
});

// Primary Domain Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/farms', farmRoutes);

// Nested field routes under farm
app.get('/api/v1/farms/:farmId/fields', authenticate, getFieldsByFarmHandler);
app.post('/api/v1/farms/:farmId/fields', authenticate, createFieldHandler);
app.use('/api/v1/fields', fieldRoutes);

app.use('/api/v1/crops', cropRoutes);
app.use('/api/v1/sensors', sensorRoutes);
app.use('/api/v1/pests', pestRoutes);
app.use('/api/v1/weather', weatherRoutes);
app.use('/api/v1/recommendations', recommendationRoutes);
app.use('/api/v1/alerts', alertRoutes);
app.use('/api/v1/reports', reportRoutes);

// Global Error Handler
app.use(errorHandler);

export default app;
