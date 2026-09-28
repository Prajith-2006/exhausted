import { Router } from 'express';
import { getAlertsHandler, markReadHandler, markAllReadHandler } from './alerts.controller';
import { authenticate } from '../../middleware/auth.middleware';

const router = Router();

router.use(authenticate);

router.get('/', getAlertsHandler);
router.patch('/read-all', markAllReadHandler);
router.patch('/:id/read', markReadHandler);

export default router;
