import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/db';
import Case from '@/models/Case';
import Payment from '@/models/Payment';
import { Types } from 'mongoose';
import { verifyPaymentSignature } from '@/lib/razorpay';

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
    
    // Required fields from Razorpay webhook/frontend
    const { 
      paymentId,        // Our internal payment ID 
      razorpayPaymentId, // Razorpay's payment ID
      razorpayOrderId,   // Razorpay's order ID
      razorpaySignature  // Signature from Razorpay
    } = body;
    
    if (!paymentId || !razorpayPaymentId || !razorpayOrderId || !razorpaySignature) {
      return NextResponse.json(
        { message: 'Missing required payment verification information' },
        { status: 400 }
      );
    }
    
    // Find the payment record
    if (!Types.ObjectId.isValid(paymentId)) {
      return NextResponse.json(
        { message: 'Invalid payment ID' },
        { status: 400 }
      );
    }
    
    const payment = await Payment.findById(paymentId);
    
    if (!payment) {
      return NextResponse.json(
        { message: 'Payment record not found' },
        { status: 404 }
      );
    }
    
    // Verify that the payment belongs to the user or is admin
    if (payment.userId.toString() !== session.user.id && session.user.role !== 'admin') {
      return NextResponse.json(
        { message: 'You do not have permission to verify this payment' },
        { status: 403 }
      );
    }
    
    // Verify Razorpay signature to ensure payment is authentic
    const isValidSignature = verifyPaymentSignature({
      order_id: razorpayOrderId,
      payment_id: razorpayPaymentId,
      signature: razorpaySignature
    });
    
    if (!isValidSignature) {
      // Update payment status to failed if signature verification fails
      await Payment.findByIdAndUpdate(paymentId, {
        status: 'failed',
        razorpayPaymentId,
        razorpayOrderId,
        razorpaySignature
      });
      
      return NextResponse.json(
        { message: 'Payment verification failed. Invalid signature.' },
        { status: 400 }
      );
    }
    
    // Update payment record with verified information
    const updatedPayment = await Payment.findByIdAndUpdate(
      paymentId,
      {
        status: 'completed',
        razorpayPaymentId,
        razorpayOrderId,
        razorpaySignature,
        transactionId: razorpayPaymentId,
        paymentDate: new Date()
      },
      { new: true }
    );
    
    // Update case payment status
    await Case.findByIdAndUpdate(
      payment.caseId,
      {
        paymentStatus: 'paid',
        paymentId: payment._id,
      }
    );
    
    // Generate invoice URL
    const invoiceUrl = `/api/payment/invoice/${paymentId}`;
    
    // Update receipt URL in payment
    await Payment.findByIdAndUpdate(
      paymentId,
      { receiptUrl: invoiceUrl }
    );
    
    return NextResponse.json({
      message: 'Payment verified successfully',
      payment: {
        id: updatedPayment._id,
        amount: updatedPayment.amount,
        status: updatedPayment.status,
        transactionId: updatedPayment.transactionId,
        receiptUrl: invoiceUrl,
        invoiceUrl: invoiceUrl
      }
    });
    
  } catch (error: any) {
    console.error('Error verifying payment:', error);
    return NextResponse.json(
      { message: error.message || 'Error verifying payment' },
      { status: 500 }
    );
  }
} 