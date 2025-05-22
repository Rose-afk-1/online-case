import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from '@/models/User';

// This is a special security code that should be stored in environment variables
// In a real application, this would be a strong, randomly generated code
const ADMIN_SECURITY_CODE = 'admin123secure'; // Replace with a real secure code in production

export async function POST(req: NextRequest) {
  try {
    // Parse request body
    const { name, email, password, securityCode } = await req.json();

    // Validate required fields
    if (!name || !email || !password || !securityCode) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Check if security code is valid
    if (securityCode !== ADMIN_SECURITY_CODE) {
      return NextResponse.json(
        { error: 'Invalid security code' },
        { status: 403 }
      );
    }

    // Connect to database
    if (mongoose.connection.readyState !== 1) {
      await mongoose.connect(process.env.MONGODB_URI as string);
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { error: 'Email already in use' },
        { status: 409 }
      );
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new admin user
    const newAdmin = new User({
      name,
      email,
      password: hashedPassword,
      role: 'admin',
      emailVerified: new Date(), // Auto-verify admin emails
    });

    await newAdmin.save();

    // Return success response (without password)
    const adminResponse = {
      id: newAdmin._id,
      name: newAdmin.name,
      email: newAdmin.email,
      role: newAdmin.role,
      createdAt: newAdmin.createdAt
    };

    return NextResponse.json(adminResponse, { status: 201 });
  } catch (error: any) {
    console.error('Error creating admin:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create admin account' },
      { status: 500 }
    );
  }
} 