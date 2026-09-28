import { Router } from 'express';
import { getCropsHandler, getCropByIdHandler, createCropHandler, updateCropHandler, deleteCropHandler } from './crops.controller';
import { authenticate } from '../../middleware/auth.middleware';

const router = Router();

router.use(authenticate);

router.get('/', getCropsHandler);
router.post('/', createCropHandler);
router.get('/:id', getCropByIdHandler);
router.patch('/:id', updateCropHandler);
router.delete('/:id', deleteCropHandler);

export default router;
