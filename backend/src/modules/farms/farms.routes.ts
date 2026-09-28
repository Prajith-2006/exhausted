import { Router } from 'express';
import multer from 'multer';
import { getFarms, getFarmById, createFarm, updateFarm, deleteFarm, analyzeFarmPhotoHandler } from './farms.controller';
import { authenticate } from '../../middleware/auth.middleware';

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }
});

const router = Router();

router.use(authenticate);

router.get('/', getFarms);
router.post('/', createFarm);
router.post('/analyze-photo', upload.single('image'), analyzeFarmPhotoHandler);
router.get('/:id', getFarmById);
router.patch('/:id', updateFarm);
router.delete('/:id', deleteFarm);

export default router;
