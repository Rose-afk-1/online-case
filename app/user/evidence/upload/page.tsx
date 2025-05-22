'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Form, FormField, FormLabel } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { FileUpload } from '@/components/ui/file-upload';

type CaseOption = {
  _id: string;
  caseNumber: string;
  title: string;
};

export default function UploadEvidencePage() {
  const { data: session, status: authStatus } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const caseIdFromUrl = searchParams.get('caseId');
  
  const [userCases, setUserCases] = useState<CaseOption[]>([]);
  const [formData, setFormData] = useState({
    evidenceType: '',
    description: '',
    caseId: caseIdFromUrl || '',
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingCases, setIsFetchingCases] = useState(true);
  const [error, setError] = useState('');
  
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
    
    // Fetch user's cases for the dropdown
    fetchUserCases();
  }, [authStatus]);
  
  const fetchUserCases = async () => {
    setIsFetchingCases(true);
    try {
      const response = await fetch('/api/cases');
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch your cases');
      }
      
      setUserCases(data.cases.map((caseItem: any) => ({
        _id: caseItem._id,
        caseNumber: caseItem.caseNumber,
        title: caseItem.title,
      })));
      
      // If case ID from URL but not in form data, set it
      if (caseIdFromUrl && !formData.caseId) {
        setFormData(prev => ({ ...prev, caseId: caseIdFromUrl }));
      }
    } catch (error: any) {
      setError(error.message || 'An error occurred while fetching your cases');
    } finally {
      setIsFetchingCases(false);
    }
  };
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleFileChange = (file: File | null) => {
    setSelectedFile(file);
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedFile) {
      setError('Please select a file to upload');
      return;
    }
    
    if (!formData.caseId) {
      setError('Please select a case');
      return;
    }
    
    if (!formData.evidenceType) {
      setError('Please select an evidence type');
      return;
    }
    
    setError('');
    setIsLoading(true);
    
    try {
      // Create form data for file upload
      const formDataToSend = new FormData();
      formDataToSend.append('title', formData.evidenceType);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('caseId', formData.caseId);
      formDataToSend.append('file', selectedFile);
      formDataToSend.append('evidenceType', formData.evidenceType);
      
      const response = await fetch('/api/evidence', {
        method: 'POST',
        body: formDataToSend,
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to upload evidence');
      }
      
      // Redirect to evidence detail page or case page
      router.push(`/user/cases/${formData.caseId}`);
      router.refresh();
    } catch (error: any) {
      setError(error.message || 'An error occurred while uploading the evidence');
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Upload Evidence</h1>
          <Link href={caseIdFromUrl ? `/user/cases/${caseIdFromUrl}` : '/user/dashboard'}>
            <Button variant="outline" size="sm">
              {caseIdFromUrl ? 'Back to Case' : 'Back to Dashboard'}
            </Button>
          </Link>
        </div>
        
        <div className="bg-white shadow rounded-lg p-6">
          {error && (
            <div className="mb-6 rounded-md bg-red-50 p-4 text-sm text-red-700">
              {error}
            </div>
          )}
          
          <Form onSubmit={handleSubmit}>
            <FormField>
              <FormLabel htmlFor="caseId" required>
                Case
              </FormLabel>
              {isFetchingCases ? (
                <div className="animate-pulse h-10 w-full bg-gray-200 rounded-md"></div>
              ) : (
                <select
                  id="caseId"
                  name="caseId"
                  value={formData.caseId}
                  onChange={handleChange}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  required
                  disabled={!!caseIdFromUrl}
                >
                  <option value="">Select a case</option>
                  {userCases.map(caseOption => (
                    <option key={caseOption._id} value={caseOption._id}>
                      {caseOption.caseNumber} - {caseOption.title}
                    </option>
                  ))}
                </select>
              )}
            </FormField>
            
            <FormField>
              <FormLabel htmlFor="evidenceType" required>
                Evidence Type
              </FormLabel>
              <select
                id="evidenceType"
                name="evidenceType"
                value={formData.evidenceType}
                onChange={handleChange}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                required
              >
                <option value="">Select evidence type</option>
                {evidenceTypeOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </FormField>
            
            <FormField>
              <FormLabel htmlFor="description">
                Description
              </FormLabel>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Describe the evidence you are uploading"
                className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                rows={3}
              />
            </FormField>
            
            <FormField>
              <FileUpload
                label="Evidence File"
                description="Upload PDF, images, or documents (max 5MB)"
                acceptedFileTypes="application/pdf,image/*,.doc,.docx,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                maxSizeMB={5}
                onFileChange={handleFileChange}
                required
              />
            </FormField>
            
            <div className="mt-8 flex flex-col space-y-4 sm:flex-row sm:space-y-0 sm:space-x-4">
              <Button
                type="submit"
                variant="primary"
                className="flex-1"
                disabled={isLoading || !selectedFile}
              >
                {isLoading ? (
                  <>
                    <span className="mr-2 inline-block h-4 w-4 animate-spin rounded-full border-2 border-solid border-current border-r-transparent align-[-0.125em]"></span>
                    Uploading...
                  </>
                ) : (
                  'Upload Evidence'
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={() => router.back()}
                disabled={isLoading}
              >
                Cancel
              </Button>
            </div>
          </Form>
        </div>
        
        <div className="mt-8 bg-blue-50 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-blue-800 mb-2">About Evidence Submission</h2>
          <ul className="list-disc pl-5 space-y-2 text-blue-700">
            <li>All uploaded evidence must be related to your case</li>
            <li>Supported file types: PDF, images, and document files</li>
            <li>Maximum file size: 5MB</li>
            <li>Evidence will be reviewed by court officials</li>
            <li>You may be asked to provide original documents</li>
          </ul>
        </div>
      </div>
    </div>
  );
} 