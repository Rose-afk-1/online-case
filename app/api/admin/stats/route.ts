import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import mongoose from 'mongoose';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import Case from '@/models/Case';
import Hearing from '@/models/Hearing';

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
      totalHearings,
      upcomingHearings,
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
      
      // Total hearings
      Hearing.countDocuments({}),
      
      // Upcoming hearings (scheduled for the future)
      Hearing.countDocuments({ 
        date: { $gte: new Date() },
        status: { $in: ['scheduled', 'postponed'] }
      })
    ]);

    // Return stats
    return NextResponse.json({
      users: {
        total: totalUsers,
        newThisWeek: newUsersThisWeek
      },
      cases: {
        total: totalCases,
        pending: pendingCases
      },
      hearings: {
        total: totalHearings,
        upcoming: upcomingHearings
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