/**
 * Billing Component
 * Manages payment methods and billing history
 */

import { Card } from '../../components';

export function Billing() {
  return (
    <div className="space-y-6">
      <Card>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Payment Methods
        </h2>
        <p className="text-gray-600 mb-4">
          Manage your payment methods for subscriptions and bookings.
        </p>
        <div className="p-4 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-600">
            Payment method management will be integrated with Stripe in
            production.
          </p>
        </div>
      </Card>

      <Card>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Billing History
        </h2>
        <p className="text-gray-600">
          View your past invoices and payment history.
        </p>
        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-600">
            Billing history will be available after payment integration.
          </p>
        </div>
      </Card>
    </div>
  );
}

