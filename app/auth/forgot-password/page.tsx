'use client';

import Link from 'next/link';
import { useState } from 'react';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      // In a real application, this would call your API to send a reset email
      // For now, we'll simulate success after a short delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Handle success
      setSuccess(true);
    } catch (err) {
      setError('An error occurred. Please try again.');
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
        <h1 className="text-2xl font-bold text-white mb-6 text-center">Reset Your Password</h1>
        
        {success ? (
          <div className="text-center">
            <div className="mb-4 p-4 bg-green-800/80 border border-green-700 text-white rounded-md">
              <p className="mb-2">Password reset email sent!</p>
              <p className="text-sm">Check your email for instructions to reset your password.</p>
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
              Enter your email address and we'll send you a link to reset your password.
            </p>
            
            {error && (
              <div className="mb-4 p-3 bg-red-800 border border-red-600 text-white rounded-md">
                {error}
              </div>
            )}
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1">
                  Email Address
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-600 text-gray-300 py-3 px-4 rounded"
                  required
                />
              </div>
              
              <button
                type="submit"
                className="w-full py-3 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Sending...' : 'Send Reset Link'}
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