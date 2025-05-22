'use client';

import React, { useState, useEffect, FormEvent } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormField, FormLabel } from '@/components/ui/form';
import Link from 'next/link';

// Case types for dropdown selection
const CASE_TYPES = [
  { label: 'Civil', value: 'civil' },
  { label: 'Criminal', value: 'criminal' },
  { label: 'Family', value: 'family' },
  { label: 'Other', value: 'other' }
];

export default function CreateCasePage() {
  const { data: session, status: authStatus } = useSession();
  const router = useRouter();
  
  const [formData, setFormData] = useState({
    title: '',
    caseType: '',
    description: '',
    plaintiffs: '',
    defendants: '',
    courtLocation: '',
    filingFee: ''
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  useEffect(() => {
    if (authStatus === 'loading') return;
    
    if (authStatus === 'unauthenticated') {
      router.push('/auth/login');
      return;
    }
  }, [authStatus, router]);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const validateForm = () => {
    const requiredFields = ['title', 'caseType', 'description', 'plaintiffs', 'defendants'];
    const emptyFields = requiredFields.filter(field => !formData[field as keyof typeof formData]);
    
    if (emptyFields.length > 0) {
      setError(`Missing required fields: ${emptyFields.join(', ')}`);
      return false;
    }
    
    // Check if filing fee is a valid number if provided
    if (formData.filingFee && isNaN(Number(formData.filingFee))) {
      setError('Filing fee must be a valid number');
      return false;
    }
    
    return true;
  };
  
  const handleInitialSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');
    
    if (!validateForm()) {
      setIsLoading(false);
      return;
    }
    
    try {
      const response = await fetch('/api/cases', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          filingFee: formData.filingFee ? Number(formData.filingFee) : undefined,
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to create case');
      }
      
      // Case is filed without payment
      setSuccess('Case filed successfully! You will be redirected to the case details page.');
      
      // Redirect to case details page after short delay
      setTimeout(() => {
        router.push(`/user/cases/${data.case._id}`);
      }, 2000);
    } catch (error: any) {
      setError(error.message || 'An error occurred while filing the case');
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        <div className="mb-8">
          <div className="flex space-x-2 mb-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.back()}
            >
              ← Back
            </Button>
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
          
          <h1 className="text-2xl font-bold text-gray-900">File a New Case</h1>
          <p className="mt-1 text-sm text-gray-600">
            Complete the form below to file a new case with the court system.
          </p>
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
        
        <div className="bg-white shadow rounded-lg p-6">
          <Form onSubmit={handleInitialSubmit}>
            <FormField>
              <FormLabel required>Case Title</FormLabel>
              <Input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="Brief title describing the case"
                required
                className="w-full"
              />
            </FormField>
            
            <FormField>
              <FormLabel required>Case Type</FormLabel>
              <select
                name="caseType"
                value={formData.caseType}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select a case type</option>
                {CASE_TYPES.map((type, index) => (
                  <option key={index} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </FormField>
            
            <FormField>
              <FormLabel required>Case Description</FormLabel>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Detailed description of the case"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                rows={4}
              />
            </FormField>
            
            <div className="mt-6 mb-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center">
                <span className="mr-2 text-red-500">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
                </span>
                Required Case Parties
              </h3>
              <p className="text-sm text-red-600 ml-8 font-medium mb-3">
                Both plaintiffs and defendants are mandatory fields and cannot be left empty
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 border-2 border-red-200 rounded-md bg-red-50 mb-4">
              <FormField>
                <FormLabel required className="font-bold text-red-700 flex items-center">
                  <span className="mr-1">*</span> Plaintiff(s)
                </FormLabel>
                <Input
                  type="text"
                  name="plaintiffs"
                  value={formData.plaintiffs}
                  onChange={handleChange}
                  placeholder="Name(s) of plaintiff(s)"
                  required
                  className="w-full border-red-300 focus:border-red-500 shadow-sm"
                />
                <p className="mt-1 text-xs text-gray-700">The party filing the case. For multiple plaintiffs, separate names with commas.</p>
              </FormField>
              
              <FormField>
                <FormLabel required className="font-bold text-red-700 flex items-center">
                  <span className="mr-1">*</span> Defendant(s)
                </FormLabel>
                <Input
                  type="text"
                  name="defendants"
                  value={formData.defendants}
                  onChange={handleChange}
                  placeholder="Name(s) of defendant(s)"
                  required
                  className="w-full border-red-300 focus:border-red-500 shadow-sm"
                />
                <p className="mt-1 text-xs text-gray-700">The party being sued or charged. For multiple defendants, separate names with commas.</p>
              </FormField>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField>
                <FormLabel>Court Location</FormLabel>
                <Input
                  type="text"
                  name="courtLocation"
                  value={formData.courtLocation}
                  onChange={handleChange}
                  placeholder="Preferred court location (if any)"
                  className="w-full"
                />
              </FormField>
              
              <FormField>
                <FormLabel required>Filing Fee (₹)</FormLabel>
                <Input
                  type="number"
                  name="filingFee"
                  value={formData.filingFee}
                  onChange={handleChange}
                  placeholder="0"
                  min="0"
                  step="1"
                  required
                  className="w-full"
                />
                <p className="mt-1 text-sm text-gray-500">Filing fee required for uploading evidence. You can submit the case for free, but payment will be required before uploading documents.</p>
              </FormField>
            </div>
            
            <div className="mt-6 bg-blue-50 p-4 rounded-md border border-blue-200">
              <h4 className="text-blue-800 font-medium">Free Case Submission</h4>
              <p className="text-sm text-blue-600 mt-1">
                You can submit your case without any payment. However, to upload evidence documents later, you'll need to pay the filing fee specified above.
              </p>
            </div>
            
            <div className="mt-6">
              <Button
                type="submit"
                variant="primary"
                isLoading={isLoading}
                className="w-full"
              >
                Submit Case
              </Button>
            </div>
            
            <div className="mt-4 text-sm text-gray-500">
              <p>
                <strong>Note:</strong> Once submitted, your case will be reviewed by court officials.
                You will receive a confirmation with your assigned case number. To upload evidence documents,
                you will need to complete the payment process afterward.
              </p>
            </div>
          </Form>
        </div>
      </div>
    </div>
  );
} 