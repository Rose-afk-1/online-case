'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function NotificationsPage() {
  const { data: session, status: authStatus } = useSession();
  const router = useRouter();
  
  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [removingNotificationId, setRemovingNotificationId] = useState<string | null>(null);
  
  useEffect(() => {
    if (authStatus === 'loading') return;
    
    if (authStatus === 'unauthenticated') {
      router.push('/auth/login');
      return;
    }
    
    fetchNotifications();
  }, [authStatus]);
  
  const fetchNotifications = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/user/notifications');
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch notifications');
      }
      
      setNotifications(data.notifications || []);
    } catch (error: any) {
      setError(error.message || 'An error occurred while fetching notifications');
      console.error('Error fetching notifications:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };
  
  const handleRemoveNotification = async (notificationId: string) => {
    try {
      setRemovingNotificationId(notificationId);
      const response = await fetch(`/api/user/notifications/${notificationId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to remove notification');
      }
      
      // Update local state
      setNotifications(prev => prev.filter((notification: any) => notification._id !== notificationId));
    } catch (error: any) {
      console.error('Error removing notification:', error);
      alert('Failed to remove notification. Please try again.');
    } finally {
      setRemovingNotificationId(null);
    }
  };
  
  const handleMarkAllAsRead = () => {
    // In a real application, you would make an API call to mark all notifications as read
    console.log('Marking all notifications as read');
    alert('All notifications marked as read');
  };
  
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
            <p className="mt-1 text-sm text-gray-600">
              View and manage your notifications
            </p>
          </div>
          {notifications.length > 0 && (
            <Button 
              onClick={handleMarkAllAsRead}
              variant="outline"
              className="flex items-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              Mark all as read
            </Button>
          )}
        </div>
        
        <div className="bg-white shadow rounded-lg overflow-hidden">
          {error && (
            <div className="p-4 bg-red-50 border-l-4 border-red-500 text-red-700">
              <p>{error}</p>
            </div>
          )}
          
          {isLoading ? (
            <div className="flex justify-center items-center p-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              <span className="ml-2">Loading notifications...</span>
            </div>
          ) : notifications.length === 0 ? (
            <div className="py-16 text-center">
              <div className="rounded-full bg-gray-100 p-3 mx-auto w-16 h-16 mb-4 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900">No notifications</h3>
              <p className="mt-1 text-gray-500">
                You don't have any notifications right now. We'll notify you when there's activity.
              </p>
              <div className="mt-6">
                <Link href="/user/dashboard">
                  <Button>Return to Dashboard</Button>
                </Link>
              </div>
            </div>
          ) : (
            <div>
              <ul className="divide-y divide-gray-200">
                {notifications.map((notification: any) => (
                  <li key={notification._id} className="relative hover:bg-gray-50">
                    <div className="flex px-6 py-5">
                      <div className="flex-shrink-0 mr-4">
                        {notification.type === 'payment' && (
                          <div className="rounded-full bg-red-100 p-3 text-red-600">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                            </svg>
                          </div>
                        )}
                        {notification.type === 'hearing' && (
                          <div className="rounded-full bg-blue-100 p-3 text-blue-600">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                            </svg>
                          </div>
                        )}
                        {notification.type === 'case' && (
                          <div className="rounded-full bg-green-100 p-3 text-green-600">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                            </svg>
                          </div>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between">
                          <h3 className="text-base font-medium text-gray-900">{notification.title}</h3>
                          <span className="text-sm text-gray-500">{formatDate(notification.createdAt)}</span>
                        </div>
                        <p className="text-base text-gray-500 mt-1">{notification.message}</p>
                        <div className="mt-3 flex items-center justify-between">
                          <Link href={notification.link || '#'} className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                            View details
                          </Link>
                          <button
                            type="button"
                            onClick={() => handleRemoveNotification(notification._id)}
                            disabled={removingNotificationId === notification._id}
                            className="inline-flex items-center p-1 border border-transparent rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                          >
                            {removingNotificationId === notification._id ? (
                              <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></span>
                            ) : (
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                    {/* Blue unread indicator */}
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500"></div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 