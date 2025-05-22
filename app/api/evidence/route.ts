import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/db';
import Evidence from '@/models/Evidence';
import Case from '@/models/Case';
import { Types } from 'mongoose';
import { writeFile } from 'fs/promises';
import path from 'path';
import { mkdir } from 'fs/promises';

// Create evidence (file upload)
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
    
    // Parse the FormData
    const formData = await req.formData();
    const title = formData.get('title') as string;
    const description = formData.get('description') as string;
    const caseId = formData.get('caseId') as string;
    const file = formData.get('file') as File;
    const evidenceType = formData.get('evidenceType') as string || 'document'; // Get evidenceType or default to 'document'
    
    if (!title || !caseId || !file) {
      return NextResponse.json(
        { message: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    // Validate case exists and belongs to the user
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
    
    if (caseData.userId.toString() !== session.user.id.toString() && session.user.role !== 'admin') {
      return NextResponse.json(
        { message: 'You do not have permission to add evidence to this case' },
        { status: 403 }
      );
    }
    
    // Check if payment is completed for this case
    if (caseData.paymentStatus !== 'paid' && session.user.role !== 'admin') {
      return NextResponse.json(
        { message: 'Payment must be completed before uploading evidence. Please complete the payment for this case first.' },
        { status: 403 }
      );
    }
    
    // Get file metadata
    const fileBytes = await file.arrayBuffer();
    const buffer = Buffer.from(fileBytes);
    const fileType = file.type;
    const fileSize = buffer.length;
    
    // Check file size (max 50MB)
    const maxFileSize = 50 * 1024 * 1024; // 50MB
    if (fileSize > maxFileSize) {
      return NextResponse.json(
        { message: 'File size exceeds the 50MB limit' },
        { status: 400 }
      );
    }
    
    // Validate file type
    const allowedTypes = [
      // Documents
      'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-powerpoint', 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'text/plain', 'application/rtf',
      // Images
      'image/jpeg', 'image/png', 'image/gif', 'image/bmp', 'image/tiff',
      // Videos
      'video/mp4', 'video/quicktime', 'video/x-msvideo', 'video/x-ms-wmv',
      // Audio
      'audio/mpeg', 'audio/wav', 'audio/ogg'
    ];
    
    if (!allowedTypes.includes(fileType)) {
      return NextResponse.json(
        { message: 'Unsupported file type. Please upload a document, image, video, or audio file.' },
        { status: 400 }
      );
    }
    
    // Create upload directory if it doesn't exist
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', caseId);
    
    try {
      await mkdir(uploadDir, { recursive: true });
    } catch (error) {
      console.error('Error creating directory:', error);
    }
    
    // Create a unique filename
    const timestamp = Date.now();
    const filename = `${timestamp}-${file.name.replace(/\s+/g, '-')}`;
    const filePath = path.join(uploadDir, filename);
    
    // Save the file
    await writeFile(filePath, buffer);
    
    // Relative path for browser access
    const fileUrl = `/uploads/${caseId}/${filename}`;
    
    // Create evidence record
    const evidence = await Evidence.create({
      caseId: new Types.ObjectId(caseId),
      userId: new Types.ObjectId(session.user.id),
      title,
      description,
      fileUrl,
      fileType,
      fileSize,
      evidenceType,
      uploadDate: new Date(),
      isApproved: false,
    });
    
    return NextResponse.json(
      { 
        message: 'Evidence uploaded successfully', 
        evidence: {
          _id: evidence._id,
          title: evidence.title,
          fileUrl: evidence.fileUrl,
          evidenceType: evidence.evidenceType
        } 
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Error uploading evidence:', error);
    return NextResponse.json(
      { message: error.message || 'Error uploading evidence' },
      { status: 500 }
    );
  }
}

// Get evidence (with filters)
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
    
    // Get query parameters
    const { searchParams } = new URL(req.url);
    const caseId = searchParams.get('caseId');
    
    // Build query
    const query: any = {};
    
    if (caseId) {
      if (!Types.ObjectId.isValid(caseId)) {
        return NextResponse.json(
          { message: 'Invalid case ID' },
          { status: 400 }
        );
      }
      query.caseId = new Types.ObjectId(caseId);
    }
    
    // Regular users can only see their own evidence or evidence for their cases
    if (session.user.role !== 'admin') {
      if (caseId) {
        // Check if the case belongs to the user
        const caseData = await Case.findById(caseId);
        
        if (!caseData) {
          return NextResponse.json(
            { message: 'Case not found' },
            { status: 404 }
          );
        }
        
        if (caseData.userId.toString() !== session.user.id.toString()) {
          return NextResponse.json(
            { message: 'You do not have permission to view evidence for this case' },
            { status: 403 }
          );
        }
      } else {
        // If no case ID provided, only show user's evidence
        query.userId = new Types.ObjectId(session.user.id);
      }
    }
    
    // Fetch evidence
    const evidence = await Evidence.find(query)
      .sort({ uploadDate: -1 })
      .select('_id title description fileUrl fileType fileSize uploadDate isApproved');
    
    return NextResponse.json({ evidence });
  } catch (error: any) {
    console.error('Error fetching evidence:', error);
    return NextResponse.json(
      { message: error.message || 'Error fetching evidence' },
      { status: 500 }
    );
  }
} 