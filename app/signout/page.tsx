'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { signOut } from 'next-auth/react';

export default function SignOutPage() {
  const router = useRouter();
  
  useEffect(() => {
    const handleSignOut = async () => {
      try {
        await signOut({ redirect: false });
        // Force redirect to home page
        window.location.href = '/';
      } catch (error) {
        console.error('Error during sign out:', error);
        window.location.href = '/';
      }
    };
    
    handleSignOut();
  }, [router]);
  
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-black relative"
      style={{
        backgroundImage: 'url(/lady-justice.jpg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}
    >
      <div className="text-white text-xl">
        Signing out...
      </div>
    </div>
  );
} 