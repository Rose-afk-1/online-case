import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import mongoose from 'mongoose';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import Case from '@/models/Case';
import Hearing from '@/models/Hearing';
import Evidence from '@/models/Evidence';
import Payment from '@/models/Payment';

export async function GET(req: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Ensure user is an admin
    if (session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Connect to database
    await dbConnect();

    // Get total counts from different collections
    const [
      totalUsers,
      newUsersThisWeek,
      totalCases,
      pendingCases,
      activeCases,
      totalHearings,
      upcomingHearings,
      totalEvidence,
      pendingEvidence,
      totalPayments,
      completedPayments,
      pendingPayments,
      failedPayments,
    ] = await Promise.all([
      // Total users
      User.countDocuments({}),
      
      // New users in the last 7 days
      User.countDocuments({
        createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
      }),
      
      // Total cases
      Case.countDocuments({}),
      
      // Pending cases
      Case.countDocuments({ status: 'pending' }),
      
      // Active cases (approved and inProgress)
      Case.countDocuments({ 
        status: { $in: ['approved', 'inProgress'] }
      }),
      
      // Total hearings
      Hearing.countDocuments({}),
      
      // Upcoming hearings (scheduled for the future)
      Hearing.countDocuments({ 
        date: { $gte: new Date() },
        status: { $in: ['scheduled', 'postponed'] }
      }),
      
      // Total evidence
      Evidence.countDocuments({}),
      
      // Pending evidence (not yet approved)
      Evidence.countDocuments({ isApproved: false }),
      
      // Total payments
      Payment.countDocuments({}),
      
      // Completed payments
      Payment.countDocuments({ status: 'completed' }),
      
      // Pending payments
      Payment.countDocuments({ status: 'pending' }),
      
      // Failed payments
      Payment.countDocuments({ status: 'failed' })
    ]);

    // Return stats
    return NextResponse.json({
      users: {
        total: totalUsers,
        newThisWeek: newUsersThisWeek
      },
      cases: {
        total: totalCases,
        pending: pendingCases,
        active: activeCases
      },
      hearings: {
        total: totalHearings,
        upcoming: upcomingHearings
      },
      evidence: {
        total: totalEvidence,
        pending: pendingEvidence
      },
      payments: {
        total: totalPayments,
        completed: completedPayments,
        pending: pendingPayments,
        failed: failedPayments
      },
      timestamp: new Date()
    });
  } catch (error: any) {
    console.error('Error fetching admin stats:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch admin statistics' },
      { status: 500 }
    );
  }
} 