'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import Spinner from '@/components/ui/Spinner';

type Evidence = {
  _id: string;
  title: string;
  description?: string;
  fileUrl: string;
  fileType: string;
  fileSize: number;
  uploadDate: string;
  isApproved: boolean;
  approvalDate?: string;
  approvedBy?: string;
  caseId: {
    _id: string;
    caseNumber: string;
    title: string;
  };
  userId: {
    _id: string;
    name: string;
    email: string;
  };
};

export default function AdminEvidencePage() {
  const { data: session, status: authStatus } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Safely handle parameter values
  const filterApproved = searchParams.get('approved');
  const validApproved = ['true', 'false'].includes(filterApproved || '') ? filterApproved : null;
  const filterCaseId = searchParams.get('case');
  const filterFileType = searchParams.get('fileType');
  
  const [evidence, setEvidence] = useState<Evidence[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState('');
  const [processingIds, setProcessingIds] = useState<string[]>([]);
  
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
    
    fetchEvidence();
  }, [authStatus, session, validApproved, filterCaseId, filterFileType, router]);
  
  const fetchEvidence = async () => {
    setIsLoading(true);
    setError('');
    
    try {
      let url = '/api/evidence';
      const params = new URLSearchParams();
      
      if (validApproved) {
        params.append('isApproved', validApproved);
      }
      
      if (filterCaseId) {
        params.append('caseId', filterCaseId);
      }
      
      if (filterFileType) {
        params.append('fileType', filterFileType);
      }
      
      if (params.toString()) {
        url += `?${params.toString()}`;
      }
      
      // Add a timestamp to prevent caching
      const timestamp = new Date().getTime();
      const noCache = url.includes('?') ? `&t=${timestamp}` : `?t=${timestamp}`;
      
      console.log(`Fetching evidence from: ${url}${noCache}`);
      
      const response = await fetch(`${url}${noCache}`, {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch evidence');
      }
      
      console.log(`Loaded ${data.evidence?.length || 0} evidence items`);
      setEvidence(data.evidence || []);
    } catch (error: any) {
      console.error("Error fetching evidence:", error);
      setError(error.message || 'An error occurred while fetching evidence');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleApproveEvidence = async (id: string, isApproved: boolean) => {
    try {
      setProcessingIds(prev => [...prev, id]);
      setError('');
      
      console.log(`Processing evidence ${id}: ${isApproved ? 'approving' : 'rejecting'}`);
      
      // Optimistic UI update first
      if (validApproved === 'true' && !isApproved) {
        // On Approved tab, rejecting: remove from list
        setEvidence(prev => prev.filter(item => item._id !== id));
      } else if (validApproved === 'false') {
        // On Pending tab, always remove item regardless of approval status
        setEvidence(prev => prev.filter(item => item._id !== id));
      } else {
        // On All tab: update the item status
        setEvidence(prev => prev.map(item => 
          item._id === id ? { ...item, isApproved } : item
        ));
      }
      
      const response = await fetch(`/api/evidence/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        },
        body: JSON.stringify({ isApproved }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to update evidence');
      }
      
      console.log('API response:', data);
      
      // Fetch fresh data after a short delay
      setTimeout(() => {
        fetchEvidence();
      }, 500);
      
    } catch (error: any) {
      console.error("Error updating evidence:", error);
      setError(error.message || 'Failed to update evidence status');
      // If error, refresh to get correct state
      fetchEvidence();
    } finally {
      setProcessingIds(prev => prev.filter(itemId => itemId !== id));
    }
  };
  
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' bytes';
    else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    else return (bytes / 1048576).toFixed(1) + ' MB';
  };
  
  const getFileTypeIcon = (fileType: string) => {
    if (fileType.startsWith('image/')) {
      return '🖼️';
    } else if (fileType === 'application/pdf') {
      return '📄';
    } else if (fileType.includes('word') || fileType.includes('document')) {
      return '📝';
    } else if (fileType.startsWith('video/')) {
      return '🎬';
    } else if (fileType.startsWith('audio/')) {
      return '🔊';
    } else {
      return '📎';
    }
  };
  
  const filteredEvidence = evidence.filter(item => 
    item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (item.description && item.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
    item.caseId?.caseNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.caseId?.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.userId?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.userId?.email.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const fileTypes = [
    { label: 'All Files', value: '' },
    { label: 'Images', value: 'image' },
    { label: 'Documents', value: 'document' },
    { label: 'PDFs', value: 'pdf' },
    { label: 'Videos', value: 'video' },
    { label: 'Audio', value: 'audio' }
  ];
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <div className="flex justify-between items-center flex-wrap gap-4">
          <h1 className="text-2xl font-bold text-gray-900">Evidence Management</h1>
          <div className="w-full md:w-1/3">
            <div className="relative rounded-md shadow-sm">
              <input
                type="text"
                className="block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                placeholder="Search evidence..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
          </div>
        </div>
        
        <div className="mb-6 grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
          <div className="flex gap-2 overflow-x-auto">
            <Link href="/admin/evidence">
              <Button 
                variant={!validApproved ? 'primary' : 'outline'} 
                size="sm"
              >
                All
              </Button>
            </Link>
            <Link href="/admin/evidence?approved=false">
              <Button 
                variant={validApproved === 'false' ? 'primary' : 'outline'} 
                size="sm"
              >
                Pending
              </Button>
            </Link>
            <Link href="/admin/evidence?approved=true">
              <Button 
                variant={validApproved === 'true' ? 'primary' : 'outline'} 
                size="sm"
              >
                Approved
              </Button>
            </Link>
          </div>
          
          <div>
            <select 
              className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              value={filterFileType || ''}
              onChange={(e) => router.push(`/admin/evidence${e.target.value ? `?fileType=${e.target.value}` : ''}`)}
            >
              {fileTypes.map(type => (
                <option key={type.value} value={type.value}>{type.label}</option>
              ))}
            </select>
          </div>
          
          <div className="flex justify-end">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => fetchEvidence()}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Spinner size="sm" className="mr-2" />
                  Refreshing...
                </>
              ) : (
                '↻ Refresh'
              )}
            </Button>
          </div>
        </div>
        
        {error && (
          <div className="mb-6 rounded-md bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}
        
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <Spinner size="lg" />
          </div>
        ) : filteredEvidence.length === 0 ? (
          <div className="bg-white shadow rounded-lg p-6 text-center">
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
                d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" 
              />
            </svg>
            <p className="text-gray-600">
              {searchTerm ? 'No evidence matches your search criteria.' :
              validApproved === 'false'
                ? 'There are no evidence items pending review.'
                : validApproved === 'true'
                ? 'There are no approved evidence items.'
                : 'There are no evidence items in the system.'}
            </p>
          </div>
        ) : (
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <ul className="divide-y divide-gray-200">
              {filteredEvidence.map(item => (
                <li key={item._id} className="p-4 sm:p-6 hover:bg-gray-50">
                  <div className="md:flex md:justify-between">
                    <div className="md:flex-1">
                      <div className="flex items-start">
                        <div className="flex-shrink-0 text-2xl">
                          {getFileTypeIcon(item.fileType)}
                        </div>
                        <div className="ml-4 flex-1">
                          <div className="text-lg font-medium text-blue-600 truncate">
                            {item.title}
                          </div>
                          
                          <div className="mt-1 text-sm text-gray-700">
                            <span className="font-semibold">Case:</span> {item.caseId.caseNumber} - {item.caseId.title}
                          </div>
                          
                          <div className="mt-1 text-sm text-gray-700">
                            <span className="font-semibold">Status:</span> {
                              item.isApproved === true 
                                ? <span className="ml-1 px-2 py-1 text-xs font-medium rounded-full text-white bg-green-500">Approved</span>
                                : item.isApproved === false && item.approvalDate 
                                  ? <span className="ml-1 px-2 py-1 text-xs font-medium rounded-full text-white bg-red-500">Rejected</span>
                                  : <span className="ml-1 px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800">Pending</span>
                            }
                          </div>
                          
                          <div className="mt-1 text-sm text-gray-700">
                            <span className="font-semibold">Uploaded by:</span> {item.userId.name} ({item.userId.email})
                          </div>
                          
                          <div className="mt-1 text-sm text-gray-500">
                            <span className="font-semibold">Uploaded:</span> {formatDate(item.uploadDate)}
                          </div>
                          
                          {item.description && (
                            <div className="mt-3 text-sm text-gray-700">
                              <span className="font-semibold">Description:</span> {item.description}
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="mt-4 lg:mt-0 lg:ml-6 flex flex-col space-y-2">
                        <div className="flex flex-col space-y-1">
                          <a
                            href={item.fileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center justify-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                          >
                            View File
                          </a>
                          <div className="text-xs text-gray-500 text-center">
                            {formatFileSize(item.fileSize)}
                          </div>
                        </div>
                        
                        <div className="flex space-x-2 mt-2">
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() => handleApproveEvidence(item._id, true)}
                            disabled={processingIds.includes(item._id) || item.isApproved}
                            className={!item.isApproved ? "bg-green-600 hover:bg-green-700" : ""}
                          >
                            {processingIds.includes(item._id) ? (
                              <>
                                <Spinner size="sm" className="mr-1" /> 
                                Processing...
                              </>
                            ) : 'Approve'}
                          </Button>
                          
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleApproveEvidence(item._id, false)}
                            disabled={processingIds.includes(item._id)}
                          >
                            {processingIds.includes(item._id) ? (
                              <>
                                <Spinner size="sm" className="mr-1" /> 
                                Processing...
                              </>
                            ) : 'Reject'}
                          </Button>
                        </div>
                      </div>
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