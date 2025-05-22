'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

type Case = {
  _id: string;
  title: string;
  caseNumber: string;
  description: string;
  status: string;
  caseType: string;
  filingDate: string;
  userId: {
    _id: string;
    name: string;
    email: string;
  };
};

export default function ReviewCasesPage() {
  const { data: session, status: authStatus } = useSession();
  const router = useRouter();
  
  const [pendingCases, setPendingCases] = useState<Case[]>([]);
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
    
    fetchPendingCases();
  }, [authStatus, session]);
  
  const fetchPendingCases = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/cases?status=pending');
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch pending cases');
      }
      
      setPendingCases(data.cases);
    } catch (error: any) {
      setError(error.message || 'An error occurred while fetching pending cases');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleCaseAction = async (caseId: string, action: 'approve' | 'reject') => {
    try {
      const response = await fetch(`/api/cases/${caseId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: action === 'approve' ? 'approved' : 'rejected',
          notes: action === 'approve' 
            ? 'Your case has been approved by court officials.' 
            : 'Your case has been rejected. Please contact the court for more information.',
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || `Failed to ${action} case`);
      }
      
      // Refresh the list
      fetchPendingCases();
    } catch (error: any) {
      setError(error.message || `An error occurred while trying to ${action} the case`);
    }
  };
  
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };
  
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Review Cases</h1>
            <p className="mt-1 text-sm text-gray-600">
              Review and process pending case submissions
            </p>
          </div>
          <Link href="/admin/dashboard">
            <Button variant="outline" size="sm">
              Back to Dashboard
            </Button>
          </Link>
        </div>
        
        {error && (
          <div className="mb-6 rounded-md bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}
        
        {isLoading ? (
          <div className="text-center py-12">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" />
            <p className="mt-4 text-gray-600">Loading pending cases...</p>
          </div>
        ) : pendingCases.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <h3 className="text-lg font-medium text-gray-900 mb-2">No pending cases</h3>
            <p className="text-gray-600">There are currently no cases awaiting review.</p>
          </div>
        ) : (
          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <ul className="divide-y divide-gray-200">
              {pendingCases.map((caseItem) => (
                <li key={caseItem._id}>
                  <div className="px-4 py-5 sm:px-6">
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center">
                      <div className="mb-4 sm:mb-0">
                        <h3 className="text-lg font-medium text-blue-600">
                          <Link href={`/admin/cases/${caseItem._id}`} className="hover:underline">
                            {caseItem.title}
                          </Link>
                        </h3>
                        <div className="mt-1 text-sm text-gray-500">
                          <span>Case #{caseItem.caseNumber}</span>
                          <span className="mx-2">•</span>
                          <span>Filed on {formatDate(caseItem.filingDate)}</span>
                          <span className="mx-2">•</span>
                          <span>Type: {caseItem.caseType.charAt(0).toUpperCase() + caseItem.caseType.slice(1)}</span>
                        </div>
                        <div className="mt-2 text-sm text-gray-500">
                          <span>Filed by: {caseItem.userId?.name || 'Unknown'}</span>
                          <span className="mx-2">•</span>
                          <span>{caseItem.userId?.email || 'No email'}</span>
                        </div>
                      </div>
                      
                      <div className="flex flex-col sm:flex-row gap-2">
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => handleCaseAction(caseItem._id, 'approve')}
                        >
                          Approve
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleCaseAction(caseItem._id, 'reject')}
                        >
                          Reject
                        </Button>
                        <Link href={`/admin/cases/${caseItem._id}`}>
                          <Button variant="outline" size="sm">
                            View Details
                          </Button>
                        </Link>
                      </div>
                    </div>
                    
                    <div className="mt-4">
                      <p className="text-sm text-gray-700">
                        {caseItem.description.length > 200
                          ? `${caseItem.description.substring(0, 200)}...`
                          : caseItem.description}
                      </p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
} 