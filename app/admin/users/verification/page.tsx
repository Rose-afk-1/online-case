'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns/formatDistanceToNow';

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
  isVerified: boolean;
}

interface ActionMessage {
  type: 'success' | 'error';
  message: string;
}

export default function ManageVerificationPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<Record<string, string>>({});
  const [actionMessages, setActionMessages] = useState<Record<string, ActionMessage>>({});

  useEffect(() => {
    if (status === 'loading') return;
    
    if (!session || session.user.role !== 'admin') {
      router.push('/unauthorized');
      return;
    }
    
    fetchUsers();
  }, [session, status, router]);
  
  const fetchUsers = async () => {
    try {
      setLoading(true);
      
      // Fetch users with verification filter
      const response = await fetch('/api/admin/users?verified=false');
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch users');
      }
      
      setUsers(data.users || []);
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleResendVerification = async (userId: string, userEmail: string) => {
    try {
      setActionLoading({ ...actionLoading, [userId]: 'resend' });
      const newMessages = { ...actionMessages };
      delete newMessages[userId];
      setActionMessages(newMessages);
      
      const response = await fetch('/api/admin/users/verification/resend', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to resend verification');
      }
      
      setActionMessages({
        ...actionMessages,
        [userId]: {
          type: 'success',
          message: `Verification email sent to ${userEmail}`
        }
      });
    } catch (err: any) {
      setActionMessages({
        ...actionMessages,
        [userId]: {
          type: 'error',
          message: err.message || 'Failed to resend verification'
        }
      });
    } finally {
      setActionLoading({ ...actionLoading, [userId]: '' });
    }
  };
  
  const handleManualVerify = async (userId: string, userEmail: string) => {
    try {
      setActionLoading({ ...actionLoading, [userId]: 'verify' });
      const newMessages = { ...actionMessages };
      delete newMessages[userId];
      setActionMessages(newMessages);
      
      const response = await fetch('/api/admin/users/verification/manual', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to verify user');
      }
      
      // Remove this user from the list
      setUsers(users.filter(user => user._id !== userId));
      
      setActionMessages({
        ...actionMessages,
        [userId]: {
          type: 'success',
          message: `${userEmail} has been verified`
        }
      });
    } catch (err: any) {
      setActionMessages({
        ...actionMessages,
        [userId]: {
          type: 'error',
          message: err.message || 'Failed to verify user'
        }
      });
    } finally {
      setActionLoading({ ...actionLoading, [userId]: '' });
    }
  };
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex justify-center items-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-500"></div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-semibold text-gray-900">Unverified Users</h1>
          <Link href="/admin/users" className="text-blue-600 hover:text-blue-800">
            Back to All Users
          </Link>
        </div>
        
        {error && (
          <div className="mt-4 bg-red-50 p-4 rounded-md">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Error</h3>
                <p className="text-sm text-red-700 mt-1">{error}</p>
              </div>
            </div>
          </div>
        )}
        
        <div className="mt-8 bg-white shadow overflow-hidden sm:rounded-lg">
          {users.length === 0 ? (
            <div className="p-6 text-center text-gray-500">
              No unverified users found
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      User
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Registered
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {users.map((user) => (
                    <tr key={user._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 bg-gray-200 rounded-full flex items-center justify-center">
                            <span className="text-gray-500 font-medium">
                              {user.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {user.name}
                            </div>
                            <div className="text-sm text-gray-500">
                              {user.email}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDistanceToNow(new Date(user.createdAt), { addSuffix: true })}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                          Unverified
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end space-x-2">
                          <button
                            onClick={() => handleResendVerification(user._id, user.email)}
                            disabled={actionLoading[user._id] === 'resend'}
                            className="text-blue-600 hover:text-blue-900 disabled:opacity-50"
                          >
                            {actionLoading[user._id] === 'resend' ? 'Sending...' : 'Resend Email'}
                          </button>
                          <button
                            onClick={() => handleManualVerify(user._id, user.email)}
                            disabled={actionLoading[user._id] === 'verify'}
                            className="text-green-600 hover:text-green-900 disabled:opacity-50"
                          >
                            {actionLoading[user._id] === 'verify' ? 'Verifying...' : 'Verify User'}
                          </button>
                        </div>
                        {actionMessages[user._id] && (
                          <div className={`mt-1 text-xs ${actionMessages[user._id].type === 'success' ? 'text-green-600' : 'text-red-600'}`}>
                            {actionMessages[user._id].message}
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 