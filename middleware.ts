import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Define protected routes
  const isAdminRoute = pathname.startsWith('/admin');
  const isUserRoute = pathname.startsWith('/user');
  const isProtectedRoute = isAdminRoute || isUserRoute;
  
  // Public routes that don't need auth checks
  const publicRoutes = [
    '/',
    '/auth/signin',
    '/auth/register',
    '/auth/verify-email',
    '/auth/forgot-password',
    '/auth/reset-password',
    '/unauthorized',
    '/api/auth/register',
    '/api/auth/verify-email'
  ];
  
  // Skip middleware for public routes
  if (publicRoutes.some(route => pathname.startsWith(route)) || pathname.includes('/_next')) {
    return NextResponse.next();
  }
  
  // Get the token using next-auth
  const token = await getToken({ 
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });
  
  // If accessing protected routes without being logged in, redirect to login
  if (isProtectedRoute && !token) {
    return NextResponse.redirect(new URL('/', request.url));
  }
  
  // Check for admin routes specifically
  if (isAdminRoute && token) {
    // Check if the user has admin role
    if (token.role !== 'admin') {
      // User logged in but not an admin, redirect to unauthorized page
      return NextResponse.redirect(new URL('/unauthorized', request.url));
    }
  }
  
  // Check if email is verified for protected routes (if applicable)
  if (isProtectedRoute && token && token.isVerified === false) {
    // User is logged in but email not verified, redirect to verification reminder page
    return NextResponse.redirect(new URL('/auth/verify-reminder', request.url));
  }

  // Continue with the request if authorized
  return NextResponse.next();
}

// Configure which paths the middleware should run on
export const config = {
  matcher: [
    // Match all routes except for specific API routes
    '/((?!api/auth/verify-email|_next/static|_next/image|favicon.ico).*)',
  ],
}; 