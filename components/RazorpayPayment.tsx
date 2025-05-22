'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

declare global {
  interface Window {
    Razorpay: any;
  }
}

interface RazorpayPaymentProps {
  caseId: string;
  caseNumber: string;
  amount: number;
  currency?: string;
  name: string;
  description?: string;
  onSuccess?: (paymentData: any) => void;
  onError?: (error: any) => void;
}

export default function RazorpayPayment({
  caseId,
  caseNumber,
  amount,
  currency = 'INR',
  name,
  description = 'Case Filing Fee',
  onSuccess,
  onError
}: RazorpayPaymentProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isScriptLoaded, setIsScriptLoaded] = useState(false);
  const router = useRouter();

  // Load the Razorpay script
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => {
      setIsScriptLoaded(true);
      console.log('Razorpay script loaded successfully');
    };
    script.onerror = () => {
      console.error('Failed to load Razorpay script');
      if (onError) onError(new Error('Failed to load Razorpay payment gateway'));
    };
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const handlePayment = async () => {
    try {
      setIsLoading(true);
      console.log('Creating payment order for case:', caseId, 'Amount:', amount);

      // Create an order on the server
      const response = await fetch('/api/payment/create-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          caseId,
          amount,
          currency,
        }),
      });

      const responseData = await response.json();
      
      if (!response.ok) {
        console.error('Error response from create-order API:', responseData);
        throw new Error(responseData.message || 'Failed to create payment order');
      }

      console.log('Order created successfully:', responseData);

      // Initialize Razorpay checkout
      const options = {
        key: responseData.key, // Razorpay API key
        amount: responseData.amount, // Amount in smallest currency unit (paise for INR)
        currency: responseData.currency,
        name: name, // Business/website name
        description: description,
        order_id: responseData.orderId,
        handler: async function (response: any) {
          try {
            console.log('Payment successful, verifying payment:', response);
            
            // Verify payment with our backend
            const verificationResponse = await fetch('/api/payment/verify-payment', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                paymentId: responseData.paymentId, // Our internal payment ID
                razorpayPaymentId: response.razorpay_payment_id,
                razorpayOrderId: response.razorpay_order_id,
                razorpaySignature: response.razorpay_signature,
              }),
            });

            const verificationData = await verificationResponse.json();

            if (!verificationResponse.ok) {
              console.error('Payment verification failed:', verificationData);
              throw new Error(verificationData.message || 'Payment verification failed');
            }

            console.log('Payment verified successfully:', verificationData);
            
            // Call the success callback if provided
            if (onSuccess) {
              onSuccess(verificationData);
            }
            
            // Redirect to success page
            router.push(`/user/cases/${caseId}/payment/success?paymentId=${responseData.paymentId}`);
            
          } catch (error: any) {
            console.error('Error during payment verification:', error);
            if (onError) onError(error);
          }
        },
        prefill: {
          name: '',
          email: '',
          contact: '',
        },
        notes: {
          caseId: caseId,
          caseNumber: caseNumber,
        },
        theme: {
          color: '#3B82F6', // Blue color to match the site theme
        },
        modal: {
          ondismiss: function() {
            setIsLoading(false);
            console.log('Checkout form closed by user');
          }
        }
      };

      const razorpay = new window.Razorpay(options);
      razorpay.on('payment.failed', function (response: any) {
        console.error('Payment failed:', response.error);
        if (onError) onError(new Error(response.error.description || 'Payment failed'));
      });
      
      razorpay.open();
    } catch (error: any) {
      console.error('Error in handlePayment:', error);
      if (onError) onError(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 text-lg font-medium"
      disabled={isLoading || !isScriptLoaded}
      onClick={handlePayment}
    >
      {isLoading ? 'Processing...' : `Pay ₹${amount}`}
    </Button>
  );
} 