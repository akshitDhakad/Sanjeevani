/**
 * Core type definitions for Home-First Elderly Care Platform
 */

export type Role = 'customer' | 'caregiver' | 'vendor' | 'admin';

export type VerificationStatus = 'pending' | 'verified' | 'rejected';

export type BookingStatus =
  | 'requested'
  | 'confirmed'
  | 'in_progress'
  | 'completed'
  | 'cancelled';

export type SubscriptionStatus = 'active' | 'cancelled' | 'expired' | 'pending';

export interface User {
  id: string;
  role: Role;
  name: string;
  email: string;
  phone?: string;
  city?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CaregiverProfile {
  id: string;
  userId: string;
  services: string[]; // e.g. ['nursing', 'physiotherapy', 'adl']
  experienceYears: number;
  verified: boolean;
  verificationStatus: VerificationStatus;
  documents: Document[];
  rating?: number;
  hourlyRate?: number;
  bio?: string;
  availability?: Availability;
  createdAt: string;
  updatedAt: string;
}

export interface Document {
  type: string;
  url: string;
  uploadedAt: string;
  verified: boolean;
}

export interface Availability {
  days: string[]; // e.g. ['monday', 'tuesday']
  startTime: string; // HH:mm format
  endTime: string; // HH:mm format
  timezone: string;
}

export interface Booking {
  id: string;
  customerId: string;
  caregiverId?: string;
  startTime: string;
  endTime?: string;
  status: BookingStatus;
  priceCents: number;
  address: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Subscription {
  id: string;
  userId: string;
  planId: string;
  planName: string;
  status: SubscriptionStatus;
  priceCents: number;
  billingCycle: 'monthly' | 'yearly';
  startDate: string;
  endDate?: string;
  autoRenew: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Device {
  id: string;
  vendorId: string;
  name: string;
  type: string; // e.g. 'monitor', 'alert', 'medication_dispenser'
  description?: string;
  rentalPriceCents: number;
  available: boolean;
  features: string[];
  createdAt: string;
  updatedAt: string;
}

export interface PaymentSession {
  id: string;
  amountCents: number;
  currency: string;
  status: 'pending' | 'completed' | 'failed';
  clientSecret?: string; // For Stripe integration
  createdAt: string;
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface SearchFilters {
  city?: string;
  service?: string;
  minRating?: number;
  maxPrice?: number;
  page?: number;
  limit?: number;
}

export interface AdminReport {
  totalUsers: number;
  totalCaregivers: number;
  totalBookings: number;
  activeSubscriptions: number;
  revenueCents: number;
  period: {
    start: string;
    end: string;
  };
}

