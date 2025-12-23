/**
 * Zod schemas for runtime validation
 * These schemas match backend validation and are used for form validation
 */

import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  phone: z.string().optional(),
  role: z.enum(['customer', 'caregiver', 'vendor']).default('customer'),
});

export const updateUserSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  phone: z.string().optional(),
  city: z.string().max(100).optional(),
});

export const caregiverProfileSchema = z.object({
  services: z
    .array(z.string())
    .min(1, 'Select at least one service')
    .refine(
      (val) =>
        val.every((s) =>
          ['nursing', 'physiotherapy', 'adl', 'companionship', 'medication', 'other'].includes(s)
        ),
      'Invalid service selected'
    ),
  experienceYears: z.number().min(0, 'Experience cannot be negative').max(50, 'Experience cannot exceed 50 years'),
  hourlyRate: z.number().positive('Hourly rate must be positive').optional(),
  bio: z.string().max(500, 'Bio cannot exceed 500 characters').optional(),
  availability: z
    .object({
      days: z
        .array(z.enum(['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']))
        .min(1, 'Select at least one day'),
      startTime: z.string().regex(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format (HH:mm)'),
      endTime: z.string().regex(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format (HH:mm)'),
      timezone: z.string().default('Asia/Kolkata'),
    })
    .optional(),
});

export const documentUploadSchema = z.object({
  type: z.enum(['id_proof', 'qualification', 'background_check', 'other']),
  file: z.instanceof(File).refine((file) => file.size <= 5 * 1024 * 1024, 'File size must be less than 5MB'),
});

export const bookingSchema = z.object({
  caregiverId: z.string().min(1, 'Caregiver is required'),
  startTime: z.string().datetime('Invalid start time format'),
  endTime: z.string().datetime('Invalid end time format').optional(),
  address: z.string().min(10, 'Address must be at least 10 characters').max(500, 'Address cannot exceed 500 characters'),
  notes: z.string().max(500, 'Notes cannot exceed 500 characters').optional(),
});

export const searchFiltersSchema = z.object({
  city: z.string().optional(),
  service: z.string().optional(),
  minRating: z.number().min(0).max(5).optional(),
  maxPrice: z.number().positive().optional(),
  page: z.number().int().positive().optional(),
  limit: z.number().int().positive().max(100).optional(),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
export type CaregiverProfileInput = z.infer<typeof caregiverProfileSchema>;
export type DocumentUploadInput = z.infer<typeof documentUploadSchema>;
export type BookingInput = z.infer<typeof bookingSchema>;
export type SearchFiltersInput = z.infer<typeof searchFiltersSchema>;
