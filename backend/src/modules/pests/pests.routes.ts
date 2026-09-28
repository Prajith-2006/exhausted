import { Router } from 'express';
import multer from 'multer';
import { 
  getPestsHandler, 
  getPestByIdHandler, 
  createPestHandler, 
  analyzePestHandler,
  updatePestHandler, 
  deletePestHandler 
} from './pests.controller';
import { authenticate } from '../../middleware/auth.middleware';

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

const router = Router();

router.use(authenticate);

router.get('/', getPestsHandler);
router.post('/', createPestHandler);
router.post('/analyze', upload.fields([
  { name: 'pdf', maxCount: 1 },
  { name: 'image', maxCount: 1 }
]), analyzePestHandler);
router.get('/:id', getPestByIdHandler);
router.patch('/:id', updatePestHandler);
router.delete('/:id', deletePestHandler);

export default router;

