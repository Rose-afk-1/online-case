'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

// Case types for dropdown selection
const CASE_TYPES = [
  { label: 'Civil', value: 'civil' },
  { label: 'Criminal', value: 'criminal' },
  { label: 'Family', value: 'family' },
  { label: 'Other', value: 'other' }
];

interface CaseFormProps {
  onSubmit: (formData: any) => Promise<void>;
}

export default function CaseForm({ onSubmit }: CaseFormProps) {
  const router = useRouter();
  
  const [formData, setFormData] = useState({
    caseType: '',
    title: '',
    description: '',
    plaintiffs: '',
    defendants: '',
    courtLocation: '',
    filingFee: '0'
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    try {
      await onSubmit(formData);
    } catch (error: any) {
      setError(error.message || 'An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="case-filing-form">
      <div className="mb-8">
        <div className="flex space-x-2 mb-4">
          <button
            onClick={() => router.back()}
            className="bg-gray-100 text-gray-700 px-4 py-2 rounded hover:bg-gray-200"
          >
            ← Back
          </button>
          <Link href="/user/dashboard">
            <button className="bg-gray-100 text-gray-700 px-4 py-2 rounded hover:bg-gray-200">
              Dashboard
            </button>
          </Link>
        </div>
        
        <h1 className="text-2xl font-bold text-gray-900">File a New Case</h1>
        <p className="mt-1 text-sm text-gray-600">
          Complete the form below to file a new case with the court system.
        </p>
      </div>
      
      {error && (
        <div className="mb-6 rounded-md bg-red-50 p-4 text-sm text-red-700 border border-red-300">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Case Type field moved above Case Title */}
        <div className="space-y-2">
          <label htmlFor="caseType" className="block text-sm font-medium">
            Case Type <span className="text-red-500">*</span>
          </label>
          <select
            id="caseType"
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
        </div>
        
        <div className="space-y-2">
          <label htmlFor="title" className="block text-sm font-medium">
            Case Title <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
            placeholder="Brief title describing the case"
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        
        <div className="space-y-2">
          <label htmlFor="description" className="block text-sm font-medium">
            Case Description <span className="text-red-500">*</span>
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            required
            rows={4}
            placeholder="Detailed description of the case"
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        
        <div className="mt-6 mb-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center">
            <span className="mr-2 text-red-500">⚠</span>
            Required Case Parties
          </h3>
          <p className="text-sm text-red-600 font-medium mb-3">
            Both plaintiffs and defendants are mandatory fields and cannot be left empty
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 border-2 border-red-200 rounded-md bg-red-50 mb-4">
          <div className="space-y-2">
            <label htmlFor="plaintiffs" className="block text-sm font-medium text-red-700">
              * Plaintiff(s) <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="plaintiffs"
              name="plaintiffs"
              value={formData.plaintiffs}
              onChange={handleChange}
              required
              placeholder="Name(s) of plaintiff(s)"
              className="w-full px-3 py-2 border border-red-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500"
            />
            <p className="mt-1 text-xs text-gray-700">
              The party filing the case. For multiple plaintiffs, separate names with commas.
            </p>
          </div>
          
          <div className="space-y-2">
            <label htmlFor="defendants" className="block text-sm font-medium text-red-700">
              * Defendant(s) <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="defendants"
              name="defendants"
              value={formData.defendants}
              onChange={handleChange}
              required
              placeholder="Name(s) of defendant(s)"
              className="w-full px-3 py-2 border border-red-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500"
            />
            <p className="mt-1 text-xs text-gray-700">
              The party being sued or charged. For multiple defendants, separate names with commas.
            </p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label htmlFor="courtLocation" className="block text-sm font-medium">
              Court Location
            </label>
            <input
              type="text"
              id="courtLocation"
              name="courtLocation"
              value={formData.courtLocation}
              onChange={handleChange}
              placeholder="Preferred court location (if any)"
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          <div className="space-y-2">
            <label htmlFor="filingFee" className="block text-sm font-medium">
              Filing Fee (₹) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              id="filingFee"
              name="filingFee"
              value={formData.filingFee}
              onChange={handleChange}
              required
              min="0"
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
        
        <div className="flex justify-end space-x-4 pt-6">
          <button
            type="button"
            onClick={() => router.back()}
            className="bg-white text-gray-700 px-4 py-2 border border-gray-300 rounded-md shadow-sm hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="bg-blue-600 text-white px-6 py-2 rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            {isLoading ? 'Submitting...' : 'Submit Case'}
          </button>
        </div>
      </form>
    </div>
  );
} 