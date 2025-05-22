import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/db';
import Case from '@/models/Case';
import Hearing from '@/models/Hearing';
import Evidence from '@/models/Evidence';
import { Types } from 'mongoose';
import User from '@/models/User';

// Get a specific case
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      console.log('Unauthorized access attempt');
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    console.log('User accessing case:', {
      userId: session.user.id,
      userRole: session.user.role,
      isAdmin: session.user.role === 'admin'
    });
    
    await dbConnect();
    
    // Get case ID from params - await the params properly
    const paramsData = await params;
    const caseId = paramsData.id;
    console.log('Fetching case with ID:', caseId);
    
    // Validate case ID - more detailed error handling
    if (!caseId || caseId === 'undefined') {
      console.error('Missing case ID parameter');
      return NextResponse.json(
        { message: 'Missing case ID parameter' },
        { status: 400 }
      );
    }
    
    // Check if ID is valid MongoDB ObjectId
    if (!Types.ObjectId.isValid(caseId)) {
      console.error('Invalid case ID format:', caseId);
      return NextResponse.json(
        { message: 'Invalid case ID format' },
        { status: 400 }
      );
    }
    
    // Find the case and populate user data
    const caseData = await Case.findById(caseId)
      .populate({
        path: 'userId',
        select: 'name email phone address'
      });
    
    if (!caseData) {
      console.error('Case not found with ID:', caseId);
      return NextResponse.json(
        { message: 'Case not found' },
        { status: 404 }
      );
    }
    
    console.log('Case data retrieved:', {
      id: caseData._id,
      title: caseData.title,
      userId: caseData.userId._id.toString(),
      status: caseData.status,
      plaintiffs: caseData.plaintiffs || 'N/A',
      defendants: caseData.defendants || 'N/A',
      isUserMatch: caseData.userId._id.toString() === session.user.id
    });
    
    // Check if user has access to this case
    if (session.user.role !== 'admin' && caseData.userId._id.toString() !== session.user.id) {
      console.error('Access denied for user', session.user.id, 'to case', caseId);
      return NextResponse.json(
        { message: 'Access denied' },
        { status: 403 }
      );
    }
    
    // Get related hearings
    const hearings = await Hearing.find({ caseId: new Types.ObjectId(caseId) })
      .sort({ date: 1, time: 1 })
      .lean();
    
    // Get related evidence
    const evidence = await Evidence.find({ caseId: new Types.ObjectId(caseId) })
      .sort({ uploadedAt: -1 })
      .lean();
    
    console.log(`Found ${hearings.length} hearings and ${evidence.length} evidence items`);
    
    // Prepare response with all related data - ensure plaintiffs and defendants are included
    const responseData = {
      case: {
        ...caseData.toObject(),
        plaintiffs: caseData.plaintiffs || '',
        defendants: caseData.defendants || '',
        hearings,
        evidence
      }
    };
    
    return NextResponse.json(responseData);
  } catch (error: any) {
    console.error('Error fetching case:', error);
    return NextResponse.json(
      { message: error.message || 'Error fetching case' },
      { status: 500 }
    );
  }
}

// Update a case
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    if (!Types.ObjectId.isValid(params.id)) {
      return NextResponse.json(
        { message: 'Invalid case ID' },
        { status: 400 }
      );
    }
    
    await dbConnect();
    
    const updates = await req.json();
    
    // Get the case before update
    const existingCase = await Case.findById(params.id);
    
    if (!existingCase) {
      return NextResponse.json(
        { message: 'Case not found' },
        { status: 404 }
      );
    }
    
    // Check if user has permission (admin or owner)
    const isAdmin = session.user.role === 'admin';
    const isOwner = existingCase.userId.toString() === session.user.id.toString();
    
    if (!isAdmin && !isOwner) {
      return NextResponse.json(
        { message: 'You do not have permission to update this case' },
        { status: 403 }
      );
    }
    
    // Restrict what fields regular users can update
    if (!isAdmin) {
      // Regular users can only update certain fields
      const allowedUpdates = ['description', 'plaintiffs', 'defendants', 'reliefSought', 'value'];
      Object.keys(updates).forEach(key => {
        if (!allowedUpdates.includes(key)) {
          delete updates[key];
        }
      });
    }
    
    // Update the case
    const updatedCase = await Case.findByIdAndUpdate(
      params.id,
      { $set: updates },
      { new: true, runValidators: true }
    );
    

    
    return NextResponse.json({ 
      message: 'Case updated successfully',
      case: updatedCase 
    });
  } catch (error: any) {
    console.error('Error updating case:', error);
    return NextResponse.json(
      { message: error.message || 'Error updating case' },
      { status: 500 }
    );
  }
}

// Delete a case
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    await dbConnect();
    
    // Use await to properly access params in Next.js 15+
    const paramsData = await params;
    const caseId = paramsData.id;
    console.log('Processing case deletion request for ID:', caseId);
    
    // Validate case ID
    if (!caseId || caseId === 'undefined') {
      console.error('Missing case ID parameter');
      return NextResponse.json(
        { message: 'Missing case ID parameter' },
        { status: 400 }
      );
    }
    
    // Check if ID is valid MongoDB ObjectId
    if (!Types.ObjectId.isValid(caseId)) {
      console.error('Invalid case ID format:', caseId);
      return NextResponse.json(
        { message: 'Invalid case ID format' },
        { status: 400 }
      );
    }
    
    // Find the case to check ownership
    const caseData = await Case.findById(caseId);
    
    if (!caseData) {
      console.error('Case not found with ID:', caseId);
      return NextResponse.json(
        { message: 'Case not found' },
        { status: 404 }
      );
    }
    
    console.log('Case found, checking permissions:', {
      role: session.user.role,
      caseUserId: caseData.userId.toString(),
      sessionUserId: session.user.id,
      caseStatus: caseData.status
    });
    
    // Allow users to delete their own cases, or admins to delete any case
    if (session.user.role !== 'admin' && caseData.userId.toString() !== session.user.id) {
      console.error('Access denied: User does not own this case');
      return NextResponse.json(
        { message: 'Access denied' },
        { status: 403 }
      );
    }
    
    // Only allow deletion of cases that are in 'pending' or 'draft' status
    // This prevents users from deleting cases that are already in progress in the court system
    if (session.user.role !== 'admin' && 
        !['pending', 'draft'].includes(caseData.status)) {
      console.error('Cannot delete case with status:', caseData.status);
      return NextResponse.json(
        { message: 'Cannot delete a case that has been approved or is in progress' },
        { status: 403 }
      );
    }
    
    // Delete all related data
    // First, delete related hearings
    await Hearing.deleteMany({ caseId: caseData._id });
    
    // Then, delete related evidence
    await Evidence.deleteMany({ caseId: caseData._id });
    
    // Finally, delete the case itself
    await Case.findByIdAndDelete(caseId);
    
    console.log('Case and related data successfully deleted');
    
    return NextResponse.json({ 
      message: 'Case successfully deleted',
      success: true
    });
  } catch (error: any) {
    console.error('Error deleting case:', error);
    return NextResponse.json(
      { message: error.message || 'Error deleting case' },
      { status: 500 }
    );
  }
} 