import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/db';
import Case from '@/models/Case';
import User from '@/models/User';
import { Types } from 'mongoose';
import { sendAdminNotificationEmail, sendCaseFilingConfirmationEmail } from '@/lib/email';
import { calculateFilingFee } from '@/lib/utils';


// Create a new case
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
    const { title, description, category, plaintiffs, defendants, reliefSought, value, caseType } = body;
    
    // Validate required fields
    if (!title) {
      return NextResponse.json(
        { message: 'Case title is required' },
        { status: 400 }
      );
    }
    
    // Required fields
    const requiredFields = ['plaintiffs', 'defendants'];
    const missingFields = requiredFields.filter(field => !body[field]);
    
    if (missingFields.length > 0) {
      return NextResponse.json(
        { message: `Missing required fields: ${missingFields.join(', ')}` },
        { status: 400 }
      );
    }
    
    // Convert caseType to lowercase to match schema enum values
    const normalizedCaseType = caseType ? caseType.toLowerCase() : 'civil';
    
    // Generate a unique case number (using current date + random string)
    const currentDate = new Date();
    const year = currentDate.getFullYear();
    const randomString = Math.random().toString(36).substring(2, 8).toUpperCase();
    const caseNumber = `CASE-${year}-${randomString}`;
    
    // Create the case with appropriate data
    const newCase = await Case.create({
      caseNumber,
      title,
      description,
      category,
      plaintiffs,
      defendants,
      reliefSought,
      value: Number(value) || 0,
      filingFee: calculateFilingFee(normalizedCaseType),
      status: 'pending',
      userId: new Types.ObjectId(session.user.id),
      filingDate: new Date(),
      caseType: normalizedCaseType,
      paymentStatus: 'unpaid' // Default to unpaid to require payment for evidence uploads
    });
    
    // Send email notifications after successful case creation
    try {
      // Send notification to admins about new case
      const adminUsers = await User.find({ role: 'admin' }).select('email');
      const adminEmails = adminUsers.map(admin => admin.email);
      
      if (adminEmails.length > 0) {
        await sendAdminNotificationEmail(
          adminEmails,
          `New Case Filed: ${newCase.caseNumber}`,
          'new_case',
          {
            caseNumber: newCase.caseNumber,
            title: newCase.title,
            userId: newCase._id,
            filedBy: session.user.name || session.user.email,
            filedAt: newCase.filingDate
          }
        );
        console.log(`Admin notification sent for new case: ${newCase.caseNumber}`);
      }
      
      // Send confirmation email to the user
      const userData = await User.findById(session.user.id);
      if (userData && userData.email) {
        await sendCaseFilingConfirmationEmail(
          userData.email,
          userData.name || 'User',
          newCase.caseNumber,
          newCase.title,
          newCase.filingDate,
          newCase.filingFee
        );
        console.log(`Confirmation email sent to user: ${userData.email}`);
      }
      
    } catch (emailError) {
      console.error('Failed to send case filing notifications:', emailError);
      // Don't fail the case creation if email fails
    }
    
    return NextResponse.json(
      {
        message: 'Case created successfully',
        case: {
          _id: newCase._id,
          caseNumber: newCase.caseNumber,
          title: newCase.title,
          status: newCase.status,
          filingDate: newCase.filingDate,
          filingFee: newCase.filingFee
        }
      },
      { status: 201 }
    );
    
  } catch (error: any) {
    console.error('Error creating case:', error);
    return NextResponse.json(
      { message: error.message || 'Error creating case' },
      { status: 500 }
    );
  }
}

// Get cases (with filtering)
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    await dbConnect();
    
    const { searchParams } = new URL(req.url);
    const query: any = {};
    
    // Apply filters based on query parameters
    const statusFilter = searchParams.get('status');
    const caseTypeFilter = searchParams.get('caseType');
    const search = searchParams.get('search');
    const paymentStatusFilter = searchParams.get('paymentStatus');
    
    if (statusFilter) {
      query.status = statusFilter.toLowerCase();
    }
    
    if (caseTypeFilter) {
      query.caseType = caseTypeFilter.toLowerCase();
    }
    
    if (paymentStatusFilter) {
      // Handle the consolidated payment status
      if (paymentStatusFilter === 'paymentRequired') {
        query.paymentStatus = { $in: ['unpaid', 'pending'] };
      } else {
        query.paymentStatus = paymentStatusFilter.toLowerCase();
      }
    }
    
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { caseNumber: { $regex: search, $options: 'i' } },
        { plaintiffs: { $regex: search, $options: 'i' } },
        { defendants: { $regex: search, $options: 'i' } }
      ];
    }
    
    // Admin can see all cases, normal users can only see their own cases
    if (session.user.role !== 'admin') {
      query.userId = new Types.ObjectId(session.user.id);
    }
    
    console.log('User role:', session.user.role);
    console.log('Query filters:', query);
    
    // Get pagination parameters
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;
    
    // Get sort parameters
    const sortField = searchParams.get('sortField') || 'filingDate';
    const sortOrder = searchParams.get('sortOrder') === 'asc' ? 1 : -1;
    const sort: any = {};
    sort[sortField] = sortOrder;
    
    // Execute query with pagination
    const cases = await Case.find(query)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .populate({
        path: 'userId',
        select: 'name email' // Include only necessary fields
      });
    
    console.log(`Found ${cases.length} cases matching query`);
    
    // Get total count for pagination
    const totalCases = await Case.countDocuments(query);
    
    return NextResponse.json({
      cases,
      pagination: {
        total: totalCases,
        page,
        limit,
        totalPages: Math.ceil(totalCases / limit)
      }
    });
  } catch (error: any) {
    console.error('Error fetching cases:', error);
    return NextResponse.json(
      { message: error.message || 'Error fetching cases' },
      { status: 500 }
    );
  }
} 