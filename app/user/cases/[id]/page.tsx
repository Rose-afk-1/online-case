'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import BackButton from '@/components/shared/BackToDashboard';
import InvoiceDownloadButton from '@/components/InvoiceDownloadButton';

type CaseDetail = {
  _id: string;
  caseNumber: string;
  title: string;
  description: string;
  caseType: string;
  status: string;
  filingDate: string;
  plaintiffs: string;
  defendants: string;
  courtLocation?: string;
  filingFee?: number;
  paymentStatus?: string;
  paymentId?: string;
  userId: {
    _id: string;
    name: string;
    email: string;
  };
};

type ResourceCounts = {
  hearings: number;
  evidence: number;
};

// Status colors
const statusColors: Record<string, { bg: string; text: string }> = {
  'pending': { bg: 'bg-yellow-100', text: 'text-yellow-800' },
  'approved': { bg: 'bg-green-100', text: 'text-green-800' },
  'rejected': { bg: 'bg-red-100', text: 'text-red-800' },
  'inProgress': { bg: 'bg-blue-100', text: 'text-blue-800' },
  'completed': { bg: 'bg-gray-100', text: 'text-gray-800' },
};

// Payment status colors
const paymentStatusColors: Record<string, { bg: string; text: string }> = {
  'unpaid': { bg: 'bg-red-100', text: 'text-red-800' },
  'pending': { bg: 'bg-yellow-100', text: 'text-yellow-800' },
  'paid': { bg: 'bg-green-100', text: 'text-green-800' },
  'failed': { bg: 'bg-gray-100', text: 'text-gray-800' },
};

