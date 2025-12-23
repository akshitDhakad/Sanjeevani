/**
 * Authentication controller
 */

import { Request, Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth';
import { authService } from '../services/AuthService';
import { asyncHandler } from '../utils/errors/errorHandler';

export class AuthController {
  /**
   * Register new user
   */
  public register = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const result = await authService.register(req.body);
    res.status(201).json({
      success: true,
      data: result,
    });
  });

  /**
   * Login user
   */
  public login = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const result = await authService.login(req.body);
    res.status(200).json({
      success: true,
      data: result,
    });
  });

  /**
   * Refresh access token
   */
  public refreshToken = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      return res.status(400).json({
        success: false,
        error: { message: 'Refresh token is required' },
      });
    }

    const result = await authService.refreshToken(refreshToken);
    res.status(200).json({
      success: true,
      data: result,
    });
  });

  /**
   * Get current user
   */
  public getMe = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
    const user = await authService.getUserById(req.user!.userId);
    res.status(200).json({
      success: true,
      data: user,
    });
  });
}

export const authController = new AuthController();

