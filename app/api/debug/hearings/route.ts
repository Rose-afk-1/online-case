import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Hearing from '@/models/Hearing';
import Case from '@/models/Case';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { Types } from 'mongoose';

interface UserSession {
  user?: {
    id: string;
    role: string;
    isAdmin?: boolean;
    name?: string | null;
    email?: string | null;
  };
}

interface HearingDocument {
  _id: Types.ObjectId;
  case?: Types.ObjectId;
  title?: string;
  date?: Date;
  time?: string;
  [key: string]: any;
}

interface CaseDocument {
  _id: Types.ObjectId;
  [key: string]: any;
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions) as UserSession;
    
    // Only allow admins or in development mode
    if (!session?.user?.isAdmin && process.env.NODE_ENV !== 'development') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Connect to database
    await connectDB();
    
    // Fetch all hearings and cases
    const allHearings = await Hearing.find().lean() as HearingDocument[];
    const allCases = await Case.find().lean() as CaseDocument[];
    
    // Get hearing data structure (field names)
    const hearingFields = allHearings.length > 0 
      ? Object.keys(allHearings[0]) 
      : [];
    
    // Validate hearings against cases
    const caseIds = new Set(allCases.map(c => c._id.toString()));
    
    const validHearings: HearingDocument[] = [];
    const invalidHearings: HearingDocument[] = [];
    
    allHearings.forEach(hearing => {
      const hearingCaseId = hearing.case?.toString();
      
      if (hearingCaseId && caseIds.has(hearingCaseId)) {
        validHearings.push(hearing);
      } else {
        invalidHearings.push(hearing);
      }
    });
    
    // Prepare response with detailed information
    return NextResponse.json({
      totalHearings: allHearings.length,
      totalCases: allCases.length,
      hearingStructure: hearingFields,
      validHearings: validHearings.length,
      invalidHearings: invalidHearings.length,
      sampleHearing: allHearings.length > 0 ? allHearings[0] : null,
      hearingsWithValidCases: validHearings.slice(0, 5),
      hearingsWithInvalidCases: invalidHearings.slice(0, 5)
    });
    
  } catch (error: unknown) {
    console.error('Debug hearings error:', error);
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
} 