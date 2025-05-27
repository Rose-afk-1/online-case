import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const token = url.searchParams.get('token');
    
    if (!token) {
      return NextResponse.json(
        { message: 'Verification token is required' },
        { status: 400 }
      );
    }
    
    await dbConnect();
    
    // Find user with the token
    const user = await User.findOne({
      verificationToken: token,
      verificationTokenExpires: { $gt: new Date() }, // Check if token is still valid
    });
    
    if (!user) {
      return NextResponse.json(
        { message: 'Invalid or expired verification token' },
        { status: 400 }
      );
    }
    
    // Mark user as verified and remove verification token
    user.isVerified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpires = undefined;
    await user.save();
    
    // Redirect to home page with success message
    const redirectUrl = new URL('/', process.env.NEXTAUTH_URL || 'http://localhost:3000');
    redirectUrl.searchParams.set('verified', 'true');
    
    return NextResponse.redirect(redirectUrl);
  } catch (error: any) {
    console.error('Email verification error:', error);
    return NextResponse.json(
      { message: error.message || 'Error verifying email' },
      { status: 500 }
    );
  }
} 