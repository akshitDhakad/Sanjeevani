/**
 * Caregiver routes
 */

import { Router } from 'express';
import { caregiverController } from '../controllers/CaregiverController';
import { protect, restrictTo } from '../middleware/auth';
import { validateBody, validateQuery } from '../middleware/validation';
import {
  createCaregiverProfileSchema,
  updateCaregiverProfileSchema,
  searchCaregiversQuerySchema,
  updateVerificationStatusSchema,
} from '../validators/caregiver.validator';

const router = Router();

// Public routes
router.get('/search', validateQuery(searchCaregiversQuerySchema), caregiverController.searchCaregivers);
router.get('/:userId', caregiverController.getProfileByUserId);

// Protected routes
router.use(protect);

router.post(
  '/profile',
  restrictTo('caregiver'),
  validateBody(createCaregiverProfileSchema),
  caregiverController.createProfile
);
router.get('/profile/me', restrictTo('caregiver'), caregiverController.getMyProfile);
router.patch(
  '/profile/me',
  restrictTo('caregiver'),
  validateBody(updateCaregiverProfileSchema),
  caregiverController.updateProfile
);

// Admin only routes
router.patch(
  '/:userId/verification',
  restrictTo('admin'),
  validateBody(updateVerificationStatusSchema),
  caregiverController.updateVerificationStatus
);

export default router;

