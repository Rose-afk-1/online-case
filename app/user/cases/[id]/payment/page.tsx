'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormField, FormLabel } from '@/components/ui/form';
import React from 'react';
import RazorpayPayment from '@/components/RazorpayPayment';

interface CaseDetails {
  _id: string;
  caseNumber: string;
  title: string;
  filingFee?: number;
  paymentStatus?: string;
}

export default function PaymentPage({ params }: { params: Promise<{ id: string }> | { id: string } }) {
  const { data: session, status: authStatus } = useSession();
  const router = useRouter();
  const caseId = 'then' in params ? React.use(params).id : params.id;
  
  const [caseDetails, setCaseDetails] = useState<CaseDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [paymentAmount, setPaymentAmount] = useState<number | undefined>(undefined);
  
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
      
      // If already paid, redirect to case details
      if (data.case.paymentStatus === 'paid') {
        setSuccess('Payment has already been completed for this case.');
        setTimeout(() => {
          router.push(`/user/cases/${caseId}`);
        }, 2000);
        return;
      }
      
      setCaseDetails(data.case);
      // Initialize payment amount with filing fee
      if (data.case.filingFee) {
        setPaymentAmount(data.case.filingFee);
      }
    } catch (error: any) {
      setError(error.message || 'An error occurred while fetching case details');
    } finally {
      setIsLoading(false);
    }
  };
  
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const handlePaymentSuccess = (paymentData: any) => {
    setSuccess('Payment processed successfully! You will be redirected shortly.');
    
    // Redirect after successful payment
    setTimeout(() => {
      router.push(`/user/cases/${caseId}`);
    }, 2000);
  };

  const handlePaymentError = (error: any) => {
    setError(error.message || 'An error occurred while processing payment');
  };
  
  if (isLoading) {
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
            <Link href="/user/dashboard">
              <Button
                variant="outline"
                size="sm"
              >
                Dashboard
              </Button>
            </Link>
          </div>
          
          <h1 className="text-2xl font-bold text-gray-900">Complete Payment</h1>
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
        
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="px-4 py-5 sm:p-6">
            <div className="mb-6 border-b pb-6">
              <h3 className="text-lg font-medium text-gray-900 mb-3">Payment Required for Evidence Upload</h3>
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm text-gray-600">Filing fee for case #{caseDetails?.caseNumber}</p>
                  <p className="text-sm text-gray-500 mt-1">Payment is required to upload evidence for this case</p>
                </div>
                <p className="text-lg font-medium text-gray-900">
                  {caseDetails?.filingFee !== undefined ? formatCurrency(caseDetails.filingFee) : 'N/A'}
                </p>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Payment Method</h3>
              
              <div className="mb-6">
                <p className="text-sm text-gray-600 mb-4">
                  Pay securely using Razorpay. You can use credit/debit cards, UPI, net banking, and more.
                </p>

                {caseDetails && paymentAmount && (
                  <RazorpayPayment
                    caseId={caseDetails._id}
                    caseNumber={caseDetails.caseNumber}
                    amount={paymentAmount}
                    name="Online Case Filing System"
                    description={`Filing fee for case ${caseDetails.caseNumber}`}
                    onSuccess={handlePaymentSuccess}
                    onError={handlePaymentError}
                  />
                )}
              </div>
              
              <div className="mt-4 text-xs text-gray-500 text-center">
                <p>All payments are processed securely through Razorpay.</p>
                <p>Your payment information is never stored on our servers.</p>
                <p>All amounts are in Indian Rupees (₹).</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 