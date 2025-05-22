'use client';

import React, { useState, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormField, FormLabel } from '@/components/ui/form';
import BackButton from '@/components/shared/BackToDashboard';
import { SignOutButton } from '@/components/ui/SignOutButton';

interface UserProfile {
  name: string;
  email: string;
  role: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
}

export default function ProfilePage() {
  const { data: session, status: authStatus } = useSession();
  const router = useRouter();
  
  const [activeTab, setActiveTab] = useState('personal');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Form states
  const [profile, setProfile] = useState<UserProfile>({
    name: '',
    email: '',
    role: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
  });
  
  // Password change state
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  
  // Notification preferences
  const [notifications, setNotifications] = useState({
    emailUpdates: true,
    caseStatusChanges: true,
    hearingReminders: true,
    documentUploads: false,
  });
  
  useEffect(() => {
    if (authStatus === 'loading') return;
    
    if (authStatus === 'unauthenticated') {
      router.push('/auth/login');
      return;
    }
    
    fetchUserProfile();
  }, [authStatus]);
  
  const fetchUserProfile = async () => {
    setIsLoading(true);
    try {
      // For demo purposes, we'll use the session data and check for stored profile data
      if (session && session.user) {
        // Check if we have profile data stored in localStorage (for demo purposes)
        let storedProfile = null;
        if (typeof window !== 'undefined') {
          const storedData = localStorage.getItem('userProfile');
          if (storedData) {
            try {
              storedProfile = JSON.parse(storedData);
            } catch (e) {
              console.error('Failed to parse stored profile data', e);
            }
          }
        }
        
        // Use stored data or defaults
        setProfile({
          name: session.user.name || '',
          email: session.user.email || '',
          role: session.user.role || 'user',
          phone: storedProfile?.phone || '',
          address: storedProfile?.address || '',
          city: storedProfile?.city || '',
          state: storedProfile?.state || '',
          zipCode: storedProfile?.zipCode || '',
        });
      }
    } catch (error: any) {
      setError('Failed to load profile information');
      console.error('Error fetching profile:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProfile((prev) => ({ ...prev, [name]: value }));
  };
  
  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({ ...prev, [name]: value }));
  };
  
  const handleNotificationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setNotifications((prev) => ({ ...prev, [name]: checked }));
  };
  
  const saveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError('');
    setSuccess('');
    
    try {
      // In a real app, you would update the profile through an API
      // For demo purposes, we'll just save to localStorage
      
      // Simulating API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Save to localStorage (for demo purposes)
      if (typeof window !== 'undefined') {
        const dataToSave = {
          phone: profile.phone,
          address: profile.address,
          city: profile.city,
          state: profile.state,
          zipCode: profile.zipCode
        };
        localStorage.setItem('userProfile', JSON.stringify(dataToSave));
      }
      
      setSuccess('Profile information updated successfully');
    } catch (error: any) {
      setError('Failed to update profile information');
      console.error('Error updating profile:', error);
    } finally {
      setIsSaving(false);
    }
  };
  
  const savePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError('');
    setSuccess('');
    
    try {
      // Validate passwords
      if (passwordData.newPassword !== passwordData.confirmPassword) {
        throw new Error('New password and confirmation do not match');
      }
      
      if (passwordData.newPassword.length < 8) {
        throw new Error('Password must be at least 8 characters long');
      }
      
      // Call the API to update the password
      const response = await fetch('/api/user/password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to change password');
      }
      
      console.log('Password updated successfully, preparing to sign out');
      setSuccess('Password changed successfully. Please click the button below to sign out and sign back in with your new password.');
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
      
      // Don't rely on setTimeout as it might not work properly in some scenarios
    } catch (error: any) {
      setError(error.message || 'Failed to change password');
      console.error('Error changing password:', error);
    } finally {
      setIsSaving(false);
    }
  };
  
  const handleSignOut = () => {
    console.log('Manually signing out user');
    // Most reliable approach - direct navigation to sign-out page
    window.location.href = '/auth/signout';
  };
  
  const saveNotifications = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError('');
    setSuccess('');
    
    try {
      // In a real app, you would update notification preferences through an API
      // For demo purposes, we'll just simulate a successful update
      
      // Simulating API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setSuccess('Notification preferences updated successfully');
    } catch (error: any) {
      setError('Failed to update notification preferences');
      console.error('Error updating notifications:', error);
    } finally {
      setIsSaving(false);
    }
  };
  
  return isLoading ? (
    <div className="min-h-screen flex items-center justify-center">
      <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" />
      <p className="ml-2">Loading profile...</p>
    </div>
  ) : (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
          <BackButton />
        </div>
        
        {error && (
          <div className="mb-6 rounded-md bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}
        
        {success && (
          <div className="mb-6 rounded-md bg-green-50 p-4 text-sm text-green-700">
            {success}
            {success.includes('Please click the button below') && (
              <div className="mt-3">
                <Button 
                  onClick={handleSignOut}
                  variant="destructive" 
                  className="bg-gradient-to-r from-red-500 to-red-600 hover:shadow-lg hover:scale-105 active:scale-95 transition-all duration-300 flex items-center"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 mr-2"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth="2"
                >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                    />
                  </svg>
                  Sign Out Now
                </Button>
              </div>
            )}
          </div>
        )}
        
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setActiveTab('personal')}
              className={`px-4 py-3 text-sm font-medium ${
                activeTab === 'personal'
                  ? 'text-blue-600 border-b-2 border-blue-500'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Personal Information
            </button>
            <button
              onClick={() => setActiveTab('security')}
              className={`px-4 py-3 text-sm font-medium ${
                activeTab === 'security'
                  ? 'text-blue-600 border-b-2 border-blue-500'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Security
            </button>
            <button
              onClick={() => setActiveTab('notifications')}
              className={`px-4 py-3 text-sm font-medium ${
                activeTab === 'notifications'
                  ? 'text-blue-600 border-b-2 border-blue-500'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Notifications
            </button>
          </div>
          
          <div className="p-6">
            {activeTab === 'personal' && (
              <Form onSubmit={saveProfile}>
                <div className="space-y-6">
                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                    <FormField>
                      <FormLabel required>Full Name</FormLabel>
                      <Input
                        type="text"
                        name="name"
                        value={profile.name}
                        onChange={handleProfileChange}
                        placeholder="Your full name"
                        required
                        disabled
                      />
                      <p className="mt-1 text-sm text-gray-500">
                        Name cannot be changed
                      </p>
                    </FormField>
                    
                    <FormField>
                      <FormLabel required>Email Address</FormLabel>
                      <Input
                        type="email"
                        name="email"
                        value={profile.email}
                        onChange={handleProfileChange}
                        placeholder="Your email address"
                        required
                        disabled
                      />
                      <p className="mt-1 text-sm text-gray-500">
                        Email cannot be changed
                      </p>
                    </FormField>
                    
                    <FormField>
                      <FormLabel>Phone Number</FormLabel>
                      <Input
                        type="tel"
                        name="phone"
                        value={profile.phone}
                        onChange={handleProfileChange}
                        placeholder="Your phone number"
                      />
                    </FormField>
                    
                    <FormField>
                      <FormLabel>Account Type</FormLabel>
                      <Input
                        type="text"
                        name="role"
                        value={profile.role === 'admin' ? 'Administrator' : 'Regular User'}
                        disabled
                      />
                    </FormField>
                  </div>
                  
                  <div className="border-t border-gray-200 pt-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Address Information</h3>
                    
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                      <div className="sm:col-span-2">
                        <FormField>
                          <FormLabel>Street Address</FormLabel>
                          <Input
                            type="text"
                            name="address"
                            value={profile.address}
                            onChange={handleProfileChange}
                            placeholder="Street address"
                          />
                        </FormField>
                      </div>
                      
                      <FormField>
                        <FormLabel>City</FormLabel>
                        <Input
                          type="text"
                          name="city"
                          value={profile.city}
                          onChange={handleProfileChange}
                          placeholder="City"
                        />
                      </FormField>
                      
                      <div className="grid grid-cols-2 gap-6">
                        <FormField>
                          <FormLabel>State</FormLabel>
                          <Input
                            type="text"
                            name="state"
                            value={profile.state}
                            onChange={handleProfileChange}
                            placeholder="State"
                          />
                        </FormField>
                        
                        <FormField>
                          <FormLabel>ZIP Code</FormLabel>
                          <Input
                            type="text"
                            name="zipCode"
                            value={profile.zipCode}
                            onChange={handleProfileChange}
                            placeholder="ZIP code"
                          />
                        </FormField>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex justify-between mt-8">
                    <SignOutButton />
                    <Button 
                      variant="primary" 
                      type="submit" 
                      disabled={isSaving}
                      className="bg-blue-600"
                    >
                      {isSaving ? 'Saving...' : 'Save Changes'}
                    </Button>
                  </div>
                </div>
              </Form>
            )}
            
            {activeTab === 'security' && (
              <Form onSubmit={savePassword}>
                <div className="space-y-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Change Password</h3>
                  
                  <FormField>
                    <FormLabel required>Current Password</FormLabel>
                    <Input
                      type="password"
                      name="currentPassword"
                      value={passwordData.currentPassword}
                      onChange={handlePasswordChange}
                      placeholder="Enter your current password"
                      required
                    />
                  </FormField>
                  
                  <FormField>
                    <FormLabel required>New Password</FormLabel>
                    <Input
                      type="password"
                      name="newPassword"
                      value={passwordData.newPassword}
                      onChange={handlePasswordChange}
                      placeholder="Enter a new password"
                      required
                    />
                    <p className="mt-1 text-sm text-gray-500">
                      Password must be at least 8 characters long
                    </p>
                  </FormField>
                  
                  <FormField>
                    <FormLabel required>Confirm New Password</FormLabel>
                    <Input
                      type="password"
                      name="confirmPassword"
                      value={passwordData.confirmPassword}
                      onChange={handlePasswordChange}
                      placeholder="Confirm your new password"
                      required
                    />
                  </FormField>
                  
                  <div className="flex justify-end">
                    <Button
                      type="submit"
                      variant="primary"
                      disabled={isSaving}
                    >
                      {isSaving ? 'Updating...' : 'Update Password'}
                    </Button>
                  </div>
                </div>
              </Form>
            )}
            
            {activeTab === 'notifications' && (
              <Form onSubmit={saveNotifications}>
                <div className="space-y-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Notification Preferences</h3>
                  
                  <div className="space-y-4">
                    <div className="flex items-start">
                      <div className="flex items-center h-5">
                        <input
                          type="checkbox"
                          id="emailUpdates"
                          name="emailUpdates"
                          checked={notifications.emailUpdates}
                          onChange={handleNotificationChange}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                      </div>
                      <div className="ml-3 text-sm">
                        <label htmlFor="emailUpdates" className="font-medium text-gray-700">
                          Email Updates
                        </label>
                        <p className="text-gray-500">
                          Receive general updates about the platform and new features.
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-start">
                      <div className="flex items-center h-5">
                        <input
                          type="checkbox"
                          id="caseStatusChanges"
                          name="caseStatusChanges"
                          checked={notifications.caseStatusChanges}
                          onChange={handleNotificationChange}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                      </div>
                      <div className="ml-3 text-sm">
                        <label htmlFor="caseStatusChanges" className="font-medium text-gray-700">
                          Case Status Changes
                        </label>
                        <p className="text-gray-500">
                          Receive notifications when the status of your cases changes.
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-start">
                      <div className="flex items-center h-5">
                        <input
                          type="checkbox"
                          id="hearingReminders"
                          name="hearingReminders"
                          checked={notifications.hearingReminders}
                          onChange={handleNotificationChange}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                      </div>
                      <div className="ml-3 text-sm">
                        <label htmlFor="hearingReminders" className="font-medium text-gray-700">
                          Hearing Reminders
                        </label>
                        <p className="text-gray-500">
                          Receive reminders for upcoming hearings and court appearances.
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-start">
                      <div className="flex items-center h-5">
                        <input
                          type="checkbox"
                          id="documentUploads"
                          name="documentUploads"
                          checked={notifications.documentUploads}
                          onChange={handleNotificationChange}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                      </div>
                      <div className="ml-3 text-sm">
                        <label htmlFor="documentUploads" className="font-medium text-gray-700">
                          Document Uploads
                        </label>
                        <p className="text-gray-500">
                          Receive notifications when new documents are uploaded to your cases.
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex justify-end">
                    <Button
                      type="submit"
                      variant="primary"
                      disabled={isSaving}
                    >
                      {isSaving ? 'Saving...' : 'Save Preferences'}
                    </Button>
                  </div>
                </div>
              </Form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 