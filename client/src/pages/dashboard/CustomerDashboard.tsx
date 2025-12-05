/**
 * Customer Dashboard Page
 * Main dashboard for customers to manage bookings, subscriptions, and browse caregivers
 */

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getCaregivers } from '../../services/caregivers';
import { useDebounce } from '../../hooks/useDebounce';
import { BookingList } from '../../features/bookings/BookingList';
import { SubscriptionList } from '../../features/subscriptions/SubscriptionList';
import { Card, Input, Button, Select, Spinner } from '../../components';
import { useAuth } from '../../features/auth/useAuth';

export function CustomerDashboard() {
  const { user } = useAuth();
  const [searchCity, setSearchCity] = useState('');
  const [searchService, setSearchService] = useState('');
  const debouncedCity = useDebounce(searchCity, 500);

  const { data: caregiversData, isLoading } = useQuery({
    queryKey: ['caregivers', debouncedCity, searchService],
    queryFn: () =>
      getCaregivers({
        city: debouncedCity || undefined,
        service: searchService || undefined,
        page: 1,
        limit: 10,
      }),
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, {user?.name}!
          </h1>
          <p className="text-gray-600 mt-2">
            Manage your bookings, subscriptions, and find caregivers.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Search Caregivers */}
            <Card>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Find Caregivers
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <Input
                  label="City"
                  placeholder="Enter city name"
                  value={searchCity}
                  onChange={(e) => setSearchCity(e.target.value)}
                />
                <Select
                  label="Service"
                  options={[
                    { value: '', label: 'All Services' },
                    { value: 'nursing', label: 'Nursing Care' },
                    { value: 'physiotherapy', label: 'Physiotherapy' },
                    { value: 'adl', label: 'ADL' },
                    { value: 'companionship', label: 'Companionship' },
                  ]}
                  value={searchService}
                  onChange={(e) => setSearchService(e.target.value)}
                />
              </div>

              {isLoading ? (
                <div className="flex justify-center p-8">
                  <Spinner />
                </div>
              ) : (
                <div className="space-y-3">
                  {caregiversData?.data.map((caregiver) => (
                    <div
                      key={caregiver.id}
                      className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-semibold text-gray-900">
                            {caregiver.userId}
                          </h3>
                          <p className="text-sm text-gray-600 mt-1">
                            Services: {caregiver.services.join(', ')}
                          </p>
                          <p className="text-sm text-gray-600">
                            Experience: {caregiver.experienceYears} years
                          </p>
                          {caregiver.rating && (
                            <p className="text-sm text-gray-600">
                              Rating: {caregiver.rating.toFixed(1)} ⭐
                            </p>
                          )}
                        </div>
                        <div className="text-right">
                          {caregiver.hourlyRate && (
                            <p className="font-semibold text-gray-900">
                              ${(caregiver.hourlyRate / 100).toFixed(2)}/hr
                            </p>
                          )}
                          {caregiver.verified && (
                            <span className="inline-block mt-2 px-2 py-1 text-xs bg-green-100 text-green-800 rounded">
                              Verified
                            </span>
                          )}
                          <Button size="sm" className="mt-2">
                            Book Now
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                  {caregiversData?.data.length === 0 && (
                    <p className="text-center text-gray-600 py-4">
                      No caregivers found. Try adjusting your search filters.
                    </p>
                  )}
                </div>
              )}
            </Card>

            {/* Bookings */}
            <Card>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                My Bookings
              </h2>
              <BookingList />
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Subscriptions */}
            <Card>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Subscriptions
              </h2>
              <SubscriptionList />
            </Card>

            {/* Quick Actions */}
            <Card>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Quick Actions
              </h2>
              <div className="space-y-2">
                <Button fullWidth variant="outline">
                  Emergency Request
                </Button>
                <Button fullWidth variant="outline">
                  Browse Plans
                </Button>
                <Button fullWidth variant="outline">
                  View Devices
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

