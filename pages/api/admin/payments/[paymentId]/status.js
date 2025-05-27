import dbConnect from '../../../../../lib/db';
import Payment from '../../../../../models/Payment';
import Case from '../../../../../models/Case';
import User from '../../../../../models/User';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../../../../lib/auth';

export default async function handler(req, res) {
  if (req.method !== 'PUT') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    await dbConnect();

    // Verify admin session
    const session = await getServerSession(req, res, authOptions);
    if (!session) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    if (session.user?.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const { paymentId } = req.query;
    const { status, notes } = req.body;

    const validStatuses = ['pending', 'completed', 'failed', 'refunded'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const payment = await Payment.findByIdAndUpdate(
      paymentId,
      { 
        status,
        adminNotes: notes,
        statusUpdatedBy: session.user.id,
        statusUpdatedAt: new Date()
      },
      { new: true }
    ).populate('caseId');

    if (!payment) {
      return res.status(404).json({ error: 'Payment not found' });
    }

    // Update case payment status if needed
    if (payment.caseId) {
      await Case.findByIdAndUpdate(payment.caseId._id, {
        paymentStatus: status
      });
    }

    res.json({ 
      message: 'Payment status updated successfully',
      payment 
    });

  } catch (error) {
    console.error('Error updating payment status:', error);
    res.status(500).json({ error: 'Failed to update payment status' });
  }
} 