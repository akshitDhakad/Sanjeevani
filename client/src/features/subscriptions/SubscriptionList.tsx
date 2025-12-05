/**
 * Subscription List Component
 * Displays user's active subscriptions
 */

import { useQuery } from '@tanstack/react-query';
import { getSubscriptions } from '../../services/payments';
import { useAuth } from '../auth/useAuth';
import { Card, Spinner, Button } from '../../components';
import { format } from 'date-fns';

export function SubscriptionList() {
  const { user } = useAuth();

  const { data, isLoading, error } = useQuery({
    queryKey: ['subscriptions', user?.id],
    queryFn: () => getSubscriptions(user?.id),
    enabled: !!user?.id,
  });

  if (isLoading) {
    return (
      <div className="flex justify-center p-8">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
        Failed to load subscriptions.
      </div>
    );
  }

  const subscriptions = data || [];

  if (subscriptions.length === 0) {
    return (
      <Card>
        <p className="text-gray-600 text-center py-8">
          No active subscriptions. Browse our plans to get started.
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {subscriptions.map((subscription) => (
        <Card key={subscription.id} hover>
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {subscription.planName}
              </h3>
              <div className="space-y-1 text-sm text-gray-600">
                <p>
                  <strong>Status:</strong>{' '}
                  <span
                    className={`font-medium ${
                      subscription.status === 'active'
                        ? 'text-green-600'
                        : 'text-gray-600'
                    }`}
                  >
                    {subscription.status.toUpperCase()}
                  </span>
                </p>
                <p>
                  <strong>Billing Cycle:</strong>{' '}
                  {subscription.billingCycle}
                </p>
                <p>
                  <strong>Price:</strong> $
                  {(subscription.priceCents / 100).toFixed(2)}/
                  {subscription.billingCycle === 'monthly' ? 'month' : 'year'}
                </p>
                <p>
                  <strong>Start Date:</strong>{' '}
                  {format(new Date(subscription.startDate), 'PP')}
                </p>
                {subscription.endDate && (
                  <p>
                    <strong>End Date:</strong>{' '}
                    {format(new Date(subscription.endDate), 'PP')}
                  </p>
                )}
                <p>
                  <strong>Auto-renew:</strong>{' '}
                  {subscription.autoRenew ? 'Yes' : 'No'}
                </p>
              </div>
            </div>
            {subscription.status === 'active' && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  // Handle cancel subscription
                }}
              >
                Cancel
              </Button>
            )}
          </div>
        </Card>
      ))}
    </div>
  );
}

