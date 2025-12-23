/**
 * Caregiver controller
 */

import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth';
import { caregiverService } from '../services/CaregiverService';
import { asyncHandler } from '../utils/errors/errorHandler';

export class CaregiverController {
  /**
   * Create caregiver profile
   */
  public createProfile = asyncHandler(
    async (req: AuthRequest, res: Response, next: NextFunction) => {
      const profile = await caregiverService.createProfile({
        userId: req.user!.userId,
        ...req.body,
      });
      res.status(201).json({
        success: true,
        data: profile,
      });
    }
  );

  /**
   * Get current user's caregiver profile
   * Returns null if profile doesn't exist (valid state for new caregivers)
   */
  public getMyProfile = asyncHandler(
    async (req: AuthRequest, res: Response, next: NextFunction) => {
      try {
        const profile = await caregiverService.getProfileByUserId(req.user!.userId);
        res.status(200).json({
          success: true,
          data: profile,
        });
      } catch (error: any) {
        // If profile doesn't exist (404), return null instead of error
        // This is a valid state for caregivers who haven't completed onboarding
        if (error.statusCode === 404 || error.name === 'NotFoundError') {
          res.status(200).json({
            success: true,
            data: null,
          });
        } else {
          throw error;
        }
      }
    }
  );

  /**
   * Update caregiver profile
   */
  public updateProfile = asyncHandler(
    async (req: AuthRequest, res: Response, next: NextFunction) => {
      const profile = await caregiverService.updateProfile(req.user!.userId, req.body);
      res.status(200).json({
        success: true,
        data: profile,
      });
    }
  );

  /**
   * Search caregivers
   */
  public searchCaregivers = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
      const filters = {
        city: req.query.city as string,
        service: req.query.service as string,
        minRating: req.query.minRating ? parseFloat(req.query.minRating as string) : undefined,
        maxPrice: req.query.maxPrice ? parseFloat(req.query.maxPrice as string) : undefined,
        verificationStatus: req.query.verificationStatus as 'pending' | 'verified' | 'rejected',
        page: req.query.page ? parseInt(req.query.page as string) : 1,
        limit: req.query.limit ? parseInt(req.query.limit as string) : 10,
      };

      const result = await caregiverService.searchCaregivers(filters);
      res.status(200).json({
        success: true,
        ...result,
      });
    }
  );

  /**
   * Get caregiver profile by user ID
   */
  public getProfileByUserId = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
      const profile = await caregiverService.getProfileByUserId(req.params.userId);
      res.status(200).json({
        success: true,
        data: profile,
      });
    }
  );

  /**
   * Update verification status (admin only)
   */
  public updateVerificationStatus = asyncHandler(
    async (req: AuthRequest, res: Response, next: NextFunction) => {
      const profile = await caregiverService.updateVerificationStatus(
        req.params.userId,
        req.body.status
      );
      res.status(200).json({
        success: true,
        data: profile,
      });
    }
  );
}

export const caregiverController = new CaregiverController();

