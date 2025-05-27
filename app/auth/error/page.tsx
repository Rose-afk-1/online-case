'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState, Suspense } from 'react';

function AuthErrorContent() {
  const searchParams = useSearchParams();
  const [errorMessage, setErrorMessage] = useState('An authentication error occurred');
  const [errorDetails, setErrorDetails] = useState('Please try again or contact support if the problem persists.');

  useEffect(() => {
    const error = searchParams.get('error');
    
    if (error === 'CredentialsSignin') {
      setErrorMessage('Invalid login credentials');
      setErrorDetails('The email or password you entered is incorrect. Please try again.');
    } else if (error === 'AccessDenied') {
      setErrorMessage('Access denied');
      setErrorDetails('You do not have permission to access this page.');
    } else if (error === 'Verification') {
      setErrorMessage('Verification required');
      setErrorDetails('Your account requires verification before you can log in.');
    } else if (error === 'OAuthSignin' || error === 'OAuthCallback') {
      setErrorMessage('Social login error');
      setErrorDetails('There was a problem with the social login. Please try another method.');
    }
  }, [searchParams]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 px-4">
      <div className="max-w-md w-full bg-white border border-gray-200 rounded-lg p-8 text-center">
        <div className="w-20 h-20 mx-auto mb-6 flex items-center justify-center rounded-full bg-red-100">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            className="w-12 h-12 text-red-600"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        </div>
        
        <h1 className="text-2xl font-bold mb-4 text-gray-800">{errorMessage}</h1>
        
        <p className="text-gray-600 mb-8">
          {errorDetails}
        </p>
        
        <div className="flex flex-col space-y-3">
          <Link 
            href="/"
            className="w-full py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition text-center"
          >
            Return to Login
          </Link>
          
          <Link 
            href="/auth/register"
            className="text-blue-600 hover:underline text-sm"
          >
            Need an account? Register now
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function AuthErrorPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" />
      </div>
    }>
      <AuthErrorContent />
    </Suspense>
  );
} 