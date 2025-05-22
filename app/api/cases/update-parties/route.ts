import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/db';
import Case from '@/models/Case';
import mongoose from 'mongoose';

// Update plaintiffs and defendants for a case
export async function POST(req: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Connect to database
    await dbConnect();

    // Get request body
    const body = await req.json();
    const { caseId, plaintiffs, defendants } = body;

    console.log('Updating case parties:', {
      caseId,
      plaintiffsLength: plaintiffs?.length || 0,
      defendantsLength: defendants?.length || 0
    });

    // Validate caseId
    if (!caseId || !mongoose.Types.ObjectId.isValid(caseId)) {
      return NextResponse.json(
        { message: 'Invalid case ID' },
        { status: 400 }
      );
    }

    // Find the case
    const caseRecord = await Case.findById(caseId);
    if (!caseRecord) {
      return NextResponse.json(
        { message: 'Case not found' },
        { status: 404 }
      );
    }

    // Check if user is authorized to update this case
    const userId = session.user.id;
    const isAdmin = session.user.role === 'admin';

    if (!isAdmin && caseRecord.userId.toString() !== userId) {
      return NextResponse.json(
        { message: 'You are not authorized to update this case' },
        { status: 403 }
      );
    }

    // Check if there are updates
    if (plaintiffs === undefined && defendants === undefined) {
      return NextResponse.json(
        { message: 'No updates specified' },
        { status: 400 }
      );
    }

    // Prepare update object
    const updates: any = {};
    if (plaintiffs !== undefined) {
      updates.plaintiffs = plaintiffs;
    }
    if (defendants !== undefined) {
      updates.defendants = defendants;
    }

    // Update the case
    console.log(`Updating case ${caseId} with:`, updates);
    const updatedCase = await Case.findByIdAndUpdate(
      caseId,
      { $set: updates },
      { new: true }
    );

    return NextResponse.json({
      message: 'Case updated successfully',
      case: updatedCase
    });
  } catch (error) {
    console.error('Error updating case parties:', error);
    return NextResponse.json(
      { message: 'Failed to update case parties' },
      { status: 500 }
    );
  }
} 