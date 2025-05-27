'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

type Evidence = {
  _id: string;
  title: string;
  description?: string;
  fileUrl: string;
  fileType: string;
  fileSize: number;
  uploadDate: string;
  isApproved: boolean;
  evidenceType?: string;
};

type CaseDetails = {
  title: string;
  caseNumber: string;
  paymentStatus?: string;
};

export default function CaseEvidencePage({ params }: { params: Promise<{ id: string }> }) {
  const { data: session, status: authStatus } = useSession();
  const router = useRouter();
  const { id: caseId } = React.use(params);
  
  const [evidence, setEvidence] = useState<Evidence[]>([]);
  const [caseDetails, setCaseDetails] = useState<CaseDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  
  useEffect(() => {
    if (authStatus === 'loading') return;
    
    if (authStatus === 'unauthenticated') {
      router.push('/auth/login');
      return;
    }
    
    fetchCaseDetails();
    fetchEvidence();
  }, [authStatus, caseId]);
  
  const fetchCaseDetails = async () => {
    try {
      const response = await fetch(`/api/cases/${caseId}`);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch case details');
      }
      
      if (session?.user?.role !== 'admin' && 
          data.case.userId._id.toString() !== session?.user?.id.toString()) {
        router.push('/unauthorized');
        return;
      }
      
      setCaseDetails({
        title: data.case.title,
        caseNumber: data.case.caseNumber,
        paymentStatus: data.case.paymentStatus
      });
    } catch (error: any) {
      setError(error.message || 'An error occurred while fetching case details');
    }
  };
  
  const fetchEvidence = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/evidence?caseId=${caseId}`);
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
  
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };
  
  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' bytes';
    else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    else return (bytes / 1048576).toFixed(1) + ' MB';
  };
  
  const getFileTypeIcon = (fileType: string) => {
    if (fileType.startsWith('image/')) {
      return (
        <svg className="w-10 h-10 text-blue-500" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
          <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
        </svg>
      );
    } else if (fileType === 'application/pdf') {
      return (
        <svg className="w-10 h-10 text-red-500" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
          <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
          <path d="M8 11h4m-4 3h4m-6-6h.01" />
        </svg>
      );
    } else if (fileType.includes('word') || fileType.includes('document')) {
      return (
        <svg className="w-10 h-10 text-blue-700" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
          <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 3a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm0 3a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm0 3a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1z" clipRule="evenodd" />
        </svg>
      );
    } else if (fileType.startsWith('video/')) {
      return (
        <svg className="w-10 h-10 text-purple-600" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
          <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" />
          <path d="M14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
        </svg>
      );
    } else if (fileType.startsWith('audio/')) {
      return (
        <svg className="w-10 h-10 text-green-600" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
          <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217z" clipRule="evenodd" />
          <path d="M12.293 7.293a1 1 0 011.414 0L15 8.586l1.293-1.293a1 1 0 111.414 1.414L16.414 10l1.293 1.293a1 1 0 01-1.414 1.414L15 11.414l-1.293 1.293a1 1 0 01-1.414-1.414L13.586 10l-1.293-1.293a1 1 0 010-1.414z" />
        </svg>
      );
    } else if (fileType.includes('spreadsheet') || fileType.includes('excel')) {
      return (
        <svg className="w-10 h-10 text-green-700" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
          <path fillRule="evenodd" d="M5 4a3 3 0 00-3 3v6a3 3 0 003 3h10a3 3 0 003-3V7a3 3 0 00-3-3H5zm-1 9v-1h5v2H5a1 1 0 01-1-1zm7 1h4a1 1 0 001-1v-1h-5v2zm0-4h5V8h-5v2zM9 8H4v2h5V8z" clipRule="evenodd" />
        </svg>
      );
    } else {
      return (
        <svg className="w-10 h-10 text-gray-500" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
          <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
        </svg>
      );
    }
  };
  
  const getEvidenceTypeLabel = (type: string | undefined) => {
    switch (type) {
      case 'document':
        return 'Document';
      case 'image':
        return 'Image/Photo';
      case 'video':
        return 'Video';
      case 'audio':
        return 'Audio Recording';
      case 'financial':
        return 'Financial Record';
      case 'medical':
        return 'Medical Record';
      case 'correspondence':
        return 'Correspondence/Email';
      case 'receipt':
        return 'Receipt/Invoice';
      case 'contract':
        return 'Contract/Agreement';
      case 'other':
        return 'Other';
      default:
        return 'Document';
    }
  };
  
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex space-x-2 mb-2">
              <Link href={`/user/cases/${caseId}`}>
                <Button
                  variant="outline"
                  size="sm"
                >
                  ← Back to case
                </Button>
              </Link>
              <Link href="/">
                <Button
                  variant="outline"
                  size="sm"
                >
                  Home
                </Button>
              </Link>
              <Link href="/user/dashboard">
                <Button
                  variant="outline"
                  size="sm"
                >
                  Dashboard
                </Button>
              </Link>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">
              Evidence for Case {caseDetails?.caseNumber}
            </h1>
            <p className="mt-1 text-gray-600">{caseDetails?.title}</p>
          </div>
          <div className="mt-4 sm:mt-0">
            {(caseDetails?.paymentStatus === 'paid' || session?.user?.role === 'admin') ? (
              <Link href={`/user/cases/${caseId}/upload-evidence`}>
                <Button variant="primary">
                  Upload New Evidence
                </Button>
              </Link>
            ) : (
              <div>
                <Button 
                  variant="primary" 
                  disabled 
                  title="Complete payment first"
                  className="opacity-50 cursor-not-allowed"
                >
                  Upload New Evidence
                </Button>
                <p className="mt-2 text-xs text-red-600">Payment required before uploading</p>
              </div>
            )}
          </div>
        </div>
        
        {error && (
          <div className="mb-6 rounded-md bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}
        
        {!error && caseDetails?.paymentStatus !== 'paid' && session?.user?.role !== 'admin' && (
          <div className="mb-6 rounded-md bg-yellow-50 p-4 text-sm text-yellow-700">
            <p className="font-medium">Payment Required</p>
            <p className="mt-1">You must complete payment for this case before you can upload evidence.</p>
            <div className="mt-2">
              <Link href={`/user/cases/${caseId}`}>
                <Button variant="outline" size="sm" className="mr-2">
                  Go to Case Details
                </Button>
              </Link>
              <Link href={`/user/cases/${caseId}/payment`}>
                <Button variant="primary" size="sm">
                  Complete Payment
                </Button>
              </Link>
            </div>
          </div>
        )}
        
        {isLoading ? (
          <div className="text-center py-12">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" />
            <p className="mt-4 text-gray-600">Loading evidence...</p>
          </div>
        ) : evidence.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <h3 className="text-lg font-medium text-gray-900 mb-2">No evidence uploaded</h3>
            <p className="text-gray-600 mb-6">
              You haven't uploaded any evidence for this case yet.
            </p>
            <Link href={`/user/cases/${caseId}/upload-evidence`}>
              <Button variant="primary">Upload Evidence</Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {evidence.map((item) => (
              <div key={item._id} className="bg-white rounded-lg shadow overflow-hidden">
                <div className="p-6">
                  <div className="flex items-start">
                    <div className="flex-shrink-0">
                      {getFileTypeIcon(item.fileType)}
                    </div>
                    <div className="ml-4 flex-1">
                      <h3 className="text-lg font-medium text-gray-900">{item.title}</h3>
                      <div className="flex items-center mt-1">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {getEvidenceTypeLabel(item.evidenceType)}
                        </span>
                      </div>
                      <p className="mt-1 text-sm text-gray-500">
                        Uploaded on {formatDate(item.uploadDate)}
                      </p>
                      {item.description && (
                        <p className="mt-2 text-sm text-gray-700">{item.description}</p>
                      )}
                      <div className="mt-3 flex items-center text-sm text-gray-500">
                        <span className="truncate">{formatFileSize(item.fileSize)}</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gray-50 px-6 py-4">
                  <div className="flex justify-between items-center">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      item.isApproved
                        ? 'bg-green-100 text-green-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {item.isApproved ? 'Approved' : 'Pending Review'}
                    </span>
                    <a
                      href={item.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-500"
                    >
                      View File
                      <svg className="ml-1 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z" />
                        <path d="M5 5a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-3a1 1 0 10-2 0v3H5V7h3a1 1 0 000-2H5z" />
                      </svg>
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 