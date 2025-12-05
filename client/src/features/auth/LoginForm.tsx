/**
 * Login Form Component
 * Handles user authentication
 */

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { loginSchema, type LoginInput } from '../../api/schema';
import { login as loginService } from '../../services/auth';
import { useAuth } from './useAuth';
import { Button, Input } from '../../components';

export function LoginForm() {
  const navigate = useNavigate();
  const { login: setAuth } = useAuth();
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
  });

  const loginMutation = useMutation({
    mutationFn: loginService,
    onSuccess: (data) => {
      setAuth(data.token, data.user);
      // Redirect based on user role
      const redirectPath =
        data.user.role === 'admin'
          ? '/admin'
          : data.user.role === 'caregiver'
          ? '/caregiver/dashboard'
          : '/customer/dashboard';
      navigate(redirectPath);
    },
    onError: (err: Error) => {
      setError(err.message || 'Login failed. Please check your credentials.');
    },
  });

  const onSubmit = (data: LoginInput) => {
    setError(null);
    loginMutation.mutate(data);
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
        isLoading={loginMutation.isPending}
        disabled={loginMutation.isPending}
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

