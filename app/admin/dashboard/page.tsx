'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

type CaseData = {
  _id: string;
  caseNumber: string;
  title: string;
  caseType: string;
  status: string;
  filingDate: string;
  userId: {
    _id: string;
    name: string;
    email: string;
  };
};

type DashboardStats = {
  users?: {
    total: number;
    newThisWeek: number;
  };
  cases?: {
    total: number;
    pending: number;
    active: number;
  };
  hearings?: {
    total: number;
    upcoming: number;
  };
  evidence?: {
    total: number;
    pending: number;
  };
  payments?: {
    total: number;
    pending: number;
    completed: number;
    totalAmount: number;
  };
  timestamp?: Date;
};

// Status colors
const statusColors: Record<string, { bg: string; text: string }> = {
  'Pending': { bg: 'bg-yellow-100', text: 'text-yellow-800' },
  'Active': { bg: 'bg-blue-100', text: 'text-blue-800' },
  'Closed': { bg: 'bg-gray-100', text: 'text-gray-800' },
  'Rejected': { bg: 'bg-red-100', text: 'text-red-800' },
  'Scheduled': { bg: 'bg-purple-100', text: 'text-purple-800' },
  'Under Review': { bg: 'bg-indigo-100', text: 'text-indigo-800' },
};

export default function AdminDashboard() {
  const { data: session, status: authStatus } = useSession();
  const router = useRouter();
  
  const [recentCases, setRecentCases] = useState<CaseData[]>([]);
  const [stats, setStats] = useState<DashboardStats>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  
  useEffect(() => {
    if (authStatus === 'loading') return;
    
    if (authStatus === 'unauthenticated') {
      router.push('/auth/login');
      return;
    }
    
    if (session?.user?.role !== 'admin') {
      router.push('/unauthorized');
      return;
    }
    
    Promise.all([
      fetchRecentCases(),
      fetchDashboardStats()
    ]).finally(() => {
      setIsLoading(false);
    });
  }, [authStatus, session]);
  
  const fetchRecentCases = async () => {
    try {
      const response = await fetch('/api/cases?limit=5&sortField=filingDate&sortOrder=desc');
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch recent cases');
      }
      
      setRecentCases(data.cases);
    } catch (error: any) {
      setError(error.message || 'An error occurred while fetching recent cases');
    }
  };
  
  const fetchDashboardStats = async () => {
    try {
      const response = await fetch('/api/admin/stats');
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch dashboard statistics');
      }
      
      setStats(data);
      console.log("Dashboard stats loaded:", data);
    } catch (error: any) {
      setError(error.message || 'An error occurred while fetching dashboard statistics');
      console.error("Error loading dashboard stats:", error);
    }
  };
  
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" />
        <p className="ml-2">Loading dashboard...</p>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Court Administration Dashboard</h1>
          <p className="mt-1 text-sm text-gray-600">
            Manage cases, review evidence, and schedule hearings
          </p>
        </div>
        
        {error && (
          <div className="mb-6 rounded-md bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}
        
        {/* Dashboard Stats */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5 mb-8">
          <div className="bg-white overflow-hidden border border-gray-200 rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-blue-500 rounded-md p-3">
                  <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Total Cases</dt>
                    <dd className="text-2xl font-semibold text-gray-900">{stats.cases?.total || 0}</dd>
                  </dl>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 px-5 py-3">
              <Link href="/admin/cases" className="text-sm text-blue-700 font-medium hover:text-blue-900">
                View all cases
              </Link>
            </div>
          </div>
          
          <div className="bg-white overflow-hidden border border-gray-200 rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-yellow-500 rounded-md p-3">
                  <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Pending Cases</dt>
                    <dd className="text-2xl font-semibold text-gray-900">{stats.cases?.pending || 0}</dd>
                  </dl>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 px-5 py-3">
              <Link href="/admin/cases?status=Pending" className="text-sm text-blue-700 font-medium hover:text-blue-900">
                View pending cases
              </Link>
            </div>
          </div>
          
          <div className="bg-white overflow-hidden border border-gray-200 rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-green-500 rounded-md p-3">
                  <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Active Cases</dt>
                    <dd className="text-2xl font-semibold text-gray-900">
                      {stats.cases?.active || 0}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 px-5 py-3">
              <Link href="/admin/cases?status=approved" className="text-sm text-blue-700 font-medium hover:text-blue-900">
                View active cases
              </Link>
            </div>
          </div>
          
          <div className="bg-white overflow-hidden border border-gray-200 rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-purple-500 rounded-md p-3">
                  <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                  </svg>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Pending Evidence</dt>
                    <dd className="text-2xl font-semibold text-gray-900">
                      {stats.evidence?.pending || 0}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 px-5 py-3">
              <Link href="/admin/evidence?approved=false" className="text-sm text-blue-700 font-medium hover:text-blue-900">
                Review evidence
              </Link>
            </div>
          </div>
          
          <div className="bg-white overflow-hidden border border-gray-200 rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-indigo-500 rounded-md p-3">
                  <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Upcoming Hearings</dt>
                    <dd className="text-2xl font-semibold text-gray-900">{stats.hearings?.upcoming || 0}</dd>
                  </dl>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 px-5 py-3">
              <Link href="/admin/hearings" className="text-sm text-blue-700 font-medium hover:text-blue-900">
                View hearing calendar
              </Link>
            </div>
          </div>
          
          <div className="bg-white overflow-hidden border border-gray-200 rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-green-500 rounded-md p-3">
                  <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Total Payments</dt>
                    <dd className="text-2xl font-semibold text-gray-900">{stats.payments?.total || 0}</dd>
                  </dl>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 px-5 py-3">
              <Link href="/admin/payments" className="text-sm text-blue-700 font-medium hover:text-blue-900">
                Manage payments
              </Link>
            </div>
          </div>
        </div>
        
        {/* Recent Cases */}
        <div className="bg-white border border-gray-200 rounded-lg mb-8">
          <div className="px-4 py-5 border-b border-gray-200 sm:px-6 flex justify-between items-center">
            <h3 className="text-lg font-medium text-gray-900">Recent Case Filings</h3>
            <Link href="/admin/cases">
              <Button variant="outline" size="sm">View All</Button>
            </Link>
          </div>
          
          {recentCases.length === 0 ? (
            <div className="p-6 text-center text-gray-500">
              No recent case filings
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Case Number
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Title
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Filed By
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Filing Date
                    </th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {recentCases.map((caseItem) => (
                    <tr key={caseItem._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {caseItem.caseNumber}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {caseItem.title}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {caseItem.userId.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusColors[caseItem.status]?.bg || 'bg-gray-100'} ${statusColors[caseItem.status]?.text || 'text-gray-800'}`}>
                          {caseItem.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(caseItem.filingDate)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <Link href={`/admin/cases/${caseItem._id}`}>
                          <Button variant="outline" size="sm">
                            Review
                          </Button>
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
        
        {/* Quick Actions */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 border-b border-gray-200 sm:px-6">
            <h3 className="text-lg font-medium text-gray-900">Quick Actions</h3>
          </div>
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="border border-gray-200 rounded-lg p-5 hover:bg-gray-50">
              <h4 className="text-lg font-medium text-gray-900 mb-2">Schedule Hearing</h4>
              <p className="text-gray-500 mb-4">Schedule a new hearing for an existing case.</p>
              <Link href="/admin/hearings/schedule">
                <Button variant="primary" size="sm">Schedule</Button>
              </Link>
            </div>
            
            <div className="border border-gray-200 rounded-lg p-5 hover:bg-gray-50">
              <h4 className="text-lg font-medium text-gray-900 mb-2">Review Evidence</h4>
              <p className="text-gray-500 mb-4">Review and approve pending evidence submissions.</p>
              <Link href="/admin/evidence?approved=false">
                <Button variant="primary" size="sm">Review</Button>
              </Link>
            </div>
            
            <div className="border border-gray-200 rounded-lg p-5 hover:bg-gray-50">
              <h4 className="text-lg font-medium text-gray-900 mb-2">Manage Users</h4>
              <p className="text-gray-500 mb-4">View and manage user accounts in the system.</p>
              <Link href="/admin/users">
                <Button variant="primary" size="sm">Manage</Button>
              </Link>
            </div>
            
            <div className="border border-gray-200 rounded-lg p-5 hover:bg-gray-50">
              <h4 className="text-lg font-medium text-gray-900 mb-2">Manage Payments</h4>
              <p className="text-gray-500 mb-4">View and manage all user payments and transactions.</p>
              <Link href="/admin/payments">
                <Button variant="primary" size="sm">Manage</Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 