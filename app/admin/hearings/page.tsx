'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import Modal from '@/components/ui/Modal';
import Spinner from '@/components/ui/Spinner';
import FormInput from '@/components/ui/FormInput';

interface Hearing {
  _id: string;
  caseId: {
    _id: string;
    caseNumber: string;
    title: string;
  } | string;
  title: string;
  description?: string;
  date: string;
  time: string;
  duration: number;
  location: string;
  status: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

interface Case {
  _id: string;
  caseNumber: string;
  title: string;
}

export default function HearingsManagement() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [hearings, setHearings] = useState<Hearing[]>([]);
  const [cases, setCases] = useState<Case[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [currentHearing, setCurrentHearing] = useState<Partial<Hearing> | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Fetch hearings and cases data
  useEffect(() => {
    if (status === 'loading') return;
    
    if (!session || session.user.role !== 'admin') {
      router.push('/auth/login');
      return;
    }
    
    fetchHearings();
    fetchCases();
  }, [session, status, router]);

  const fetchHearings = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/hearings');
      if (!response.ok) throw new Error('Failed to fetch hearings');
      
      const data = await response.json();
      // Check if data is an array or if it contains a hearings property
      if (Array.isArray(data)) {
        setHearings(data);
      } else if (data.hearings && Array.isArray(data.hearings)) {
        setHearings(data.hearings);
      } else {
        console.error('Unexpected API response format:', data);
        setHearings([]); // Set to empty array as fallback
        setError('Unexpected data format received from server');
      }
      
      setError('');
    } catch (err: any) {
      setError(err.message);
      console.error('Error fetching hearings:', err);
      setHearings([]); // Set to empty array on error
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCases = async () => {
    try {
      const response = await fetch('/api/cases');
      if (!response.ok) throw new Error('Failed to fetch cases');
      
      const data = await response.json();
      setCases(data.cases || []);
    } catch (err) {
      console.error('Error fetching cases:', err);
    }
  };

  const handleAddHearing = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentHearing) return;
    
    try {
      setIsSaving(true);
      const response = await fetch('/api/hearings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(currentHearing),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create hearing');
      }
      
