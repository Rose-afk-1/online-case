import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import mongoose from 'mongoose';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/db';
import Case from '@/models/Case';
import Evidence from '@/models/Evidence';
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
    
    // Get total cases and cases by status
    const totalCases = await Case.countDocuments({ userId });
    
    // Count cases by status
    const casesByStatus = {
      pending: await Case.countDocuments({ userId, status: 'pending' }),
      approved: await Case.countDocuments({ userId, status: 'approved' }),
      rejected: await Case.countDocuments({ userId, status: 'rejected' }),
      inProgress: await Case.countDocuments({ userId, status: 'inProgress' }),
      completed: await Case.countDocuments({ userId, status: 'completed' })
    };
    
    // Count cases by type
    const casesByType = {
      civil: await Case.countDocuments({ userId, caseType: 'civil' }),
      criminal: await Case.countDocuments({ userId, caseType: 'criminal' }),
      family: await Case.countDocuments({ userId, caseType: 'family' }),
      other: await Case.countDocuments({ userId, caseType: { $nin: ['civil', 'criminal', 'family'] } })
    };
    
    // Get cases needing payment - check multiple possible payment status values
    const casesNeedingPayment = await Case.countDocuments({ 
      userId, 
      $or: [
        { paymentStatus: 'paymentRequired' },
        { paymentStatus: 'unpaid' },
        { paymentStatus: 'pending' }
      ]
    });
    
    // Get evidence uploads count
    const evidenceCount = await Evidence.countDocuments({ userId });

    // Get all user's case IDs
    const userCaseIds = await Case.find({ userId }).distinct('_id');
    console.log('User case IDs:', userCaseIds);
    
    // Debug: Count all hearings for user cases regardless of date
    const totalHearingsForUser = await Hearing.countDocuments({
      caseId: { $in: userCaseIds }
    });
    console.log('Total hearings found for user (any date):', totalHearingsForUser);
    
    // Debug: Check if hearings have correct field name (caseId vs case)
    const hearingsWithCaseId = await Hearing.countDocuments({
      caseId: { $in: userCaseIds }
    });
    console.log('Hearings with caseId field:', hearingsWithCaseId);
    
    // Get upcoming hearings with correct status
    const currentDate = new Date();
    console.log('Current date for comparison:', currentDate);
    
    const upcomingHearings = await Hearing.countDocuments({
      caseId: { $in: userCaseIds },
      date: { $gte: currentDate },
      status: { $in: ['scheduled', 'postponed'] }
    });
    console.log('Upcoming hearings count:', upcomingHearings);

    // Get all hearings for debugging
    const allHearings = await Hearing.find({
      caseId: { $in: userCaseIds }
    }).select('title date status caseId').lean();
    
    console.log('All hearings data:', JSON.stringify(allHearings, null, 2));
    
    // Get detailed hearing information
    const hearings = await Hearing
      .find({
        caseId: { $in: userCaseIds },
        date: { $gte: currentDate },
        status: { $in: ['scheduled', 'postponed'] }
      })
      .sort({ date: 1 })
      .limit(5)
      .populate('caseId', 'title caseNumber')
      .lean();
    
    // Get recent activity - most recent case updates
    const recentCases = await Case.find({ userId })
      .sort({ updatedAt: -1 })
      .limit(5)
      .select('_id title caseNumber status updatedAt');
    
    // Return the stats
    return NextResponse.json({
      totalCases,
      casesByStatus,
      casesByType,
      casesNeedingPayment,
      evidenceCount,
      upcomingHearings,
      recentActivity: {
        cases: recentCases,
        hearings
      }
    });
    
  } catch (error: any) {
    console.error('Error fetching user stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user stats' },
      { status: 500 }
    );
  }
} 