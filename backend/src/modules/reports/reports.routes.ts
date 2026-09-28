import { Router } from 'express';
import {
  getFarmReportHandler,
  getCropReportHandler,
  getSensorReportHandler,
  getWeatherReportHandler,
  getPestReportHandler,
  getRecommendationReportHandler
} from './reports.controller';
import { authenticate } from '../../middleware/auth.middleware';

const router = Router();

router.use(authenticate);

router.get('/farm/:farmId', getFarmReportHandler);
router.get('/crop/:cropId', getCropReportHandler);
router.get('/sensors/:farmId', getSensorReportHandler);
router.get('/weather/:farmId', getWeatherReportHandler);
router.get('/pests/:farmId', getPestReportHandler);
router.get('/recommendations/:farmId', getRecommendationReportHandler);

export default router;
