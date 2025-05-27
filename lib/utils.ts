import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Calculate filing fee based on case type
 * @param caseType - The type of case being filed
 * @returns Filing fee in INR
 */
export function calculateFilingFee(caseType: string): number {
  const normalizedCaseType = caseType.toLowerCase();
  
  // High-fee cases: Criminal, Commercial, and Cybercrime cases
  const highFeeCases = [
    'criminal',
    'commercial',
    'cybercrime'
  ];
  
  // Standard-fee cases: All others (Civil, Family, Constitutional, etc.)
  const standardFeeCases = [
    'civil',
    'family',
    'constitutional',
    'administrative',
    'tax',
    'consumer',
    'election',
    'special',
    'other'
  ];
  
  if (highFeeCases.includes(normalizedCaseType)) {
    return 1000; // ₹1000 for criminal, commercial, cybercrime cases
  } else if (standardFeeCases.includes(normalizedCaseType)) {
    return 500; // ₹500 for civil, family, constitutional, etc.
  } else {
    return 500; // Default to ₹500 for any unknown case types
  }
}

/**
 * Get filing fee structure information for display
 * @returns Object with fee structure details
 */
export function getFilingFeeStructure() {
  return {
    highFee: {
      amount: 1000,
      currency: 'INR',
      caseTypes: ['Criminal', 'Commercial', 'Cybercrime'],
      description: 'Complex cases requiring specialized handling'
    },
    standardFee: {
      amount: 500,
      currency: 'INR', 
      caseTypes: ['Civil', 'Family', 'Constitutional', 'Administrative', 'Tax', 'Consumer', 'Election', 'Special', 'Other'],
      description: 'Standard legal proceedings'
    }
  };
}

/**
 * Format currency for display
 * @param amount - Amount to format
 * @param currency - Currency code (default: INR)
 * @returns Formatted currency string
 */
export function formatCurrency(amount: number, currency: string = 'INR'): string {
  if (currency === 'INR') {
    return `₹${amount.toLocaleString('en-IN')}`;
  }
  return `${amount} ${currency}`;
}
