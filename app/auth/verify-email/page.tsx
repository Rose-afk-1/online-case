'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

export default function VerifyEmailPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get('token');
  
  const [verificationState, setVerificationState] = useState<'loading' | 'success' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState('');
  
  useEffect(() => {
    if (!token) {
      setVerificationState('error');
      setErrorMessage('Verification token is missing');
      return;
    }
    
    async function verifyEmail() {
      try {
        const response = await fetch(`/api/auth/verify-email?token=${token}`);
        const data = await response.json();
        
        if (response.ok) {
          setVerificationState('success');
          // Redirect to login after a short delay
          setTimeout(() => {
            router.push('/auth/signin?verified=true');
          }, 3000);
        } else {
          setVerificationState('error');
          setErrorMessage(data.message || 'Email verification failed');
        }
      } catch (error) {
        setVerificationState('error');
        setErrorMessage('An error occurred during verification');
      }
    }
    
    verifyEmail();
  }, [token, router]);
  
  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-md bg-gray-900 rounded-lg border border-gray-800 p-8">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-white">Email Verification</h1>
        </div>
        
        {verificationState === 'loading' && (
          <div className="text-center">
            <div className="inline-block w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-4 text-gray-300">Verifying your email address...</p>
          </div>
        )}
        
        {verificationState === 'success' && (
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 text-green-500 mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-white mb-2">Email Verified Successfully!</h2>
            <p className="text-gray-300 mb-4">
              Your email has been verified. You can now log in to your account.
            </p>
            <p className="text-gray-400 text-sm">
              Redirecting to login page in a few seconds...
            </p>
            <div className="mt-6">
              <Link href="/auth/signin" className="text-blue-400 hover:underline">
                Click here if you are not redirected automatically
              </Link>
            </div>
          </div>
        )}
        
        {verificationState === 'error' && (
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 text-red-500 mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-white mb-2">Verification Failed</h2>
            <p className="text-gray-300 mb-6">
              {errorMessage}
            </p>
            <div className="flex justify-center space-x-4">
              <Link 
                href="/auth/register" 
                className="px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-600 transition-colors"
              >
                Register Again
              </Link>
              <Link 
                href="/auth/signin" 
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-500 transition-colors"
              >
                Sign In
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 