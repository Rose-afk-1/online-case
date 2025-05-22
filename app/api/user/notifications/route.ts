import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/db';
import Case from '@/models/Case';
import Hearing from '@/models/Hearing';

export async function GET(req: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Connect to the database
    await dbConnect();
    
    const userId = session.user.id;
    
    // Get cases with payment required - check multiple possible payment status values
    const casesNeedingPayment = await Case.find({ 
      userId, 
      $or: [
        { paymentStatus: 'paymentRequired' },
        { paymentStatus: 'unpaid' },
        { paymentStatus: 'pending' }
      ]
    }).select('_id title caseNumber createdAt');
    
    // Get user case IDs
    const userCaseIds = await Case.find({ userId }).distinct('_id');
    
    // Get upcoming hearings
    const currentDate = new Date();
    const upcomingHearings = await Hearing.find({
      caseId: { $in: userCaseIds },
      date: { $gte: currentDate },
      status: { $in: ['scheduled', 'postponed'] }
    })
      .sort({ date: 1 })
      .limit(3)
      .populate('caseId', 'title caseNumber')
      .lean();
    
    // Get recently updated cases
    const recentCaseUpdates = await Case.find({
      userId,
      updatedAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } // Last 7 days
    }).select('_id title status caseNumber updatedAt');
    
    // Combine into notifications
    const notifications = [
      ...casesNeedingPayment.map(c => ({
        _id: `payment-${c._id}`,
        type: 'payment',
        title: 'Payment Required',
        message: `Payment required for case #${c.caseNumber}: ${c.title}`,
        caseId: c._id,
        createdAt: c.createdAt,
        link: `/user/cases/${c._id}/payment`
      })),
      ...upcomingHearings.map(h => ({
        _id: `hearing-${h._id}`,
        type: 'hearing',
        title: 'Upcoming Hearing',
        message: `Hearing scheduled for ${new Date(h.date).toLocaleDateString()} at ${h.time}: ${h.title}`,
        hearingId: h._id,
        caseId: h.case?._id,
        createdAt: h.createdAt,
        link: `/user/hearings/${h._id}`
      })),
      ...recentCaseUpdates.map(c => ({
        _id: `case-${c._id}`,
        type: 'case',
        title: 'Case Updated',
        message: `Case #${c.caseNumber} status changed to ${c.status}`,
        caseId: c._id,
        createdAt: c.updatedAt,
        link: `/user/cases/${c._id}`
      }))
    ];
    
    // Sort by date (newest first)
    notifications.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    
    return NextResponse.json({ notifications });
    
  } catch (error: any) {
    console.error('Error fetching notifications:', error);
    return NextResponse.json(
      { error: 'Failed to fetch notifications' },
      { status: 500 }
    );
  }
} 