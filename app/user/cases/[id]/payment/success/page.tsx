'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { FaCheckCircle, FaFileInvoice, FaArrowLeft } from 'react-icons/fa';
import React from 'react';

export default function PaymentSuccessPage({ params }: { params: Promise<{ id: string }> | { id: string } }) {
  const { data: session, status: authStatus } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Unwrap params safely whether it's a Promise or not
  const caseId = 'then' in params ? React.use(params).id : params.id;
  const paymentId = searchParams.get('paymentId');
  const [paymentDetails, setPaymentDetails] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (authStatus === 'loading') return;
    
    if (authStatus === 'unauthenticated') {
      router.push('/auth/login');
      return;
    }
    
    if (!paymentId) {
      setError('Payment ID not found');
      setIsLoading(false);
      return;
    }
    
    fetchPaymentDetails();
  }, [authStatus, caseId, paymentId]);

  const fetchPaymentDetails = async () => {
    try {
      const response = await fetch(`/api/payment?caseId=${caseId}`);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch payment details');
      }
      
      const payment = data.payments.find((p: any) => p._id === paymentId);
      
      if (!payment) {
        throw new Error('Payment details not found');
      }
      
      setPaymentDetails(payment);
    } catch (error: any) {
      setError(error.message || 'An error occurred while fetching payment details');
    } finally {
      setIsLoading(false);
    }
  };
  
  const formatCurrency = (amount: number, currency: string = 'INR') => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: currency,
      maximumFractionDigits: 0
    }).format(amount);
  };
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-IN', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" />
        <p className="ml-2">Loading payment details...</p>
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
                className="flex items-center gap-1"
              >
                <FaArrowLeft size={14} />
                Back to Case
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
        </div>
        
        {error && (
          <div className="mb-6 rounded-md bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}
        
        {paymentDetails && (
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="px-4 py-5 sm:p-6">
              <div className="text-center mb-6">
                <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4">
                  <FaCheckCircle className="h-10 w-10 text-green-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">Payment Successful!</h2>
                <p className="mt-1 text-sm text-gray-500">
                  Your payment has been processed successfully.
                </p>
              </div>
              
              <div className="border-t border-gray-200 py-4 mb-4">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Transaction ID</p>
                    <p className="mt-1 text-sm text-gray-900">{paymentDetails.transactionId || paymentDetails.razorpayPaymentId || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Amount Paid</p>
                    <p className="mt-1 text-sm text-gray-900">{formatCurrency(paymentDetails.amount, paymentDetails.currency)}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Payment Method</p>
                    <p className="mt-1 text-sm text-gray-900">{paymentDetails.paymentMethod}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Payment Date</p>
                    <p className="mt-1 text-sm text-gray-900">{formatDate(paymentDetails.paymentDate || paymentDetails.createdAt)}</p>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-center mt-6 space-x-4">
                <Link href={paymentDetails.receiptUrl || `#`}>
                  <Button
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
                    disabled={!paymentDetails.receiptUrl}
                  >
                    <FaFileInvoice />
                    Download Invoice
                  </Button>
                </Link>
                
                <Link href={`/user/cases/${caseId}`}>
                  <Button variant="outline">
                    Return to Case
                  </Button>
                </Link>
              </div>
              
              <div className="mt-8 text-center text-sm text-gray-600">
                <p>An invoice has been generated for your records.</p>
                <p>You can now upload evidence for your case.</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 