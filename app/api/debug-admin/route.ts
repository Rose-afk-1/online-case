import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import bcrypt from 'bcryptjs';

export async function POST(req: NextRequest) {
  try {
    // Only allow in development
    if (process.env.NODE_ENV === 'production') {
      return NextResponse.json(
        { error: 'Debug endpoints not available in production' },
        { status: 403 }
      );
    }

    const { email, newPassword } = await req.json();
    
    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    // Connect to the database
    await dbConnect();

    // Find the user by email
    const user = await User.findOne({ email });
    
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Get current information
    const userInfo = {
      id: user._id.toString(),
      email: user.email,
      name: user.name,
      role: user.role,
      passwordHash: user.password.substring(0, 10) + '...' // Only show part of hash for security
    };

    let updateData: any = {};
    
    // If new password provided, update it
    if (newPassword) {
      const salt = await bcrypt.genSalt(10);
      updateData.password = await bcrypt.hash(newPassword, salt);
    }

    // Make sure the user is an admin
    if (user.role !== 'admin') {
      updateData.role = 'admin';
    }

    // Only update if we have something to update
    if (Object.keys(updateData).length > 0) {
      await User.updateOne({ _id: user._id }, updateData);
      return NextResponse.json({
        message: 'Admin user updated successfully',
        before: userInfo,
        updated: {
          password: !!newPassword,
          role: user.role !== 'admin' ? 'admin' : user.role
        }
      });
    }

    return NextResponse.json({
      message: 'No changes needed',
      user: userInfo
    });
  } catch (error: any) {
    console.error('Error in debug-admin route:', error);
    return NextResponse.json(
      { error: error.message || 'An error occurred' },
      { status: 500 }
    );
  }
} 