'use client';

import { useEffect } from 'react';
import { signOut } from 'next-auth/react';

export default function SignOutPage() {
  useEffect(() => {
    const handleSignOut = async () => {
      try {
        await signOut({ redirect: false });
        // Use direct window location change for more reliable navigation
        window.location.href = '/';
      } catch (error) {
        console.error('Error during sign out:', error);
        window.location.href = '/';
      }
    };
    
    handleSignOut();
  }, []);
  
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <p>Signing out...</p>
      </div>
    </div>
  );
} 