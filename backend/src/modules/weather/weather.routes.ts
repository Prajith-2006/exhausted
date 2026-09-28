import { Router } from 'express';
import { getWeatherForFarmHandler } from './weather.controller';
import { authenticate } from '../../middleware/auth.middleware';

const router = Router();

router.use(authenticate);

router.get('/farm/:farmId', getWeatherForFarmHandler);

export default router;
