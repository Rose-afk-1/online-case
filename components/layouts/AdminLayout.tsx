'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';

interface AdminLayoutProps {
  children: React.ReactNode;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const pathname = usePathname();
  const { data: session } = useSession();

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const navigation = [
    { name: 'Dashboard', href: '/admin/dashboard', icon: '📊' },
    { name: 'Cases', href: '/admin/cases', icon: '📁' },
    { name: 'Hearings', href: '/admin/hearings', icon: '📅' },
    { name: 'Evidence', href: '/admin/evidence', icon: '📄' },
    { name: 'Users', href: '/admin/users', icon: '👥' },
    { name: 'Settings', href: '/admin/settings', icon: '⚙️' },
  ];

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Mobile sidebar backdrop */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-gray-600 bg-opacity-75 z-20 lg:hidden"
          onClick={toggleSidebar}
        ></div>
      )}

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 w-64 bg-white shadow-md transform transition-transform duration-300 ease-in-out z-30 ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0 lg:static lg:z-auto`}
      >
        <div className="flex flex-col h-full">
          <div className="px-4 py-6 bg-blue-600 text-white">
            <div className="flex items-center justify-between">
              <Link href="/admin/dashboard" className="text-xl font-bold">
                Admin Portal
              </Link>
              <button
                onClick={toggleSidebar}
                className="p-1 rounded-md text-white hover:bg-blue-700 focus:outline-none lg:hidden"
              >
                <span className="sr-only">Close sidebar</span>
                ✕
              </button>
            </div>
            <div className="mt-2 text-sm">
              {session?.user?.name && <p>Welcome, {session.user.name}</p>}
            </div>
          </div>

          <div className="flex-1 py-4 overflow-y-auto">
            <nav className="space-y-1 px-2">
              {navigation.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`group flex items-center px-4 py-2 text-sm font-medium rounded-md ${
                      isActive
                        ? 'bg-blue-100 text-blue-600'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <span className="mr-3 text-lg">{item.icon}</span>
                    {item.name}
                  </Link>
                );
              })}
            </nav>
          </div>

          <div className="p-4 border-t border-gray-200">
            <Link
              href="/auth/logout"
              className="flex items-center px-4 py-2 text-sm font-medium text-red-600 rounded-md hover:bg-red-50"
            >
              <span className="mr-3 text-lg">🚪</span>
              Logout
            </Link>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className={`flex-1 ${isSidebarOpen ? 'lg:ml-64' : ''}`}>
        {/* Mobile Header */}
        <div className="sticky top-0 z-10 flex justify-between items-center px-4 py-3 bg-white shadow-sm lg:hidden">
          <button
            onClick={toggleSidebar}
            className="p-2 rounded-md text-gray-700 hover:bg-gray-100 focus:outline-none"
          >
            <span className="sr-only">Open sidebar</span>
            ☰
          </button>
          <h1 className="text-lg font-semibold text-gray-900">Admin Portal</h1>
          <div className="w-8"></div> {/* For balance */}
        </div>

        {/* Content */}
        <main className="py-4 bg-white min-h-screen">{children}</main>
      </div>
    </div>
  );
};

export default AdminLayout;
