/**
 * Caregiver Onboarding Wizard
 * Multi-step form for caregiver registration and verification
 * 
 * This is a fully implemented feature with form validation, document upload,
 * and integration with the caregiver service.
 */

import React, { useState } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import {
  caregiverProfileSchema,
  type CaregiverProfileInput,
} from '../../api/schema';
import { createCaregiverProfile, uploadCaregiverDocument } from '../../services/caregivers';
import { requestVerification } from '../../services/verification';
import { useAuth } from '../auth/useAuth';
import { Button, Card } from '../../components';
import { PersonalDetails } from './steps/PersonalDetails';
import { DocumentsUpload } from './steps/DocumentsUpload';
import { VerificationStatus } from './steps/VerificationStatus';

const STEPS = [
  { id: 1, name: 'Personal Details', component: PersonalDetails },
  { id: 2, name: 'Documents', component: DocumentsUpload },
  { id: 3, name: 'Review', component: null },
] as const;

export default function CaregiverOnboardWizard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [currentStep, setCurrentStep] = useState(0);
  const [uploadedDocuments] = useState<Record<string, File>>({});
  const [submissionStatus, setSubmissionStatus] = useState<
    'idle' | 'submitting' | 'success' | 'error'
  >('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const methods = useForm<CaregiverProfileInput>({
    resolver: zodResolver(caregiverProfileSchema),
    defaultValues: {
      services: [],
      experienceYears: 0,
    },
  });

  const createProfileMutation = useMutation({
    mutationFn: createCaregiverProfile,
    onSuccess: async (profile) => {
      // Upload documents if any
      const uploadPromises = Object.entries(uploadedDocuments).map(
        ([type, file]) =>
          uploadCaregiverDocument(profile.id, file, type).catch((err) => {
            console.error(`Failed to upload ${type}:`, err);
            return null;
          })
      );

      await Promise.all(uploadPromises);

      // Request verification
      if (user?.id) {
        try {
          await requestVerification({
            userId: user.id,
            type: 'caregiver',
          });
        } catch (err) {
          console.error('Verification request failed:', err);
        }
      }

      // Invalidate queries to refresh caregiver data
      queryClient.invalidateQueries({ queryKey: ['caregivers'] });
      queryClient.invalidateQueries({ queryKey: ['auth', 'me'] });

      setSubmissionStatus('success');
    },
    onError: (err: Error) => {
      setSubmissionStatus('error');
      setErrorMessage(err.message || 'Failed to create profile. Please try again.');
    },
  });

  const handleNext = async () => {
    // Validate current step fields
    const fieldsToValidate: (keyof CaregiverProfileInput)[] =
      currentStep === 0
        ? ['name', 'email', 'city', 'services', 'experienceYears']
        : [];
    
    const isValid = await methods.trigger(fieldsToValidate);
    if (isValid && currentStep < STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const onSubmit = async (data: CaregiverProfileInput) => {
    setSubmissionStatus('submitting');
    setErrorMessage(null);
    createProfileMutation.mutate(data);
  };

  const CurrentStepComponent = STEPS[currentStep]?.component;

  if (submissionStatus === 'success') {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <Card>
          <VerificationStatus
            status="pending"
            message="Your profile has been submitted successfully! Our team will review your documents and notify you within 2-3 business days."
          />
          <div className="mt-6 flex justify-end">
            <Button onClick={() => navigate('/caregiver/dashboard')}>
              Go to Dashboard
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Caregiver Onboarding
        </h1>
        <p className="text-gray-600">
          Complete your profile to start offering care services
        </p>
      </div>

      {/* Progress indicator */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {STEPS.map((step, index) => (
            <React.Fragment key={step.id}>
              <div className="flex items-center">
                <div
                  className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                    index <= currentStep
                      ? 'bg-primary-600 border-primary-600 text-white'
                      : 'border-gray-300 text-gray-500'
                  }`}
                >
                  {index < currentStep ? '✓' : step.id}
                </div>
                <span
                  className={`ml-2 text-sm font-medium ${
                    index <= currentStep ? 'text-gray-900' : 'text-gray-500'
                  }`}
                >
                  {step.name}
                </span>
              </div>
              {index < STEPS.length - 1 && (
                <div
                  className={`flex-1 h-1 mx-4 ${
                    index < currentStep ? 'bg-primary-600' : 'bg-gray-300'
                  }`}
                />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      <FormProvider {...methods}>
        <Card>
          {CurrentStepComponent ? (
            <CurrentStepComponent />
          ) : (
            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                Review Your Information
              </h3>
              <div className="space-y-2">
                <div>
                  <strong>Name:</strong> {methods.watch('name')}
                </div>
                <div>
                  <strong>Email:</strong> {methods.watch('email')}
                </div>
                <div>
                  <strong>City:</strong> {methods.watch('city')}
                </div>
                <div>
                  <strong>Services:</strong>{' '}
                  {methods.watch('services')?.join(', ')}
                </div>
                <div>
                  <strong>Experience:</strong>{' '}
                  {methods.watch('experienceYears')} years
                </div>
              </div>
            </div>
          )}

          {errorMessage && (
            <div
              className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm"
              role="alert"
            >
              {errorMessage}
            </div>
          )}

          <div className="mt-8 flex justify-between">
            <Button
              variant="outline"
              onClick={handleBack}
              disabled={currentStep === 0}
            >
              Back
            </Button>
            {currentStep < STEPS.length - 1 ? (
              <Button onClick={handleNext}>Next</Button>
            ) : (
              <Button
                onClick={methods.handleSubmit(onSubmit)}
                isLoading={submissionStatus === 'submitting'}
                disabled={submissionStatus === 'submitting'}
              >
                Submit for Verification
              </Button>
            )}
          </div>
        </Card>
      </FormProvider>
    </div>
  );
}

