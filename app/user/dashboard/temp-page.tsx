'use client';

import React from 'react';
import Link from 'next/link';
import { SignOutButton } from '@/components/ui/SignOutButton';

export default function TempDashboardPage() {
  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-5xl mx-auto bg-white shadow-md rounded-lg p-6">
        <div className="flex justify-between items-center border-b pb-4 mb-6">
          <h1 className="text-2xl font-bold text-gray-800">User Dashboard</h1>
          <SignOutButton />
        </div>
        
        <div className="bg-blue-100 text-blue-700 p-4 rounded-md mb-6">
          <h2 className="font-bold">Login Successful!</h2>
          <p>You have successfully logged in to the Online Case Filing System.</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white border border-gray-200 p-4 rounded-md shadow-sm">
            <h3 className="font-semibold text-lg mb-2">My Cases</h3>
            <p className="text-gray-600">0 cases filed</p>
          </div>
          
          <div className="bg-white border border-gray-200 p-4 rounded-md shadow-sm">
            <h3 className="font-semibold text-lg mb-2">Pending Evidence</h3>
            <p className="text-gray-600">0 documents pending</p>
          </div>
          
          <div className="bg-white border border-gray-200 p-4 rounded-md shadow-sm">
            <h3 className="font-semibold text-lg mb-2">Upcoming Hearings</h3>
            <p className="text-gray-600">No upcoming hearings</p>
          </div>
        </div>
        
        <div className="flex flex-col md:flex-row md:space-x-4 space-y-4 md:space-y-0">
          <Link href="/" className="flex-1">
            <button className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded">
              File a New Case
            </button>
          </Link>
          
          <Link href="/" className="flex-1">
            <button className="w-full bg-gray-600 hover:bg-gray-700 text-white px-4 py-3 rounded">
              View My Profile
            </button>
          </Link>
          
          <Link href="/" className="flex-1">
            <button className="w-full bg-green-600 hover:bg-green-700 text-white px-4 py-3 rounded">
              Contact Support
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
} 