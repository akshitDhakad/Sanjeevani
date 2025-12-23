/**
 * User controller
 */

import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth';
import { userService } from '../services/UserService';
import { asyncHandler } from '../utils/errors/errorHandler';

export class UserController {
  /**
   * Get current user profile
   */
  public getProfile = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
    const user = await userService.getUserById(req.user!.userId);
    res.status(200).json({
      success: true,
      data: user,
    });
  });

  /**
   * Update current user profile
   */
  public updateProfile = asyncHandler(
    async (req: AuthRequest, res: Response, next: NextFunction) => {
      const user = await userService.updateUser(req.user!.userId, req.body);
      res.status(200).json({
        success: true,
        data: user,
      });
    }
  );

  /**
   * Get all users (admin only)
   */
  public getUsers = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    const result = await userService.getUsers(page, limit, {
      role: req.query.role as string,
      city: req.query.city as string,
      isActive: req.query.isActive ? req.query.isActive === 'true' : undefined,
    });

    res.status(200).json({
      success: true,
      ...result,
    });
  });

  /**
   * Get user by ID (admin only)
   */
  public getUserById = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
    const user = await userService.getUserById(req.params.id);
    res.status(200).json({
      success: true,
      data: user,
    });
  });
}

export const userController = new UserController();

