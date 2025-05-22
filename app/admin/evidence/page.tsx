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
  const filterApproved = searchParams.get('approved');
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
  }, [authStatus, session, filterApproved, filterCaseId, filterFileType]);
  
  const fetchEvidence = async () => {
    setIsLoading(true);
    try {
      let url = '/api/evidence';
      const params = new URLSearchParams();
      
      // If filtering by approval status
      if (filterApproved === 'true' || filterApproved === 'false') {
        params.append('isApproved', filterApproved);
      }
      
      // If filtering by case
      if (filterCaseId) {
        params.append('caseId', filterCaseId);
      }
      
      // If filtering by file type
      if (filterFileType) {
        params.append('fileType', filterFileType);
      }
      
      if (params.toString()) {
        url += `?${params.toString()}`;
      }
      
      const response = await fetch(url);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch evidence');
      }
      
      setEvidence(data.evidence);
    } catch (error: any) {
      setError(error.message || 'An error occurred while fetching evidence');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleApproveEvidence = async (id: string, isApproved: boolean) => {
    try {
      setProcessingIds(prev => [...prev, id]);
      const response = await fetch(`/api/evidence/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isApproved }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to update evidence');
      }
      
      // Update the local state
      setEvidence(prevEvidence => 
        prevEvidence.map(item => 
          item._id === id ? { ...item, isApproved } : item
        )
      );
    } catch (error: any) {
      setError(error.message || 'An error occurred while updating evidence');
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
    item.caseId.caseNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.caseId.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.userId.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.userId.email.toLowerCase().includes(searchTerm.toLowerCase())
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
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Evidence Management</h1>
            <p className="mt-1 text-sm text-gray-600">
              Review, approve, and manage evidence submitted for cases
            </p>
          </div>
          <div className="mt-4 sm:mt-0">
            <input
              type="text"
              placeholder="Search evidence..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
        
        <div className="mb-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="flex gap-2 overflow-x-auto">
            <Link href="/admin/evidence">
              <Button 
                variant={!filterApproved ? 'primary' : 'outline'} 
                size="sm"
              >
                All
              </Button>
            </Link>
            <Link href="/admin/evidence?approved=false">
              <Button 
                variant={filterApproved === 'false' ? 'primary' : 'outline'} 
                size="sm"
              >
                Pending
              </Button>
            </Link>
            <Link href="/admin/evidence?approved=true">
              <Button 
                variant={filterApproved === 'true' ? 'primary' : 'outline'} 
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
        </div>
        
        {error && (
          <div className="mb-6 rounded-md bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}
        
        {isLoading ? (
          <div className="text-center py-12">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" />
            <p className="mt-4 text-gray-600">Loading evidence...</p>
          </div>
        ) : filteredEvidence.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <h3 className="text-lg font-medium text-gray-900 mb-2">No evidence found</h3>
            <p className="text-gray-600">
              {searchTerm ? 'No evidence matches your search criteria.' :
               filterApproved === 'false'
                ? 'There are no evidence items pending review.'
                : filterApproved === 'true'
                ? 'There are no approved evidence items.'
                : 'There are no evidence items in the system.'}
            </p>
          </div>
        ) : (
          <div className="bg-white shadow rounded-lg">
            <ul className="divide-y divide-gray-200">
              {filteredEvidence.map((item) => (
                <li key={item._id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex flex-col lg:flex-row lg:items-center">
                    <div className="flex-1">
                      <div className="flex items-start">
                        <div className="text-2xl mr-3">
                          {getFileTypeIcon(item.fileType)}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center">
                            <h3 className="text-lg font-medium text-gray-900 mr-2">{item.title}</h3>
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                              item.isApproved 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-yellow-100 text-yellow-800'
                            }`}>
                              {item.isApproved ? 'Approved' : 'Pending'}
                            </span>
                          </div>
                          
                          <div className="mt-1 text-sm text-gray-700">
                            <span className="font-semibold">Case:</span> {item.caseId ? (
                              <Link href={`/admin/cases/${item.caseId._id}`} className="text-blue-600 hover:underline">
                                {item.caseId.caseNumber} - {item.caseId.title}
                              </Link>
                            ) : "Unknown Case"}
                          </div>
                          
                          <div className="mt-1 text-sm text-gray-700">
                            <span className="font-semibold">Uploaded by:</span> {item.userId ? `${item.userId.name} (${item.userId.email})` : "Unknown User"}
                          </div>
                          
                          <div className="mt-1 text-sm text-gray-700">
                            <span className="font-semibold">Uploaded on:</span> {formatDate(item.uploadDate)}
                          </div>
                          
                          <div className="mt-1 text-sm text-gray-700">
                            <span className="font-semibold">File details:</span> {getFileTypeIcon(item.fileType)} {item.fileType} • {formatFileSize(item.fileSize)}
                          </div>
                          
                          {item.description && (
                            <div className="mt-3 text-sm text-gray-700">
                              <div className="font-semibold">Description:</div>
                              <p className="mt-1">{item.description}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-4 lg:mt-0 flex flex-col gap-2">
                      <div className="flex gap-2">
                        <a
                          href={item.fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                        >
                          🔍 View
                        </a>
                        <a
                          href={item.fileUrl}
                          download
                          className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                        >
                          ⬇️ Download
                        </a>
                      </div>
                      
                      {!item.isApproved && (
                        <button
                          onClick={() => handleApproveEvidence(item._id, true)}
                          disabled={processingIds.includes(item._id)}
                          className="inline-flex items-center justify-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
                        >
                          {processingIds.includes(item._id) ? (
                            <>
                              <Spinner size="sm" className="mr-2" />
                              Processing...
                            </>
                          ) : (
                            '✓ Approve Evidence'
                          )}
                        </button>
                      )}
                      
                      {item.isApproved && (
                        <button
                              onClick={() => handleApproveEvidence(item._id, false)}
                          disabled={processingIds.includes(item._id)}
                          className="inline-flex items-center justify-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                        >
                          {processingIds.includes(item._id) ? (
                            <>
                              <Spinner size="sm" className="mr-2" />
                              Processing...
                            </>
                          ) : (
                            '✕ Revoke Approval'
                          )}
                        </button>
                      )}
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