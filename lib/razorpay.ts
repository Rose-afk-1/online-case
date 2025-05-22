import Razorpay from 'razorpay';
import crypto from 'crypto';

// Check if environment variables are set
if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
  console.error('Razorpay credentials are not set in environment variables');
}

// Initialize Razorpay instance with API keys from environment variables
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID as string,
  key_secret: process.env.RAZORPAY_KEY_SECRET as string,
});

export default razorpay;

// Helper function to create an order
export async function createOrder(options: {
  amount: number;
  currency: string;
  receipt: string;
  notes?: Record<string, string>;
}) {
  try {
    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
      throw new Error('Razorpay API keys are not configured');
    }

    console.log('Creating Razorpay order with options:', options);
    
    // Validate required fields
    if (!options.amount) throw new Error('Amount is required for creating an order');
    if (!options.currency) throw new Error('Currency is required for creating an order');
    if (!options.receipt) throw new Error('Receipt ID is required for creating an order');
    
    // Ensure amount is a positive number
    if (options.amount <= 0) throw new Error('Amount must be greater than 0');
    
    const order = await razorpay.orders.create(options);
    console.log('Razorpay order created successfully:', order);
    return order;
  } catch (error: any) {
    console.error('Failed to create Razorpay order:', error);
    // Add more details to the error message
    if (error.error && error.error.description) {
      throw new Error(`Razorpay error: ${error.error.description}`);
    }
    throw error;
  }
}

// Helper function to verify payment signature
export function verifyPaymentSignature(options: {
  order_id: string;
  payment_id: string;
  signature: string;
}) {
  try {
    const { order_id, payment_id, signature } = options;
    
    if (!process.env.RAZORPAY_KEY_SECRET) {
      throw new Error('Razorpay secret key is not configured');
    }
    
    // Create a signature using the order_id and payment_id
    const text = order_id + '|' + payment_id;
    const generatedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET as string)
      .update(text)
      .digest('hex');
    
    // Compare the generated signature with the one received from Razorpay
    const isValid = generatedSignature === signature;
    console.log('Signature validation result:', isValid);
    return isValid;
  } catch (error: any) {
    console.error('Error verifying signature:', error);
    throw new Error(`Failed to verify payment signature: ${error.message}`);
  }
} 