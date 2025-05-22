'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';

type BackButtonProps = {
  variant?: 'default' | 'outline' | 'ghost';
  className?: string;
  label?: string;
  fallbackRoute?: string; 
};

/**
 * A reusable back button component that uses browser history
 * Falls back to a specified route if no history is available
 */
export default function BackButton({
  variant = 'outline',
  className = 'text-black border-gray-300 hover:bg-gray-100',
  label = 'Back',
  fallbackRoute = '/user/dashboard'
}: BackButtonProps) {
  const router = useRouter();

  const handleClick = () => {
    // Use browser history API if available, otherwise go to fallback route
    if (typeof window !== 'undefined' && window.history.length > 1) {
      window.history.back();
    } else {
      router.push(fallbackRoute);
    }
  };

  return (
    <Button
      variant={variant}
      onClick={handleClick}
      className={className}
    >
      <svg 
        xmlns="http://www.w3.org/2000/svg" 
        width="16" 
        height="16" 
        viewBox="0 0 24 24" 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        className="mr-2"
      >
        <path d="M15 18l-6-6 6-6" />
      </svg>
      {label}
    </Button>
  );
} 