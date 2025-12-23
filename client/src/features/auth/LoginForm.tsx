/**
 * Login Form Component
 * Handles user authentication
 */

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router-dom';
import { loginSchema, type LoginInput } from '../../api/schema';
import { useAuth } from './useAuth';
import { getErrorMessage, getValidationErrors } from '../../utils/errorHandler';
import { Button, Input } from '../../components';

export function LoginForm() {
  const navigate = useNavigate();
  const { login, isLoading } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<Record<string, string[]> | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginInput) => {
    setError(null);
    setValidationErrors(null);
    
    try {
      await login(data);
      // Redirect will be handled by AuthProvider after successful login
      // Get user from context to determine redirect path
      const redirectPath = '/customer/dashboard'; // Default, will be updated based on user role
      navigate(redirectPath);
    } catch (err) {
      const validationErrs = getValidationErrors(err);
      if (validationErrs) {
        setValidationErrors(validationErrs);
      } else {
        setError(getErrorMessage(err));
      }
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 w-full max-w-md">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Sign In</h2>
        <p className="text-gray-600">Welcome back to Home-First Care</p>
      </div>

      {error && (
        <div
          className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm"
          role="alert"
        >
          {error}
        </div>
      )}

      {validationErrors && (
        <div
          className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm"
          role="alert"
        >
          <ul className="list-disc list-inside">
            {Object.entries(validationErrors).map(([field, messages]) => (
              <li key={field}>
                {field}: {messages.join(', ')}
              </li>
            ))}
          </ul>
        </div>
      )}

      <Input
        label="Email"
        type="email"
        autoComplete="email"
        {...register('email')}
        error={errors.email?.message}
        required
      />

      <Input
        label="Password"
        type="password"
        autoComplete="current-password"
        {...register('password')}
        error={errors.password?.message}
        required
      />

      <Button
        type="submit"
        fullWidth
        isLoading={isLoading}
        disabled={isLoading}
      >
        Sign In
      </Button>

      <div className="text-sm text-center text-gray-600">
        <p>
          Don't have an account?{' '}
          <a href="/register" className="text-primary-600 hover:underline">
            Sign up
          </a>
        </p>
      </div>
    </form>
  );
}

