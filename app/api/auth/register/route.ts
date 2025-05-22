import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import { generateVerificationToken, setTokenExpiration } from '@/lib/tokens';

export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    
    const body = await req.json();
    const { name, email, password, phoneNumber, address } = body;
    
    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return NextResponse.json(
        { message: 'User with this email already exists' },
        { status: 400 }
      );
    }
    
    // Generate verification token and expiry
    const verificationToken = generateVerificationToken();
    const verificationTokenExpires = setTokenExpiration(24); // 24 hours
    
    // Create new user (default role is 'user')
    const user = await User.create({
      name,
      email,
      password,
      phoneNumber,
      address,
      isVerified: false,
      verificationToken,
      verificationTokenExpires
    });
    
    // Remove password and verification token from response
    const newUser = {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
      isVerified: user.isVerified
    };
    
    return NextResponse.json(
      { 
        message: 'User registered successfully. Please verify your account.',
        user: newUser 
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { message: error.message || 'Error registering user' },
      { status: 500 }
    );
  }
} 