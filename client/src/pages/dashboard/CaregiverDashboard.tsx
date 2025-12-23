/**
 * Caregiver Dashboard Page
 * Main dashboard for caregivers to manage jobs, profile, and availability
 */

import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { useMyCaregiverProfile } from '../../hooks/useCaregivers';
import { getBookings } from '../../services/bookings';
import { useAuth } from '../../features/auth/useAuth';
import { Card, Button, Spinner, DashboardLayout } from '../../components';
import { VerificationStatus } from '../../features/onboarding/steps/VerificationStatus';

export function CaregiverDashboard() {
  const { user } = useAuth();

  const { 
    data: profile, 
    isLoading: profileLoading, 
    error: profileError 
  } = useMyCaregiverProfile();

  const { data: bookingsData, isLoading: bookingsLoading } = useQuery({
    queryKey: ['bookings', 'me'],
    queryFn: () => getBookings(),
    enabled: !!user,
    retry: false,
  });

  // Show loading only while fetching (not on error)
  if (profileLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Spinner size="lg" />
      </div>
    );
  }

  // Handle errors (except 404 which is handled as null profile)
  if (profileError && (profileError as any)?.status !== 404) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Card className="max-w-md">
          <div className="text-center py-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Error Loading Profile
            </h2>
            <p className="text-gray-600 mb-4">
              {(profileError as any)?.message || 'Failed to load caregiver profile'}
            </p>
            <Button onClick={() => window.location.reload()}>
              Retry
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  const bookings = bookingsData?.data || [];
  
  // Handle both _id and id fields for MongoDB compatibility
  const getBookingId = (booking: any) => booking._id || booking.id;
  const pendingBookings = bookings.filter((b) => b.status === 'requested');
  const activeBookings = bookings.filter(
    (b) => b.status === 'confirmed' || b.status === 'in_progress'
  );

  // Sidebar navigation items
  const sidebarItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      ),
      path: '/caregiver/dashboard',
    },
    {
      id: 'bookings',
      label: 'My Bookings',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
      path: '/caregiver/bookings',
      badge: pendingBookings.length,
    },
    {
      id: 'profile',
      label: 'Profile',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      ),
      path: '/caregiver/profile',
    },
    {
      id: 'onboarding',
      label: 'Complete Profile',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      path: '/caregiver/onboarding',
    },
  ];

  return (
    <DashboardLayout
      sidebarItems={sidebarItems}
      title="Caregiver Dashboard"
    >
      <div className="space-y-6">

        {!profile && (
          <Card className="mb-6">
            <div className="text-center py-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Complete Your Profile
              </h2>
              <p className="text-gray-600 mb-4">
                Set up your caregiver profile to start receiving bookings.
              </p>
              <Link to="/caregiver/onboarding">
                <Button>Start Onboarding</Button>
              </Link>
            </div>
          </Card>
        )}

        {profile && (
          <>
            {/* Verification Status */}
            {profile.verificationStatus !== 'verified' && (
              <Card className="mb-6">
                <VerificationStatus status={profile.verificationStatus} />
              </Card>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Main Content */}
              <div className="lg:col-span-2 space-y-6">
                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-gray-900">
                        {pendingBookings.length}
                      </p>
                      <p className="text-sm text-gray-600 mt-1">
                        Pending Requests
                      </p>
                    </div>
                  </Card>
                  <Card>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-gray-900">
                        {activeBookings.length}
                      </p>
                      <p className="text-sm text-gray-600 mt-1">
                        Active Bookings
                      </p>
                    </div>
                  </Card>
                  <Card>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-gray-900">
                        {bookings.filter((b) => b.status === 'completed').length}
                      </p>
                      <p className="text-sm text-gray-600 mt-1">
                        Completed
                      </p>
                    </div>
                  </Card>
                </div>

                {/* Recent Bookings */}
                <Card>
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">
                    Recent Bookings
                  </h2>
                  {bookingsLoading ? (
                    <div className="flex justify-center p-8">
                      <Spinner />
                    </div>
                  ) : bookings.length === 0 ? (
                    <p className="text-gray-600 text-center py-8">
                      No bookings yet. Your bookings will appear here.
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {bookings.slice(0, 5).map((booking) => {
                        const bookingId = getBookingId(booking);
                        return (
                        <div
                          key={bookingId}
                          className="p-4 border border-gray-200 rounded-lg"
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="font-semibold text-gray-900">
                                Booking #{bookingId.slice(0, 8)}
                              </p>
                              <p className="text-sm text-gray-600">
                                {booking.address}
                              </p>
                              <p className="text-sm text-gray-600">
                                Status: {booking.status}
                              </p>
                            </div>
                            <Button size="sm" variant="outline">
                              View Details
                            </Button>
                          </div>
                        </div>
                        );
                      })}
                    </div>
                  )}
                </Card>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Profile Summary */}
                <Card>
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">
                    Profile Summary
                  </h2>
                  <div className="space-y-2 text-sm">
                    <p>
                      <strong>Services:</strong> {profile.services.join(', ')}
                    </p>
                    <p>
                      <strong>Experience:</strong> {profile.experienceYears}{' '}
                      years
                    </p>
                    {profile.rating && (
                      <p>
                        <strong>Rating:</strong> {profile.rating.toFixed(1)} ⭐
                      </p>
                    )}
                    {profile.hourlyRate && (
                      <p>
                        <strong>Rate:</strong> $
                        {(profile.hourlyRate / 100).toFixed(2)}/hr
                      </p>
                    )}
                  </div>
                  <Button fullWidth variant="outline" className="mt-4">
                    Edit Profile
                  </Button>
                </Card>

                {/* Quick Actions */}
                <Card>
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">
                    Quick Actions
                  </h2>
                  <div className="space-y-2">
                    <Button fullWidth variant="outline">
                      Update Availability
                    </Button>
                    <Button fullWidth variant="outline">
                      View Earnings
                    </Button>
                    <Button fullWidth variant="outline">
                      Upload Documents
                    </Button>
                  </div>
                </Card>
              </div>
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}

