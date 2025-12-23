/**
 * Express application setup
 * Main server application class with all middleware and routes
 */

import express, { Application } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import compression from 'compression';
import morgan from 'morgan';
import 'express-async-errors';
import { config } from './config/env';
import { errorHandler, notFoundHandler } from './utils/errors/errorHandler';
import { apiLimiter } from './middleware/rateLimiter';
import routes from './routes';

export class App {
  public app: Application;

  constructor() {
    this.app = express();
    this.setupMiddleware();
    this.setupRoutes();
    this.setupErrorHandling();
  }

  /**
   * Setup middleware
   */
  private setupMiddleware(): void {
    // Security middleware
    this.app.use(helmet());

    // CORS configuration
    this.app.use(
      cors({
        origin: config.CORS_ORIGIN,
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization'],
      })
    );

    // Compression middleware
    this.app.use(compression());

    // Body parsing middleware
    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(express.urlencoded({ extended: true, limit: '10mb' }));

    // Logging middleware
    if (config.isDevelopment) {
      this.app.use(morgan('dev'));
    } else {
      this.app.use(morgan('combined'));
    }

    // Rate limiting
    this.app.use('/api', apiLimiter);

    // Health check endpoint
    this.app.get('/health', (_req, res) => {
      res.status(200).json({
        success: true,
        message: 'Server is running',
        timestamp: new Date().toISOString(),
        environment: config.NODE_ENV,
      });
    });
  }

  /**
   * Setup routes
   */
  private setupRoutes(): void {
    // API routes
    this.app.use('/api/v1', routes);

    // Root endpoint
    this.app.get('/', (_req, res) => {
      res.status(200).json({
        success: true,
        message: 'Home-First Elderly Care Platform API',
        version: '1.0.0',
        documentation: '/api/v1',
      });
    });
  }

  /**
   * Setup error handling
   */
  private setupErrorHandling(): void {
    // 404 handler (must be after all routes)
    this.app.use(notFoundHandler);

    // Global error handler (must be last)
    this.app.use(errorHandler);
  }

  /**
   * Start server
   */
  public listen(port: number, callback?: () => void): void {
    this.app.listen(port, () => {
      if (callback) {
        callback();
      } else {
        console.log(`🚀 Server running on port ${port}`);
        console.log(`📝 Environment: ${config.NODE_ENV}`);
        console.log(`🌐 Health check: http://localhost:${port}/health`);
      }
    });
  }
}

