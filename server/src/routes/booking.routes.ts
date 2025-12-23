/**
 * Booking routes
 */

import { Router } from 'express';
import { bookingController } from '../controllers/BookingController';
import { protect } from '../middleware/auth';
import { validateBody, validateQuery } from '../middleware/validation';
import {
  createBookingSchema,
  updateBookingSchema,
  getBookingsQuerySchema,
} from '../validators/booking.validator';

const router = Router();

// All routes require authentication
router.use(protect);

router.post('/', validateBody(createBookingSchema), bookingController.createBooking);
router.get('/me', validateQuery(getBookingsQuerySchema), bookingController.getMyBookings);
router.get('/:id', bookingController.getBooking);
router.patch('/:id', validateBody(updateBookingSchema), bookingController.updateBooking);
router.post('/:id/cancel', bookingController.cancelBooking);

export default router;

