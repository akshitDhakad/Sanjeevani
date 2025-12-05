/**
 * Payment service
 * Handles payment sessions, subscriptions, and billing
 * 
 * NOTE: Replace with real Stripe integration in production
 * Use Stripe Elements for secure card input
 */

import { apiPost, apiGet } from '../api/client';
import type { PaymentSession, Subscription } from '../types';

/**
 * Create payment checkout session
 * NOTE: Replace with Stripe Checkout Session creation
 */
export async function createCheckoutSession(params: {
  amountCents: number;
  currency?: string;
  bookingId?: string;
  subscriptionId?: string;
  successUrl: string;
  cancelUrl: string;
}): Promise<PaymentSession> {
  return apiPost<PaymentSession>('/payments/checkout', {
    amount_cents: params.amountCents,
    currency: params.currency || 'usd',
    booking_id: params.bookingId,
    subscription_id: params.subscriptionId,
    success_url: params.successUrl,
    cancel_url: params.cancelUrl,
  });
}

/**
 * Get payment session status
 */
export async function getPaymentSession(id: string): Promise<PaymentSession> {
  return apiGet<PaymentSession>(`/payments/sessions/${id}`);
}

/**
 * Create subscription
 */
export async function createSubscription(params: {
  planId: string;
  billingCycle: 'monthly' | 'yearly';
  paymentMethodId?: string;
}): Promise<Subscription> {
  return apiPost<Subscription>('/subscriptions', params);
}

/**
 * Cancel subscription
 */
export async function cancelSubscription(id: string): Promise<Subscription> {
  return apiPost<Subscription>(`/subscriptions/${id}/cancel`, {});
}

/**
 * Get user subscriptions
 */
export async function getSubscriptions(userId?: string): Promise<Subscription[]> {
  const query = userId ? `?userId=${userId}` : '';
  const response = await apiGet<{ data: Subscription[] }>(`/subscriptions${query}`);
  return response.data;
}

