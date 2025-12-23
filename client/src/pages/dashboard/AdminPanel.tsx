/**
 * Admin Panel Page
 * Comprehensive admin dashboard with user management, analytics, and platform control
 */

import { useState, useMemo } from 'react';
import {
  useAdminReports,
  usePendingVerifications,
  useApproveVerification,
  useRejectVerification,
  useAdminUsers,
  useBlockUser,
  useUpdateUserProfile,
  useUserSubscriptions,
  useCreateUserSubscription,
  useCancelUserSubscription,
  useUserPerformance,
  useCaregiverPerformance,
  useChatAnalytics,
  usePlatformAnalytics,
} from '../../hooks/useAdmin';
import { useCaregivers } from '../../hooks/useCaregivers';
import {
  Card,
  Spinner,
  Button,
  DecorativeDoodles,
  Input,
  Select,
} from '../../components';
import { HealthGraph } from '../../components/HealthGraph';
import { useAuth } from '../../features/auth/useAuth';
import { formatDate, formatCurrency } from '../../utils/formatDate';
import { getErrorMessage } from '../../utils/errorHandler';
import type { User, CaregiverProfile, Subscription } from '../../types';

type TabType = 'overview' | 'users' | 'caregivers' | 'verifications' | 'subscriptions' | 'analytics' | 'chats';

