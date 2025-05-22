import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import mongoose from 'mongoose';
import { authOptions } from '@/lib/auth';
import Hearing, { IHearing } from '@/models/Hearing';
import Case from '@/models/Case';

// Interface for populated case data
interface PopulatedCase {
  _id: mongoose.Types.ObjectId;
  caseNumber: string;
  title: string;
  userId: mongoose.Types.ObjectId;
}

// Interface for populated hearing document
interface PopulatedHearing extends Omit<IHearing, 'caseId'> {
  caseId: PopulatedCase;
}

// GET a specific hearing
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const hearingId = params.id;
    const hearing = await Hearing.findById(hearingId)
      .populate('caseId', 'caseNumber title userId')
      .lean();

    if (!hearing) {
      return NextResponse.json({ error: 'Hearing not found' }, { status: 404 });
    }

    // Check permissions - admins can see all hearings, users can only see their own
    if (session.user.role !== 'admin') {
      // Type assertion for populated hearing
      const populatedHearing = hearing as unknown as PopulatedHearing;
      
      if (!populatedHearing.caseId || populatedHearing.caseId.userId.toString() !== session.user.id) {
        return NextResponse.json({ error: 'Not authorized to access this hearing' }, { status: 403 });
      }
    }

    return NextResponse.json(hearing);
  } catch (error: any) {
    console.error('Error fetching hearing:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch hearing' },
      { status: 500 }
    );
  }
}

// PATCH - update a hearing
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Only admins can update hearings
    if (session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Only administrators can update hearings' },
        { status: 403 }
      );
    }

    // Check MongoDB connection
    if (mongoose.connection.readyState !== 1) {
      await mongoose.connect(process.env.MONGODB_URI as string);
    }

    const hearingId = params.id;
    const data = await req.json();

    // Find the hearing
    const hearing = await Hearing.findById(hearingId);
    if (!hearing) {
      return NextResponse.json({ error: 'Hearing not found' }, { status: 404 });
    }

    // If changing the case, verify the new case exists
    if (data.caseId && data.caseId !== hearing.caseId.toString()) {
      const caseExists = await Case.findById(data.caseId);
      if (!caseExists) {
        return NextResponse.json({ error: 'Case not found' }, { status: 404 });
      }
    }

    // Update fields
    Object.keys(data).forEach((key) => {
      if (data[key] !== undefined && key !== '_id') {
        (hearing as any)[key] = data[key];
      }
    });

    await hearing.save();

    return NextResponse.json(hearing);
  } catch (error: any) {
    console.error('Error updating hearing:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update hearing' },
      { status: 500 }
    );
  }
}

// DELETE - remove a hearing
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Only admins can delete hearings
    if (session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Only administrators can delete hearings' },
        { status: 403 }
      );
    }

    // Check MongoDB connection
    if (mongoose.connection.readyState !== 1) {
      await mongoose.connect(process.env.MONGODB_URI as string);
    }

    const hearingId = params.id;
    const hearing = await Hearing.findById(hearingId);
    
    if (!hearing) {
      return NextResponse.json({ error: 'Hearing not found' }, { status: 404 });
    }

    await Hearing.findByIdAndDelete(hearingId);

    return NextResponse.json({ message: 'Hearing deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting hearing:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to delete hearing' },
      { status: 500 }
    );
  }
} 