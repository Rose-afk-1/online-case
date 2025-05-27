import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import { generateVerificationToken, setTokenExpiration } from '@/lib/tokens';
import { sendWelcomeEmail } from '@/lib/email';

export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    
    const body = await req.json();
    const { email } = body;
    
    if (!email) {
      return NextResponse.json(
        { message: 'Email is required' },
        { status: 400 }
      );
    }
    
    // Find user by email
    const user = await User.findOne({ email });
    
    if (!user) {
      return NextResponse.json(
        { message: 'User not found' },
        { status: 404 }
      );
    }
    
    // If user is already verified, no need to resend
    if (user.isVerified) {
      return NextResponse.json(
        { message: 'Your email is already verified' },
        { status: 400 }
      );
    }
    
    // Generate new verification token and expiry
    const verificationToken = generateVerificationToken();
    const verificationTokenExpires = setTokenExpiration(24); // 24 hours
    
    // Update user with new token
    user.verificationToken = verificationToken;
    user.verificationTokenExpires = verificationTokenExpires;
    await user.save();
    
    // Send verification email
    try {
      await sendWelcomeEmail(
        user.email,
        user.name
      );
      console.log(`Verification email resent to ${user.email}`);
    } catch (emailError) {
      console.error('Failed to send verification email:', emailError);
      return NextResponse.json(
        { message: 'Error sending verification email' },
        { status: 500 }
      );
    }
    
    return NextResponse.json(
      { message: 'Verification email has been sent' },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Error resending verification email:', error);
    return NextResponse.json(
      { message: error.message || 'Error resending verification email' },
      { status: 500 }
    );
  }
} 