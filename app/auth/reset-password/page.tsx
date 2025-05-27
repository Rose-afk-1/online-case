'use client';

import Link from 'next/link';
import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [isValidToken, setIsValidToken] = useState(true);

  useEffect(() => {
    // In a real app, you would verify the token with your API
    if (!token) {
      setIsValidToken(false);
      setError('Missing or invalid reset token. Please request a new password reset link.');
    }
  }, [token]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    // Validate passwords
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      setIsSubmitting(false);
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters long');
      setIsSubmitting(false);
      return;
    }

    try {
      // In a real application, this would call your API to reset the password
      // using the token and new password
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Handle success
      setSuccess(true);
      
      // Redirect to login after 3 seconds
      setTimeout(() => {
        router.push('/');
      }, 3000);
    } catch (err) {
      setError('An error occurred while resetting your password. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-black relative px-4">
      {/* Blurred background */}
      <div 
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage: 'url(/lady-justice.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          filter: 'blur(2px)',
          zIndex: 0
        }}
      />
      
      <div className="w-full max-w-md bg-gray-900/80 p-8 rounded-lg border border-gray-700 relative z-10">
        <h1 className="text-2xl font-bold text-white mb-6 text-center">Set New Password</h1>
        
        {!isValidToken ? (
          <div className="text-center">
            <div className="mb-4 p-4 bg-red-800/80 border border-red-600 text-white rounded-md">
              <p>{error}</p>
            </div>
            
            <Link
              href="/auth/forgot-password"
              className="inline-block w-full py-3 px-4 bg-blue-600 text-white rounded hover:bg-blue-700 transition text-center mt-4"
            >
              Request New Reset Link
            </Link>
          </div>
        ) : success ? (
          <div className="text-center">
            <div className="mb-4 p-4 bg-green-800/80 border border-green-700 text-white rounded-md">
              <p className="mb-2">Password reset successful!</p>
              <p className="text-sm">You will be redirected to the login page shortly.</p>
            </div>
            
            <Link
              href="/"
              className="inline-block w-full py-3 px-4 bg-blue-600 text-white rounded hover:bg-blue-700 transition text-center mt-4"
            >
              Return to Login
            </Link>
          </div>
        ) : (
          <>
            <p className="text-gray-300 mb-6 text-center">
              Enter your new password below.
            </p>
            
            {error && (
              <div className="mb-4 p-3 bg-red-800 border border-red-600 text-white rounded-md">
                {error}
              </div>
            )}
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-1">
                  New Password
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-600 text-gray-300 py-3 px-4 rounded"
                  required
                  minLength={8}
                />
              </div>
              
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-300 mb-1">
                  Confirm New Password
                </label>
                <input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-600 text-gray-300 py-3 px-4 rounded"
                  required
                />
              </div>
              
              <button
                type="submit"
                className="w-full py-3 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Updating...' : 'Reset Password'}
              </button>
            </form>
            
            <div className="mt-6 text-center">
              <Link href="/" className="text-blue-400 hover:underline">
                Back to Login
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite] text-white" />
      </div>
    }>
      <ResetPasswordContent />
    </Suspense>
  );
} 