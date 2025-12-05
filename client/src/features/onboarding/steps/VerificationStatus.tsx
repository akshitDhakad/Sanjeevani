/**
 * Verification Status Step
 * Shows current verification status after submission
 */

import type { VerificationStatus } from '../../../types';

interface VerificationStatusProps {
  status?: VerificationStatus;
  message?: string;
}

export function VerificationStatus({
  status = 'pending',
  message,
}: VerificationStatusProps) {
  const statusConfig = {
    pending: {
      icon: '⏳',
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
      borderColor: 'border-yellow-200',
      title: 'Verification Pending',
      description:
        message ||
        'Your documents are under review. We will notify you once verification is complete.',
    },
    verified: {
      icon: '✅',
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
      title: 'Verified',
      description:
        message ||
        'Congratulations! Your profile has been verified. You can now start accepting bookings.',
    },
    rejected: {
      icon: '❌',
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200',
      title: 'Verification Rejected',
      description:
        message ||
        'Your verification was rejected. Please check the reason and resubmit your documents.',
    },
  };

  const config = statusConfig[status];

  return (
    <div
      className={`p-6 border-2 rounded-lg ${config.bgColor} ${config.borderColor}`}
    >
      <div className="flex items-start">
        <span className="text-4xl mr-4">{config.icon}</span>
        <div className="flex-1">
          <h4 className={`text-lg font-semibold ${config.color} mb-2`}>
            {config.title}
          </h4>
          <p className="text-sm text-gray-700">{config.description}</p>
        </div>
      </div>
    </div>
  );
}

