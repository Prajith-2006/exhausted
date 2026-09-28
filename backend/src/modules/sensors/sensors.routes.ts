import { Router } from 'express';
import {
  getSensorsHandler,
  getSensorByIdHandler,
  createSensorHandler,
  updateSensorHandler,
  deleteSensorHandler,
  addReadingHandler,
  getReadingsHandler
} from './sensors.controller';
import { authenticate } from '../../middleware/auth.middleware';

const router = Router();

router.use(authenticate);

router.get('/', getSensorsHandler);
router.post('/', createSensorHandler);
router.get('/:id', getSensorByIdHandler);
router.patch('/:id', updateSensorHandler);
router.delete('/:id', deleteSensorHandler);

router.post('/:sensorId/readings', addReadingHandler);
router.get('/:sensorId/readings', getReadingsHandler);

export default router;
