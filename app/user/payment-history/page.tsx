'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import BackButton from '@/components/shared/BackToDashboard';
import InvoiceDownloadButton from '@/components/InvoiceDownloadButton';

type Payment = {
  _id: string;
  caseId: string;
  amount: number;
  currency: string;
  paymentMethod: string;
  status: string;
  description: string;
  transactionId?: string;
  razorpayPaymentId?: string;
  receiptUrl?: string;
  paymentDate?: string;
  createdAt: string;
  caseDetails?: {
    caseNumber: string;
    title: string;
  };
};

export default function PaymentHistoryPage() {
  const { data: session, status: authStatus } = useSession();
  const router = useRouter();
  
  const [payments, setPayments] = useState<Payment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [methodFilter, setMethodFilter] = useState('all');

  useEffect(() => {
    if (authStatus === 'loading') return;
    
    if (authStatus === 'unauthenticated') {
      router.push('/auth/login');
      return;
    }
    
    fetchPayments();
  }, [authStatus]);

  const fetchPayments = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/payment');
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch payment history');
      }
      
      // Fetch case details for each payment
      const paymentsWithCaseDetails = await Promise.all(
        data.payments.map(async (payment: Payment) => {
          try {
            const caseResponse = await fetch(`/api/cases/${payment.caseId}`);
            if (caseResponse.ok) {
              const caseData = await caseResponse.json();
              return {
                ...payment,
                caseDetails: {
                  caseNumber: caseData.case.caseNumber,
                  title: caseData.case.title,
                }
              };
            }
          } catch (error) {
            console.error('Error fetching case details:', error);
          }
          return payment;
        })
      );
      
      setPayments(paymentsWithCaseDetails);
    } catch (error: any) {
      setError(error.message || 'An error occurred while fetching payment history');
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
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
      case 'success':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'failed':
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPaymentMethodIcon = (method: string) => {
    switch (method.toLowerCase()) {
      case 'card':
      case 'credit_card':
      case 'debit_card':
        return '💳';
      case 'upi':
        return '📱';
      case 'netbanking':
        return '🏦';
      case 'wallet':
        return '👛';
      default:
        return '💰';
    }
  };

  const filteredPayments = payments.filter(payment => {
    const statusMatch = statusFilter === 'all' || payment.status.toLowerCase() === statusFilter.toLowerCase();
    const methodMatch = methodFilter === 'all' || payment.paymentMethod.toLowerCase() === methodFilter.toLowerCase();
    return statusMatch && methodMatch;
  });

  const totalPaid = payments
    .filter(p => p.status.toLowerCase() === 'completed' || p.status.toLowerCase() === 'success')
    .reduce((sum, payment) => sum + payment.amount, 0);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" />
        <p className="ml-2">Loading payment history...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex space-x-2 mb-4">
            <BackButton />
            <Link href="/">
              <Button variant="outline" size="sm">Home</Button>
            </Link>
            <Link href="/user/dashboard">
              <Button variant="outline" size="sm">Dashboard</Button>
            </Link>
          </div>
          
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Payment History</h1>
              <p className="mt-1 text-sm text-gray-600">
                View all your payment transactions and download invoices
              </p>
            </div>
            
            {/* Summary Card */}
            <div className="mt-4 md:mt-0 bg-white rounded-lg shadow p-4 border-l-4 border-green-500">
              <div className="text-sm text-gray-600">Total Paid</div>
              <div className="text-2xl font-bold text-green-600">
                {formatCurrency(totalPaid)}
              </div>
              <div className="text-xs text-gray-500">
                {payments.filter(p => p.status.toLowerCase() === 'completed').length} successful transactions
              </div>
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-6 rounded-md bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Filters */}
        <div className="bg-white p-4 rounded-lg shadow mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="w-full sm:w-1/3">
              <label htmlFor="statusFilter" className="block text-sm font-medium text-gray-700 mb-1">
                Payment Status
              </label>
              <select
                id="statusFilter"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="all">All Statuses</option>
                <option value="completed">Completed</option>
                <option value="pending">Pending</option>
                <option value="failed">Failed</option>
              </select>
            </div>
            
            <div className="w-full sm:w-1/3">
              <label htmlFor="methodFilter" className="block text-sm font-medium text-gray-700 mb-1">
                Payment Method
              </label>
              <select
                id="methodFilter"
                value={methodFilter}
                onChange={(e) => setMethodFilter(e.target.value)}
                className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="all">All Methods</option>
                <option value="card">Card</option>
                <option value="upi">UPI</option>
                <option value="netbanking">Net Banking</option>
                <option value="wallet">Wallet</option>
              </select>
            </div>

            <div className="w-full sm:w-1/3 flex items-end">
              <Button 
                variant="outline" 
                className="w-full" 
                onClick={() => {
                  setStatusFilter('all');
                  setMethodFilter('all');
                }}
              >
                Clear Filters
              </Button>
            </div>
          </div>
        </div>

        {/* Payment List */}
        {filteredPayments.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <div className="w-16 h-16 mx-auto mb-4 text-gray-400">
              💳
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {payments.length === 0 ? 'No payment history' : 'No payments match your filters'}
            </h3>
            <p className="text-gray-600 mb-6">
              {payments.length === 0 
                ? "You haven't made any payments yet. Start by filing a case and completing the payment process."
                : "Try adjusting your filters to see more results."
              }
            </p>
            {payments.length === 0 && (
              <Link href="/user/cases/new">
                <Button variant="primary">File Your First Case</Button>
              </Link>
            )}
          </div>
        ) : (
          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <ul className="divide-y divide-gray-200">
              {filteredPayments.map((payment) => (
                <li key={payment._id}>
                  <div className="px-4 py-4 sm:px-6">
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-3">
                          <span className="text-2xl">{getPaymentMethodIcon(payment.paymentMethod)}</span>
                          <div>
                            <div className="flex items-center space-x-2">
                              <p className="text-lg font-semibold text-gray-900">
                                {formatCurrency(payment.amount, payment.currency)}
                              </p>
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(payment.status)}`}>
                                {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                              </span>
                            </div>
                            
                            <div className="mt-1 text-sm text-gray-600">
                              {payment.caseDetails ? (
                                <Link 
                                  href={`/user/cases/${payment.caseId}`}
                                  className="text-blue-600 hover:text-blue-800 font-medium"
                                >
                                  Case #{payment.caseDetails.caseNumber}: {payment.caseDetails.title}
                                </Link>
                              ) : (
                                <span>{payment.description}</span>
                              )}
                            </div>
                            
                            <div className="mt-1 flex items-center space-x-4 text-xs text-gray-500">
                              <span>💳 {payment.paymentMethod.toUpperCase()}</span>
                              {payment.transactionId && (
                                <span>ID: {payment.transactionId}</span>
                              )}
                              <span>📅 {formatDate(payment.paymentDate || payment.createdAt)}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        {(payment.status.toLowerCase() === 'completed' || payment.status.toLowerCase() === 'success') && (
                          <InvoiceDownloadButton paymentId={payment._id} />
                        )}
                        
                        {payment.caseDetails && (
                          <Link href={`/user/cases/${payment.caseId}`}>
                            <Button variant="outline" size="sm">
                              View Case
                            </Button>
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Stats Summary */}
        {payments.length > 0 && (
          <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-lg shadow p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">
                {filteredPayments.length}
              </div>
              <div className="text-sm text-gray-600">Total Transactions</div>
            </div>
            
            <div className="bg-white rounded-lg shadow p-4 text-center">
              <div className="text-2xl font-bold text-green-600">
                {filteredPayments.filter(p => p.status.toLowerCase() === 'completed').length}
              </div>
              <div className="text-sm text-gray-600">Successful</div>
            </div>
            
            <div className="bg-white rounded-lg shadow p-4 text-center">
              <div className="text-2xl font-bold text-yellow-600">
                {filteredPayments.filter(p => p.status.toLowerCase() === 'pending').length}
              </div>
              <div className="text-sm text-gray-600">Pending</div>
            </div>
            
            <div className="bg-white rounded-lg shadow p-4 text-center">
              <div className="text-2xl font-bold text-red-600">
                {filteredPayments.filter(p => p.status.toLowerCase() === 'failed').length}
              </div>
              <div className="text-sm text-gray-600">Failed</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 