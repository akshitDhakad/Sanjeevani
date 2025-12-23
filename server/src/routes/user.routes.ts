/**
 * User routes
 */

import { Router } from 'express';
import { userController } from '../controllers/UserController';
import { protect, restrictTo } from '../middleware/auth';
import { validateBody, validateQuery } from '../middleware/validation';
import { updateUserSchema, getUserQuerySchema } from '../validators/user.validator';

const router: Router = Router();

// All routes require authentication
router.use(protect);

router.get('/profile', userController.getProfile);
router.patch('/profile', validateBody(updateUserSchema), userController.updateProfile);

// Admin only routes
router.get('/', restrictTo('admin'), validateQuery(getUserQuerySchema), userController.getUsers);
router.get('/:id', restrictTo('admin'), userController.getUserById);

export default router;

