'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import BackButton from '@/components/shared/BackToDashboard';

interface Hearing {
  _id: string;
  caseId: {
    _id: string;
    caseNumber: string;
    title: string;
  };
  title: string;
  date: string;
  time: string;
  duration: number;
  location: string;
  status: 'scheduled' | 'completed' | 'postponed' | 'cancelled';
  notes?: string;
}

interface PaginationData {
  total: number;
  page: number;
  limit: number;
  pages: number;
}

const statusColors = {
  scheduled: 'bg-blue-100 text-blue-800',
  completed: 'bg-green-100 text-green-800',
  postponed: 'bg-yellow-100 text-yellow-800',
  cancelled: 'bg-red-100 text-red-800',
};

export default function HearingsPage() {
  const { data: session, status: sessionStatus } = useSession();
  const router = useRouter();
  
  const [hearings, setHearings] = useState<Hearing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [pagination, setPagination] = useState<PaginationData>({
    total: 0,
    page: 1,
    limit: 10,
    pages: 0,
  });

  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Force white background on mount
  useEffect(() => {
    // Force the body to be white
    document.body.style.backgroundColor = '#ffffff';
    document.body.style.background = '#ffffff';
    
    // Clean up when component unmounts
    return () => {
      document.body.style.backgroundColor = '';
      document.body.style.background = '';
    };
  }, []);

  useEffect(() => {
    // Redirect if not authenticated
    if (sessionStatus === 'unauthenticated') {
      router.push('/auth/login');
      return;
    }

    if (sessionStatus === 'authenticated') {
      fetchHearings();
    }
  }, [sessionStatus, router, pagination.page, searchTerm, statusFilter, startDate, endDate]);

  const fetchHearings = async () => {
    try {
      setLoading(true);
      
      // Build query parameters
      const params = new URLSearchParams();
      params.append('page', pagination.page.toString());
      params.append('limit', pagination.limit.toString());
      
      if (searchTerm) params.append('search', searchTerm);
      if (statusFilter) params.append('status', statusFilter);
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);
      
      // Default sort by date with most recent first if no other sorting specified
      params.append('sort', 'date');
      params.append('order', 'desc');
      
      const response = await fetch(`/api/hearings?${params.toString()}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch hearings');
      }
      
      const data = await response.json();
      console.log('Hearings fetched:', data.hearings.length, 'results');
      data.hearings.forEach((h: any) => console.log(`- ${h.title}, Date: ${h.date}, Status: ${h.status}`));
      setHearings(data.hearings);
      setPagination(data.pagination);
      setError('');
    } catch (err: any) {
      setError(err.message || 'An error occurred');
      console.error('Error fetching hearings:', err);
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (page: number) => {
    setPagination(prev => ({ ...prev, page }));
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPagination(prev => ({ ...prev, page: 1 })); // Reset to first page on new search
  };

  const clearFilters = () => {
    setSearchTerm('');
    setStatusFilter('');
    setStartDate('');
    setEndDate('');
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const viewHearingDetails = (hearingId: string) => {
    router.push(`/user/hearings/${hearingId}`);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (sessionStatus === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#ffffff', background: '#ffffff' }}>
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" />
        <p className="ml-2">Loading hearings...</p>
      </div>
    );
  }

  return (
    <>
      <style jsx global>{`
        body {
          background-color: #ffffff !important;
          color: #000000 !important;
        }
        html {
          background-color: #ffffff !important;
        }
        * {
          background-color: transparent;
        }
      `}</style>
      
      <div style={{ 
        backgroundColor: '#ffffff', 
        background: '#ffffff',
        minHeight: '100vh',
        width: '100%',
        position: 'relative',
        zIndex: 1
      }}>
        <div className="container mx-auto py-8 px-4" style={{ backgroundColor: '#ffffff', background: '#ffffff' }}>
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold">My Hearings</h1>
            <BackButton />
          </div>
          
          {/* Search and Filter Section */}
          <div className="bg-white shadow-sm border border-gray-200 rounded-lg p-6 mb-6">
            <form onSubmit={handleSearch} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="relative">
                  <svg xmlns="http://www.w3.org/2000/svg" className="absolute left-3 top-3 h-4 w-4 text-gray-400" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                  <Input
                    placeholder="Search hearings..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                
                <div>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
                  >
                    <option value="">All Statuses</option>
                    <option value="scheduled">Scheduled</option>
                    <option value="completed">Completed</option>
                    <option value="postponed">Postponed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
                
                <div>
                  <Input
                    type="date"
                    placeholder="Start Date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full"
                  />
                </div>
                
                <div>
                  <Input
                    type="date"
                    placeholder="End Date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full"
                  />
                </div>
              </div>
              
              <div className="flex justify-between">
                <Button type="submit" variant="primary">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="h-4 w-4 mr-2"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"></path></svg>
                  Apply Filters
                </Button>
                <Button type="button" variant="outline" onClick={clearFilters}>
                  Clear Filters
                </Button>
              </div>
            </form>
          </div>
          
          {/* Hearings Table */}
          <div className="bg-white shadow-sm border border-gray-200 rounded-lg">
            <div className="p-6 border-b">
              <h2 className="text-xl font-bold text-black">Scheduled Hearings</h2>
            </div>
            <div className="p-6">
              {loading ? (
                <div className="flex justify-center py-8">
                  <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" />
                  <p className="ml-2">Loading hearings...</p>
                </div>
              ) : error ? (
                <div className="text-center text-red-500 py-4 flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5 mr-2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
                  {error}
                </div>
              ) : hearings.length === 0 ? (
                <div className="text-center py-8 text-black">
                  No hearings found. Adjust your filters or check back later.
                </div>
              ) : (
                <>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">Case</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">Hearing Title</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">Date & Time</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">Location</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">Status</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {hearings.map((hearing) => (
                          <tr key={hearing._id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="font-medium text-black">{hearing.caseId.caseNumber}</div>
                              <div className="text-sm text-black">{hearing.caseId.title}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-black">
                              {hearing.title}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex flex-col">
                                <span className="flex items-center text-black">
                                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-3 w-3 mr-1"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                                  {formatDate(hearing.date)}
                                </span>
                                <span className="flex items-center text-sm text-black">
                                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-3 w-3 mr-1"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                                  {hearing.time} ({hearing.duration} min)
                                </span>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="flex items-center text-black">
                                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-3 w-3 mr-1"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                                {hearing.location}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`${statusColors[hearing.status]} px-2 py-1 rounded-full text-xs font-medium`}>
                                {hearing.status.charAt(0).toUpperCase() + hearing.status.slice(1)}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => viewHearingDetails(hearing._id)}
                              >
                                View Details
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  
                  {/* Pagination */}
                  {pagination.pages > 1 && (
                    <div className="mt-6 flex items-center justify-center">
                      <nav className="relative z-0 inline-flex rounded-md -space-x-px" aria-label="Pagination">
                        <button
                          onClick={() => handlePageChange(Math.max(1, pagination.page - 1))}
                          disabled={pagination.page <= 1}
                          className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium hover:bg-gray-50 ${pagination.page <= 1 ? "text-gray-300 cursor-not-allowed" : "text-gray-500 cursor-pointer"}`}
                        >
                          <span className="sr-only">Previous</span>
                          <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                            <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </button>
                          
                        {[...Array(pagination.pages)].map((_, i) => {
                          const pageNumber = i + 1;
                          
                          // Show first page, last page, current page, and pages around current page
                          if (
                            pageNumber === 1 ||
                            pageNumber === pagination.pages ||
                            (pageNumber >= pagination.page - 1 && pageNumber <= pagination.page + 1)
                          ) {
                            return (
                              <button
                                key={pageNumber}
                                onClick={() => handlePageChange(pageNumber)}
                                className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                                  pageNumber === pagination.page
                                    ? "z-10 bg-blue-50 border-blue-500 text-blue-600"
                                    : "bg-white border-gray-300 text-gray-500 hover:bg-gray-50"
                                }`}
                              >
                                {pageNumber}
                              </button>
                            );
                          }
                          
                          // Show ellipsis when there's a gap
                          if (
                            (pageNumber === 2 && pagination.page > 3) ||
                            (pageNumber === pagination.pages - 1 && pagination.page < pagination.pages - 2)
                          ) {
                            return (
                              <span
                                key={pageNumber}
                                className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700"
                              >
                                ...
                              </span>
                            );
                          }
                          
                          return null;
                        })}
                        
                        <button
                          onClick={() => handlePageChange(Math.min(pagination.pages, pagination.page + 1))}
                          disabled={pagination.page >= pagination.pages}
                          className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium hover:bg-gray-50 ${pagination.page >= pagination.pages ? "text-gray-300 cursor-not-allowed" : "text-gray-500 cursor-pointer"}`}
                        >
                          <span className="sr-only">Next</span>
                          <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                            <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                          </svg>
                        </button>
                      </nav>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
} 