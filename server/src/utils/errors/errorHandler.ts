/**
 * Global error handling middleware
 */

import { Request, Response, NextFunction } from 'express';
import { AppError } from './AppError';
import { config } from '../../config/env';

export const errorHandler = (
  err: Error | AppError,
  _req: Request,
  res: Response,
  next: NextFunction
): void => {
  // If response already sent, delegate to default Express error handler
  if (res.headersSent) {
    return next(err);
  }

  // Handle known operational errors
  if (err instanceof AppError && err.isOperational) {
    res.status(err.statusCode).json({
      success: false,
      error: {
        message: err.message,
        ...(config.isDevelopment && { stack: err.stack }),
      },
    });
    return;
  }

  // Handle Mongoose validation errors
  if (err.name === 'ValidationError') {
    res.status(422).json({
      success: false,
      error: {
        message: 'Validation failed',
        details: (err as any).errors,
      },
    });
    return;
  }

  // Handle Mongoose duplicate key errors
  if ((err as any).code === 11000) {
    const field = Object.keys((err as any).keyPattern)[0];
    res.status(409).json({
      success: false,
      error: {
        message: `${field} already exists`,
      },
    });
    return;
  }

  // Handle JWT errors
  if (err.name === 'JsonWebTokenError') {
    res.status(401).json({
      success: false,
      error: {
        message: 'Invalid token',
      },
    });
    return;
  }

  if (err.name === 'TokenExpiredError') {
    res.status(401).json({
      success: false,
      error: {
        message: 'Token expired',
      },
    });
    return;
  }

  // Handle unknown errors
  console.error('❌ Unexpected error:', err);
  res.status(500).json({
    success: false,
    error: {
      message: config.isProduction ? 'Internal server error' : err.message,
      ...(config.isDevelopment && { stack: err.stack }),
    },
  });
};

/**
 * Async error wrapper to catch errors in async route handlers
 */
export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

/**
 * 404 Not Found handler
 */
export const notFoundHandler = (req: Request, res: Response, _next: NextFunction): void => {
  res.status(404).json({
    success: false,
    error: {
      message: `Route ${req.originalUrl} not found`,
    },
  });
};

