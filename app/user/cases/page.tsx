'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import BackButton from '@/components/shared/BackToDashboard';

type Case = {
  _id: string;
  title: string;
  caseNumber: string;
  status: string;
  caseType: string;
  filingDate: string;
};

type Pagination = {
  total: number;
  page: number;
  limit: number;
  pages: number;
};

export default function CasesPage() {
  const { data: session, status: authStatus } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Debug log for URL parameters
  console.log('URL params:', {
    paymentStatus: searchParams.get('paymentStatus'),
    caseType: searchParams.get('caseType'),
    status: searchParams.get('status')
  });
  
  const [cases, setCases] = useState<Case[]>([]);
  const [pagination, setPagination] = useState<Pagination>({
    total: 0,
    page: 1,
    limit: 10,
    pages: 1,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Initialize filter states from URL params
  const [caseType, setCaseType] = useState(searchParams.get('caseType') || '');
  const [caseStatus, setCaseStatus] = useState(searchParams.get('status') || '');
  
  // Initialize payment status correctly at mount time
  const initPaymentStatus = () => {
    const param = searchParams.get('paymentStatus');
    if (param === 'unpaid' || param === 'pending') {
      return 'paymentRequired';
    }
    return param || '';
  };
  const [paymentStatus, setPaymentStatus] = useState(initPaymentStatus());
  
  const currentPage = parseInt(searchParams.get('page') || '1');
  
  // Check if we're specifically viewing pending payments
  const isViewingPendingPayments = paymentStatus === 'paymentRequired' || 
    searchParams.get('paymentStatus') === 'paymentRequired' || 
    searchParams.get('paymentStatus') === 'unpaid' || 
    searchParams.get('paymentStatus') === 'pending';
  
  useEffect(() => {
    if (authStatus === 'loading') return;
    
    if (authStatus === 'unauthenticated') {
      router.push('/auth/login');
      return;
    }
    
    // Initialize filter states from URL params
    setCaseType(searchParams.get('caseType') || '');
    setCaseStatus(searchParams.get('status') || '');
    
    // Reuse the same initialization logic for consistency
    setPaymentStatus(initPaymentStatus());
    
    fetchCases();
  }, [authStatus, currentPage, searchParams]);
  
  const fetchCases = async () => {
    setIsLoading(true);
    try {
      let url = `/api/cases?page=${currentPage}`;
      if (caseType) url += `&caseType=${caseType}`;
      if (caseStatus) url += `&status=${caseStatus}`;
      if (paymentStatus) url += `&paymentStatus=${paymentStatus}`;
      
      console.log('Fetching cases with URL:', url);
      console.log('Current payment status filter:', paymentStatus);
      
      const response = await fetch(url);
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
  
  const handleFilterChange = () => {
    const params = new URLSearchParams();
    if (caseType) params.set('caseType', caseType);
    if (caseStatus) params.set('status', caseStatus);
    if (paymentStatus) params.set('paymentStatus', paymentStatus);
    params.set('page', '1');
    
    router.push(`/user/cases?${params.toString()}`);
  };
  
  const clearFilters = () => {
    // Reset all filter states
    setCaseType('');
    setCaseStatus('');
    setPaymentStatus('');
    
    // Clear URL params except for page
    router.push('/user/cases?page=1');
  };
  
  const goToPage = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', page.toString());
    
    router.push(`/user/cases?${params.toString()}`);
  };
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'inProgress':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };
  
  // Add a specific handler for payment status changes
  const handlePaymentStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newPaymentStatus = e.target.value;
    setPaymentStatus(newPaymentStatus);
    
    // Apply filters immediately
    const params = new URLSearchParams(searchParams.toString());
    if (newPaymentStatus) {
      params.set('paymentStatus', newPaymentStatus);
    } else {
      params.delete('paymentStatus');
    }
    params.set('page', '1'); // Reset to page 1
    
    router.push(`/user/cases?${params.toString()}`);
  };
  
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <h1 className="text-2xl font-bold text-gray-900 mb-4 sm:mb-0">
            {isViewingPendingPayments ? 'Cases Requiring Payment' : 'My Cases'}
          </h1>
          <div className="flex gap-4">
            <BackButton />
            <Link href="/user/cases/new">
              <Button variant="primary">
                File a New Case
              </Button>
            </Link>
          </div>
        </div>
        
        {/* Payment status notification */}
        {isViewingPendingPayments && (
          <div className="mb-6 rounded-md bg-yellow-50 p-4 text-sm text-yellow-700 border border-yellow-300">
            <div className="flex">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-yellow-400 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              <p>
                You are viewing cases that require payment. Please complete the payment process to proceed with your case filing.
              </p>
            </div>
          </div>
        )}
        
        {/* Filters */}
        <div className="bg-white p-4 rounded-lg shadow mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="w-full sm:w-1/4">
              <label htmlFor="caseType" className="block text-sm font-medium text-gray-700 mb-1">
                Case Type
              </label>
              <select
                id="caseType"
                value={caseType}
                onChange={(e) => setCaseType(e.target.value)}
                className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="">All Types</option>
                <option value="civil">Civil</option>
                <option value="criminal">Criminal</option>
                <option value="family">Family</option>
                <option value="other">Other</option>
              </select>
            </div>
            
            <div className="w-full sm:w-1/4">
              <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                id="status"
                value={caseStatus}
                onChange={(e) => setCaseStatus(e.target.value)}
                className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
                <option value="inProgress">In Progress</option>
                <option value="completed">Completed</option>
              </select>
            </div>
            
            <div className="w-full sm:w-1/4">
              <label htmlFor="paymentStatus" className="block text-sm font-medium text-gray-700 mb-1">
                Payment Status
              </label>
              <select
                id="paymentStatus"
                value={paymentStatus}
                onChange={handlePaymentStatusChange}
                className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="">All Payment Statuses</option>
                <option value="paymentRequired">Payment Required</option>
                <option value="paid">Paid</option>
                <option value="failed">Payment Failed</option>
              </select>
            </div>
            
            <div className="w-full sm:w-1/4 flex items-end">
              <Button 
                variant="outline" 
                className="w-full" 
                onClick={handleFilterChange}
              >
                Apply Filters
              </Button>
            </div>
          </div>
          
          {(caseType || caseStatus || paymentStatus) && (
            <div className="mt-4 flex justify-end">
              <Button 
                variant="outline" 
                className="text-sm"
                onClick={clearFilters}
              >
                Clear All Filters
              </Button>
            </div>
          )}
        </div>
        
        {error && (
          <div className="mb-6 rounded-md bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}
        
        {isLoading ? (
          <div className="text-center py-12">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" />
            <p className="mt-4 text-gray-600">Loading cases...</p>
          </div>
        ) : cases.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <h3 className="text-lg font-medium text-gray-900 mb-2">No cases found</h3>
            <p className="text-gray-600 mb-6">You haven't filed any cases yet or no cases match your filters.</p>
            <Link href="/user/cases/new">
              <Button variant="primary">File Your First Case</Button>
            </Link>
          </div>
        ) : (
          <>
            <div className="bg-white shadow overflow-hidden sm:rounded-md">
              <ul className="divide-y divide-gray-200">
                {cases.map((caseItem) => (
                  <li key={caseItem._id}>
                    <Link href={`/user/cases/${caseItem._id}`} className="block hover:bg-gray-50">
                      <div className="px-4 py-4 sm:px-6">
                        <div className="flex items-center justify-between">
                          <div className="truncate">
                            <div className="flex text-sm">
                              <p className="font-medium text-blue-600 truncate">{caseItem.title}</p>
                            </div>
                            <div className="mt-2 flex">
                              <div className="flex items-center text-sm text-gray-500">
                                <span>Case #{caseItem.caseNumber}</span>
                                <span className="mx-2">•</span>
                                <span>Filed on {formatDate(caseItem.filingDate)}</span>
                              </div>
                            </div>
                          </div>
                          <div className="ml-2 flex-shrink-0 flex">
                            <span className={`inline-flex px-2 text-xs leading-5 font-semibold rounded-full ${getStatusColor(caseItem.status)}`}>
                              {caseItem.status.charAt(0).toUpperCase() + caseItem.status.slice(1)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            
            {/* Pagination */}
            {pagination.pages > 1 && (
              <div className="mt-6 flex justify-between items-center">
                <div className="text-sm text-gray-700">
                  Showing <span className="font-medium">{(pagination.page - 1) * pagination.limit + 1}</span> to{' '}
                  <span className="font-medium">
                    {Math.min(pagination.page * pagination.limit, pagination.total)}
                  </span>{' '}
                  of <span className="font-medium">{pagination.total}</span> results
                </div>
                
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => goToPage(pagination.page - 1)}
                    disabled={pagination.page === 1}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => goToPage(pagination.page + 1)}
                    disabled={pagination.page === pagination.pages}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
} 