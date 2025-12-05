/**
 * Personal Details Step
 * First step of caregiver onboarding
 */

import { useFormContext } from 'react-hook-form';
import { Input } from '../../../components';
import type { CaregiverProfileInput } from '../../../api/schema';

const SERVICE_OPTIONS = [
  { value: 'nursing', label: 'Nursing Care' },
  { value: 'physiotherapy', label: 'Physiotherapy' },
  { value: 'adl', label: 'Activities of Daily Living (ADL)' },
  { value: 'companionship', label: 'Companionship' },
  { value: 'medication_management', label: 'Medication Management' },
  { value: 'meal_preparation', label: 'Meal Preparation' },
  { value: 'transportation', label: 'Transportation' },
];

export function PersonalDetails() {
  const {
    register,
    formState: { errors },
    watch,
    setValue,
  } = useFormContext<CaregiverProfileInput>();

  const selectedServices = watch('services') || [];

  const handleServiceToggle = (serviceValue: string) => {
    const current = selectedServices;
    if (current.includes(serviceValue)) {
      const filtered = current.filter((s) => s !== serviceValue);
      // Don't allow removing the last service - validation requires at least one
      if (filtered.length > 0) {
        setValue('services', filtered as [string, ...string[]], {
          shouldValidate: true,
        });
      }
      // If trying to remove the last service, do nothing (validation will prevent submission)
    } else {
      setValue('services', [...current, serviceValue] as [string, ...string[]], {
        shouldValidate: true,
      });
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          Personal Information
        </h3>
        <p className="text-sm text-gray-600">
          Please provide your basic information to get started.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="Full Name"
          {...register('name')}
          error={errors.name?.message}
          required
        />

        <Input
          label="Email"
          type="email"
          {...register('email')}
          error={errors.email?.message}
          required
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="Phone Number"
          type="tel"
          {...register('phone')}
          error={errors.phone?.message}
        />

        <Input
          label="City"
          {...register('city')}
          error={errors.city?.message}
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Services Offered <span className="text-red-500">*</span>
        </label>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {SERVICE_OPTIONS.map((option) => (
            <label
              key={option.value}
              className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
            >
              <input
                type="checkbox"
                checked={selectedServices.includes(option.value)}
                onChange={() => handleServiceToggle(option.value)}
                className="mr-2 h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
              <span className="text-sm text-gray-700">{option.label}</span>
            </label>
          ))}
        </div>
        {errors.services && (
          <p className="mt-1 text-sm text-red-600" role="alert">
            {errors.services.message}
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="Years of Experience"
          type="number"
          min="0"
          max="50"
          {...register('experienceYears', { valueAsNumber: true })}
          error={errors.experienceYears?.message}
          required
        />

        <Input
          label="Hourly Rate (USD)"
          type="number"
          min="0"
          step="0.01"
          {...register('hourlyRate', { valueAsNumber: true })}
          error={errors.hourlyRate?.message}
          helperText="Optional - you can set this later"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Bio (Optional)
        </label>
        <textarea
          {...register('bio')}
          rows={4}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          placeholder="Tell us about your background and experience..."
        />
        {errors.bio && (
          <p className="mt-1 text-sm text-red-600" role="alert">
            {errors.bio.message}
          </p>
        )}
      </div>
    </div>
  );
}

