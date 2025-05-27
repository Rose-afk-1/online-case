'use client';
import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import FormInput from '@/components/ui/FormInput';
import Spinner from '@/components/ui/Spinner';

export default function EditHearingPage() {
  // Use the useParams hook to get route parameters
  const params = useParams();
  const hearingId = params.id as string;
  const { data: session, status } = useSession();
  const router = useRouter();
  const [cases, setCases] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    caseId: '',
    title: '',
    description: '',
    date: '',
    time: '',
    location: '',
    status: 'scheduled',
    notes: '',
  });

  // Create court room options
  const courtRoomOptions = Array.from({ length: 20 }, (_, i) => ({
    value: `High Court Room No.${i + 1}`,
    label: `High Court Room No.${i + 1}`
  }));

  useEffect(() => {
    if (status === 'loading') return;
    if (!session || session.user.role !== 'admin') {
      router.push('/auth/login');
      return;
    }
    
    fetchHearing();
    fetchCases();
  }, [session, status, router, hearingId]);

  const fetchHearing = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/hearings/${hearingId}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch hearing');
      }
      
      const hearing = await response.json();
      
      // Format date to YYYY-MM-DD for input[type="date"]
      const formattedDate = hearing.date ? new Date(hearing.date).toISOString().split('T')[0] : '';
      
      setForm({
        caseId: typeof hearing.caseId === 'object' ? hearing.caseId._id : hearing.caseId,
        title: hearing.title || '',
        description: hearing.description || '',
        date: formattedDate,
        time: hearing.time || '',
        location: hearing.location || '',
        status: hearing.status || 'scheduled',
        notes: hearing.notes || '',
      });
      
      setError('');
    } catch (err: any) {
      setError(err.message || 'Failed to load hearing data');
      console.error('Error fetching hearing:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCases = async () => {
    try {
      const response = await fetch('/api/cases');
      const data = await response.json();
      
      // Include all cases for editing (not just approved ones)
      setCases(data.cases || []);
    } catch (err) {
      setCases([]);
      console.error('Error fetching cases:', err);
    }
  };

  const handleChange = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    
    // Clear the error message when the user selects a case
    if (field === 'caseId' && value && error === 'Please select a case') {
      setError('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError('');
    
    // Add validation for caseId
    if (!form.caseId) {
      setError('Please select a case');
      setIsSaving(false);
      return;
    }
    
    try {
      const response = await fetch(`/api/hearings/${hearingId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          duration: 60, // Set a default duration value
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update hearing');
      }
      
      // Redirect back to the hearings list
      router.push('/admin/hearings');
    } catch (err: any) {
      setError(err.message);
      console.error('Error updating hearing:', err);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto bg-white p-8 rounded-lg shadow-lg mt-10">
      <h1 className="text-2xl font-bold mb-6 text-gray-900">Edit Hearing</h1>
      
      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <FormInput
          label="Case"
          type="select"
          value={form.caseId}
          onChange={(e) => handleChange('caseId', e.target.value)}
          options={cases.map((c) => ({ 
            value: c._id, 
            label: `${c.caseNumber} - ${c.title}` 
          }))}
          required
        />
        
        <FormInput
          label="Title"
          type="text"
          value={form.title}
          onChange={(e) => handleChange('title', e.target.value)}
          required
          placeholder="Enter hearing title"
        />
        
        <FormInput
          label="Description"
          type="textarea"
          value={form.description}
          onChange={(e) => handleChange('description', e.target.value)}
          rows={3}
          placeholder="Enter hearing description"
        />
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormInput
            label="Date"
            type="date"
            value={form.date}
            onChange={(e) => handleChange('date', e.target.value)}
            required
          />
          
          <FormInput
            label="Time"
            type="time"
            value={form.time}
            onChange={(e) => handleChange('time', e.target.value)}
            required
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormInput
            label="Location"
            type="select"
            value={form.location}
            onChange={(e) => handleChange('location', e.target.value)}
            options={courtRoomOptions}
            required
          />
          
          <FormInput
            label="Status"
            type="select"
            value={form.status}
            onChange={(e) => handleChange('status', e.target.value)}
            options={[
              { value: 'scheduled', label: 'Scheduled' },
              { value: 'completed', label: 'Completed' },
              { value: 'cancelled', label: 'Cancelled' },
              { value: 'postponed', label: 'Postponed' },
            ]}
            required
          />
        </div>
        
        <FormInput
          label="Notes"
          type="textarea"
          value={form.notes}
          onChange={(e) => handleChange('notes', e.target.value)}
          rows={3}
        />
        
        <div className="flex justify-end space-x-3 pt-4">
          <button
            type="button"
            onClick={() => router.push('/admin/hearings')}
            className="px-4 py-2 border rounded-md text-gray-700 bg-white hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Cancel
          </button>
          
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center"
            disabled={isSaving}
          >
            {isSaving ? (
              <>
                <Spinner size="sm" className="mr-1" /> 
                Saving...
              </>
            ) : (
              'Update Hearing'
            )}
          </button>
        </div>
      </form>
    </div>
  );
} 