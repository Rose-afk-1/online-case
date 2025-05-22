'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

type CaseData = {
  _id: string;
  caseNumber: string;
  title: string;
  status: string;
  caseType: string;
  filingDate: string;
  paymentStatus: string;
};

type PaginationData = {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

export default function UserDashboard() {
  const { data: session, status: authStatus } = useSession();
  const router = useRouter();
  
  const [cases, setCases] = useState<CaseData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [pagination, setPagination] = useState<PaginationData>({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0,
  });
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    caseType: '',
  });
  
  // Dashboard stats
  const [stats, setStats] = useState({
    totalCases: 0,
    casesByStatus: {
      pending: 0,
      approved: 0,
      rejected: 0,
      inProgress: 0,
      completed: 0
    },
    casesByType: {
      civil: 0,
      criminal: 0,
      family: 0,
      other: 0
    },
    evidenceCount: 0,
    casesNeedingPayment: 0,
    upcomingHearings: 0,
    recentActivity: {
      cases: [],
      hearings: []
    }
  });
  
  // Notifications state
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  
  // Case statuses and their colors for UI
  const statusColors: Record<string, { bg: string; text: string }> = {
    pending: { bg: 'bg-yellow-100', text: 'text-yellow-800' },
    approved: { bg: 'bg-green-100', text: 'text-green-800' },
    rejected: { bg: 'bg-red-100', text: 'text-red-800' },
    inProgress: { bg: 'bg-blue-100', text: 'text-blue-800' },
    completed: { bg: 'bg-purple-100', text: 'text-purple-800' },
  };
  
  // Payment status colors
  const paymentStatusColors: Record<string, { bg: string; text: string }> = {
    paid: { bg: 'bg-green-100', text: 'text-green-800' },
    paymentRequired: { bg: 'bg-red-100', text: 'text-red-800' },
    failed: { bg: 'bg-red-100', text: 'text-red-800' },
  };
  
  const [isDeleting, setIsDeleting] = useState(false);
  const [deletingCaseId, setDeletingCaseId] = useState<string | null>(null);
  const [removingNotificationId, setRemovingNotificationId] = useState<string | null>(null);
  
  useEffect(() => {
    if (authStatus === 'loading') return;
    
    if (authStatus === 'unauthenticated') {
      router.push('/auth/login');
      return;
    }
    
    fetchCases();
    fetchDashboardStats();
    fetchNotifications();
  }, [authStatus, pagination.page, filters]);
  
  const fetchCases = async () => {
    setIsLoading(true);
    try {
      const queryParams = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
      });
      
      if (filters.search) queryParams.append('search', filters.search);
      if (filters.status) queryParams.append('status', filters.status);
      if (filters.caseType) queryParams.append('caseType', filters.caseType);
      
      const response = await fetch(`/api/cases?${queryParams.toString()}`);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch cases');
      }
      
      setCases(data.cases);
      setPagination(data.pagination);
    } catch (error: any) {
      setError(error.message || 'An error occurred while fetching cases');
    } finally {
      setIsLoading(false);
    }
  };
  
  const fetchDashboardStats = async () => {
    try {
      const response = await fetch('/api/user/stats');
      
      if (!response.ok) {
        const errorText = await response.text();
        let errorMessage = 'Failed to fetch dashboard stats';
        try {
          // Try to parse as JSON, but don't fail if it's not valid JSON
          const errorData = JSON.parse(errorText);
          if (errorData.message) errorMessage = errorData.message;
        } catch (e) {
          // If parsing fails, use the original error text or fallback message
          if (errorText) errorMessage = errorText;
        }
        throw new Error(errorMessage);
      }
      
      const data = await response.json();
      setStats(data);
    } catch (error: any) {
      console.error('Error fetching dashboard stats:', error);
      // Provide complete fallback stats with all required properties
      setStats({ 
        totalCases: 0, 
        casesByStatus: { 
          pending: 0, 
          approved: 0, 
          rejected: 0, 
          inProgress: 0, 
          completed: 0 
        },
        casesByType: {
          civil: 0,
          criminal: 0,
          family: 0,
          other: 0
        },
        evidenceCount: 0,
        casesNeedingPayment: 0,
        upcomingHearings: 0,
        recentActivity: {
          cases: [],
          hearings: []
        }
      });
    }
  };
  
  const fetchNotifications = async () => {
    try {
      const response = await fetch('/api/user/notifications');
      
      if (!response.ok) {
        const errorText = await response.text();
        let errorMessage = 'Failed to fetch notifications';
        try {
          // Try to parse as JSON, but don't fail if it's not valid JSON
          const errorData = JSON.parse(errorText);
          if (errorData.message) errorMessage = errorData.message;
        } catch (e) {
          // If parsing fails, use the original error text or fallback message
          if (errorText) errorMessage = errorText;
        }
        throw new Error(errorMessage);
      }
      
      const data = await response.json();
      setNotifications(data.notifications || []);
    } catch (error: any) {
      console.error('Error fetching notifications:', error);
      // Set empty notifications array as fallback
      setNotifications([]);
    }
  };
  
  const handlePrevPage = () => {
    if (pagination.page > 1) {
      setPagination(prev => ({ ...prev, page: prev.page - 1 }));
    }
  };
  
  const handleNextPage = () => {
    if (pagination.page < pagination.totalPages) {
      setPagination(prev => ({ ...prev, page: prev.page + 1 }));
    }
  };
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPagination(prev => ({ ...prev, page: 1 })); // Reset to first page on search
  };
  
  const handleFilterChange = (field: string, value: string) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  };
  
  const clearFilters = () => {
    setFilters({
      search: '',
      status: '',
      caseType: '',
    });
    setPagination(prev => ({ ...prev, page: 1 }));
  };
  
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };
  
  // Capitalize first letter
  const capitalize = (str: string) => {
    return str.charAt(0).toUpperCase() + str.slice(1);
  };
  
  const deleteCase = async (caseId: string) => {
    if (!confirm("Are you sure you want to delete this case? This action cannot be undone.")) {
      return;
    }
    
    setIsDeleting(true);
    setDeletingCaseId(caseId);
    
    try {
      const response = await fetch(`/api/cases/${caseId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to delete case');
      }
      
      // Remove the deleted case from the state
      setCases(prevCases => prevCases.filter(caseItem => caseItem._id !== caseId));
      
      // Update stats
      if (stats.totalCases > 0) {
        setStats(prev => ({
          ...prev,
          totalCases: prev.totalCases - 1,
          casesByStatus: {
            ...prev.casesByStatus,
            pending: prev.casesByStatus.pending > 0 ? prev.casesByStatus.pending - 1 : 0
          }
        }));
      }
    } catch (error: any) {
      setError(error.message || 'An error occurred while deleting the case');
    } finally {
      setIsDeleting(false);
      setDeletingCaseId(null);
    }
  };
  
  const handleRemoveNotification = async (e: React.MouseEvent, notificationId: string) => {
    e.stopPropagation();
    setRemovingNotificationId(notificationId);
    
    try {
      const response = await fetch(`/api/user/notifications/${notificationId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to remove notification');
      }
      
      // Update local state
      setNotifications(prev => 
        prev.filter((notification: any) => notification._id !== notificationId)
      );
    } catch (error: any) {
      console.error('Error removing notification:', error);
      alert('Failed to remove notification. Please try again.');
    } finally {
      setRemovingNotificationId(null);
    }
  };
  
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Notification Center */}
        <div className="mb-8">
          <div className="relative">
            <button 
              onClick={() => setShowNotifications(!showNotifications)}
              className="bg-white shadow-md rounded-lg px-4 py-3 w-full flex items-center justify-between hover:bg-gray-50"
            >
              <span className="font-medium text-gray-800">Notifications</span>
              {notifications.length > 0 && (
                <span className="bg-red-500 text-white rounded-full h-6 w-6 flex items-center justify-center text-sm">
                  {notifications.length}
                </span>
              )}
            </button>
            
            {showNotifications && (
              <div className="fixed inset-0 z-50 bg-transparent" onClick={() => setShowNotifications(false)}>
                <div 
                  className="absolute right-0 top-16 bg-white shadow-2xl w-full max-w-md overflow-hidden rounded-lg border border-gray-300 mx-4 animate-slideInRight" 
                  onClick={(e) => e.stopPropagation()}
                  style={{ maxHeight: '85vh', backgroundColor: '#ffffff' }}
                >
                  <div className="flex justify-between items-center px-4 py-3 bg-white border-b border-gray-200" style={{ backgroundColor: '#ffffff' }}>
                    <div className="flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600 mr-2" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
                      </svg>
                      <h3 className="text-lg font-medium text-gray-900">Notifications</h3>
                      {notifications.length > 0 && (
                        <span className="ml-2 px-2 py-0.5 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                          {notifications.length}
                        </span>
                      )}
                    </div>
                    <button 
                      onClick={() => setShowNotifications(false)}
                      className="text-gray-400 hover:text-gray-600 focus:outline-none p-1 hover:bg-gray-200 rounded-full transition-colors"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                  
                  <div className="overflow-y-auto" style={{ backgroundColor: '#ffffff', maxHeight: 'calc(85vh - 120px)' }}>
                    {notifications.length > 0 ? (
                      <div style={{ backgroundColor: '#ffffff' }}>
                        {notifications.map((notification: any) => (
                          <div 
                            key={notification._id} 
                            className="border-b border-gray-100 hover:bg-gray-50 transition-colors relative"
                            style={{ backgroundColor: '#ffffff' }}
                          >
                            {/* Unread indicator */}
                            <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500" />
                            
                            <div className="flex px-4 py-3 items-start">
                              <div className="flex-shrink-0 mr-3">
                                {notification.type === 'payment' && (
                                  <div className="rounded-full bg-red-100 p-2 text-red-600">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                      <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                                    </svg>
                                  </div>
                                )}
                                {notification.type === 'hearing' && (
                                  <div className="rounded-full bg-blue-100 p-2 text-blue-600">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                      <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                                    </svg>
                                  </div>
                                )}
                                {notification.type === 'case' && (
                                  <div className="rounded-full bg-green-100 p-2 text-green-600">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                      <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                                    </svg>
                                  </div>
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-start w-full">
                                  <h4 className="text-sm font-medium text-gray-900">{notification.title}</h4>
                                  <span className="text-xs text-gray-500 ml-2 whitespace-nowrap">{formatDate(notification.createdAt)}</span>
                                </div>
                                <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                                <div className="mt-2 flex items-center justify-between">
                                  <Link href={notification.link || '#'} className="text-xs text-blue-600 hover:text-blue-800 inline-flex items-center">
                                    <span>View details</span>
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 ml-1" viewBox="0 0 20 20" fill="currentColor">
                                      <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                                    </svg>
                                  </Link>
                                  <button 
                                    className="text-xs text-gray-500 hover:text-red-600 transition-colors flex items-center" 
                                    onClick={(e) => handleRemoveNotification(e, notification._id)}
                                    disabled={removingNotificationId === notification._id}
                                  >
                                    {removingNotificationId === notification._id ? (
                                      <span className="inline-block h-3 w-3 animate-spin rounded-full border-2 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite] mr-1"></span>
                                    ) : null}
                                    Remove
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="py-12 text-center" style={{ backgroundColor: '#ffffff' }}>
                        <div className="rounded-full bg-gray-100 p-3 mx-auto w-16 h-16 mb-4 flex items-center justify-center">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
                          </svg>
                        </div>
                        <p className="text-gray-500 font-medium">No notifications yet</p>
                        <p className="text-gray-400 text-sm mt-1">We'll let you know when something arrives</p>
                      </div>
                    )}
                  </div>
                  
                  {notifications.length > 0 && (
                    <div className="px-4 py-3 border-t border-gray-200 flex justify-between items-center" style={{ backgroundColor: '#ffffff' }}>
                      <button 
                        className="text-sm text-gray-600 hover:text-gray-800 flex items-center space-x-1 px-2 py-1 rounded hover:bg-gray-100 transition-colors"
                        onClick={() => {
                          // Mark all as read functionality would go here
                          alert('This would mark all notifications as read');
                        }}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        <span>Mark all as read</span>
                      </button>
                      <Link 
                        href="/user/notifications" 
                        className="text-sm text-blue-600 hover:text-blue-800 px-2 py-1 rounded hover:bg-blue-50 transition-colors"
                      >
                        View all
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* Dashboard Overview - Stats Cards */}
        <div className="mb-8">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Overview</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Total Cases Card */}
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0 bg-blue-500 rounded-md p-3">
                    <svg className="h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Total Cases</dt>
                      <dd className="text-2xl font-semibold text-gray-900">{stats.totalCases}</dd>
                    </dl>
                  </div>
                </div>
                <div className="mt-3">
                  <div className="flex justify-between text-xs">
                    <span className="text-yellow-600">Pending: {stats.casesByStatus?.pending || 0}</span>
                    <span className="text-green-600">Approved: {stats.casesByStatus?.approved || 0}</span>
                    <span className="text-blue-600">In Progress: {stats.casesByStatus?.inProgress || 0}</span>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-4 sm:px-6">
                <div className="text-sm">
                  <Link href="/user/cases" className="font-medium text-blue-600 hover:text-blue-500">
                    View all cases
                  </Link>
                </div>
              </div>
            </div>
            
            {/* Upcoming Hearings Card */}
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0 bg-indigo-500 rounded-md p-3">
                    <svg className="h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Upcoming Hearings</dt>
                      <dd className="text-2xl font-semibold text-gray-900">{stats.upcomingHearings || 0}</dd>
                    </dl>
                  </div>
                </div>
                <div className="mt-3">
                  <div className="h-2 bg-gray-200 rounded">
                    <div className="h-full bg-indigo-500 rounded" style={{ width: `${stats.upcomingHearings > 0 ? 100 : 0}%` }}></div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-4 sm:px-6">
                <div className="text-sm">
                  <Link href="/user/hearings" className="font-medium text-blue-600 hover:text-blue-500">
                    View hearing schedule
                  </Link>
                </div>
              </div>
            </div>
            
            {/* Evidence Card */}
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0 bg-green-500 rounded-md p-3">
                    <svg className="h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Evidence Uploaded</dt>
                      <dd className="text-2xl font-semibold text-gray-900">{stats.evidenceCount}</dd>
                    </dl>
                  </div>
                </div>
                <div className="mt-3">
                  <div className="text-xs text-gray-500">
                    For {stats.totalCases} total cases
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-4 sm:px-6">
                <div className="text-sm">
                  <Link href="/user/evidence/upload" className="font-medium text-blue-600 hover:text-blue-500">
                    Upload evidence
                  </Link>
                </div>
              </div>
            </div>
            
            {/* Payment Required Card */}
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0 bg-red-500 rounded-md p-3">
                    <svg className="h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Requires Payment</dt>
                      <dd className="text-2xl font-semibold text-gray-900">{stats.casesNeedingPayment}</dd>
                    </dl>
                  </div>
                </div>
                <div className="mt-3">
                  {stats.casesNeedingPayment > 0 ? (
                    <div className="text-xs text-red-600 font-medium animate-pulse">
                      Action required
                    </div>
                  ) : (
                    <div className="text-xs text-green-600 font-medium">
                      All payments complete
                    </div>
                  )}
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-4 sm:px-6">
                <div className="text-sm">
                  <Link href="/user/cases?paymentStatus=unpaid,pending,paymentRequired" className="font-medium text-blue-600 hover:text-blue-500">
                    View pending payments
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Unified Case Overview */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Case Overview</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {/* Pending Cases */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-medium text-yellow-800">Pending</h3>
                <span className="text-2xl font-bold text-yellow-700">{stats.casesByStatus.pending}</span>
              </div>
              <Link href="/user/cases?status=pending" className="text-sm text-yellow-700 hover:underline">
                View pending cases
              </Link>
            </div>
            
            {/* Approved Cases */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-medium text-green-800">Approved</h3>
                <span className="text-2xl font-bold text-green-700">{stats.casesByStatus.approved}</span>
              </div>
              <Link href="/user/cases?status=approved" className="text-sm text-green-700 hover:underline">
                View approved cases
              </Link>
            </div>
            
            {/* In Progress Cases */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-medium text-blue-800">In Progress</h3>
                <span className="text-2xl font-bold text-blue-700">{stats.casesByStatus.inProgress}</span>
              </div>
              <Link href="/user/cases?status=inProgress" className="text-sm text-blue-700 hover:underline">
                View in-progress cases
              </Link>
            </div>
            
            {/* Completed Cases */}
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-medium text-purple-800">Completed</h3>
                <span className="text-2xl font-bold text-purple-700">{stats.casesByStatus.completed}</span>
              </div>
              <Link href="/user/cases?status=completed" className="text-sm text-purple-700 hover:underline">
                View completed cases
              </Link>
            </div>
          </div>
        </div>
        
        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Link href="/user/cases/file">
              <div className="p-6 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition duration-150">
                <div className="flex flex-col items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mb-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="12" y1="5" x2="12" y2="19"></line>
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                  </svg>
                  <span className="text-lg font-medium">File New Case</span>
                  <p className="mt-2 text-sm text-white opacity-80 text-center">
                    Start a new case filing
                  </p>
                </div>
              </div>
            </Link>
            
            <Link href="/user/evidence/upload">
              <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-6 hover:bg-gray-50 transition duration-200">
                <div className="flex flex-col items-center text-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mb-3 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                  </svg>
                  <span className="text-lg font-medium text-gray-900">Upload Evidence</span>
                  <p className="text-sm text-gray-500 mt-1">Add files to your case</p>
                </div>
              </div>
            </Link>
            
            <Link href="/user/hearings">
              <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-6 hover:bg-gray-50 transition duration-200">
                <div className="flex flex-col items-center text-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mb-3 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span className="text-lg font-medium text-gray-900">Check Hearings</span>
                  <p className="text-sm text-gray-500 mt-1">View scheduled hearings</p>
                </div>
              </div>
            </Link>
            
            <Link href="/user/profile">
              <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-6 hover:bg-gray-50 transition duration-200">
                <div className="flex flex-col items-center text-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mb-3 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <span className="text-lg font-medium text-gray-900">My Profile</span>
                  <p className="text-sm text-gray-500 mt-1">Manage your account</p>
                </div>
              </div>
            </Link>
          </div>
        </div>
        
        {/* Recent Cases */}
        <div className="mb-8">
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="flex justify-between items-center px-4 py-5 sm:px-6 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Recent Cases</h3>
              <Link href="/user/cases">
                <Button variant="outline" size="sm">View All</Button>
              </Link>
            </div>
            
            <div className="px-4 py-5 sm:p-6">
              {error && (
                <div className="mb-6 rounded-md bg-red-50 p-4 text-sm text-red-700">
                  {error}
                </div>
              )}
              
              {isLoading ? (
                <div className="text-center py-6">
                  <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" />
                  <p className="mt-2 text-sm text-gray-500">Loading cases...</p>
                </div>
              ) : cases.length === 0 ? (
                <div className="text-center py-6">
                  <svg
                    className="mx-auto h-12 w-12 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No cases found</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Get started by filing a new case.
                  </p>
                  <div className="mt-6">
                    <Link href="/user/cases/file">
                      <Button className="bg-blue-600 hover:bg-blue-700 text-white">File New Case</Button>
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="overflow-hidden sm:rounded-md">
                  <ul className="divide-y divide-gray-200">
                    {cases.map((caseItem) => (
                      <li key={caseItem._id}>
                        <Link href={`/user/cases/${caseItem._id}`} className="block hover:bg-gray-50">
                          <div className="px-4 py-4">
                            <div className="flex items-center justify-between">
                              <div className="truncate">
                                <div className="flex text-sm">
                                  <p className="font-medium text-blue-600 truncate">{caseItem.title}</p>
                                  <p className="ml-1 flex-shrink-0 font-normal text-gray-500">
                                    ({caseItem.caseNumber})
                                  </p>
                                </div>
                                <div className="mt-2 flex text-sm text-gray-500">
                                  <div className="flex items-center">
                                    <svg className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                      <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                                    </svg>
                                    {formatDate(caseItem.filingDate)}
                                  </div>
                                  <div className="ml-4">
                                    <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                                      {capitalize(caseItem.caseType)}
                                    </span>
                                  </div>
                                </div>
                              </div>
                              <div className="ml-2 flex-shrink-0 flex">
                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                  statusColors[caseItem.status]?.bg || 'bg-gray-100'
                                } ${statusColors[caseItem.status]?.text || 'text-gray-800'}`}>
                                  {capitalize(caseItem.status)}
                                </span>
                                {caseItem.paymentStatus === 'paymentRequired' && (
                                  <button 
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      e.preventDefault();
                                      router.push(`/user/cases/${caseItem._id}/payment`);
                                    }}
                                    className="ml-2 px-2 py-0.5 inline-flex text-xs leading-5 font-semibold text-blue-800 bg-blue-100 rounded-full hover:bg-blue-200 cursor-pointer"
                                  >
                                    Pay Now
                                  </button>
                                )}
                                <button 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    e.preventDefault();
                                    deleteCase(caseItem._id);
                                  }}
                                  className="ml-2 px-2 py-0.5 inline-flex text-xs leading-5 font-semibold text-red-800 bg-red-100 rounded-full hover:bg-red-200 cursor-pointer"
                                  disabled={isDeleting && deletingCaseId === caseItem._id}
                                >
                                  {isDeleting && deletingCaseId === caseItem._id ? (
                                    <span className="inline-block h-3 w-3 animate-spin rounded-full border-2 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite] mr-1"></span>
                                  ) : null}
                                  Remove
                                </button>
                              </div>
                            </div>
                          </div>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Activity Timeline */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
          <div className="bg-white rounded-lg shadow overflow-hidden">
            {!stats.recentActivity?.cases || stats.recentActivity.cases.length === 0 ? (
              <div className="p-6 text-center text-gray-500">
                No recent activity found
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {stats.recentActivity.cases.map((activity: any) => (
                  <div key={activity._id} className="p-4 hover:bg-gray-50">
                    <div className="flex items-start">
                      <div className={`mt-1 rounded-full p-1 ${statusColors[activity.status]?.bg || 'bg-gray-100'}`}>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                      <div className="ml-3 flex-1">
                        <div className="flex justify-between">
                          <p className="text-sm font-medium text-gray-900">
                            Case #{activity.caseNumber}
                          </p>
                          <p className="text-sm text-gray-500">
                            {formatDate(activity.updatedAt)}
                          </p>
                        </div>
                        <p className="text-sm text-gray-500">{activity.title}</p>
                        <p className="mt-1">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[activity.status]?.bg || 'bg-gray-100'} ${statusColors[activity.status]?.text || 'text-gray-800'}`}>
                            {capitalize(activity.status)}
                          </span>
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 