import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import mongoose from 'mongoose';
import { authOptions } from '@/lib/auth';
import Hearing, { IHearing } from '@/models/Hearing';
import Case from '@/models/Case';
import User from '@/models/User';
import { sendHearingNotificationEmail } from '@/lib/email';

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
  context: { params: Promise<{ id: string }> }
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

    // Await the params promise to get the id
    const { id: hearingId } = await context.params;
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
  context: { params: Promise<{ id: string }> }
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

    // Await the params promise to get the id
    const { id: hearingId } = await context.params;
    const data = await req.json();

    // Find the hearing and populate case data for email
    const hearing = await Hearing.findById(hearingId).populate('caseId', 'caseNumber title userId');
    if (!hearing) {
      return NextResponse.json({ error: 'Hearing not found' }, { status: 404 });
    }

    // Store original values for email notification
    const originalStatus = hearing.status;
    const originalDate = new Date(hearing.date);

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
    
    // Check if we need to send an email notification
    const statusChanged = data.status && originalStatus !== data.status;
    const dateChanged = data.date && new Date(data.date).getTime() !== originalDate.getTime();
    
    if (statusChanged || dateChanged) {
      try {
        // Get case and user data for the email
        const caseData = await Case.findById(hearing.caseId);
        const user = await User.findById(caseData?.userId);
        
        if (user && caseData) {
          // Determine notification type
          let notificationType: 'scheduled' | 'postponed' | 'closed' | 'completed' | 'cancelled';
          
          // First check if date changed - this takes precedence over status
          if (dateChanged && hearing.status !== 'cancelled') {
            notificationType = 'postponed';
            console.log("Sending postponed notification due to date change");
          } 
          // Then check the current status
          else if (hearing.status === 'scheduled') {
            notificationType = 'scheduled';
            console.log("Sending scheduled notification");
          } else if (hearing.status === 'postponed') {
            notificationType = 'postponed';
            console.log("Sending postponed notification");
          } else if (hearing.status === 'completed') {
            notificationType = 'completed';
            console.log("Sending completed notification");
          } else if (hearing.status === 'cancelled') {
            notificationType = 'cancelled';
            console.log("Sending cancelled notification");
          } else {
            notificationType = 'closed';
            console.log("Sending closed notification");
          }
          
          console.log(`Preparing email data for hearing notification:
- User Email: ${user.email}
- User Name: ${user.name}
- Case Number: ${caseData.caseNumber}
- Case Title: ${caseData.title}
- Hearing Date: ${new Date(hearing.date).toISOString()}
- Hearing Time: ${hearing.time}
- Hearing Location: ${hearing.location}
- Notification Type: ${notificationType}
- Previous Date (if any): ${originalDate ? originalDate.toISOString() : 'none'}
- Notes/Reason: ${data.notes || hearing.notes || 'none'}`);
          
          await sendHearingNotificationEmail(
            user.email,
            user.name,
            caseData.caseNumber,
            caseData.title,
            new Date(hearing.date),
            hearing.time,
            hearing.location,
            notificationType,
            notificationType === 'postponed' ? originalDate : undefined,
            data.notes || hearing.notes
          );
          
          console.log(`Hearing ${notificationType} notification sent to ${user.email}`);
        }
      } catch (emailError) {
        console.error('Failed to send hearing update notification:', emailError);
        // Continue with the response even if email fails
      }
    }

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
  context: { params: Promise<{ id: string }> }
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

    // Await the params promise to get the id
    const { id: hearingId } = await context.params;
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