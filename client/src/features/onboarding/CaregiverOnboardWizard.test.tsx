/**
 * Caregiver Onboarding Wizard Test
 * Example test using MSW for API mocking
 */

import React from 'react';
import { describe, it, expect, beforeEach, beforeAll, afterEach, afterAll } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import CaregiverOnboardWizard from './CaregiverOnboardWizard';
import { AuthProvider } from '../auth/AuthProvider';
import { handlers } from '../../mocks/handlers';

// Mock MSW server
const server = setupServer(...handlers);

// Start server before all tests
beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));

// Reset handlers after each test
afterEach(() => server.resetHandlers());

// Clean up after all tests
afterAll(() => server.close());

const TestWrapper = ({ children }: { children: React.ReactNode }) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>{children}</AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
};

describe('CaregiverOnboardWizard', () => {
  beforeEach(() => {
    // Mock successful API responses
    server.use(
      http.post('http://localhost:4000/caregivers', () => {
        return HttpResponse.json({
          id: 'c1',
          userId: '1',
          services: ['nursing'],
          experienceYears: 5,
          verified: false,
          verificationStatus: 'pending',
          documents: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
      }),
      http.post('http://localhost:4000/verification/request', () => {
        return HttpResponse.json({
          id: 'v1',
          userId: '1',
          status: 'pending',
          requestedAt: new Date().toISOString(),
        });
      })
    );
  });

  it('renders personal details step initially', () => {
    render(
      <TestWrapper>
        <CaregiverOnboardWizard />
      </TestWrapper>
    );

    expect(screen.getByText('Personal Information')).toBeInTheDocument();
    expect(screen.getByLabelText(/full name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
  });

  it('allows user to fill personal details and proceed', async () => {
    const user = userEvent.setup();
    render(
      <TestWrapper>
        <CaregiverOnboardWizard />
      </TestWrapper>
    );

    // Fill form fields
    await user.type(screen.getByLabelText(/full name/i), 'John Doe');
    await user.type(screen.getByLabelText(/email/i), 'john@example.com');
    await user.type(screen.getByLabelText(/city/i), 'New York');
    await user.type(
      screen.getByLabelText(/years of experience/i),
      '5'
    );

    // Select a service
    const serviceCheckbox = screen.getByText(/nursing care/i).closest('label');
    if (serviceCheckbox) {
      await user.click(serviceCheckbox);
    }

    // Click Next
    const nextButton = screen.getByRole('button', { name: /next/i });
    await user.click(nextButton);

    // Should move to documents step
    await waitFor(() => {
      expect(screen.getByText('Document Verification')).toBeInTheDocument();
    });
  });

  it('shows validation errors for required fields', async () => {
    const user = userEvent.setup();
    render(
      <TestWrapper>
        <CaregiverOnboardWizard />
      </TestWrapper>
    );

    // Try to proceed without filling required fields
    const nextButton = screen.getByRole('button', { name: /next/i });
    await user.click(nextButton);

    // Should show validation errors
    await waitFor(() => {
      expect(screen.getByText(/name must be at least/i)).toBeInTheDocument();
    });
  });
});

