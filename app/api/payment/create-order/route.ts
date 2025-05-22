import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/db';
import Case from '@/models/Case';
import Payment from '@/models/Payment';
import { Types } from 'mongoose';
import razorpay, { createOrder } from '@/lib/razorpay';

export async function POST(req: NextRequest) {
  try {
    console.log('Create order API called');
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      console.error('Unauthorized: No session or user');
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    await dbConnect();
    
    const body = await req.json();
    console.log('Request body:', body);
    
    // Required fields
    const { caseId, amount } = body;
    
    if (!caseId || !amount) {
      console.error('Missing required fields:', { caseId, amount });
      return NextResponse.json(
        { message: 'Missing required payment information' },
        { status: 400 }
      );
    }
    
    // Validate case exists and belongs to the user
    if (!Types.ObjectId.isValid(caseId)) {
      console.error('Invalid case ID format:', caseId);
      return NextResponse.json(
        { message: 'Invalid case ID' },
        { status: 400 }
      );
    }
    
    const caseData = await Case.findById(caseId);
    
    if (!caseData) {
      console.error('Case not found:', caseId);
      return NextResponse.json(
        { message: 'Case not found' },
        { status: 404 }
      );
    }
    
    console.log('Case found:', {
      id: caseData._id,
      userId: caseData.userId,
      currentUserId: session.user.id
    });
    
    if (caseData.userId.toString() !== session.user.id.toString() && session.user.role !== 'admin') {
      console.error('Permission denied: Case does not belong to user');
      return NextResponse.json(
        { message: 'You do not have permission to make payments for this case' },
        { status: 403 }
      );
    }
    
    // Convert amount to paise (Razorpay requires amount in smallest currency unit)
    const amountInPaise = Math.round(amount * 100);
    
    // Create a shorter receipt ID (must be less than 40 chars)
    // Using timestamp in base36 + last 6 chars of caseId
    const timestamp = Date.now().toString(36);
    const shortCaseId = caseId.toString().slice(-6);
    const receiptId = `rcpt_${timestamp}_${shortCaseId}`;

    console.log('Creating Razorpay order with options:', {
      amount: amountInPaise,
      currency: 'INR',
      receipt: receiptId
    });

    try {
      // Create order in Razorpay
      const orderOptions = {
        amount: amountInPaise,
        currency: 'INR',
        receipt: receiptId,
        notes: {
          caseId: caseId,
          caseNumber: caseData.caseNumber,
          userId: session.user.id
        }
      };

      // Call Razorpay API to create order
      const order = await createOrder(orderOptions);
      console.log('Razorpay order created:', order);
      
      // Create a pending payment record
      const payment = await Payment.create({
        caseId: new Types.ObjectId(caseId),
        userId: new Types.ObjectId(session.user.id),
        amount,
        currency: 'INR',
        paymentMethod: 'razorpay',
        status: 'pending',
        description: `Filing fee for case ${caseData.caseNumber}`,
        razorpayOrderId: order.id,
      });
      
      console.log('Payment record created:', {
        id: payment._id,
        status: payment.status,
        razorpayOrderId: order.id
      });
      
      const responseData = {
        message: 'Order created successfully',
        orderId: order.id,
        amount: amountInPaise,
        currency: 'INR',
        key: process.env.RAZORPAY_KEY_ID,
        paymentId: payment._id
      };
      
      console.log('Sending response:', responseData);
      return NextResponse.json(responseData, { status: 201 });
    } catch (razorpayError: any) {
      console.error('Razorpay order creation error:', razorpayError);
      return NextResponse.json(
        { message: `Razorpay error: ${razorpayError.message || 'Unknown error creating order'}` },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error('Error creating Razorpay order:', error);
    return NextResponse.json(
      { message: error.message || 'Error creating payment order' },
      { status: 500 }
    );
  }
} 