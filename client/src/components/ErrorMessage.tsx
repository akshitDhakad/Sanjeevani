/**
 * Error Message Component
 * Displays user-friendly error messages
 */

import React from 'react';
import { getErrorMessage, getValidationErrors } from '../utils/errorHandler';

interface ErrorMessageProps {
  error: unknown;
  className?: string;
}

export function ErrorMessage({ error, className = '' }: ErrorMessageProps) {
  if (!error) return null;

  const message = getErrorMessage(error);
  const validationErrors = getValidationErrors(error);

  if (validationErrors) {
    return (
      <div
        className={`p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm ${className}`}
        role="alert"
      >
        <p className="font-semibold mb-2">Validation Errors:</p>
        <ul className="list-disc list-inside space-y-1">
          {Object.entries(validationErrors).map(([field, messages]) => (
            <li key={field}>
              <span className="font-medium">{field}:</span> {messages.join(', ')}
            </li>
          ))}
        </ul>
      </div>
    );
  }

  return (
    <div
      className={`p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm ${className}`}
      role="alert"
    >
      {message}
    </div>
  );
}

