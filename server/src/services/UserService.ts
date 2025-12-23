/**
 * User service
 * Handles user-related business logic
 */

import { User, IUser } from '../models/User';
import { NotFoundError, BadRequestError } from '../utils/errors/AppError';

export interface UpdateUserData {
  name?: string;
  phone?: string;
  city?: string;
}

export class UserService {
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

  /**
   * Get user by email
   */
  public async getUserByEmail(email: string): Promise<IUser | null> {
    return User.findOne({ email: email.toLowerCase() });
  }

  /**
   * Update user
   */
  public async updateUser(userId: string, data: UpdateUserData): Promise<IUser> {
    const user = await this.getUserById(userId);

    // Update fields
    if (data.name !== undefined) user.name = data.name;
    if (data.phone !== undefined) user.phone = data.phone;
    if (data.city !== undefined) user.city = data.city;

    await user.save();
    return user;
  }

  /**
   * Get all users with pagination
   */
  public async getUsers(
    page: number = 1,
    limit: number = 10,
    filters?: { role?: string; city?: string; isActive?: boolean }
  ) {
    const skip = (page - 1) * limit;
    const query: any = {};

    if (filters?.role) query.role = filters.role;
    if (filters?.city) query.city = filters.city;
    if (filters?.isActive !== undefined) query.isActive = filters.isActive;

    const [users, total] = await Promise.all([
      User.find(query).skip(skip).limit(limit).sort({ createdAt: -1 }),
      User.countDocuments(query),
    ]);

    return {
      data: users,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Deactivate user
   */
  public async deactivateUser(userId: string): Promise<IUser> {
    const user = await this.getUserById(userId);
    user.isActive = false;
    await user.save();
    return user;
  }

  /**
   * Activate user
   */
  public async activateUser(userId: string): Promise<IUser> {
    const user = await this.getUserById(userId);
    user.isActive = true;
    await user.save();
    return user;
  }
}

export const userService = new UserService();

