'use client';

import React, { useState } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';

export default function VerifyReminderPage() {
  const { data: session } = useSession();
  const [resendStatus, setResendStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  
  const handleResendVerification = async () => {
    if (!session?.user?.email) return;
    
    setResendStatus('loading');
    setErrorMessage('');
    
    try {
      const response = await fetch('/api/auth/resend-verification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: session.user.email,
        }),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setResendStatus('success');
      } else {
        setResendStatus('error');
        setErrorMessage(data.message || 'Failed to resend verification email');
      }
    } catch (error) {
      setResendStatus('error');
      setErrorMessage('An error occurred. Please try again later.');
    }
  };
  
  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-md bg-gray-900 rounded-lg border border-gray-800 p-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-yellow-100 text-yellow-500 mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-white">Email Verification Required</h1>
        </div>
        
        <div className="text-center mb-8">
          <p className="text-gray-300 mb-4">
            We've sent a verification email to <span className="font-semibold text-white">{session?.user?.email}</span>.
          </p>
          <p className="text-gray-300">
            Please check your email and click the verification link to activate your account.
          </p>
        </div>
        
        <div className="space-y-4">
          {resendStatus === 'success' && (
            <div className="bg-green-500 bg-opacity-20 text-green-400 p-3 rounded-md mb-4">
              Verification email has been resent. Please check your inbox.
            </div>
          )}
          
          {resendStatus === 'error' && (
            <div className="bg-red-500 bg-opacity-20 text-red-400 p-3 rounded-md mb-4">
              {errorMessage}
            </div>
          )}
          
          <button 
            onClick={handleResendVerification}
            disabled={resendStatus === 'loading'}
            className="w-full py-3 text-white font-medium rounded-md bg-blue-600 hover:bg-blue-700 transition-colors duration-200 disabled:bg-blue-800 disabled:cursor-not-allowed"
          >
            {resendStatus === 'loading' ? 'Sending...' : 'Resend Verification Email'}
          </button>
          
          <Link 
            href="/auth/signin" 
            className="w-full py-3 text-white font-medium rounded-md bg-gray-700 hover:bg-gray-600 transition-colors duration-200 inline-block text-center mt-4"
          >
            Return to Sign In
          </Link>
        </div>
        
        <div className="text-center mt-8">
          <p className="text-gray-400 text-sm">
            If you're having trouble, please contact our support team.
          </p>
        </div>
      </div>
    </div>
  );
} 