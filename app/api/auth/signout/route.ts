import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  
  // Immediately redirect to homepage regardless of session status
  return NextResponse.redirect(new URL("/", req.url));
} 