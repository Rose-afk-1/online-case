'use client';

import React, { useState, useEffect, FormEvent } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormField, FormLabel } from '@/components/ui/form';
import Link from 'next/link';

type CaseDetails = {
  _id: string;
  caseNumber: string;
  title: string;
  status: string;
  paymentStatus?: string;
};

export default function UploadEvidencePage({ params }: { params: Promise<{ id: string }> | { id: string } }) {
  const { data: session, status: authStatus } = useSession();
  const router = useRouter();
  const caseId = 'then' in params ? React.use(params).id : params.id;
  
  const [caseDetails, setCaseDetails] = useState<CaseDetails | null>(null);
  const [evidenceType, setEvidenceType] = useState('');
  const [description, setDescription] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isInitLoading, setIsInitLoading] = useState(true);
  const [success, setSuccess] = useState('');
  
  // Evidence type options
  const evidenceTypeOptions = [
    { value: 'document', label: 'Document' },
    { value: 'image', label: 'Image/Photograph' },
    { value: 'video', label: 'Video' },
    { value: 'audio', label: 'Audio Recording' },
    { value: 'financial', label: 'Financial Record' },
    { value: 'medical', label: 'Medical Record' },
    { value: 'correspondence', label: 'Correspondence/Email' },
    { value: 'receipt', label: 'Receipt/Invoice' },
    { value: 'contract', label: 'Contract/Agreement' },
    { value: 'other', label: 'Other' }
  ];
  
  useEffect(() => {
    if (authStatus === 'loading') return;
    
    if (authStatus === 'unauthenticated') {
      router.push('/auth/login');
      return;
    }
    
    fetchCaseDetails();
  }, [authStatus, caseId]);
  
  const fetchCaseDetails = async () => {
    try {
      const response = await fetch(`/api/cases/${caseId}`);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch case details');
      }
      
      // Check if the current user is authorized to access this case
      if (session?.user?.role !== 'admin' && 
          data.case.userId._id.toString() !== session?.user?.id.toString()) {
        router.push('/unauthorized');
        return;
      }
      
      setCaseDetails(data.case);
    } catch (error: any) {
      setError(error.message || 'An error occurred while fetching case details');
    } finally {
      setIsInitLoading(false);
    }
  };
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };
  
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');
    
    try {
      if (!file) {
        throw new Error('Please select a file to upload');
      }
      
      if (!evidenceType) {
        throw new Error('Please select an evidence type');
      }
      
      // Maximum file size (50MB)
      const maxSize = 50 * 1024 * 1024;
      if (file.size > maxSize) {
        throw new Error('File size exceeds 50MB limit');
      }
      
      // Create FormData and append all data
      const formData = new FormData();
      formData.append('file', file);
      formData.append('title', evidenceType); // We'll use the evidence type as the title
      formData.append('description', description);
      formData.append('caseId', caseId);
      formData.append('evidenceType', evidenceType); // Add the evidence type explicitly
      
      const response = await fetch('/api/evidence', {
        method: 'POST',
        body: formData,
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to upload evidence');
      }
      
      setSuccess('Evidence uploaded successfully! It will be reviewed by court officials.');
      
      // Reset form
      setEvidenceType('');
      setDescription('');
      setFile(null);
      
      // Redirect to evidence list after a short delay
      setTimeout(() => {
        router.push(`/user/cases/${caseId}/evidence`);
      }, 2000);
    } catch (error: any) {
      setError(error.message || 'An error occurred while uploading evidence');
    } finally {
      setIsLoading(false);
    }
  };
  
  if (isInitLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" />
        <p className="ml-2">Loading...</p>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        <div className="mb-8">
          <div className="flex space-x-2 mb-4">
            <Link href={`/user/cases/${caseId}`}>
              <Button
                variant="outline"
                size="sm"
              >
                ← Back to Case
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
          
          <h1 className="text-2xl font-bold text-gray-900">Upload Evidence</h1>
          {caseDetails && (
            <p className="mt-1 text-sm text-gray-600">
              Case #{caseDetails.caseNumber}: {caseDetails.title}
            </p>
          )}
        </div>
        
        {error && (
          <div className="mb-6 rounded-md bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}
        
        {success && (
          <div className="mb-6 rounded-md bg-green-50 p-4 text-sm text-green-700">
            {success}
          </div>
        )}
        
        {caseDetails && caseDetails.paymentStatus !== 'paid' && session?.user?.role !== 'admin' ? (
          <div className="bg-white shadow rounded-lg p-6">
            <div className="text-center py-6">
              <svg 
                className="mx-auto h-16 w-16 text-red-500" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <h3 className="mt-4 text-lg font-medium text-gray-900">Payment Required</h3>
              <p className="mt-2 text-sm text-gray-500 max-w-md mx-auto">
                Payment must be completed before you can upload evidence. Please complete the payment process for this case.
              </p>
              <div className="mt-6">
                <Link href={`/user/cases/${caseId}`}>
                  <Button variant="primary">
                    Return to Case Details
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white shadow rounded-lg p-6">
            <Form onSubmit={handleSubmit}>
              <FormField>
                <FormLabel required>Evidence Type</FormLabel>
                <select
                  value={evidenceType}
                  onChange={(e) => setEvidenceType(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  <option value="" disabled>Select evidence type</option>
                  {evidenceTypeOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </FormField>
              
              <FormField>
                <FormLabel>Description (Optional)</FormLabel>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Additional details about this evidence"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  rows={4}
                />
              </FormField>
              
              <FormField>
                <FormLabel required>Evidence File</FormLabel>
                <div className="mt-1 flex items-center">
                  <label className="w-full flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md cursor-pointer hover:border-gray-400">
                    <div className="space-y-1 text-center">
                      <svg
                        className="mx-auto h-12 w-12 text-gray-400"
                        stroke="currentColor"
                        fill="none"
                        viewBox="0 0 48 48"
                        aria-hidden="true"
                      >
                        <path
                          d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                          strokeWidth={2}
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                      <div className="flex text-sm text-gray-600">
                        <span className="relative bg-white rounded-md font-medium text-blue-600 hover:text-blue-500">
                          Upload a file
                        </span>
                        <p className="pl-1">or drag and drop</p>
                      </div>
                      <p className="text-xs text-gray-500">
                        Documents, Images, Videos, Audio up to 50MB
                      </p>
                    </div>
                    <input
                      id="file-upload"
                      name="file-upload"
                      type="file"
                      className="sr-only"
                      onChange={handleFileChange}
                      accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.gif,.mp4,.mov,.mp3,.wav,.txt,.rtf,.xls,.xlsx,.ppt,.pptx"
                    />
                  </label>
                </div>
                {file && (
                  <div className="mt-2 text-sm text-gray-700 flex items-center">
                    <span className="font-medium">Selected file:</span>
                    <span className="ml-2">{file.name}</span>
                    <span className="ml-2 text-gray-500">
                      ({(file.size / 1024 / 1024).toFixed(2)} MB)
                    </span>
                  </div>
                )}
              </FormField>
              
              <div className="mt-6">
                <Button
                  type="submit"
                  variant="primary"
                  disabled={isLoading}
                  className="w-full"
                >
                  {isLoading ? 'Uploading...' : 'Upload Evidence'}
                </Button>
              </div>
              
              <div className="mt-4 text-sm text-gray-500">
                <p>
                  <strong>Note:</strong> All evidence will be reviewed by court
                  officials before being accepted into the case file. You will be
                  notified once your evidence has been reviewed.
                </p>
              </div>
            </Form>
          </div>
        )}
      </div>
    </div>
  );
} 