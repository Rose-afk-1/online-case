import { NextRequest, NextResponse } from "next/server";

/**
 * Handles user sign-out by clearing all authentication-related cookies
 * and redirecting to the homepage login.
 */
export async function GET(req: NextRequest) {
  // Create a response that redirects to the homepage
  const response = NextResponse.redirect(new URL("/", req.url), { status: 303 });
  
  // Clear all session cookies with the most thorough approach
  response.cookies.set({
    name: "next-auth.session-token",
    value: "",
    expires: new Date(0),
    path: "/",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax"
  });
  
  // Clear secure versions
  response.cookies.set({
    name: "__Secure-next-auth.session-token",
    value: "",
    expires: new Date(0),
    path: "/",
    httpOnly: true,
    secure: true,
    sameSite: "lax"
  });
  
  response.cookies.set({
    name: "__Host-next-auth.session-token",
    value: "",
    expires: new Date(0),
    path: "/",
    httpOnly: true,
    secure: true,
    sameSite: "lax"
  });
  
  // Clear CSRF token
  response.cookies.set({
    name: "next-auth.csrf-token",
    value: "",
    expires: new Date(0),
    path: "/",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax"
  });
  
  // Clear callback URL
  response.cookies.set({
    name: "next-auth.callback-url",
    value: "",
    expires: new Date(0),
    path: "/",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax"
  });
  
  // Also try to clear all cookies that match a pattern
  const allCookies = req.cookies.getAll();
  for (const cookie of allCookies) {
    if (cookie.name.includes('next-auth')) {
      response.cookies.set({
        name: cookie.name,
        value: "",
        expires: new Date(0),
        path: "/",
        httpOnly: true,
        secure: cookie.name.startsWith("__Secure-") || cookie.name.startsWith("__Host-"),
        sameSite: "lax"
      });
    }
  }
  
  return response;
}

// Handle POST request for signout
export async function POST(req: NextRequest) {
  return GET(req);
} 