import { Router } from 'express';
import {
  analyzeHandler,
  getRecommendationsHandler,
  getRecommendationByIdHandler,
  markReviewedHandler
} from './recommendations.controller';
import { authenticate } from '../../middleware/auth.middleware';

const router = Router();

router.use(authenticate);

router.post('/analyze', analyzeHandler);
router.get('/', getRecommendationsHandler);
router.get('/:id', getRecommendationByIdHandler);
router.patch('/:id/review', markReviewedHandler);

export default router;
