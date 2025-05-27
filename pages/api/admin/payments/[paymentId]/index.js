import dbConnect from '../../../../../lib/db';
import Payment from '../../../../../models/Payment';
import User from '../../../../../models/User';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../../../../lib/auth';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
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

    const payment = await Payment.findById(paymentId)
      .populate('userId', 'name email phoneNumber address')
      .populate('caseId', 'caseNumber title description status plaintiffs defendants')
      .exec();

    if (!payment) {
      return res.status(404).json({ error: 'Payment not found' });
    }

    res.json({ payment });

  } catch (error) {
    console.error('Error fetching payment details:', error);
    res.status(500).json({ error: 'Failed to fetch payment details' });
  }
} 