export function AdminPanel() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('');

  // Queries
  const { data: reports, isLoading: reportsLoading } = useAdminReports();
  const { data: pendingVerifications, isLoading: verificationsLoading } = usePendingVerifications();
  const { data: usersData, isLoading: usersLoading } = useAdminUsers({
    role: roleFilter || undefined,
    isActive: statusFilter === 'active' ? true : statusFilter === 'blocked' ? false : undefined,
    limit: 50,
  });
  const { data: caregiversData } = useCaregivers({});
  const { data: chatAnalytics, isLoading: chatsLoading } = useChatAnalytics();
  const { data: platformAnalytics, isLoading: platformLoading } = usePlatformAnalytics();

  // Mutations
  const approveMutation = useApproveVerification();
  const rejectMutation = useRejectVerification();
  const blockMutation = useBlockUser();
  const updateProfileMutation = useUpdateUserProfile();
  const createSubscriptionMutation = useCreateUserSubscription();
  const cancelSubscriptionMutation = useCancelUserSubscription();

  // Selected user data
  const { data: selectedUserSubscriptions } = useUserSubscriptions(selectedUserId);
  const { data: selectedUserPerformance } = useUserPerformance(selectedUserId);
  const { data: selectedCaregiverPerformance } = useCaregiverPerformance(
    selectedUserId && usersData?.data.find((u) => u._id === selectedUserId)?.role === 'caregiver'
      ? selectedUserId
      : null
  );

  // Filtered users
  const filteredUsers = useMemo(() => {
    if (!usersData?.data) return [];
    let filtered = usersData.data;
    
    if (searchTerm) {
      filtered = filtered.filter(
        (u) =>
          u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          u.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    return filtered;
  }, [usersData?.data, searchTerm]);

  if (!user || user.role !== 'admin') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card>
          <p className="text-red-600">Access denied. Admin privileges required.</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-primary-50/30 relative overflow-hidden">
      <DecorativeDoodles variant="light" density="low" />

      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Admin Panel</h1>
              <p className="text-gray-600 mt-2">
                Complete platform management and analytics dashboard
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm font-medium">
                Admin Mode
              </span>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="mt-6 flex gap-2 overflow-x-auto">
            {[
              { id: 'overview', label: 'Overview' },
              { id: 'users', label: 'Users' },
              { id: 'caregivers', label: 'Caregivers' },
              { id: 'verifications', label: 'Verifications' },
              { id: 'subscriptions', label: 'Subscriptions' },
              { id: 'analytics', label: 'Analytics' },
              { id: 'chats', label: 'Chat Analytics' },
            ].map((tab) => (
              <Button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id as TabType);
                  setSelectedUserId(null);
                }}
                variant={activeTab === tab.id ? 'primary' : 'ghost'}
                size="sm"
                className={`whitespace-nowrap capitalize ${
                  activeTab !== tab.id
                    ? 'bg-white border border-gray-200 hover:bg-gray-50'
                    : ''
                }`}
              >
                {tab.label}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Key Metrics */}
            {reportsLoading ? (
              <div className="flex justify-center p-8">
                <Spinner size="lg" />
              </div>
            ) : reports ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-none shadow-lg">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-blue-100 text-sm font-medium">Total Users</p>
                      <p className="text-3xl font-bold mt-2">{reports.totalUsers}</p>
                      <p className="text-blue-100 text-xs mt-1">All registered users</p>
                    </div>
                    <div className="bg-white/20 p-3 rounded-lg">
                      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                      </svg>
                    </div>
                  </div>
                </Card>

                <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white border-none shadow-lg">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-green-100 text-sm font-medium">Caregivers</p>
                      <p className="text-3xl font-bold mt-2">{reports.totalCaregivers}</p>
                      <p className="text-green-100 text-xs mt-1">Active caregivers</p>
                    </div>
                    <div className="bg-white/20 p-3 rounded-lg">
                      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z" />
                      </svg>
                    </div>
                  </div>
                </Card>

                <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white border-none shadow-lg">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-purple-100 text-sm font-medium">Total Bookings</p>
                      <p className="text-3xl font-bold mt-2">{reports.totalBookings}</p>
                      <p className="text-purple-100 text-xs mt-1">All time bookings</p>
                    </div>
                    <div className="bg-white/20 p-3 rounded-lg">
                      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </div>
                </Card>

                <Card className="bg-gradient-to-br from-yellow-500 to-yellow-600 text-white border-none shadow-lg">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-yellow-100 text-sm font-medium">Revenue</p>
                      <p className="text-3xl font-bold mt-2">
                        ${(reports.revenueCents / 100).toFixed(2)}
                      </p>
                      <p className="text-yellow-100 text-xs mt-1">Total platform revenue</p>
                    </div>
                    <div className="bg-white/20 p-3 rounded-lg">
                      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </div>
                </Card>
              </div>
            ) : null}

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => setActiveTab('verifications')}>
                <Card>
                <div className="flex items-center gap-4">
                  <div className="bg-yellow-100 p-3 rounded-lg">
                    <svg className="w-6 h-6 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">Pending Verifications</p>
                    <p className="text-sm text-gray-600">
                      {pendingVerifications?.length || 0} profiles awaiting review
                    </p>
                  </div>
                </div>
                </Card>
              </div>

              <div className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => setActiveTab('users')}>
                <Card>
                  <div className="flex items-center gap-4">
                  <div className="bg-blue-100 p-3 rounded-lg">
                    <svg className="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">User Management</p>
                    <p className="text-sm text-gray-600">
                      Manage {usersData?.total || 0} registered users
                    </p>
                  </div>
                  </div>
                </Card>
              </div>

              <div className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => setActiveTab('analytics')}>
                <Card>
                  <div className="flex items-center gap-4">
                  <div className="bg-green-100 p-3 rounded-lg">
                    <svg className="w-6 h-6 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">Platform Analytics</p>
                    <p className="text-sm text-gray-600">View detailed platform metrics</p>
                  </div>
                  </div>
                </Card>
              </div>
            </div>
          </div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <UserManagementTab
            users={filteredUsers}
            isLoading={usersLoading}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            roleFilter={roleFilter}
            setRoleFilter={setRoleFilter}
            statusFilter={statusFilter}
            setStatusFilter={setStatusFilter}
            selectedUserId={selectedUserId}
            setSelectedUserId={setSelectedUserId}
            blockMutation={blockMutation}
            updateProfileMutation={updateProfileMutation}
            subscriptions={selectedUserSubscriptions}
            performance={selectedUserPerformance}
            createSubscriptionMutation={createSubscriptionMutation}
            cancelSubscriptionMutation={cancelSubscriptionMutation}
          />
        )}

        {/* Caregivers Tab */}
        {activeTab === 'caregivers' && (
          <CaregiverManagementTab
            caregivers={caregiversData?.data || []}
            performance={selectedCaregiverPerformance}
            selectedUserId={selectedUserId}
            setSelectedUserId={setSelectedUserId}
          />
        )}

        {/* Verifications Tab */}
        {activeTab === 'verifications' && (
          <VerificationsTab
            verifications={pendingVerifications || []}
            isLoading={verificationsLoading}
            approveMutation={approveMutation}
            rejectMutation={rejectMutation}
          />
        )}

        {/* Subscriptions Tab */}
        {activeTab === 'subscriptions' && (
          <SubscriptionsTab
            users={filteredUsers}
            selectedUserId={selectedUserId}
            setSelectedUserId={setSelectedUserId}
            subscriptions={selectedUserSubscriptions}
            createSubscriptionMutation={createSubscriptionMutation}
            cancelSubscriptionMutation={cancelSubscriptionMutation}
          />
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <AnalyticsTab
            platformAnalytics={platformAnalytics}
            isLoading={platformLoading}
          />
        )}

        {/* Chat Analytics Tab */}
        {activeTab === 'chats' && (
          <ChatAnalyticsTab
            chatAnalytics={chatAnalytics}
            isLoading={chatsLoading}
          />
        )}
      </div>
    </div>
  );
}

