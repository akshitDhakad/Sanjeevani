/**
 * Authentication routes
 */

import { Router } from 'express';
import { authController } from '../controllers/AuthController';
import { protect } from '../middleware/auth';
import { validateBody } from '../middleware/validation';
import { authLimiter } from '../middleware/rateLimiter';
import { registerSchema, loginSchema, refreshTokenSchema } from '../validators/auth.validator';

const router = Router();

router.post('/register', authLimiter, validateBody(registerSchema), authController.register);
router.post('/login', authLimiter, validateBody(loginSchema), authController.login);
router.post('/refresh-token', authLimiter, validateBody(refreshTokenSchema), authController.refreshToken);
router.get('/me', protect, authController.getMe);

export default router;

