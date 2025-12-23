/**
 * Routes export
 */

import { Router } from 'express';
import authRoutes from './auth.routes';
import userRoutes from './user.routes';
import caregiverRoutes from './caregiver.routes';
import bookingRoutes from './booking.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/caregivers', caregiverRoutes);
router.use('/bookings', bookingRoutes);

export default router;

