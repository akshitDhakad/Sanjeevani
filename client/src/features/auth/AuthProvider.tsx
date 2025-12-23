/**
 * Authentication Context Provider
 * Manages user authentication state and provides auth methods with token refresh
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { getCurrentUser, logout as logoutService, login as loginService, register as registerService } from '../../services/auth';
import type { User } from '../../types';
import type { LoginCredentials, RegisterCredentials } from '../../services/auth';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (credentials: RegisterCredentials) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const queryClient = useQueryClient();

  // Check if user is authenticated on mount
  const token = localStorage.getItem('auth_token');
  const { data: currentUser, isLoading, error } = useQuery({
    queryKey: ['auth', 'me'],
    queryFn: getCurrentUser,
    enabled: !!token,
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  });

  // Handle authentication errors
  useEffect(() => {
    if (error && !token) {
      setUser(null);
    }
  }, [error, token]);

  useEffect(() => {
    if (currentUser) {
      setUser(currentUser);
    } else if (!token) {
      setUser(null);
    }
  }, [currentUser, token]);

  // Login mutation
  const loginMutation = useMutation({
    mutationFn: loginService,
    onSuccess: (data) => {
      setUser(data.user);
      queryClient.setQueryData(['auth', 'me'], data.user);
    },
    onError: (error) => {
      console.error('Login error:', error);
      throw error;
    },
  });

  // Register mutation
  const registerMutation = useMutation({
    mutationFn: registerService,
    onSuccess: (data) => {
      setUser(data.user);
      queryClient.setQueryData(['auth', 'me'], data.user);
    },
    onError: (error) => {
      console.error('Register error:', error);
      throw error;
    },
  });

  // Logout mutation
  const logoutMutation = useMutation({
    mutationFn: logoutService,
    onSuccess: () => {
      setUser(null);
      queryClient.clear();
    },
    onError: (error) => {
      console.error('Logout error:', error);
      // Clear anyway
      setUser(null);
      queryClient.clear();
    },
  });

  const login = useCallback(async (credentials: LoginCredentials) => {
    await loginMutation.mutateAsync(credentials);
  }, [loginMutation]);

  const register = useCallback(async (credentials: RegisterCredentials) => {
    await registerMutation.mutateAsync(credentials);
  }, [registerMutation]);

  const logout = useCallback(async () => {
    await logoutMutation.mutateAsync();
  }, [logoutMutation]);

  const value: AuthContextType = {
    user,
    isLoading: isLoading || loginMutation.isPending || registerMutation.isPending,
    isAuthenticated: !!user,
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
