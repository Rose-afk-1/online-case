import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/db';
import Payment from '@/models/Payment';
import Case from '@/models/Case';
import { Types } from 'mongoose';

// Process a payment
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    await dbConnect();
    
    const body = await req.json();
    
    // Required fields
    const { caseId, amount, paymentMethod, cardDetails } = body;
    
    if (!caseId || !amount || !paymentMethod || !cardDetails) {
      return NextResponse.json(
        { message: 'Missing required payment information' },
        { status: 400 }
      );
    }
    
    // Validate case exists and belongs to the user
    if (!Types.ObjectId.isValid(caseId)) {
      return NextResponse.json(
        { message: 'Invalid case ID' },
        { status: 400 }
      );
    }
    
    const caseData = await Case.findById(caseId);
    
    if (!caseData) {
      return NextResponse.json(
        { message: 'Case not found' },
        { status: 404 }
      );
    }
    
    if (caseData.userId.toString() !== session.user.id.toString() && session.user.role !== 'admin') {
      return NextResponse.json(
        { message: 'You do not have permission to make payments for this case' },
        { status: 403 }
      );
    }
    
    // In a real-world application, we would integrate with a payment processor here
    // This is a simplified mock implementation
    
    // Simulate payment processing
    const isPaymentSuccessful = simulatePaymentProcessing(cardDetails);
    
    if (!isPaymentSuccessful) {
      return NextResponse.json(
        { message: 'Payment processing failed. Please check your payment details and try again.' },
        { status: 400 }
      );
    }
    
    // Create payment record
    const payment = await Payment.create({
      caseId: new Types.ObjectId(caseId),
      userId: new Types.ObjectId(session.user.id),
      amount,
      currency: 'USD',
      paymentMethod,
      status: 'completed',
      description: `Filing fee for case ${caseData.caseNumber}`,
      receiptUrl: `/receipts/${Date.now()}.pdf`, // In a real app, we'd generate an actual receipt
    });
    
    // Update case with payment information
    await Case.findByIdAndUpdate(caseId, {
      paymentStatus: 'paid',
      paymentId: payment._id,
    });
    
    return NextResponse.json({
      message: 'Payment processed successfully',
      payment: {
        id: payment._id,
        amount: payment.amount,
        status: payment.status,
        transactionId: payment.transactionId,
      }
    }, { status: 201 });
  } catch (error: any) {
    console.error('Error processing payment:', error);
    return NextResponse.json(
      { message: error.message || 'Error processing payment' },
      { status: 500 }
    );
  }
}

// Get payment history
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    await dbConnect();
    
    const { searchParams } = new URL(req.url);
    const caseId = searchParams.get('caseId');
    
    const query: any = {};
    
    // If case ID is provided, filter by case
    if (caseId) {
      if (!Types.ObjectId.isValid(caseId)) {
        return NextResponse.json(
          { message: 'Invalid case ID' },
          { status: 400 }
        );
      }
      query.caseId = new Types.ObjectId(caseId);
    }
    
    // Regular users can only see their own payments
    if (session.user.role !== 'admin') {
      query.userId = new Types.ObjectId(session.user.id);
    }
    
    const payments = await Payment.find(query).sort({ createdAt: -1 });
    
    return NextResponse.json({ payments });
  } catch (error: any) {
    console.error('Error fetching payments:', error);
    return NextResponse.json(
      { message: error.message || 'Error fetching payments' },
      { status: 500 }
    );
  }
}

// Mock payment processing function (for demonstration)
function simulatePaymentProcessing(cardDetails: any): boolean {
  // In a real application, you would validate the card details
  // and send them to a payment processor like Stripe
  
  // For this mock function, we'll approve payments with some basic validation
  if (!cardDetails) return false;
  
  const { cardNumber, expiryDate, cvv, cardholderName } = cardDetails;
  
  if (!cardNumber || !expiryDate || !cvv || !cardholderName) {
    return false;
  }
  
  // Card number should be 16 digits
  if (!/^\d{16}$/.test(cardNumber.replace(/\s/g, ''))) {
    return false;
  }
  
  // CVV should be 3 or 4 digits
  if (!/^\d{3,4}$/.test(cvv)) {
    return false;
  }
  
  // Mock success rate of 90%
  return Math.random() < 0.9;
} 