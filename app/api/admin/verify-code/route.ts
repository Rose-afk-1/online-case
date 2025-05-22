import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

// This should match the code in app/api/admin/create/route.ts
const ADMIN_SECURITY_CODE = 'admin123secure'; // In production, use environment variables

// Create a SHA-256 hash of the security code for secure comparison
const hashSecurityCode = (code: string): string => {
  return crypto.createHash('sha256').update(code).digest('hex');
};

const SECURITY_CODE_HASH = hashSecurityCode(ADMIN_SECURITY_CODE);

export async function POST(req: NextRequest) {
  try {
    // Extract the security code from the request
    const { securityCode } = await req.json();

    if (!securityCode) {
      return NextResponse.json(
        { valid: false, message: 'Security code is required' },
        { status: 400 }
      );
    }

    // Hash the provided code and compare with stored hash
    const providedCodeHash = hashSecurityCode(securityCode);
    const isValid = providedCodeHash === SECURITY_CODE_HASH;

    // Rate limit to prevent brute force attacks (in a real application)
    // This would typically use Redis or another stateful service
    
    return NextResponse.json({
      valid: isValid,
      message: isValid ? 'Security code is valid' : 'Invalid security code'
    });
  } catch (error: any) {
    console.error('Error verifying security code:', error);
    return NextResponse.json(
      { valid: false, message: 'Error processing request' },
      { status: 500 }
    );
  }
} 