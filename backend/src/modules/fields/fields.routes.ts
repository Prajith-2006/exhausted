import { Router } from 'express';
import { getFieldByIdHandler, updateFieldHandler, deleteFieldHandler } from './fields.controller';
import { authenticate } from '../../middleware/auth.middleware';

const router = Router();

router.use(authenticate);

router.get('/:id', getFieldByIdHandler);
router.patch('/:id', updateFieldHandler);
router.delete('/:id', deleteFieldHandler);

export default router;
