import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import AppleProvider from "next-auth/providers/apple";
import bcrypt from "bcryptjs";
import dbConnect from "./db";
import User from "../models/User";

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
    AppleProvider({
      clientId: process.env.APPLE_ID || "",
      clientSecret: process.env.APPLE_SECRET || "",
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        isAdmin: { label: "Is Admin Login", type: "boolean" },
        rememberMe: { label: "Remember Me", type: "boolean" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials.password) {
          return null;
        }

        await dbConnect();
        
        try {
          console.log("Auth attempt:", {
            email: credentials.email,
            isAdmin: credentials.isAdmin,
            isAdminType: typeof credentials.isAdmin
          });
          
          // Find user by email
          const user = await User.findOne({ email: credentials.email });
          
          if (!user) {
            console.log("User not found:", credentials.email);
            return null;
          }
          
          console.log("User found:", {
            id: user._id.toString(),
            email: user.email,
            role: user.role,
            isVerified: user.isVerified
          });
          
          // Check password
          const isPasswordValid = await bcrypt.compare(credentials.password, user.password);
          
          if (!isPasswordValid) {
            console.log("Invalid password for user:", credentials.email);
            return null;
          }
          
          // If this is an admin login attempt, check if user is actually an admin
          if ((credentials.isAdmin === 'true' || String(credentials.isAdmin) === 'true') && user.role !== 'admin') {
            console.log("Not authorized as admin. User role:", user.role);
            throw new Error('Not authorized as admin');
          }
          
          console.log("Login successful:", {
            id: user._id.toString(),
            name: user.name,
            email: user.email,
            role: user.role,
            isVerified: user.isVerified
          });
          
          return {
            id: user._id.toString(),
            name: user.name,
            email: user.email,
            role: user.role,
            isVerified: user.isVerified
          };
        } catch (error) {
          console.error('Authentication error:', error);
          return null;
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user, account }) {
      // Store the provider used for login in the token
      if (account) {
        token.provider = account.provider;
      }
      
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.isVerified = user.isVerified;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
        session.user.isVerified = token.isVerified as boolean;
      }
      return session;
    }
  },
  session: {
    strategy: "jwt",
    // When remember me is checked, extend session lifetime
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  pages: {
    signIn: "/",
    error: "/auth/error",
    signOut: "/"
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: true,
};

// Custom types for NextAuth
declare module "next-auth" {
  interface User {
    id: string;
    role: string;
    name?: string | null;
    email?: string | null;
    isVerified: boolean;
  }

  interface Session {
    user: {
      id: string;
      role: string;
      name?: string | null;
      email?: string | null;
      isVerified: boolean;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: string;
    isVerified: boolean;
  }
} 