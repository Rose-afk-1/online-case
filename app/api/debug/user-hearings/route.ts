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
    email?: string | null;
    name?: string | null;
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
  title?: string;
  status?: string;
  [key: string]: any;
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions) as UserSession;
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const userId = session.user.id;
    
    // Connect to database
    await connectDB();
    
    // Get all user's cases
    const userCases = await Case.find({ userId }).lean() as CaseDocument[];
    const userCaseIds = userCases.map(c => c._id);
    
    // Find all hearings associated with the user's cases
    const userHearings = await Hearing.find({
      case: { $in: userCaseIds }
    }).lean() as HearingDocument[];
    
    // Get today's date and 30 days later for reference
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const thirtyDaysLater = new Date();
    thirtyDaysLater.setDate(today.getDate() + 30);
    thirtyDaysLater.setHours(23, 59, 59, 999);
    
    // Categorize hearings
    const upcomingHearings = userHearings.filter(h => {
      const hearingDate = h.date ? new Date(h.date) : null;
      return hearingDate && hearingDate >= today && hearingDate <= thirtyDaysLater;
    });
    
    const pastHearings = userHearings.filter(h => {
      const hearingDate = h.date ? new Date(h.date) : null;
      return hearingDate && hearingDate < today;
    });
    
    const futureHearings = userHearings.filter(h => {
      const hearingDate = h.date ? new Date(h.date) : null;
      return hearingDate && hearingDate > thirtyDaysLater;
    });
    
    const hearingsWithoutDates = userHearings.filter(h => !h.date);
    
    // Add case data to hearings
    const caseMap = new Map(userCases.map(c => [c._id.toString(), c]));
    
    const addCaseInfo = (hearing: HearingDocument) => {
      const caseId = hearing.case?.toString();
      return {
        ...hearing,
        caseInfo: caseId ? caseMap.get(caseId) : 'No associated case'
      };
    };
    
    return NextResponse.json({
      userId: userId,
      totalCases: userCases.length,
      totalHearings: userHearings.length,
      dateRange: {
        from: today.toISOString(),
        to: thirtyDaysLater.toISOString()
      },
      counts: {
        upcoming: upcomingHearings.length,
        past: pastHearings.length,
        future: futureHearings.length,
        withoutDates: hearingsWithoutDates.length
      },
      hearings: {
        upcoming: upcomingHearings.map(addCaseInfo),
        past: pastHearings.map(addCaseInfo).slice(0, 5),
        future: futureHearings.map(addCaseInfo).slice(0, 5),
        withoutDates: hearingsWithoutDates.map(addCaseInfo)
      }
    });
  } catch (error: unknown) {
    console.error('Debug user hearings error:', error);
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
} 