import { Router } from 'express';
import { sendOtpHandler, registerHandler, loginHandler, meHandler } from './auth.controller';
import { authenticate } from '../../middleware/auth.middleware';

const router = Router();

router.post('/send-otp', sendOtpHandler);
router.post('/register', registerHandler);
router.post('/login', loginHandler);
router.get('/me', authenticate, meHandler);

export default router;

