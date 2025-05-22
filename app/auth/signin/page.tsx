'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

export default function SignInPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const provider = searchParams.get('provider');
  const verified = searchParams.get('verified');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  // Check if the user has just verified their email
  useEffect(() => {
    if (verified === 'true') {
      setSuccess('Your email has been verified successfully! You can now sign in.');
    }
  }, [verified]);
  
  // Handle OAuth provider login
  useEffect(() => {
    if (provider) {
      handleProviderSignIn(provider);
    }
  }, [provider]);
  
  const handleProviderSignIn = async (providerName: string) => {
    try {
      setIsLoading(true);
      
      // For demonstration, we'll simulate a successful login
      // In a real app, this would call your backend authentication API
      console.log(`Attempting to sign in with ${providerName}`);
      
      // Demo: Just redirect to dashboard after a short delay
      setTimeout(() => {
        router.push('/user/dashboard');
      }, 1000);
      
    } catch (error) {
      console.error('OAuth sign in error:', error);
      setError('Failed to sign in with provider. Please try again.');
      setIsLoading(false);
    }
  };
  
  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setIsLoading(true);
      setError('');
      setSuccess('');
      
      if (!email || !password) {
        setError('Please enter both email and password');
        setIsLoading(false);
        return;
      }
      
      // For demonstration, we'll simulate a successful login
      // In a real app, this would call your backend authentication API
      console.log('Attempting to sign in with email/password');
      
      // Demo: Just redirect to dashboard after a short delay
      setTimeout(() => {
        router.push('/user/dashboard');
      }, 1000);
      
    } catch (error) {
      console.error('Email sign in error:', error);
      setError('Invalid email or password. Please try again.');
      setIsLoading(false);
    }
  };
  
  // If we're in the process of OAuth login, show a loading screen
  if (isLoading && provider) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center">
        <div className="text-white text-center">
          <h2 className="text-2xl font-semibold mb-4">Signing in with {provider}...</h2>
          <div className="w-16 h-16 border-t-4 border-blue-500 border-solid rounded-full animate-spin mx-auto"></div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white">Sign In</h1>
          <p className="text-gray-400 text-sm mt-2">Access your account</p>
        </div>
        
        {error && (
          <div className="bg-red-500 text-white p-3 rounded-md mb-6">
            {error}
          </div>
        )}
        
        {success && (
          <div className="bg-green-500 text-white p-3 rounded-md mb-6">
            {success}
          </div>
        )}
        
        <form onSubmit={handleEmailSignIn}>
          <div className="mb-4">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email Address"
              className="w-full bg-gray-800 border border-gray-700 text-white px-4 py-3 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
          <div className="mb-6">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="w-full bg-gray-800 border border-gray-700 text-white px-4 py-3 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
          
          <button 
            type="submit" 
            disabled={isLoading}
            className="w-full py-3 text-white font-medium rounded-md bg-blue-600 hover:bg-blue-700 transition-colors duration-200 disabled:bg-blue-800 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
        
        <div className="flex items-center my-6">
          <div className="flex-grow h-px bg-gray-600"></div>
          <span className="mx-4 text-gray-400 text-sm">OR</span>
          <div className="flex-grow h-px bg-gray-600"></div>
        </div>
        
        <div className="flex space-x-4 mb-6">
          <button
            onClick={() => handleProviderSignIn('google')}
            disabled={isLoading}
            className="flex-1 bg-gray-800 hover:bg-gray-700 text-white py-3 px-4 rounded-md flex items-center justify-center transition duration-200 disabled:bg-gray-900 disabled:cursor-not-allowed"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12.545,10.239v3.821h5.445c-0.712,2.315-2.647,3.972-5.445,3.972c-3.332,0-6.033-2.701-6.033-6.032 s2.701-6.032,6.033-6.032c1.498,0,2.866,0.549,3.921,1.453l2.814-2.814C17.503,2.988,15.139,2,12.545,2 C7.021,2,2.543,6.477,2.543,12s4.478,10,10.002,10c8.396,0,10.249-7.85,9.426-11.748L12.545,10.239z"/>
            </svg>
            Google
          </button>
          <button
            onClick={() => handleProviderSignIn('apple')}
            disabled={isLoading}
            className="flex-1 bg-gray-800 hover:bg-gray-700 text-white py-3 px-4 rounded-md flex items-center justify-center transition duration-200 disabled:bg-gray-900 disabled:cursor-not-allowed"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
              <path d="M16.365 1.43c0 1.14-.493 2.27-1.177 3.08-.744.9-1.99 1.57-2.987 1.57-.12 0-.23-.02-.3-.03-.01-.06-.04-.22-.04-.39 0-1.15.572-2.27 1.206-2.98.804-.94 2.142-1.64 3.248-1.68.03.13.05.28.05.43zm4.565 15.71c-.03.07-.463 1.58-1.518 3.12-.945 1.34-1.94 2.71-3.43 2.71-1.517 0-1.9-.88-3.63-.88-1.698 0-2.302.91-3.67.91-1.377 0-2.332-1.26-3.428-2.8-1.287-1.82-2.323-4.63-2.323-7.28 0-4.28 2.797-6.55 5.552-6.55 1.448 0 2.675.95 3.6.95.865 0 2.222-1.01 3.902-1.01.613 0 2.886.06 4.374 2.19-.13.09-2.383 1.37-2.383 4.19 0 3.26 2.854 4.42 2.955 4.45z"/>
            </svg>
            Apple
          </button>
        </div>
        
        <div className="text-center mt-8">
          <p className="text-gray-400 text-sm">
            Don't have an account? <Link href="/auth/register" className="text-white hover:underline">Register Now</Link>
          </p>
        </div>
        
        <div className="text-center mt-4">
          <Link href="/" className="text-gray-400 text-sm hover:text-white">
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
} 