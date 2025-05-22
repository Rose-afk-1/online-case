'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { FaFileInvoice, FaDownload } from 'react-icons/fa';

interface InvoiceDownloadButtonProps {
  paymentId: string;
  className?: string;
}

export default function InvoiceDownloadButton({ paymentId, className = '' }: InvoiceDownloadButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  
  const handleDownloadInvoice = () => {
    setIsLoading(true);
    
    // Open the invoice URL in a new tab
    window.open(`/api/payment/invoice/${paymentId}`, '_blank');
    
    setIsLoading(false);
  };
  
  return (
    <Button
      onClick={handleDownloadInvoice}
      disabled={isLoading}
      className={`inline-flex items-center gap-2 ${className}`}
      variant="outline"
      size="sm"
    >
      {isLoading ? (
        <>
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-solid border-current border-r-transparent" />
          Loading...
        </>
      ) : (
        <>
          <FaFileInvoice className="h-4 w-4" />
          Download Invoice
        </>
      )}
    </Button>
  );
} 