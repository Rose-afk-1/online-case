'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import BackButton from '@/components/shared/BackToDashboard';

interface Hearing {
  _id: string;
  caseId: {
    _id: string;
    caseNumber: string;
    title: string;
  };
  title: string;
  date: string;
  time: string;
  duration: number;
  location: string;
  judge?: string;
  description?: string;
  status: 'scheduled' | 'completed' | 'postponed' | 'cancelled';
  notes?: string;
  createdBy?: string;
  createdAt: string;
  updatedAt: string;
}

const statusColors = {
  scheduled: 'bg-blue-100 text-black',
  completed: 'bg-green-100 text-black',
  postponed: 'bg-yellow-100 text-black',
  cancelled: 'bg-red-100 text-black',
};

export default function HearingDetailsPage() {
  const { data: session, status: sessionStatus } = useSession();
  const router = useRouter();
  const params = useParams();
  const hearingId = params.id as string;

  const [hearing, setHearing] = useState<Hearing | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    // Redirect if not authenticated
    if (sessionStatus === 'unauthenticated') {
      router.push('/auth/login');
      return;
    }

    if (sessionStatus === 'authenticated' && hearingId) {
      fetchHearingDetails();
    }
  }, [sessionStatus, router, hearingId]);

  const fetchHearingDetails = async () => {
    try {
      setLoading(true);
      
      const response = await fetch(`/api/hearings/${hearingId}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch hearing details');
      }
      
      const data = await response.json();
      setHearing(data);
      setError('');
    } catch (err: any) {
      setError(err.message || 'An error occurred');
      console.error('Error fetching hearing details:', err);
    } finally {
      setLoading(false);
    }
  };

  const navigateToCase = () => {
    if (hearing?.caseId?._id) {
      router.push(`/user/cases/${hearing.caseId._id}`);
    }
  };

  const goBackToHearings = () => {
    router.push('/user/hearings');
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      weekday: 'long',
      day: 'numeric',
    });
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (sessionStatus === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" />
        <p className="ml-2">Loading hearing details...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <BackButton label="Back to Hearings" fallbackRoute="/user/hearings" />
      
      {error ? (
        <div className="bg-white shadow-sm border border-gray-200 rounded-lg p-6">
          <div className="py-8">
            <div className="text-center text-red-500 flex flex-col items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mb-4">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              <h3 className="text-xl font-semibold mb-2">Error Loading Hearing</h3>
              <p>{error}</p>
              <Button 
                variant="outline" 
                className="mt-4"
                onClick={fetchHearingDetails}
              >
                Try Again
              </Button>
            </div>
          </div>
        </div>
      ) : hearing ? (
        <>
          {/* Hearing Header Card */}
          <div className="bg-white shadow-sm border border-gray-200 rounded-lg p-6 mb-6">
            <div className="pb-4 border-b mb-4">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-2xl font-bold">{hearing.title}</h2>
                  <div className="flex items-center mt-2 text-black">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                      <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
                      <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
                    </svg>
                    Case: {hearing.caseId.caseNumber} - {hearing.caseId.title}
                  </div>
                </div>
                <div className={`${statusColors[hearing.status]} px-3 py-1 rounded-full text-sm font-medium`}>
                  {hearing.status.charAt(0).toUpperCase() + hearing.status.slice(1)}
                </div>
              </div>
            </div>
            <div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-4">
                  <div className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2 text-blue-600">
                      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                      <line x1="16" y1="2" x2="16" y2="6" />
                      <line x1="8" y1="2" x2="8" y2="6" />
                      <line x1="3" y1="10" x2="21" y2="10" />
                    </svg>
                    <div>
                      <div className="font-semibold">Date</div>
                      <div>{formatDate(hearing.date)}</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2 text-blue-600">
                      <circle cx="12" cy="12" r="10" />
                      <polyline points="12 6 12 12 16 14" />
                    </svg>
                    <div>
                      <div className="font-semibold">Time</div>
                      <div>{hearing.time} ({hearing.duration} minutes)</div>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2 text-blue-600">
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                      <circle cx="12" cy="10" r="3" />
                    </svg>
                    <div>
                      <div className="font-semibold">Location</div>
                      <div>{hearing.location}</div>
                    </div>
                  </div>
                  
                  {hearing.judge && (
                    <div className="flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2 text-blue-600">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                        <circle cx="12" cy="7" r="4" />
                      </svg>
                      <div>
                        <div className="font-semibold">Judge</div>
                        <div>{hearing.judge}</div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
              {hearing.description && (
                <div className="mt-6">
                  <h3 className="font-semibold mb-2">Description</h3>
                  <p className="text-black">{hearing.description}</p>
                </div>
              )}
            </div>
            <div className="border-t pt-6 mt-6 flex justify-between">
              <Button
                variant="outline"
                onClick={navigateToCase}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                  <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                  <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                </svg>
                View Related Case
              </Button>
              {(hearing.status === 'scheduled' || hearing.status === 'postponed') && (
                <Button variant="default">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                    <line x1="16" y1="2" x2="16" y2="6" />
                    <line x1="8" y1="2" x2="8" y2="6" />
                    <line x1="3" y1="10" x2="21" y2="10" />
                  </svg>
                  Add to Calendar
                </Button>
              )}
            </div>
          </div>
          
          {/* Additional Details */}
          {hearing.notes && (
            <div className="bg-white shadow-sm border border-gray-200 rounded-lg p-6 mb-6">
              <div className="pb-4 border-b">
                <h2 className="text-xl font-bold">Notes</h2>
              </div>
              <div className="pt-4">
                <p className="whitespace-pre-line">{hearing.notes}</p>
              </div>
            </div>
          )}
          
          {/* Metadata */}
          <div className="bg-white shadow-sm border border-gray-200 rounded-lg p-6">
            <div className="pb-4 border-b">
              <h2 className="text-xl font-bold">Hearing Information</h2>
            </div>
            <div className="pt-4">
              <div className="text-sm text-black">
                <div className="flex justify-between py-2">
                  <span>Hearing ID:</span>
                  <span className="font-mono">{hearing._id}</span>
                </div>
                <hr className="my-2" />
                <div className="flex justify-between py-2">
                  <span>Created:</span>
                  <span>{formatDateTime(hearing.createdAt)}</span>
                </div>
                <hr className="my-2" />
                <div className="flex justify-between py-2">
                  <span>Last Updated:</span>
                  <span>{formatDateTime(hearing.updatedAt)}</span>
                </div>
              </div>
            </div>
          </div>
        </>
      ) : (
        <div className="bg-white shadow-sm border border-gray-200 rounded-lg p-6">
          <div className="py-8">
            <div className="text-center text-black">
              <h3 className="text-xl font-semibold mb-2">Hearing Not Found</h3>
              <p>The hearing you're looking for doesn't exist or you don't have permission to view it.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 