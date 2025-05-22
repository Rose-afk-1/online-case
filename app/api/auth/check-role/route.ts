import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json(
        { message: 'Not authenticated', role: null },
        { status: 401 }
      );
    }
    
    return NextResponse.json({
      role: session.user.role
    });
  } catch (error: any) {
    console.error('Error checking role:', error);
    return NextResponse.json(
      { message: error.message || 'Error checking role', role: null },
      { status: 500 }
    );
  }
} 