      await fetchHearings();
      setShowAddModal(false);
      setCurrentHearing(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteHearing = async () => {
    if (!currentHearing || !currentHearing._id) return;
    
    try {
      setIsSaving(true);
      const response = await fetch(`/api/hearings/${currentHearing._id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete hearing');
      }
      
      await fetchHearings();
      setShowDeleteModal(false);
      setCurrentHearing(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const filteredHearings = hearings.filter(hearing => {
    const matchesSearch = 
      hearing.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (typeof hearing.caseId === 'object' && hearing.caseId.caseNumber.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (typeof hearing.caseId === 'object' && hearing.caseId.title.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesStatus = statusFilter === 'all' || hearing.status === statusFilter;
    
    const matchesDate = !dateFilter || hearing.date === dateFilter;
    
    return matchesSearch && matchesStatus && matchesDate;
  });

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'scheduled': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'postponed': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
      <div className="container mx-auto px-4 py-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Hearings Management</h1>
          <button
          onClick={() => router.push('/admin/hearings/schedule')}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
          >
            Schedule New Hearing
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
            {error}
          </div>
        )}

        <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <input
              type="text"
              placeholder="Search hearings..."
              className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div>
            <select
              className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All Statuses</option>
              <option value="scheduled">Scheduled</option>
              <option value="completed">Completed</option>
              <option value="canceled">Canceled</option>
              <option value="postponed">Postponed</option>
            </select>
          </div>
          <div>
            <input
              type="date"
              className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
            />
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <Spinner />
          </div>
        ) : (
          <>
            {filteredHearings.length === 0 ? (
              <div className="text-center p-8 bg-gray-50 rounded-md">
                <p className="text-gray-600">No hearings found matching your criteria.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full bg-white border border-gray-200 shadow-sm rounded-lg">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Case</th>
                      <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                      <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date & Time</th>
                      <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                      <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredHearings.map((hearing) => (
                      <tr key={hearing._id} className="hover:bg-gray-50">
                        <td className="py-4 px-4">
                          {typeof hearing.caseId === 'object' ? (
                            <>
                              <div className="font-medium text-black">{hearing.caseId.caseNumber}</div>
                              <div className="text-black font-medium">{hearing.caseId.title}</div>
                            </>
                          ) : (
                            <div className="font-medium text-black">Case ID: {hearing.caseId}</div>
                          )}
                        </td>
                        <td className="py-4 px-4 text-black font-medium">{hearing.title}</td>
                        <td className="py-4 px-4">
                          <div className="text-black font-medium">{format(new Date(hearing.date), 'PPP')}</div>
                          <div className="text-black font-medium">{hearing.time}</div>
                        </td>
                        <td className="py-4 px-4 text-black font-medium">{hearing.location}</td>
                        <td className="py-4 px-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-bold ${getStatusColor(hearing.status)}`}>
                            {hearing.status}
                          </span>
                        </td>
                        <td className="py-4 px-4 space-x-2">
                          <button
                            onClick={() => {
                              router.push(`/admin/hearings/${hearing._id}/edit`);
                            }}
                            className="text-blue-600 hover:text-blue-800 font-medium"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => {
                              setCurrentHearing(hearing);
                              setShowDeleteModal(true);
                            }}
                            className="text-red-600 hover:text-red-800 font-medium"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}

      {/* Add Hearing Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Schedule New Hearing"
      >
        <form onSubmit={handleAddHearing} className="space-y-4 bg-white p-4 rounded-lg shadow-lg">
          <FormInput
            label="Case"
            type="select"
            value={typeof currentHearing?.caseId === 'object' ? currentHearing?.caseId._id : (currentHearing?.caseId as string || '')}
            onChange={(e) => setCurrentHearing({ ...currentHearing, caseId: e.target.value })}
            options={cases.map(caseItem => ({
              value: caseItem._id,
              label: `${caseItem.caseNumber} - ${caseItem.title}`
            }))}
            required
          />

          <FormInput
            label="Title"
            type="text"
            value={currentHearing?.title || ''}
            onChange={(e) => setCurrentHearing({...currentHearing, title: e.target.value})}
            required
            placeholder="Enter hearing title"
          />

          <FormInput
            label="Description"
            type="textarea"
            value={currentHearing?.description || ''}
            onChange={(e) => setCurrentHearing({...currentHearing, description: e.target.value})}
            rows={3}
            placeholder="Enter hearing description"
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormInput
              label="Date"
              type="date"
              value={currentHearing?.date || ''}
              onChange={(e) => setCurrentHearing({...currentHearing, date: e.target.value})}
              required
            />
            
            <FormInput
              label="Time"
              type="time"
              value={currentHearing?.time || ''}
              onChange={(e) => setCurrentHearing({...currentHearing, time: e.target.value})}
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormInput
              label="Duration (minutes)"
              type="number"
              value={currentHearing?.duration || ''}
              onChange={(e) => setCurrentHearing({...currentHearing, duration: parseInt(e.target.value)})}
              min={1}
              required
            />
            
            <FormInput
              label="Status"
              type="select"
              value={currentHearing?.status || 'scheduled'}
              onChange={(e) => setCurrentHearing({...currentHearing, status: e.target.value})}
              options={[
                { value: 'scheduled', label: 'Scheduled' },
                { value: 'completed', label: 'Completed' },
                { value: 'cancelled', label: 'Cancelled' },
                { value: 'postponed', label: 'Postponed' }
              ]}
              required
            />
          </div>

          <FormInput
            label="Location"
            type="text"
            value={currentHearing?.location || ''}
            onChange={(e) => setCurrentHearing({...currentHearing, location: e.target.value})}
            required
          />

          <FormInput
            label="Notes"
            type="textarea"
            value={currentHearing?.notes || ''}
            onChange={(e) => setCurrentHearing({...currentHearing, notes: e.target.value})}
            rows={3}
          />

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={() => setShowAddModal(false)}
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
                  <Spinner size="sm" className="mr-2" />
                  Saving...
                </>
              ) : (
                'Schedule Hearing'
              )}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Delete Hearing"
      >
        <div className="p-4">
          <p className="mb-4">
            Are you sure you want to delete this hearing? This action cannot be undone.
          </p>
          <div className="flex justify-end space-x-3">
            <button
              onClick={() => setShowDeleteModal(false)}
              className="px-4 py-2 border rounded-md text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleDeleteHearing}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 flex items-center"
              disabled={isSaving}
            >
              {isSaving ? (
                <>
                  <Spinner size="sm" className="mr-2" />
                  Deleting...
                </>
              ) : (
                'Delete'
              )}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
} 