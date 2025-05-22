import React, { ButtonHTMLAttributes } from "react";
import { cn } from '@/lib/utils';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'outline' | 'destructive';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
  className?: string;
}

export function Button({
  variant = 'primary',
  size = 'md',
  className = "",
  children,
  disabled,
  ...props
}: ButtonProps) {
  const variantClasses = {
      primary: 'bg-blue-600 text-white hover:bg-blue-700',
    outline: 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50',
    destructive: 'bg-red-600 text-white hover:bg-red-700'
    };
    
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2',
    lg: 'px-6 py-3 text-lg'
    };
    
    return (
      <button
      className={`rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
        variantClasses[variant]
      } ${sizeClasses[size]} ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}
      disabled={disabled}
        {...props}
      >
        {children}
      </button>
    );
  }

Button.displayName = 'Button';