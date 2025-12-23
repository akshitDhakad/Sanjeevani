/**
 * Authentication service
 * Handles user authentication, JWT token generation, and password management
 */

import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User, IUser } from '../models/User';
import { BadRequestError, UnauthorizedError, NotFoundError } from '../utils/errors/AppError';
import { config } from '../config/env';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  phone?: string;
  role?: 'customer' | 'caregiver' | 'vendor';
}

export interface TokenPayload {
  userId: string;
  email: string;
  role: string;
}

export interface AuthResponse {
  user: Omit<IUser, 'password'>;
  token: string;
  refreshToken: string;
}

export class AuthService {
  /**
   * Register a new user
   */
  public async register(data: RegisterData): Promise<AuthResponse> {
    // Check if user already exists
    const existingUser = await User.findOne({ email: data.email.toLowerCase() });
    if (existingUser) {
      throw new BadRequestError('User with this email already exists');
    }

    // Hash password
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(data.password, salt);

    // Create user
    const user = await User.create({
      name: data.name,
      email: data.email.toLowerCase(),
      password: hashedPassword,
      phone: data.phone,
      role: data.role || 'customer',
    });

    // Generate tokens
    const tokens = this.generateTokens({
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
    });

    return {
      user: user.toJSON() as unknown as Omit<IUser, 'password'>,
      ...tokens,
    };
  }

  /**
   * Login user
   */
  public async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const { email, password } = credentials;

    // Find user with password field
    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    if (!user) {
      throw new UnauthorizedError('Invalid email or password');
    }

    // Check if user is active
    if (!user.isActive) {
      throw new UnauthorizedError('Account is deactivated');
    }

    // Verify password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      throw new UnauthorizedError('Invalid email or password');
    }

    // Generate tokens
    const tokens = this.generateTokens({
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
    });

    return {
      user: user.toJSON() as unknown as Omit<IUser, 'password'>,
      ...tokens,
    };
  }

  /**
   * Refresh access token
   */
  public async refreshToken(refreshToken: string): Promise<{ token: string }> {
    try {
      const decoded = jwt.verify(refreshToken, config.JWT_REFRESH_SECRET) as TokenPayload;

      // Verify user still exists and is active
      const user = await User.findById(decoded.userId);
      if (!user || !user.isActive) {
        throw new UnauthorizedError('User not found or inactive');
      }

      // Generate new access token
      const token = this.generateAccessToken({
        userId: user._id.toString(),
        email: user.email,
        role: user.role,
      });

      return { token };
    } catch (error) {
      if (error instanceof jwt.JsonWebTokenError) {
        throw new UnauthorizedError('Invalid refresh token');
      }
      throw error;
    }
  }

  /**
   * Verify JWT token
   */
  public verifyToken(token: string): TokenPayload {
    try {
      return jwt.verify(token, config.JWT_SECRET) as TokenPayload;
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        throw new UnauthorizedError('Token expired');
      }
      if (error instanceof jwt.JsonWebTokenError) {
        throw new UnauthorizedError('Invalid token');
      }
      throw new UnauthorizedError('Token verification failed');
    }
  }

  /**
   * Generate access and refresh tokens
   */
  private generateTokens(payload: TokenPayload): { token: string; refreshToken: string } {
    return {
      token: this.generateAccessToken(payload),
      refreshToken: this.generateRefreshToken(payload),
    };
  }

  /**
   * Generate access token
   */
  private generateAccessToken(payload: TokenPayload): string {
    return jwt.sign(payload, config.JWT_SECRET, {
      expiresIn: config.JWT_EXPIRE as string,
    } as jwt.SignOptions);
  }

  /**
   * Generate refresh token
   */
  private generateRefreshToken(payload: TokenPayload): string {
    return jwt.sign(payload, config.JWT_REFRESH_SECRET, {
      expiresIn: config.JWT_REFRESH_EXPIRE as string,
    } as jwt.SignOptions);
  }

  /**
   * Get user by ID
   */
  public async getUserById(userId: string): Promise<IUser> {
    const user = await User.findById(userId);
    if (!user) {
      throw new NotFoundError('User not found');
    }
    return user;
  }
}

export const authService = new AuthService();

