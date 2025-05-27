import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/db';
import Payment from '@/models/Payment';
import Case from '@/models/Case';
import User from '@/models/User';
import { generateInvoice } from '@/lib/invoiceGenerator';

// Generate and serve an invoice for a payment
export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    // Await the params promise to get the id
    const { id: paymentId } = await context.params;
    console.log('Invoice requested for payment:', paymentId);

    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      console.error('Unauthorized invoice request');
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    await dbConnect();

    // Fetch the payment details
    const payment = await Payment.findById(paymentId);
    if (!payment) {
      console.error('Payment not found:', paymentId);
      return NextResponse.json(
        { message: 'Payment not found' },
        { status: 404 }
      );
    }

    // Check authorization
    if (payment.userId.toString() !== session.user.id && session.user.role !== 'admin') {
      console.error('User not authorized to access this invoice');
      return NextResponse.json(
        { message: 'You do not have permission to access this invoice' },
        { status: 403 }
      );
    }

    // Fetch the case details
    const caseDetails = await Case.findById(payment.caseId);
    if (!caseDetails) {
      console.error('Case not found for payment:', payment.caseId);
      return NextResponse.json(
        { message: 'Case details not found' },
        { status: 404 }
      );
    }

    // Fetch user details
    const user = await User.findById(payment.userId);
    if (!user) {
      console.error('User not found for payment:', payment.userId);
      return NextResponse.json(
        { message: 'User details not found' },
        { status: 404 }
      );
    }

    // Generate invoice number (payment ID + timestamp)
    const invoiceNumber = `INV-${payment._id.toString().slice(-6)}-${Date.now().toString().slice(-6)}`;
    
    // Prepare invoice data
    const invoiceData = {
      invoiceNumber,
      date: payment.paymentDate || payment.createdAt,
      paymentId: payment._id.toString(),
      transactionId: payment.transactionId || payment.razorpayPaymentId || 'N/A',
      caseNumber: caseDetails.caseNumber,
      customerName: user.name || 'Case Filer',
      customerEmail: user.email,
      amount: payment.amount,
      currency: payment.currency,
      description: payment.description || `Filing fee for case ${caseDetails.caseNumber}`,
      paymentMethod: payment.paymentMethod
    };

    console.log('Generating invoice with data:', invoiceData);
    
    // Generate the PDF
    const pdfBuffer = await generateInvoice(invoiceData);

    // Set the filename for download
    const filename = `invoice_${caseDetails.caseNumber.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`;

    // Return the PDF with appropriate headers
    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `inline; filename="${filename}"`,
        'Content-Length': pdfBuffer.length.toString()
      }
    });
  } catch (error: any) {
    console.error('Error generating invoice:', error);
    return NextResponse.json(
      { message: error.message || 'Error generating invoice' },
      { status: 500 }
    );
  }
} 