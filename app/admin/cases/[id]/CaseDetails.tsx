'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import React from 'react';

type Case = {
  _id: string;
  title: string;
  caseNumber: string;
  description: string;
  status: string;
  caseType: string;
  filingDate: string;
  plaintiffs: string;
  defendants: string;
  evidence: Array<{
    _id: string;
    title: string;
    fileUrl: string;
    uploadedAt: string;
  }>;
  hearings: Array<{
    _id: string;
    title: string;
    date: string;
    time: string;
    location: string;
    status: string;
  }>;
  userId: {
    _id: string;
    name: string;
    email: string;
    phone?: string;
    address?: string;
  };
  notes?: string;
  paymentStatus: string;
  filingFee: number;
};

type CaseDetailsProps = {
  params: Promise<{ id: string }>;
};

export default function CaseDetails({ params }: CaseDetailsProps) {
  // Properly unwrap the params Promise
  const resolvedParams = React.use(params) as { id: string };
  
  const { data: session, status: authStatus } = useSession();
  const router = useRouter();
  
  const [caseData, setCaseData] = useState<Case | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  
  // Add state for editing plaintiffs and defendants
  const [editMode, setEditMode] = useState(false);
  const [editedPlaintiffs, setEditedPlaintiffs] = useState('');
  const [editedDefendants, setEditedDefendants] = useState('');
  
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
    
    fetchCaseDetails();
  }, [authStatus, session, resolvedParams.id]);
  
  useEffect(() => {
    if (caseData) {
      setEditedPlaintiffs(caseData.plaintiffs || '');
      setEditedDefendants(caseData.defendants || '');
    }
  }, [caseData]);
  
  const fetchCaseDetails = async () => {
    try {
      console.log('Attempting to fetch case details for ID:', resolvedParams.id);
      
      // Try to get ID from params, fall back to localStorage if missing
      let caseId = resolvedParams.id;
      
      if (!caseId || caseId === 'undefined') {
        console.log('ID not in params, trying localStorage fallback');
        // Try to get from localStorage as fallback
        if (typeof window !== 'undefined') {
          caseId = localStorage.getItem('lastViewedCaseId') || '';
          if (caseId) {
            console.log('Found case ID in localStorage:', caseId);
          }
        }
        
        // If still no ID, show error
        if (!caseId) {
          console.error('Missing case ID parameter and no fallback found');
          setError('Missing case ID parameter');
          setIsLoading(false);
          return;
        }
      }
      
      // Store in localStorage for future reference
      if (typeof window !== 'undefined') {
        localStorage.setItem('lastViewedCaseId', caseId);
      }
      
      const apiUrl = `/api/cases/${encodeURIComponent(caseId)}`;
      console.log('Fetching case data from API:', apiUrl);
      
      const response = await fetch(apiUrl);
      console.log('API response status:', response.status);
      
      const data = await response.json();
      console.log('API response data:', JSON.stringify(data).substring(0, 200) + '...');
      
      if (!response.ok) {
        console.error('Error response:', data);
        throw new Error(data.message || 'Failed to fetch case details');
      }
      
      if (!data.case) {
        console.error('No case data found in response');
        throw new Error('No case data found in response');
      }
      
      // Successfully received case data
      console.log('Case data received:', {
        id: data.case._id,
        title: data.case.title,
        status: data.case.status,
        userRole: session?.user?.role
      });
      
      setCaseData(data.case);
      console.log('Case data received:', data.case);
      if (data.case.hearings) {
        console.log(`Received ${data.case.hearings.length} hearings:`, 
          data.case.hearings.map((h: any) => ({
            id: h._id,
            title: h.title,
            date: h.date,
            status: h.status
          }))
        );
      }
    } catch (error: any) {
      console.error('Error in fetchCaseDetails:', error);
      setError(error.message || 'An error occurred while fetching case details');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleStatusUpdate = async (newStatus: string) => {
    setIsUpdating(true);
    try {
      // Use the same ID approach as in fetchCaseDetails
      let caseId = resolvedParams.id;
      
      if (!caseId || caseId === 'undefined') {
        // Try to get from localStorage as fallback
        if (typeof window !== 'undefined') {
          caseId = localStorage.getItem('lastViewedCaseId') || '';
        }
        
        // If still no ID, show error
        if (!caseId) {
          throw new Error('Missing case ID parameter');
        }
      }
      
      const response = await fetch(`/api/cases/${caseId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: newStatus,
          notes: `Status updated to ${newStatus} by admin`,
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to update case status');
      }
      
      fetchCaseDetails();
    } catch (error: any) {
      setError(error.message || 'An error occurred while updating case status');
    } finally {
      setIsUpdating(false);
    }
  };
  
  const handleFieldUpdate = async () => {
    setIsUpdating(true);
    try {
      // Use the same ID approach as in handleStatusUpdate
      let caseId = resolvedParams.id;
      
      if (!caseId || caseId === 'undefined') {
        // Try to get from localStorage as fallback
        if (typeof window !== 'undefined') {
          caseId = localStorage.getItem('lastViewedCaseId') || '';
        }
        
        // If still no ID, show error
        if (!caseId) {
          throw new Error('Missing case ID parameter');
        }
      }
      
      const response = await fetch(`/api/cases/${caseId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          plaintiffs: editedPlaintiffs,
          defendants: editedDefendants,
          notes: `Updated plaintiffs and defendants information by admin`,
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to update case information');
      }
      
      setEditMode(false);
      fetchCaseDetails();
    } catch (error: any) {
      setError(error.message || 'An error occurred while updating case information');
    } finally {
      setIsUpdating(false);
    }
  };
  
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };
  
  const formatTime = (timeString: string) => {
    return new Date(`1970-01-01T${timeString}`).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };
  
  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
      closed: 'bg-gray-100 text-gray-800',
    };
    return colors[status.toLowerCase()] || 'bg-gray-100 text-gray-800';
  };
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" />
        <p className="ml-2">Loading case details...</p>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="min-h-screen p-8">
        <div className="max-w-7xl mx-auto">
          <div className="bg-red-50 p-4 rounded-md">
            <p className="text-red-700">{error}</p>
            <Button
              variant="outline"
              className="mt-4 bg-blue-600 text-white hover:bg-blue-700"
              onClick={() => router.push('/admin/cases')}
            >
              Back to Cases
            </Button>
          </div>
        </div>
      </div>
    );
  }
  
  if (!caseData) {
    return (
      <div className="min-h-screen p-8">
        <div className="max-w-7xl mx-auto">
          <div className="bg-yellow-50 p-4 rounded-md">
            <p className="text-yellow-700">Case not found</p>
            <p className="text-yellow-600 mt-2">Debug info: params.id = {resolvedParams.id}</p>
            <Button
              variant="outline"
              className="mt-4 bg-blue-600 text-white hover:bg-blue-700"
              onClick={() => router.push('/admin/cases')}
            >
              Back to Cases
            </Button>
          </div>
        </div>
      </div>
    );
  }
  
  // Additional debug info
  console.log('Rendering case data:', {
    title: caseData.title,
    plaintiffs: caseData.plaintiffs,
    plaintiffsType: typeof caseData.plaintiffs,
    defendants: caseData.defendants,
    defendantsType: typeof caseData.defendants,
    description: caseData.description,
    fullCaseData: caseData
  });
  
  // Function to safely display text data
  const safeDisplay = (text: any) => {
    if (text === null || text === undefined) return "Not provided";
    if (typeof text === "string") return text;
    if (typeof text === "object") return JSON.stringify(text);
    return String(text);
  };
  
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{caseData.title}</h1>
            <p className="mt-1 text-sm text-gray-600">
              Case #{caseData.caseNumber}
            </p>
          </div>
          <Link href="/admin/cases">
            <Button 
              className="bg-blue-600 text-white hover:bg-blue-700" 
              size="sm"
            >
              Back to Cases
            </Button>
          </Link>
        </div>
        
        {/* Status Actions */}
        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-medium text-gray-900">Current Status</h2>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium mt-1 ${getStatusColor(caseData.status)}`}>
                {caseData.status.charAt(0).toUpperCase() + caseData.status.slice(1)}
              </span>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                className="bg-blue-600 text-white hover:bg-blue-700"
                size="sm"
                onClick={() => handleStatusUpdate('approved')}
                disabled={isUpdating || caseData.status === 'approved'}
              >
                Approve
              </Button>
              <Button
                variant="outline"
                className="bg-blue-600 text-white hover:bg-blue-700"
                size="sm"
                onClick={() => handleStatusUpdate('rejected')}
                disabled={isUpdating || caseData.status === 'rejected'}
              >
                Reject
              </Button>
              <Button
                variant="outline"
                className="bg-blue-600 text-white hover:bg-blue-700"
                size="sm"
                onClick={() => handleStatusUpdate('closed')}
                disabled={isUpdating || caseData.status === 'closed'}
              >
                Close
              </Button>
            </div>
          </div>
        </div>
        
        {/* Case Details */}
        <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-6">
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">Case Information</h3>
          </div>
          <div className="border-t border-gray-200">
            <dl>
              <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Case Type</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  {caseData.caseType.charAt(0).toUpperCase() + caseData.caseType.slice(1)}
                </dd>
              </div>
              <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Filing Date</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  {formatDate(caseData.filingDate)}
                </dd>
              </div>
              <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">
                  Plaintiffs
                  {editMode ? null : (
                    <Button
                      variant="link"
                      size="sm"
                      className="ml-2 text-blue-600"
                      onClick={() => setEditMode(true)}
                    >
                      Edit
                    </Button>
                  )}
                </dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  {editMode ? (
                    <textarea
                      rows={3}
                      className="w-full p-2 border border-gray-300 rounded"
                      value={editedPlaintiffs}
                      onChange={(e) => setEditedPlaintiffs(e.target.value)}
                      placeholder="Enter plaintiffs information"
                    />
                  ) : (
                    <div className="p-3 border border-gray-300 rounded">
                      {caseData.plaintiffs || "No plaintiffs listed"}
                    </div>
                  )}
                </dd>
              </div>
              <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">
                  Defendants
                  {editMode ? null : (
                    <Button
                      variant="link"
                      size="sm"
                      className="ml-2 text-blue-600"
                      onClick={() => setEditMode(true)}
                    >
                      Edit
                    </Button>
                  )}
                </dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  {editMode ? (
                    <textarea
                      rows={3}
                      className="w-full p-2 border border-gray-300 rounded"
                      value={editedDefendants}
                      onChange={(e) => setEditedDefendants(e.target.value)}
                      placeholder="Enter defendants information"
                    />
                  ) : (
                    <div className="p-3 border border-gray-300 rounded">
                      {caseData.defendants || "No defendants listed"}
                    </div>
                  )}
                </dd>
              </div>
              <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Description</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  {caseData.description || "No description provided"}
                </dd>
              </div>
              <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Payment Status</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    caseData.paymentStatus === 'paid' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {caseData.paymentStatus.charAt(0).toUpperCase() + caseData.paymentStatus.slice(1)}
                  </span>
                  <span className="ml-2">Filing Fee: ${caseData.filingFee}</span>
                </dd>
              </div>
            </dl>
          </div>
        </div>
        
        {/* Save button for edit mode */}
        {editMode && (
          <div className="bg-gray-50 px-4 py-5 flex justify-end">
            <Button
              variant="outline"
              size="sm"
              className="mr-2"
              onClick={() => {
                setEditedPlaintiffs(caseData?.plaintiffs || '');
                setEditedDefendants(caseData?.defendants || '');
                setEditMode(false);
              }}
              disabled={isUpdating}
            >
              Cancel
            </Button>
            <Button
              className="bg-blue-600 text-white hover:bg-blue-700"
              size="sm"
              onClick={handleFieldUpdate}
              disabled={isUpdating}
            >
              {isUpdating ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        )}
        
        {/* Filed By */}
        <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-6">
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">Filed By</h3>
          </div>
          <div className="border-t border-gray-200">
            <dl>
              <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Name</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{caseData.userId.name}</dd>
              </div>
              <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Email</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{caseData.userId.email}</dd>
              </div>
              {caseData.userId.phone && (
                <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Phone</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{caseData.userId.phone}</dd>
                </div>
              )}
              {caseData.userId.address && (
                <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Address</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{caseData.userId.address}</dd>
                </div>
              )}
            </dl>
          </div>
        </div>
        
        {/* Evidence */}
        <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-6">
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">Evidence</h3>
          </div>
          <div className="border-t border-gray-200">
            {caseData.evidence && caseData.evidence.length > 0 ? (
              <ul className="divide-y divide-gray-200">
                {caseData.evidence.map((item) => (
                  <li key={item._id} className="px-4 py-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{item.title}</p>
                        <p className="text-sm text-gray-500">Uploaded on {formatDate(item.uploadedAt)}</p>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(item.fileUrl, '_blank')}
                      >
                        View
                      </Button>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="px-4 py-5 text-sm text-gray-500">No evidence uploaded yet.</p>
            )}
          </div>
        </div>
        
        {/* Hearings */}
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">Hearings</h3>
          </div>
          <div className="border-t border-gray-200">
            {caseData.hearings && caseData.hearings.length > 0 ? (
              <ul className="divide-y divide-gray-200">
                {caseData.hearings.map((hearing) => (
                  <li key={hearing._id} className="px-4 py-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{hearing.title}</p>
                        <p className="text-sm text-gray-500">
                          {formatDate(hearing.date)} at {formatTime(hearing.time)}
                        </p>
                        <p className="text-sm text-gray-500">Location: {hearing.location}</p>
                      </div>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(hearing.status)}`}>
                        {hearing.status.charAt(0).toUpperCase() + hearing.status.slice(1)}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="px-4 py-5 text-sm text-gray-500">No hearings scheduled yet.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 