export default function CaseDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { data: session, status: authStatus } = useSession();
  const router = useRouter();
  const { id: caseId } = React.use(params);
  
  const [caseDetails, setCaseDetails] = useState<CaseDetail | null>(null);
  const [resourceCounts, setResourceCounts] = useState<ResourceCounts>({
    hearings: 0,
    evidence: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Add state for editing parties
  const [isEditingParties, setIsEditingParties] = useState(false);
  const [plaintiffs, setPlaintiffs] = useState('');
  const [defendants, setDefendants] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [updateMessage, setUpdateMessage] = useState('');
  
  useEffect(() => {
    if (authStatus === 'loading') return;
    
    if (authStatus === 'unauthenticated') {
      router.push('/auth/login');
      return;
    }
    
    fetchCaseDetails();
  }, [authStatus, caseId]);
  
  // Update local state when case details change
  useEffect(() => {
    if (caseDetails) {
      setPlaintiffs(caseDetails.plaintiffs || '');
      setDefendants(caseDetails.defendants || '');
    }
  }, [caseDetails]);
  
  const fetchCaseDetails = async () => {
    try {
      const response = await fetch(`/api/cases/${caseId}`);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch case details');
      }
      
      // Additional client-side check to ensure the user can only see their own cases
      if (session?.user?.role !== 'admin' && 
          data.case.userId._id.toString() !== session?.user?.id.toString()) {
        console.error('Security warning: Attempted to access unauthorized case');
        router.push('/unauthorized');
        return;
      }
      
      setCaseDetails(data.case);
      setResourceCounts(data.counts);
    } catch (error: any) {
      setError(error.message || 'An error occurred while fetching case details');
    } finally {
      setIsLoading(false);
    }
  };
  
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };
  
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };
  
  // Function to capitalize the first letter for display
  const capitalize = (str: string) => {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1);
  };
  
  // Add function to update parties
  const handleUpdateParties = async () => {
    if (!caseDetails) return;
    
    setIsSaving(true);
    setUpdateMessage('');
    
    try {
      const response = await fetch('/api/cases/update-parties', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          caseId: caseDetails._id,
          plaintiffs,
          defendants,
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to update case parties');
      }
      
      setUpdateMessage('Case updated successfully');
      setIsEditingParties(false);
      fetchCaseDetails(); // Refresh the case data
    } catch (error: any) {
      setUpdateMessage(`Error: ${error.message || 'An error occurred'}`);
    } finally {
      setIsSaving(false);
    }
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
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-white shadow rounded-lg p-8 max-w-md w-full">
          <h2 className="text-xl font-semibold text-red-600 mb-4">Error</h2>
          <p className="text-gray-700 mb-6">{error}</p>
          <Button
            variant="outline"
            onClick={() => router.back()}
            className="w-full"
          >
            Go Back
          </Button>
        </div>
      </div>
    );
  }
  
  if (!caseDetails) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-white shadow rounded-lg p-8 max-w-md w-full">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Case Not Found</h2>
          <p className="text-gray-700 mb-6">The requested case could not be found.</p>
          <Link href="/user/dashboard">
            <Button
              variant="primary"
              className="w-full"
            >
              Return to Dashboard
            </Button>
          </Link>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <div className="flex space-x-2 mb-4">
            <BackButton />
            <Link href="/">
              <Button
                className="bg-blue-600 hover:bg-blue-700 text-white"
                size="sm"
              >
                Home
              </Button>
            </Link>
            <Link href="/user/dashboard">
              <Button
                className="bg-blue-600 hover:bg-blue-700 text-white"
                size="sm"
              >
                Dashboard
              </Button>
            </Link>
          </div>
          
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {caseDetails.title}
              </h1>
              <p className="mt-1 text-sm text-gray-600">
                Case #{caseDetails.caseNumber} • {capitalize(caseDetails.caseType)}
              </p>
            </div>
            <div className="mt-4 md:mt-0">
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[caseDetails.status]?.bg || 'bg-gray-100'} ${statusColors[caseDetails.status]?.text || 'text-gray-800'}`}>
                {capitalize(caseDetails.status)}
              </span>
            </div>
          </div>
        </div>
        
        <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-6">
          <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
            <h3 className="text-lg font-medium leading-6 text-gray-900">Case Information</h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">Details and information about the case.</p>
          </div>
          <div className="border-t border-gray-200 px-4 py-5 sm:p-0">
            <dl className="sm:divide-y sm:divide-gray-200">
              <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Filing Date</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  {formatDate(caseDetails.filingDate)}
                </dd>
              </div>
              
              <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Description</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2 whitespace-pre-wrap">
                  {caseDetails.description}
                </dd>
              </div>
              
              <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">
                  Plaintiff(s)
                  {!isEditingParties && (
                    <button 
                      onClick={() => setIsEditingParties(true)}
                      className="ml-2 text-blue-600 hover:text-blue-800 text-xs underline"
                    >
                      {caseDetails.plaintiffs ? 'Edit' : 'Add'}
                    </button>
                  )}
                </dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  {isEditingParties ? (
                    <textarea
                      value={plaintiffs}
                      onChange={(e) => setPlaintiffs(e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-md"
                      rows={3}
                      placeholder="Enter plaintiff(s) names"
                    />
                  ) : (
                    caseDetails.plaintiffs || (
                      <span className="text-gray-500 italic">No plaintiffs specified</span>
                    )
                  )}
                </dd>
              </div>
              
              <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">
                  Defendant(s)
                  {!isEditingParties && (
                    <button 
                      onClick={() => setIsEditingParties(true)}
                      className="ml-2 text-blue-600 hover:text-blue-800 text-xs underline"
                    >
                      {caseDetails.defendants ? 'Edit' : 'Add'}
                    </button>
                  )}
                </dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  {isEditingParties ? (
                    <textarea
                      value={defendants}
                      onChange={(e) => setDefendants(e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-md"
                      rows={3}
                      placeholder="Enter defendant(s) names"
                    />
                  ) : (
                    caseDetails.defendants || (
                      <span className="text-gray-500 italic">No defendants specified</span>
                    )
                  )}
                </dd>
              </div>
              
              {isEditingParties && (
                <div className="py-4 sm:py-5 px-6 flex justify-end space-x-3 border-t border-gray-200">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsEditingParties(false);
                      setPlaintiffs(caseDetails.plaintiffs || '');
                      setDefendants(caseDetails.defendants || '');
                    }}
                    disabled={isSaving}
                  >
                    Cancel
                  </Button>
                  <Button
                    className="bg-blue-600 hover:bg-blue-700 text-white" 
                    onClick={handleUpdateParties}
                    disabled={isSaving}
                  >
                    {isSaving ? 'Saving...' : 'Save Changes'}
                  </Button>
                </div>
              )}
              
              {updateMessage && (
                <div className={`py-4 sm:py-5 px-6 ${updateMessage.startsWith('Error') ? 'text-red-600' : 'text-green-600'}`}>
                  {updateMessage}
                </div>
              )}
              
              {caseDetails.courtLocation && (
                <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Court Location</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    {caseDetails.courtLocation}
                  </dd>
                </div>
              )}
              
              <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Filing Fee</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  {caseDetails.filingFee !== undefined && caseDetails.filingFee > 0 
                    ? formatCurrency(caseDetails.filingFee)
                    : 'No filing fee required'}
                </dd>
              </div>
              
              {caseDetails.paymentStatus && (
                <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Payment Status</dt>
                  <dd className="mt-1 text-sm sm:mt-0 sm:col-span-2">
                    <div className="flex items-center space-x-3">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        paymentStatusColors[caseDetails.paymentStatus]?.bg || 'bg-gray-100'
                      } ${
                        paymentStatusColors[caseDetails.paymentStatus]?.text || 'text-gray-800'
                      }`}>
                        {capitalize(caseDetails.paymentStatus)}
                      </span>
                      
                      {caseDetails.paymentStatus === 'paid' && caseDetails.paymentId && (
                        <InvoiceDownloadButton paymentId={caseDetails.paymentId} />
                      )}
                    </div>
                  </dd>
                </div>
              )}
            </dl>
          </div>
        </div>
        
        {caseDetails.paymentStatus !== 'paid' && caseDetails.filingFee !== undefined && caseDetails.filingFee > 0 && (
          <div className="bg-white shadow rounded-lg p-6 mb-8">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Payment Required for Evidence Upload</h3>
            <div className="bg-blue-50 p-4 rounded-md mb-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-blue-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3 flex-1 md:flex md:justify-between">
                  <p className="text-sm text-blue-700">
                    A filing fee of {formatCurrency(caseDetails.filingFee || 0)} is required before you can upload evidence for this case.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="border rounded-md p-4 mb-4">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-lg font-medium text-gray-900">{formatCurrency(caseDetails.filingFee || 0)}</p>
                  <p className="text-sm text-gray-500">Fee for evidence upload (case #{caseDetails.caseNumber})</p>
                </div>
                <Link href={`/user/cases/${caseId}/payment`}>
                  <Button className="bg-blue-600 hover:bg-blue-700 text-white">Pay Now</Button>
                </Link>
              </div>
            </div>
            
            <div className="text-xs text-gray-500">
              <p>Secure payment processing. Your payment information is encrypted and protected.</p>
            </div>
          </div>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Evidence</h3>
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-600">{resourceCounts?.evidence || 0} item(s)</p>
              <div className="flex space-x-2">
                <Link href={`/user/cases/${caseId}/evidence`}>
                  <Button className="bg-blue-600 hover:bg-blue-700 text-white" size="sm">View All</Button>
                </Link>
                {(caseDetails.paymentStatus === 'paid' || session?.user?.role === 'admin') ? (
                  <Link href={`/user/cases/${caseId}/upload-evidence`}>
                    <Button variant="primary" size="sm">Upload New</Button>
                  </Link>
                ) : (
                  <Button 
                    variant="primary" 
                    size="sm" 
                    disabled 
                    title="Complete payment first"
                    className="opacity-50 cursor-not-allowed"
                  >
                    Upload New
                  </Button>
                )}
              </div>
            </div>
            
            {caseDetails.paymentStatus !== 'paid' && session?.user?.role !== 'admin' && (
              <div className="mt-4 p-3 bg-yellow-50 rounded-md">
                <p className="text-sm text-yellow-700">
                  <span className="font-medium">Payment Required:</span> You must complete payment before you can upload evidence.
                </p>
              </div>
            )}
          </div>
          
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Hearings</h3>
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-600">{resourceCounts?.hearings || 0} hearing(s) scheduled</p>
              <Link href={`/user/cases/${caseId}/hearings`}>
                <Button className="bg-blue-600 hover:bg-blue-700 text-white" size="sm">View Schedule</Button>
              </Link>
            </div>
          </div>
        </div>
        
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Case Timeline</h3>
          
          {/* Empty state */}
          <div className="text-center py-8">
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
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No updates yet</h3>
            <p className="mt-1 text-sm text-gray-500">
              This timeline will show updates and changes to your case as they happen.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
