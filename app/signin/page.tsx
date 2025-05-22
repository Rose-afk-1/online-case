'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function SignInPage() {
  const router = useRouter();
  
  useEffect(() => {
    // Redirect to the main landing page
    router.replace('/');
  }, [router]);
  
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-black relative login-container"
      style={{
        backgroundImage: 'url(/lady-justice.jpg) !important',
        backgroundSize: 'cover !important',
        backgroundPosition: 'center !important',
        backgroundRepeat: 'no-repeat !important',
        backgroundColor: 'black !important'
      }}
    >
      <div className="text-white text-xl">
        Redirecting to login...
      </div>
    </div>
  );
} 