// User Management Tab Component
function UserManagementTab({
  users,
  isLoading,
  searchTerm,
  setSearchTerm,
  roleFilter,
  setRoleFilter,
  statusFilter,
  setStatusFilter,
  selectedUserId,
  setSelectedUserId,
  blockMutation,
  updateProfileMutation,
  subscriptions,
  performance,
  createSubscriptionMutation,
  cancelSubscriptionMutation,
}: any) {
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [editForm, setEditForm] = useState<Partial<User>>({});

  const selectedUser = users.find((u: User) => u._id === selectedUserId);

  const handleBlock = async (userId: string, isBlocked: boolean) => {
    if (window.confirm(`Are you sure you want to ${isBlocked ? 'unblock' : 'block'} this user?`)) {
      try {
        await blockMutation.mutateAsync({ userId, blocked: isBlocked });
      } catch (error) {
        alert(getErrorMessage(error));
      }
    }
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);
    setEditForm({
      name: user.name,
      email: user.email,
      phone: user.phone || '',
      city: user.city || '',
      role: user.role,
      isActive: user.isActive,
    });
  };

  const handleSaveEdit = async () => {
    if (!editingUser) return;
    try {
      await updateProfileMutation.mutateAsync({
        userId: editingUser._id,
        data: editForm,
      });
      setEditingUser(null);
      setEditForm({});
    } catch (error) {
      alert(getErrorMessage(error));
    }
  };

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Input
            label="Search Users"
            placeholder="Search by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Select
            label="Role"
            options={[
              { value: '', label: 'All Roles' },
              { value: 'customer', label: 'Customer' },
              { value: 'caregiver', label: 'Caregiver' },
              { value: 'admin', label: 'Admin' },
            ]}
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
          />
          <Select
            label="Status"
            options={[
              { value: '', label: 'All Status' },
              { value: 'active', label: 'Active' },
              { value: 'blocked', label: 'Blocked' },
            ]}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          />
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Users List */}
        <div className="lg:col-span-2">
          <Card>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">All Users</h2>
            {isLoading ? (
              <div className="flex justify-center p-8">
                <Spinner />
              </div>
            ) : users.length === 0 ? (
              <p className="text-gray-600 text-center py-8">No users found.</p>
            ) : (
              <div className="space-y-3">
                {users.map((user: User) => (
                  <div
                    key={user._id}
                    className={`p-4 border rounded-lg cursor-pointer transition-all ${
                      selectedUserId === user._id
                        ? 'border-primary-500 bg-primary-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => setSelectedUserId(user._id)}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p className="font-semibold text-gray-900">{user.name}</p>
                          {!user.isActive && (
                            <span className="px-2 py-1 text-xs bg-red-100 text-red-700 rounded">
                              Blocked
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600">{user.email}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <span className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded">
                            {user.role}
                          </span>
                          {user.city && (
                            <span className="text-xs text-gray-500">📍 {user.city}</span>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEdit(user);
                          }}
                        >
                          Edit
                        </Button>
                        <Button
                          size="sm"
                          variant={user.isActive ? 'danger' : 'primary'}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleBlock(user._id, !user.isActive);
                          }}
                        >
                          {user.isActive ? 'Block' : 'Unblock'}
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

        {/* User Details Sidebar */}
        <div className="space-y-6">
          {selectedUser ? (
            <>
              <Card>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">User Details</h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-600">Name</p>
                    <p className="font-semibold text-gray-900">{selectedUser.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Email</p>
                    <p className="font-semibold text-gray-900">{selectedUser.email}</p>
                  </div>
                  {selectedUser.phone && (
                    <div>
                      <p className="text-sm text-gray-600">Phone</p>
                      <p className="font-semibold text-gray-900">{selectedUser.phone}</p>
                    </div>
                  )}
                  {selectedUser.city && (
                    <div>
                      <p className="text-sm text-gray-600">City</p>
                      <p className="font-semibold text-gray-900">{selectedUser.city}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-sm text-gray-600">Role</p>
                    <p className="font-semibold text-gray-900 capitalize">{selectedUser.role}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Status</p>
                    <p className={`font-semibold ${selectedUser.isActive ? 'text-green-600' : 'text-red-600'}`}>
                      {selectedUser.isActive ? 'Active' : 'Blocked'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Joined</p>
                    <p className="font-semibold text-gray-900">
                      {formatDate(selectedUser.createdAt)}
                    </p>
                  </div>
                </div>
              </Card>

              {/* Performance Metrics */}
              {performance && (
                <Card>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Total Bookings</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {performance.totalBookings || 0}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Completed</p>
                      <p className="text-2xl font-bold text-green-600">
                        {performance.completedBookings || 0}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Total Spent</p>
                      <p className="text-xl font-bold text-gray-900">
                        {formatCurrency(performance.totalSpent || 0)}
                      </p>
                    </div>
                    {performance.averageRating && (
                      <div>
                        <p className="text-sm text-gray-600">Avg Rating</p>
                        <p className="text-xl font-bold text-yellow-600">
                          {performance.averageRating.toFixed(1)} ⭐
                        </p>
                      </div>
                    )}
                  </div>
                </Card>
              )}

              {/* Subscriptions */}
              <Card>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Subscriptions</h3>
                  <Button
                    size="sm"
                    onClick={() => {
                      const planName = prompt('Enter plan name:');
                      const price = prompt('Enter price (in dollars):');
                      if (planName && price) {
                        createSubscriptionMutation.mutate({
                          userId: selectedUser._id,
                          data: {
                            planId: `plan_${Date.now()}`,
                            planName,
                            priceCents: Math.round(parseFloat(price) * 100),
                            billingCycle: 'monthly',
                            startDate: new Date().toISOString(),
                            autoRenew: true,
                          },
                        });
                      }
                    }}
                  >
                    Add Plan
                  </Button>
                </div>
                {subscriptions && subscriptions.length > 0 ? (
                  <div className="space-y-2">
                    {subscriptions.map((sub: Subscription) => (
                      <div
                        key={sub._id}
                        className="p-3 bg-gray-50 rounded-lg flex justify-between items-center"
                      >
                        <div>
                          <p className="font-semibold text-gray-900">{sub.planName}</p>
                          <p className="text-sm text-gray-600">
                            {formatCurrency(sub.priceCents)}/{sub.billingCycle}
                          </p>
                          <p className="text-xs text-gray-500">
                            Status: <span className="capitalize">{sub.status}</span>
                          </p>
                        </div>
                        {sub.status === 'active' && (
                          <Button
                            size="sm"
                            variant="danger"
                            onClick={() => {
                              if (window.confirm('Cancel this subscription?')) {
                                cancelSubscriptionMutation.mutate({
                                  userId: selectedUser._id,
                                  subscriptionId: sub._id,
                                });
                              }
                            }}
                          >
                            Cancel
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-600">No active subscriptions</p>
                )}
              </Card>
            </>
          ) : (
            <Card>
              <p className="text-gray-600 text-center py-8">
                Select a user to view details
              </p>
            </Card>
          )}
        </div>
      </div>

      {/* Edit User Modal */}
      {editingUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="max-w-md w-full mx-4">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Edit User</h3>
            <div className="space-y-4">
              <Input
                label="Name"
                value={editForm.name || ''}
                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
              />
              <Input
                label="Email"
                type="email"
                value={editForm.email || ''}
                onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
              />
              <Input
                label="Phone"
                value={editForm.phone || ''}
                onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
              />
              <Input
                label="City"
                value={editForm.city || ''}
                onChange={(e) => setEditForm({ ...editForm, city: e.target.value })}
              />
              <Select
                label="Role"
                options={[
                  { value: 'customer', label: 'Customer' },
                  { value: 'caregiver', label: 'Caregiver' },
                  { value: 'admin', label: 'Admin' },
                ]}
                value={editForm.role || 'customer'}
                onChange={(e) => setEditForm({ ...editForm, role: e.target.value as any })}
              />
              <div className="flex gap-2">
                <Button onClick={handleSaveEdit} className="flex-1">
                  Save
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setEditingUser(null);
                    setEditForm({});
                  }}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}

// Caregiver Management Tab Component
function CaregiverManagementTab({ caregivers, performance, selectedUserId, setSelectedUserId }: any) {
  return (
    <div className="space-y-6">
      <Card>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Caregiver Performance</h2>
        {caregivers.length === 0 ? (
          <p className="text-gray-600 text-center py-8">No caregivers found.</p>
        ) : (
          <div className="space-y-3">
            {caregivers.map((caregiver: CaregiverProfile) => {
              const userId = typeof caregiver.userId === 'string' ? caregiver.userId : caregiver.userId._id;
              return (
                <div
                  key={caregiver._id}
                  className={`p-4 border rounded-lg cursor-pointer transition-all ${
                    selectedUserId === userId
                      ? 'border-primary-500 bg-primary-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setSelectedUserId(userId)}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-semibold text-gray-900">
                        {typeof caregiver.userId === 'object' ? caregiver.userId.name : 'Unknown'}
                      </p>
                      <p className="text-sm text-gray-600">
                        {caregiver.services.join(', ')} • {caregiver.experienceYears} years
                      </p>
                      {caregiver.rating && (
                        <p className="text-sm text-yellow-600 mt-1">
                          ⭐ {caregiver.rating.toFixed(1)} Rating
                        </p>
                      )}
                    </div>
                    {caregiver.verified && (
                      <span className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded">
                        Verified
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>

      {performance && selectedUserId && (
        <Card>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Metrics</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-gray-600">Total Bookings</p>
              <p className="text-2xl font-bold text-gray-900">{performance.totalBookings || 0}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Completed</p>
              <p className="text-2xl font-bold text-green-600">{performance.completedBookings || 0}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Avg Rating</p>
              <p className="text-2xl font-bold text-yellow-600">
                {performance.averageRating?.toFixed(1) || 'N/A'} ⭐
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Earnings</p>
              <p className="text-xl font-bold text-gray-900">
                {formatCurrency(performance.totalEarnings || 0)}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Response Time</p>
              <p className="text-xl font-bold text-gray-900">
                {performance.responseTime ? `${performance.responseTime}m` : 'N/A'}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Completion Rate</p>
              <p className="text-xl font-bold text-green-600">
                {performance.completionRate ? `${(performance.completionRate * 100).toFixed(1)}%` : 'N/A'}
              </p>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}

// Verifications Tab Component
function VerificationsTab({ verifications, isLoading, approveMutation, rejectMutation }: any) {
  const [rejectReason, setRejectReason] = useState<{ [key: string]: string }>({});

  const handleApprove = async (userId: string) => {
    if (window.confirm('Approve this verification?')) {
      try {
        await approveMutation.mutateAsync({ userId });
      } catch (error) {
        alert(getErrorMessage(error));
      }
    }
  };

  const handleReject = async (userId: string) => {
    const reason = rejectReason[userId] || prompt('Enter rejection reason:');
    if (reason) {
      try {
        await rejectMutation.mutateAsync({ userId, reason });
        setRejectReason({ ...rejectReason, [userId]: '' });
      } catch (error) {
        alert(getErrorMessage(error));
      }
    }
  };

  return (
    <Card>
      <h2 className="text-xl font-semibold text-gray-900 mb-4">Pending Verifications</h2>
      {isLoading ? (
        <div className="flex justify-center p-8">
          <Spinner />
        </div>
      ) : verifications.length === 0 ? (
        <p className="text-gray-600 text-center py-8">No pending verifications.</p>
      ) : (
        <div className="space-y-4">
          {verifications.map((profile: CaregiverProfile) => {
            const userId = typeof profile.userId === 'string' ? profile.userId : profile.userId._id;
            return (
              <div key={profile._id} className="p-4 border border-gray-200 rounded-lg">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900">
                      {typeof profile.userId === 'object' ? profile.userId.name : 'Unknown User'}
                    </p>
                    <p className="text-sm text-gray-600 mt-1">
                      Services: {profile.services.join(', ')}
                    </p>
                    <p className="text-sm text-gray-600">
                      Experience: {profile.experienceYears} years
                    </p>
                    {profile.bio && (
                      <p className="text-sm text-gray-600 mt-2">{profile.bio}</p>
                    )}
                    {profile.documents.length > 0 && (
                      <p className="text-xs text-gray-500 mt-2">
                        {profile.documents.length} document(s) uploaded
                      </p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="primary"
                      onClick={() => handleApprove(userId)}
                      disabled={approveMutation.isPending}
                    >
                      Approve
                    </Button>
                    <Button
                      size="sm"
                      variant="danger"
                      onClick={() => handleReject(userId)}
                      disabled={rejectMutation.isPending}
                    >
                      Reject
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </Card>
  );
}

// Subscriptions Tab Component
function SubscriptionsTab({
  users,
  selectedUserId,
  setSelectedUserId,
  subscriptions,
  createSubscriptionMutation,
  cancelSubscriptionMutation,
}: any) {
  return (
    <div className="space-y-6">
      <Card>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Manage User Subscriptions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {users.slice(0, 20).map((user: User) => (
            <div
              key={user._id}
              className={`p-4 border rounded-lg cursor-pointer transition-all ${
                selectedUserId === user._id
                  ? 'border-primary-500 bg-primary-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => setSelectedUserId(user._id)}
            >
              <p className="font-semibold text-gray-900">{user.name}</p>
              <p className="text-sm text-gray-600">{user.email}</p>
            </div>
          ))}
        </div>
      </Card>

      {selectedUserId && subscriptions && (
        <Card>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900">User Subscriptions</h3>
            <Button
              size="sm"
              onClick={() => {
                const planName = prompt('Enter plan name:');
                const price = prompt('Enter price (in dollars):');
                const cycle = prompt('Billing cycle (monthly/yearly):');
                if (planName && price && cycle) {
                  createSubscriptionMutation.mutate({
                    userId: selectedUserId,
                    data: {
                      planId: `plan_${Date.now()}`,
                      planName,
                      priceCents: Math.round(parseFloat(price) * 100),
                      billingCycle: cycle as 'monthly' | 'yearly',
                      startDate: new Date().toISOString(),
                      autoRenew: true,
                    },
                  });
                }
              }}
            >
              Add Subscription Plan
            </Button>
          </div>
          {subscriptions.length > 0 ? (
            <div className="space-y-3">
              {subscriptions.map((sub: Subscription) => (
                <div
                  key={sub._id}
                  className="p-4 bg-gray-50 rounded-lg flex justify-between items-center"
                >
                  <div>
                    <p className="font-semibold text-gray-900">{sub.planName}</p>
                    <p className="text-sm text-gray-600">
                      {formatCurrency(sub.priceCents)}/{sub.billingCycle}
                    </p>
                    <p className="text-xs text-gray-500">
                      Started: {formatDate(sub.startDate)} • Status: {sub.status}
                    </p>
                  </div>
                  {sub.status === 'active' && (
                    <Button
                      size="sm"
                      variant="danger"
                      onClick={() => {
                        if (window.confirm('Cancel this subscription?')) {
                          cancelSubscriptionMutation.mutate({
                            userId: selectedUserId,
                            subscriptionId: sub._id,
                          });
                        }
                      }}
                    >
                      Cancel
                    </Button>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-600 text-center py-8">No subscriptions found</p>
          )}
        </Card>
      )}
    </div>
  );
}

// Analytics Tab Component
function AnalyticsTab({ platformAnalytics: _platformAnalytics, isLoading }: any) {
  if (isLoading) {
    return (
      <div className="flex justify-center p-8">
        <Spinner size="lg" />
      </div>
    );
  }

  // Mock data for demonstration
  const mockTrends = {
    userGrowth: Array.from({ length: 30 }, (_, i) => ({
      date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString(),
      count: Math.floor(Math.random() * 10) + 5,
    })),
    bookingTrends: Array.from({ length: 30 }, (_, i) => ({
      date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString(),
      count: Math.floor(Math.random() * 20) + 10,
    })),
    revenueTrends: Array.from({ length: 30 }, (_, i) => ({
      date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString(),
      amount: Math.floor(Math.random() * 5000) + 1000,
    })),
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">User Growth (30 Days)</h3>
          <HealthGraph
            trend={{
              type: 'users',
              data: mockTrends.userGrowth.map((d) => ({ date: d.date, value: d.count })),
              average: mockTrends.userGrowth.reduce((a, b) => a + b.count, 0) / mockTrends.userGrowth.length,
              trend: 'improving',
            }}
            color="blue"
            height={200}
          />
        </Card>

        <Card>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Booking Trends (30 Days)</h3>
          <HealthGraph
            trend={{
              type: 'bookings',
              data: mockTrends.bookingTrends.map((d) => ({ date: d.date, value: d.count })),
              average: mockTrends.bookingTrends.reduce((a, b) => a + b.count, 0) / mockTrends.bookingTrends.length,
              trend: 'improving',
            }}
            color="green"
            height={200}
          />
        </Card>

        <Card>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue Trends (30 Days)</h3>
          <HealthGraph
            trend={{
              type: 'revenue',
              data: mockTrends.revenueTrends.map((d) => ({ date: d.date, value: d.amount / 100 })),
              average: mockTrends.revenueTrends.reduce((a, b) => a + b.amount, 0) / mockTrends.revenueTrends.length / 100,
              trend: 'improving',
            }}
            color="purple"
            height={200}
          />
        </Card>
      </div>
    </div>
  );
}

// Chat Analytics Tab Component
function ChatAnalyticsTab({ chatAnalytics: _chatAnalytics, isLoading }: any) {
  if (isLoading) {
    return (
      <div className="flex justify-center p-8">
        <Spinner size="lg" />
      </div>
    );
  }

  // Mock data for demonstration
  const mockChatData = {
    totalMessages: 1250,
    activeChats: 45,
    averageResponseTime: 2.5,
    messagesByDay: Array.from({ length: 30 }, (_, i) => ({
      date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString(),
      count: Math.floor(Math.random() * 50) + 20,
    })),
    messagesByUser: [
      { userId: '1', userName: 'John Doe', count: 120 },
      { userId: '2', userName: 'Jane Smith', count: 95 },
      { userId: '3', userName: 'Bob Johnson', count: 78 },
    ],
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-none">
          <p className="text-blue-100 text-sm">Total Messages</p>
          <p className="text-3xl font-bold mt-2">{mockChatData.totalMessages}</p>
        </Card>
        <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white border-none">
          <p className="text-green-100 text-sm">Active Chats</p>
          <p className="text-3xl font-bold mt-2">{mockChatData.activeChats}</p>
        </Card>
        <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white border-none">
          <p className="text-purple-100 text-sm">Avg Response Time</p>
          <p className="text-3xl font-bold mt-2">{mockChatData.averageResponseTime}m</p>
        </Card>
      </div>

      <Card>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Messages Over Time (30 Days)</h3>
        <HealthGraph
          trend={{
            type: 'messages',
            data: mockChatData.messagesByDay.map((d) => ({ date: d.date, value: d.count })),
            average: mockChatData.messagesByDay.reduce((a, b) => a + b.count, 0) / mockChatData.messagesByDay.length,
            trend: 'stable',
          }}
          color="blue"
          height={250}
        />
      </Card>

      <Card>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Users by Messages</h3>
        <div className="space-y-3">
          {mockChatData.messagesByUser.map((user) => (
            <div key={user.userId} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <div>
                <p className="font-semibold text-gray-900">{user.userName}</p>
                <p className="text-sm text-gray-600">{user.count} messages</p>
              </div>
              <div className="w-32 bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full"
                  style={{ 
                    width: `${mockChatData.messagesByUser.length > 0 && mockChatData.messagesByUser[0] 
                      ? (user.count / mockChatData.messagesByUser[0]!.count) * 100 
                      : 0}%` 
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
