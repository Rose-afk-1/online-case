'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '../../components/ui/select';

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

type PaginationData = {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

const statusOptions = [
  { value: 'all', label: 'All Statuses' },
  { value: 'pending', label: 'Pending' },
  { value: 'approved', label: 'Approved' },
  { value: 'rejected', label: 'Rejected' },
  { value: 'closed', label: 'Closed' },
];

const caseTypeOptions = [
  { value: 'all', label: 'All Types' },
  { value: 'civil', label: 'Civil' },
  { value: 'criminal', label: 'Criminal' },
  { value: 'family', label: 'Family' },
  { value: 'probate', label: 'Probate' },
];

export default function AdminCasesPage() {
  const { data: session, status: authStatus } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [cases, setCases] = useState<Case[]>([]);
  const [pagination, setPagination] = useState<PaginationData>({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
  const [selectedStatus, setSelectedStatus] = useState(searchParams.get('status') || '');
  const [selectedCaseType, setSelectedCaseType] = useState(searchParams.get('caseType') || '');
  const [currentPage, setCurrentPage] = useState(Number(searchParams.get('page')) || 1);
  
  useEffect(() => {
    if (authStatus === 'loading') return;
    
    console.log('Session state:', {
      authStatus,
      session,
      userRole: session?.user?.role,
      isAdmin: session?.user?.role === 'admin'
    });
    
    if (authStatus === 'unauthenticated') {
      router.push('/auth/login');
      return;
    }
    
    if (session?.user?.role !== 'admin') {
      router.push('/unauthorized');
      return;
    }
    
    fetchCases();
  }, [authStatus, session, currentPage, searchTerm, selectedStatus, selectedCaseType]);
  
  const fetchCases = async () => {
    setIsLoading(true);
    try {
      let url = `/api/cases?page=${currentPage}&limit=10`;
      
      if (searchTerm) url += `&search=${encodeURIComponent(searchTerm)}`;
      if (selectedStatus && selectedStatus !== 'all') url += `&status=${encodeURIComponent(selectedStatus)}`;
      if (selectedCaseType && selectedCaseType !== 'all') url += `&caseType=${encodeURIComponent(selectedCaseType)}`;
      
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
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchCases();
  };
  
  const handleStatusChange = (value: string) => {
    setSelectedStatus(value);
    setCurrentPage(1);
  };
  
  const handleCaseTypeChange = (value: string) => {
    setSelectedCaseType(value);
    setCurrentPage(1);
  };
  
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
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
  
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">All Cases</h1>
            <p className="mt-1 text-sm text-gray-600">
              View and manage all court cases
            </p>
          </div>
          <Link href="/admin/dashboard">
            <Button variant="outline" size="sm">
              Back to Dashboard
            </Button>
          </Link>
        </div>
        
        {/* Filters */}
        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Input
              type="text"
              placeholder="Search cases..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full"
            />
            
            <Select
              value={selectedStatus}
              onValueChange={handleStatusChange}
              options={statusOptions}
              placeholder="Filter by status"
            />
            
            <Select
              value={selectedCaseType}
              onValueChange={handleCaseTypeChange}
              options={caseTypeOptions}
              placeholder="Filter by case type"
            />
            
            <Button type="submit">
              Search
            </Button>
          </form>
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
            <p className="text-gray-600">Try adjusting your search filters</p>
          </div>
        ) : (
          <>
            <div className="bg-white shadow overflow-hidden sm:rounded-lg">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Case Details
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Filed By
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {cases.map((caseItem) => (
                    <tr key={caseItem._id}>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-blue-600">
                          <Link 
                            href={{
                              pathname: `/admin/cases/${encodeURIComponent(caseItem._id)}`,
                            }}
                            className="hover:underline"
                            onClick={() => {
                              console.log('Navigating to case with ID:', caseItem._id);
                              // Add the ID to localStorage as a backup
                              localStorage.setItem('lastViewedCaseId', caseItem._id);
                            }}
                          >
                            {caseItem.title}
                          </Link>
                        </div>
                        <div className="text-sm text-gray-500">
                          <span>Case #{caseItem.caseNumber}</span>
                          <span className="mx-2">•</span>
                          <span>{caseItem.caseType.charAt(0).toUpperCase() + caseItem.caseType.slice(1)}</span>
                          <span className="mx-2">•</span>
                          <span>Filed on {formatDate(caseItem.filingDate)}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">{caseItem.userId?.name || 'Unknown'}</div>
                        <div className="text-sm text-gray-500">{caseItem.userId?.email || 'No email'}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(caseItem.status)}`}>
                          {caseItem.status.charAt(0).toUpperCase() + caseItem.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <Link 
                          href={{
                            pathname: `/admin/cases/${encodeURIComponent(caseItem._id)}`,
                          }}
                          onClick={() => {
                            console.log('View Details clicked for case ID:', caseItem._id);
                            // Add the ID to localStorage as a backup
                            localStorage.setItem('lastViewedCaseId', caseItem._id);
                          }}
                        >
                          <Button variant="outline" size="sm">
                            View Details
                          </Button>
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="mt-6 flex justify-center">
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                  >
                    Previous
                  </Button>
                  <span className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700">
                    Page {currentPage} of {pagination.totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(currentPage + 1)}
                    disabled={currentPage === pagination.totalPages}
                    className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                  >
                    Next
                  </Button>
                </nav>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
} 