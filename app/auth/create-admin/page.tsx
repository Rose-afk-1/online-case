'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormField, FormLabel } from '@/components/ui/form';

export default function CreateAdminPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    securityCode: '',
    idPhoto: null as File | null
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFormData(prev => ({
        ...prev,
        idPhoto: e.target.files?.[0] || null
      }));
    }
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setIsLoading(true);
      setError('');
      setSuccess('');
      
      // Basic validation
      if (!formData.name || !formData.email || !formData.password || !formData.confirmPassword || !formData.securityCode) {
        setError('All fields are required');
        setIsLoading(false);
        return;
      }
      
      if (formData.password !== formData.confirmPassword) {
        setError('Passwords do not match');
        setIsLoading(false);
        return;
      }
      
      if (formData.password.length < 6) {
        setError('Password must be at least 6 characters long');
        setIsLoading(false);
        return;
      }
      
      if (!formData.idPhoto) {
        setError('ID photo is required for verification');
        setIsLoading(false);
        return;
      }
      
      // Create FormData for file upload
      const formDataToSend = new FormData();
      formDataToSend.append('name', formData.name);
      formDataToSend.append('email', formData.email);
      formDataToSend.append('password', formData.password);
      formDataToSend.append('securityCode', formData.securityCode);
      formDataToSend.append('idPhoto', formData.idPhoto);
      
      // Call the create-admin API
      const response = await fetch('/api/auth/create-admin', {
        method: 'POST',
        body: formDataToSend,
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to create admin account');
      }
      
      setSuccess('Admin account created successfully! You can now log in.');
      setFormData({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        securityCode: '',
        idPhoto: null
      });
      
      // Redirect to login page after 2 seconds
      setTimeout(() => {
        router.push('/auth/login');
      }, 2000);
      
    } catch (error: any) {
      console.error('Admin creation error:', error);
      setError(error.message || 'Failed to create admin account. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-md mx-auto px-4 sm:px-6">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Create Admin Account</h1>
          <p className="mt-2 text-gray-600">Create a new administrator account with verification</p>
        </div>
        
        <div className="bg-white shadow rounded-lg p-6">
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
          
          <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 mb-6">
            <h3 className="text-sm font-medium text-yellow-800">Important Security Notice</h3>
            <p className="text-sm text-yellow-700 mt-1">
              Creating an admin account requires verification. You must provide:
            </p>
            <ul className="list-disc ml-5 mt-1 text-sm text-yellow-700">
              <li>A valid security code provided by the system administrator</li>
              <li>A photo of your government-issued ID for verification</li>
            </ul>
          </div>
          
          <Form onSubmit={handleSubmit}>
            <FormField>
              <FormLabel required>Full Name</FormLabel>
              <Input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter administrator name"
                required
                className="w-full"
              />
            </FormField>
            
            <FormField>
              <FormLabel required>Email Address</FormLabel>
              <Input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter administrator email"
                required
                className="w-full"
              />
            </FormField>
            
            <FormField>
              <FormLabel required>Password</FormLabel>
              <Input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Create a strong password"
                required
                className="w-full"
              />
              <p className="mt-1 text-xs text-gray-500">
                Password must be at least 6 characters long
              </p>
            </FormField>
            
            <FormField>
              <FormLabel required>Confirm Password</FormLabel>
              <Input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Confirm your password"
                required
                className="w-full"
              />
            </FormField>
            
            <div className="border-t border-gray-200 mt-6 pt-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Verification</h3>
              
              <FormField>
                <FormLabel required>Security Code</FormLabel>
                <Input
                  type="text"
                  name="securityCode"
                  value={formData.securityCode}
                  onChange={handleChange}
                  placeholder="Enter security code"
                  required
                  className="w-full"
                />
                <p className="mt-1 text-xs text-gray-500">
                  Enter the security code provided by the system administrator
                </p>
              </FormField>
              
              <FormField>
                <FormLabel required>ID Verification</FormLabel>
                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
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
                      <label
                        htmlFor="file-upload"
                        className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500"
                      >
                        <span>Upload a file</span>
                        <input
                          id="file-upload"
                          name="idPhoto"
                          type="file"
                          className="sr-only"
                          accept="image/*"
                          onChange={handleFileChange}
                          required
                        />
                      </label>
                      <p className="pl-1">or drag and drop</p>
                    </div>
                    <p className="text-xs text-gray-500">
                      PNG, JPG, GIF up to 10MB
                    </p>
                  </div>
                </div>
                {formData.idPhoto && (
                  <p className="mt-2 text-sm text-green-600">
                    File selected: {formData.idPhoto.name}
                  </p>
                )}
              </FormField>
            </div>
            
            <div className="mt-6">
              <Button
                type="submit"
                variant="primary"
                disabled={isLoading}
                className="w-full"
              >
                {isLoading ? 'Creating Account...' : 'Create Admin Account'}
              </Button>
            </div>
          </Form>
          
          <div className="mt-6 text-center">
            <Link href="/auth/login" className="text-sm text-blue-600 hover:underline">
              Back to Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
} 