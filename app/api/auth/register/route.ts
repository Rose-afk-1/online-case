import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import { sendWelcomeEmail } from '@/lib/email';
import { notifyAdminsOfNewUser } from '@/lib/admin';

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
    
    // Create new user (default role is 'user') - mark as verified by default
    const user = await User.create({
      name,
      email,
      password,
      phoneNumber,
      address,
      isVerified: true // Mark users as verified by default
    });
    
    // Send welcome email without verification link
    try {
      await sendWelcomeEmail(
        email,
        name
      );
      console.log(`Welcome email sent to ${email}`);
    } catch (emailError) {
      console.error('Failed to send welcome email:', emailError);
      // Don't return an error, just log it, as the user was created successfully
    }
    
    // Notify admins about new user registration
    try {
      await notifyAdminsOfNewUser({
        name,
        email,
        role: user.role,
        createdAt: user.createdAt
      });
    } catch (notificationError) {
      console.error('Failed to notify admins about new user:', notificationError);
      // Don't return an error, just log it
    }
    
    // Remove password from response
    const newUser = {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
      isVerified: user.isVerified
    };
    
    return NextResponse.json(
      { 
        message: 'User registered successfully.',
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