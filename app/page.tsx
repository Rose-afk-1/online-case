"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { FaGoogle, FaApple } from "react-icons/fa";
import Link from "next/link";

export default function Home() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("user"); // "user" or "admin"
  const [rememberMe, setRememberMe] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const result = await signIn("credentials", {
        redirect: false,
        email,
        password,
        role: activeTab, // Pass the role based on the active tab
      });

      if (result?.error) {
        setError(result.error);
      } else {
        // Redirect based on role
        if (activeTab === "admin") {
          router.push("/admin/dashboard");
        } else {
          router.push("/user/dashboard");
        }
      }
    } catch (error) {
      setError("An error occurred during login. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialLogin = async (provider: string) => {
    setIsLoading(true);
    try {
      await signIn(provider, {
        callbackUrl: activeTab === "admin" ? "/admin/dashboard" : "/user/dashboard",
      });
    } catch (error) {
      setError(`Failed to sign in with ${provider}`);
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex flex-col justify-center items-center relative"
      style={{
        background: "url('/ghc-blue-logo.png') center/contain no-repeat",
        backgroundColor: "#0033a0", // Royal blue background to match the logo
        position: "relative",
      }}>
      {/* Background overlay with blur */}
      <div className="absolute inset-0 z-0" 
        style={{ 
          backdropFilter: "blur(1px)",
          backgroundColor: "rgba(0, 51, 160, 0.2)", // Slightly blue tinted overlay
        }}>
      </div>
      
      <div className="w-full max-w-md px-6 py-8 z-10" 
        style={{ 
          backgroundColor: 'transparent',
        }}>
        {/* Login Type Toggle */}
        <div className="flex mb-6 justify-center">
          <button
            onClick={() => setActiveTab("user")}
            className={`px-6 py-2 font-medium text-lg transition-colors ${
              activeTab === "user"
                ? "text-white border-b-2 border-blue-500"
                : "text-gray-400 hover:text-white"
            }`}
          >
            User Login
          </button>
          <button
            onClick={() => setActiveTab("admin")}
            className={`px-6 py-2 font-medium text-lg transition-colors ${
              activeTab === "admin"
                ? "text-white border-b-2 border-blue-500"
                : "text-gray-400 hover:text-white"
            }`}
          >
            Admin Login
          </button>
        </div>

        {/* Page Title */}
        <h1 className="text-3xl font-bold text-center text-white mb-2">
          Online Case Filing and Tracking System
        </h1>
        
        <h2 className="text-xl text-center text-white mb-6">
          Login to Your Account
        </h2>

        {error && (
          <div className="p-3 text-sm text-white bg-red-500 bg-opacity-80 rounded mb-4">
            {error}
          </div>
        )}

        {/* Social Login Buttons */}
        <div className="flex justify-center space-x-4 mb-6">
          <button
            onClick={() => handleSocialLogin("google")}
            disabled={isLoading}
            className="flex items-center justify-center px-4 py-2 rounded"
            style={{ 
              backgroundColor: 'rgba(30, 41, 59, 0.9)', 
              color: 'white', 
              width: '48%',
              borderRadius: '4px',
              padding: '10px'
            }}
          >
            <FaGoogle className="mr-2" /> Login With Google
          </button>
          <button
            onClick={() => handleSocialLogin("apple")}
            disabled={isLoading}
            className="flex items-center justify-center px-4 py-2 rounded"
            style={{ 
              backgroundColor: 'rgba(30, 41, 59, 0.9)', 
              color: 'white', 
              width: '48%',
              borderRadius: '4px',
              padding: '10px'
            }}
          >
            <FaApple className="mr-2" /> Login With Apple
          </button>
        </div>

        {/* Divider */}
        <div className="flex items-center justify-center mb-6">
          <div className="border-t border-gray-300 flex-grow opacity-50"></div>
          <div className="mx-4 text-white text-sm">OR</div>
          <div className="border-t border-gray-300 flex-grow opacity-50"></div>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded"
              style={{
                backgroundColor: 'rgba(30, 41, 59, 0.9)',
                border: '1px solid rgba(148, 163, 184, 0.5)',
                color: 'white'
              }}
              required
              placeholder="Email Address"
            />
          </div>
          
          <div>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded"
              style={{
                backgroundColor: 'rgba(30, 41, 59, 0.9)',
                border: '1px solid rgba(148, 163, 184, 0.5)',
                color: 'white'
              }}
              required
              placeholder="Password"
            />
          </div>
          
          <div className="flex justify-between items-center text-sm text-white">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="remember"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="mr-2"
              />
              <label htmlFor="remember">Remember me</label>
            </div>
            <Link href="/auth/forgot-password" className="text-blue-400 hover:underline">
              Forgot password?
            </Link>
          </div>
          
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 text-white font-medium rounded"
            style={{ backgroundColor: '#3b82f6' }}
          >
            {isLoading ? "Signing in..." : "Sign In"}
          </button>
          
          <div className="mt-4 text-center text-white">
            Don't have an account?{" "}
            <Link href="/auth/register" className="text-blue-400 hover:underline">
              Register Now
            </Link>
          </div>
          
          <div className="text-center mt-6 text-xs text-black flex justify-between w-full">
            <span>Privacy Policy</span>
            <span>Copyright 2025</span>
          </div>
        </form>
      </div>
    </main>
  );
}
