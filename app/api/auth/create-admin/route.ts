import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import path from 'path';
import { mkdir, writeFile } from 'fs/promises';

// Security code that must be provided to create an admin account
// In a real application, this would be stored securely and possibly rotated periodically
const ADMIN_SECURITY_CODE = "ADM1N-S3CUR3-C0D3-2023";

export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    
    // Parse the FormData
    const formData = await req.formData();
    const name = formData.get('name') as string;
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const securityCode = formData.get('securityCode') as string;
    const idPhoto = formData.get('idPhoto') as File;
    
    if (!name || !email || !password || !securityCode || !idPhoto) {
      return NextResponse.json(
        { message: 'All fields including security code and ID photo are required' },
        { status: 400 }
      );
    }

    // Verify the security code
    if (securityCode !== ADMIN_SECURITY_CODE) {
      return NextResponse.json(
        { message: 'Invalid security code. Admin account creation denied.' },
        { status: 403 }
      );
    }
    
    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return NextResponse.json(
        { message: 'User with this email already exists' },
        { status: 400 }
      );
    }
    
    // Process and save the ID photo
    const fileBytes = await idPhoto.arrayBuffer();
    const buffer = Buffer.from(fileBytes);
    
    // Create upload directory if it doesn't exist
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'admin-verification');
    
    try {
      await mkdir(uploadDir, { recursive: true });
    } catch (error) {
      console.error('Error creating directory:', error);
    }
    
    // Create a unique filename
    const timestamp = Date.now();
    const filename = `${timestamp}-${idPhoto.name.replace(/\s+/g, '-')}`;
    const filePath = path.join(uploadDir, filename);
    
    // Save the file
    await writeFile(filePath, buffer);
    
    // Relative path for database
    const idPhotoUrl = `/uploads/admin-verification/${filename}`;
    
    // Create admin user with role explicitly set to 'admin'
    const user = await User.create({
      name,
      email,
      password,
      role: 'admin',
      idPhotoUrl
    });
    
    // Remove password from response
    const newUser = {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role
    };
    
    return NextResponse.json(
      { message: 'Admin account created successfully', user: newUser },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Admin creation error:', error);
    return NextResponse.json(
      { message: error.message || 'Error creating admin account' },
      { status: 500 }
    );
  }
} 