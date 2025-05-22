import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/db';
import Evidence from '@/models/Evidence';
import Case from '@/models/Case';
import { Types } from 'mongoose';
import { unlink } from 'fs/promises';
import path from 'path';
import User from '@/models/User';

// Get a single evidence item
export async function GET(
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
    
    const { id } = params;
    
    if (!Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { message: 'Invalid evidence ID' },
        { status: 400 }
      );
    }
    
    const evidence = await Evidence.findById(id).populate({
      path: 'caseId',
      select: 'title caseNumber userId'
    });
    
    if (!evidence) {
      return NextResponse.json(
        { message: 'Evidence not found' },
        { status: 404 }
      );
    }
    
    // Check if user has permission to view this evidence
    if (session.user.role !== 'admin') {
      const caseData = await Case.findById(evidence.caseId);
      
      if (caseData?.userId.toString() !== session.user.id && 
          evidence.userId.toString() !== session.user.id) {
        return NextResponse.json(
          { message: 'You do not have permission to view this evidence' },
          { status: 403 }
        );
      }
    }
    
    return NextResponse.json({ evidence });
  } catch (error: any) {
    console.error('Error fetching evidence:', error);
    return NextResponse.json(
      { message: error.message || 'Error fetching evidence' },
      { status: 500 }
    );
  }
}

// Update evidence (approve/reject)
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
    
    // Only admins can approve/reject evidence
    if (session.user.role !== 'admin') {
      return NextResponse.json(
        { message: 'Only administrators can approve or reject evidence' },
        { status: 403 }
      );
    }
    
    if (!Types.ObjectId.isValid(params.id)) {
      return NextResponse.json(
        { message: 'Invalid evidence ID' },
        { status: 400 }
      );
    }
    
    await dbConnect();
    
    // Get updates from request
    const updates = await req.json();
    
    // Get evidence first to check if it exists and for notifying user
    const evidence = await Evidence.findById(params.id).populate('caseId');
    
    if (!evidence) {
      return NextResponse.json(
        { message: 'Evidence not found' },
        { status: 404 }
      );
    }
    
    // Only allow updates to isApproved, notes, and approval fields
    const allowedUpdates = ['isApproved', 'notes', 'tags'];
    const filteredUpdates: any = {};
    
    Object.keys(updates).forEach(key => {
      if (allowedUpdates.includes(key)) {
        filteredUpdates[key] = updates[key];
      }
    });
    
    // If approving evidence, add approval details
    if ('isApproved' in filteredUpdates) {
      filteredUpdates.approvedBy = session.user.id;
      filteredUpdates.approvalDate = new Date();
    }
    
    // Update the evidence
    const updatedEvidence = await Evidence.findByIdAndUpdate(
      params.id,
      { $set: filteredUpdates },
      { new: true }
    );
    
    return NextResponse.json({
      message: 'Evidence updated successfully',
      evidence: updatedEvidence
    });
  } catch (error: any) {
    console.error('Error updating evidence:', error);
    return NextResponse.json(
      { message: error.message || 'Error updating evidence' },
      { status: 500 }
    );
  }
} 