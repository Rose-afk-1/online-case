import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import mongoose from 'mongoose';
import { authOptions } from '@/lib/auth';
import Hearing from '@/models/Hearing';
import Case from '@/models/Case';
import { Types } from 'mongoose';
import User from '@/models/User';

// GET all hearings with pagination, filtering, and search
export async function GET(req: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check MongoDB connection
    if (mongoose.connection.readyState !== 1) {
      await mongoose.connect(process.env.MONGODB_URI as string);
    }

    // Extract query parameters
    const url = new URL(req.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '10');
    const status = url.searchParams.get('status');
    const caseId = url.searchParams.get('caseId');
    const search = url.searchParams.get('search');
    const startDate = url.searchParams.get('startDate');
    const endDate = url.searchParams.get('endDate');
    const sort = url.searchParams.get('sort') || 'date';
    const order = url.searchParams.get('order') || 'asc';

    // Skip calculation for pagination
    const skip = (page - 1) * limit;

    // Build query filter
    let filter: any = {};

    // If user is not admin, only show hearings for their cases
    if (session.user.role !== 'admin') {
      // Find all cases owned by the user
      const userCases = await Case.find({ userId: session.user.id }, '_id');
      const userCaseIds = userCases.map(c => c._id);
      
      // Only return hearings for the user's cases
      filter.caseId = { $in: userCaseIds };
    }

    // Add status filter if provided
    if (status) {
      filter.status = status;
    }

    // Add case filter if provided
    if (caseId) {
      filter.caseId = caseId;
    }

    // Add date range filter if provided
    if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = new Date(startDate);
      if (endDate) filter.date.$lte = new Date(endDate);
    }

    // Add search filter if provided
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { location: { $regex: search, $options: 'i' } },
        { judge: { $regex: search, $options: 'i' } },
        { notes: { $regex: search, $options: 'i' } }
      ];
    }

    // Set up sort options
    const sortOptions: any = {};
    sortOptions[sort] = order === 'desc' ? -1 : 1;

    // Count total hearings for pagination
    const total = await Hearing.countDocuments(filter);

    // Fetch hearings with pagination, sorting, and populate case details
    const hearings = await Hearing.find(filter)
      .populate('caseId', 'caseNumber title')
      .sort(sortOptions)
      .skip(skip)
      .limit(limit)
      .lean();

    // Return hearings with pagination metadata
    return NextResponse.json({
      hearings,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error: any) {
    console.error('Error fetching hearings:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch hearings' },
      { status: 500 }
    );
  }
}

// POST - create a new hearing
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // Only admin can create hearings
    if (session.user.role !== 'admin') {
      return NextResponse.json(
        { message: 'Only administrators can schedule hearings' },
        { status: 403 }
      );
    }
    
    await mongoose.connect(process.env.MONGODB_URI as string);
    
    const { caseId, date, time, location, type, notes } = await req.json();
    
    // Validate required fields
    if (!caseId || !date || !time || !location || !type) {
      return NextResponse.json(
        { message: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    // Validate case exists
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
    
    // Create hearing
    const hearing = await Hearing.create({
      caseId: new Types.ObjectId(caseId),
      date: new Date(date),
      time,
      location,
      type,
      notes,
      status: 'scheduled',
      createdBy: new Types.ObjectId(session.user.id),
    });
    
    return NextResponse.json(
      {
        message: 'Hearing scheduled successfully',
        hearing: {
          _id: hearing._id,
          caseId: hearing.caseId,
          date: hearing.date,
          time: hearing.time,
          location: hearing.location,
          type: hearing.type,
          status: hearing.status
        }
      },
      { status: 201 }
    );
    
  } catch (error: any) {
    console.error('Error creating hearing:', error);
    return NextResponse.json(
      { message: error.message || 'Error creating hearing' },
      { status: 500 }
    );
  }
} 