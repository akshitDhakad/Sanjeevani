/**
 * Booking controller
 */

import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth';
import { bookingService } from '../services/BookingService';
import { asyncHandler } from '../utils/errors/errorHandler';

export class BookingController {
  /**
   * Create a new booking
   */
  public createBooking = asyncHandler(
    async (req: AuthRequest, res: Response, _next: NextFunction) => {
      const booking = await bookingService.createBooking({
        customerId: req.user!.userId,
        ...req.body,
        startTime: new Date(req.body.startTime),
        endTime: req.body.endTime ? new Date(req.body.endTime) : undefined,
      });
      res.status(201).json({
        success: true,
        data: booking,
      });
    }
  );

  /**
   * Get booking by ID
   */
  public getBooking = asyncHandler(async (req: AuthRequest, res: Response, _next: NextFunction) => {
    const booking = await bookingService.getBookingById(req.params.id);
    res.status(200).json({
      success: true,
      data: booking,
    });
  });

  /**
   * Get user's bookings
   */
  public getMyBookings = asyncHandler(
    async (req: AuthRequest, res: Response, _next: NextFunction) => {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;

      const result = await bookingService.getUserBookings(
        req.user!.userId,
        req.user!.role as 'customer' | 'caregiver',
        page,
        limit
      );

      res.status(200).json({
        success: true,
        ...result,
      });
    }
  );

  /**
   * Update booking
   */
  public updateBooking = asyncHandler(
    async (req: AuthRequest, res: Response, _next: NextFunction) => {
      const booking = await bookingService.updateBooking(
        req.params.id,
        req.user!.userId,
        req.user!.role,
        {
          ...req.body,
          endTime: req.body.endTime ? new Date(req.body.endTime) : undefined,
        }
      );
      res.status(200).json({
        success: true,
        data: booking,
      });
    }
  );

  /**
   * Cancel booking
   */
  public cancelBooking = asyncHandler(
    async (req: AuthRequest, res: Response, _next: NextFunction) => {
      const booking = await bookingService.cancelBooking(req.params.id, req.user!.userId);
      res.status(200).json({
        success: true,
        data: booking,
      });
    }
  );
}

export const bookingController = new BookingController();

