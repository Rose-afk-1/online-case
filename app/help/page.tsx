'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

export default function HelpSupportPage() {
  const router = useRouter();
  const [activeSection, setActiveSection] = useState('general');
  
  // Helper function to handle section navigation
  const handleSectionChange = (section: string) => {
    setActiveSection(section);
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="mb-8 bg-white rounded-xl shadow-sm p-6 border-l-4 border-blue-500">
          <div className="flex space-x-2 mb-4">
            <Button
              className="bg-blue-600 hover:bg-blue-700 text-white"
              size="sm"
              onClick={() => router.back()}
            >
              ← Back
            </Button>
            <Link href="/">
              <Button
                className="bg-blue-600 hover:bg-blue-700 text-white"
                size="sm"
              >
                Home
              </Button>
            </Link>
            <Link href="/user/dashboard">
              <Button
                className="bg-blue-600 hover:bg-blue-700 text-white"
                size="sm"
              >
                Dashboard
              </Button>
            </Link>
          </div>
          
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <span className="mr-3 bg-blue-100 text-blue-700 p-2 rounded-full">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>
            </span>
            Help & Support
          </h1>
          <p className="mt-2 text-lg text-black ml-12">
            Find answers to common questions and learn how to use our online case filing system.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Sidebar Navigation */}
          <div className="md:col-span-1">
            <div className="bg-white shadow rounded-xl overflow-hidden border border-gray-100">
              <div className="p-4 border-b bg-gradient-to-r from-blue-500 to-blue-600">
                <h3 className="font-medium text-white">Support Categories</h3>
              </div>
              <nav className="p-2">
                <ul className="space-y-1">
                  <li>
                    <button 
                      onClick={() => handleSectionChange('general')}
                      className={`w-full text-left px-3 py-3 rounded-md flex items-center transition-all duration-200 ${
                        activeSection === 'general' 
                          ? 'bg-blue-50 text-blue-700 font-medium shadow-sm' 
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
                      General Information
                    </button>
                  </li>
                  <li>
                    <button 
                      onClick={() => handleSectionChange('case-filing')}
                      className={`w-full text-left px-3 py-3 rounded-md flex items-center transition-all duration-200 ${
                        activeSection === 'case-filing' 
                          ? 'bg-blue-50 text-blue-700 font-medium shadow-sm' 
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
                      Case Filing
                    </button>
                  </li>
                  <li>
                    <button 
                      onClick={() => handleSectionChange('evidence')}
                      className={`w-full text-left px-3 py-3 rounded-md flex items-center transition-all duration-200 ${
                        activeSection === 'evidence' 
                          ? 'bg-blue-50 text-blue-700 font-medium shadow-sm' 
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
                      Evidence Upload
                    </button>
                  </li>
                  <li>
                    <button 
                      onClick={() => handleSectionChange('payment')}
                      className={`w-full text-left px-3 py-3 rounded-md flex items-center transition-all duration-200 ${
                        activeSection === 'payment' 
                          ? 'bg-blue-50 text-blue-700 font-medium shadow-sm' 
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect><line x1="1" y1="10" x2="23" y2="10"></line></svg>
                      Payment & Fees
                    </button>
                  </li>
                  <li>
                    <button 
                      onClick={() => handleSectionChange('contact')}
                      className={`w-full text-left px-3 py-3 rounded-md flex items-center transition-all duration-200 ${
                        activeSection === 'contact' 
                          ? 'bg-blue-50 text-blue-700 font-medium shadow-sm' 
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
                      Contact Support
                    </button>
                  </li>
                </ul>
              </nav>
            </div>
          </div>
          
          {/* Main Content Area */}
          <div className="md:col-span-3">
            <div className="bg-white shadow rounded-xl p-6 border border-gray-100">
              {activeSection === 'general' && (
                <div>
                  <h2 className="text-2xl font-bold mb-6 text-gray-900 pb-2 border-b border-gray-200">General Information</h2>
                  
                  <section className="mb-8 hover:bg-blue-50 p-4 rounded-lg transition-colors duration-300">
                    <h3 className="text-xl font-semibold text-gray-800 mb-3 flex items-center">
                      <span className="text-2xl mr-2">🧾</span>
                      <span className="bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">Online Case Filing & Tracking System</span>
                    </h3>
                    <p className="text-black mb-4 ml-8">
                      The Online Case Filing & Tracking System is a digital platform that allows users to file legal cases, 
                      upload supporting evidence, and track their case status through a secure and user-friendly interface. 
                      It also provides court officials (admins) with tools to manage, review, and schedule hearings efficiently.
                    </p>
                    <p className="text-black ml-8">
                      This platform is designed to simplify the legal case filing process while ensuring transparency, 
                      accessibility, and real-time updates for all stakeholders involved.
                    </p>
                  </section>
                  
                  <section className="mb-8 hover:bg-blue-50 p-4 rounded-lg transition-colors duration-300">
                    <h3 className="text-xl font-semibold text-gray-800 mb-3 flex items-center">
                      <span className="text-2xl mr-2">💡</span>
                      <span className="bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">Key Features</span>
                    </h3>
                    <ul className="grid grid-cols-1 md:grid-cols-2 gap-3 ml-8">
                      <li className="flex items-center p-2 bg-white rounded-lg shadow-sm">
                        <span className="bg-blue-100 p-2 rounded-full mr-3 text-blue-700">
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 11V7a5 5 0 0 1 10 0v4"></path></svg>
                        </span>
                        <span className="text-black">Secure user authentication</span>
                      </li>
                      <li className="flex items-center p-2 bg-white rounded-lg shadow-sm">
                        <span className="bg-blue-100 p-2 rounded-full mr-3 text-blue-700">
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline></svg>
                        </span>
                        <span className="text-black">Case submission with ID generation</span>
                      </li>
                      <li className="flex items-center p-2 bg-white rounded-lg shadow-sm">
                        <span className="bg-blue-100 p-2 rounded-full mr-3 text-blue-700">
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
                        </span>
                        <span className="text-black">Evidence upload capabilities</span>
                      </li>
                      <li className="flex items-center p-2 bg-white rounded-lg shadow-sm">
                        <span className="bg-blue-100 p-2 rounded-full mr-3 text-blue-700">
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>
                        </span>
                        <span className="text-black">Case status tracking</span>
                      </li>
                      <li className="flex items-center p-2 bg-white rounded-lg shadow-sm">
                        <span className="bg-blue-100 p-2 rounded-full mr-3 text-blue-700">
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path><polyline points="17 21 17 13 7 13 7 21"></polyline><polyline points="7 3 7 8 15 8"></polyline></svg>
                        </span>
                        <span className="text-black">Admin panel for court officials</span>
                      </li>
                      <li className="flex items-center p-2 bg-white rounded-lg shadow-sm">
                        <span className="bg-blue-100 p-2 rounded-full mr-3 text-blue-700">
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect><line x1="1" y1="10" x2="23" y2="10"></line></svg>
                        </span>
                        <span className="text-black">Payment processing in Indian Rupees (₹)</span>
                      </li>
                    </ul>
                  </section>
                  
                  <section>
                    <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                      <span className="text-2xl mr-2">❓</span>
                      <span className="bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">Frequently Asked Questions (FAQs)</span>
                    </h3>
                    
                    <div className="space-y-4 ml-8">
                      <div className="border border-blue-100 rounded-lg p-4 bg-white shadow-sm hover:shadow-md transition-shadow duration-300">
                        <h4 className="font-medium text-blue-700 mb-2 flex items-center">
                          <span className="bg-blue-100 h-6 w-6 rounded-full flex items-center justify-center mr-2 text-sm">1</span>
                          How do I file a new case?
                        </h4>
                        <p className="text-black ml-8">
                          Once you register and log in, go to the "File a Case" section. Fill in the required details 
                          and upload any supporting documents. Click Submit to file the case.
                        </p>
                      </div>
                      
                      <div className="border border-blue-100 rounded-lg p-4 bg-white shadow-sm hover:shadow-md transition-shadow duration-300">
                        <h4 className="font-medium text-blue-700 mb-2 flex items-center">
                          <span className="bg-blue-100 h-6 w-6 rounded-full flex items-center justify-center mr-2 text-sm">2</span>
                          How do I check my case status?
                        </h4>
                        <p className="text-black ml-8">
                          Go to your dashboard after logging in. You will see a list of all your filed cases along 
                          with their current status and update history.
                        </p>
                      </div>
                      
                      <div className="border border-blue-100 rounded-lg p-4 bg-white shadow-sm hover:shadow-md transition-shadow duration-300">
                        <h4 className="font-medium text-blue-700 mb-2 flex items-center">
                          <span className="bg-blue-100 h-6 w-6 rounded-full flex items-center justify-center mr-2 text-sm">3</span>
                          Can I edit my case after submission?
                        </h4>
                        <p className="text-black ml-8">
                          No. Once a case is filed, you cannot edit the core details. However, you can upload 
                          additional evidence or communicate with court officials if they request more information.
                        </p>
                      </div>
                      
                      <div className="border border-blue-100 rounded-lg p-4 bg-white shadow-sm hover:shadow-md transition-shadow duration-300">
                        <h4 className="font-medium text-blue-700 mb-2 flex items-center">
                          <span className="bg-blue-100 h-6 w-6 rounded-full flex items-center justify-center mr-2 text-sm">4</span>
                          I uploaded the wrong document. How can I remove it?
                        </h4>
                        <p className="text-black ml-8">
                          Currently, you can only upload additional evidence — not delete existing uploads. 
                          If needed, contact a court official through the support channel or add a note in the next upload.
                        </p>
                      </div>
                      
                      <div className="border border-blue-100 rounded-lg p-4 bg-white shadow-sm hover:shadow-md transition-shadow duration-300">
                        <h4 className="font-medium text-blue-700 mb-2 flex items-center">
                          <span className="bg-blue-100 h-6 w-6 rounded-full flex items-center justify-center mr-2 text-sm">5</span>
                          What do different case statuses mean?
                        </h4>
                        <div className="text-black ml-8 space-y-2">
                          <p className="flex items-center">
                            <span className="inline-block w-2 h-2 bg-yellow-400 rounded-full mr-2"></span>
                            <span className="font-medium text-yellow-600">Pending:</span> 
                            <span className="ml-2">Your case has been submitted and is waiting for review.</span>
                          </p>
                          <p className="flex items-center">
                            <span className="inline-block w-2 h-2 bg-blue-400 rounded-full mr-2"></span>
                            <span className="font-medium text-blue-600">Under Review:</span> 
                            <span className="ml-2">A court official is currently reviewing your case.</span>
                          </p>
                          <p className="flex items-center">
                            <span className="inline-block w-2 h-2 bg-green-400 rounded-full mr-2"></span>
                            <span className="font-medium text-green-600">Approved:</span> 
                            <span className="ml-2">Your case has been approved and will proceed to the hearing stage.</span>
                          </p>
                          <p className="flex items-center">
                            <span className="inline-block w-2 h-2 bg-red-400 rounded-full mr-2"></span>
                            <span className="font-medium text-red-600">Rejected:</span> 
                            <span className="ml-2">Your case was not accepted. You may be notified with the reason.</span>
                          </p>
                        </div>
                      </div>
                      
                      <div className="border border-blue-100 rounded-lg p-4 bg-white shadow-sm hover:shadow-md transition-shadow duration-300">
                        <h4 className="font-medium text-blue-700 mb-2 flex items-center">
                          <span className="bg-blue-100 h-6 w-6 rounded-full flex items-center justify-center mr-2 text-sm">6</span>
                          How will I know about my hearing date?
                        </h4>
                        <p className="text-black ml-8">
                          You will receive a notification in your dashboard and via email (if provided) once a hearing is scheduled.
                        </p>
                      </div>
                      
                      <div className="border border-blue-100 rounded-lg p-4 bg-white shadow-sm hover:shadow-md transition-shadow duration-300">
                        <h4 className="font-medium text-blue-700 mb-2 flex items-center">
                          <span className="bg-blue-100 h-6 w-6 rounded-full flex items-center justify-center mr-2 text-sm">7</span>
                          Who can see my case or documents?
                        </h4>
                        <p className="text-black ml-8">
                          Only you and authorized court officials have access to your case and evidence. 
                          All data is securely stored and protected.
                        </p>
                      </div>
                      
                      <div className="border border-blue-100 rounded-lg p-4 bg-white shadow-sm hover:shadow-md transition-shadow duration-300">
                        <h4 className="font-medium text-blue-700 mb-2 flex items-center">
                          <span className="bg-blue-100 h-6 w-6 rounded-full flex items-center justify-center mr-2 text-sm">8</span>
                          What do I do if I face login issues or page errors?
                        </h4>
                        <div className="text-black ml-8">
                          <p className="mb-2">Please try the following:</p>
                          <ul className="space-y-1">
                            <li className="flex items-center">
                              <span className="text-blue-500 mr-2">•</span>
                              Clear your browser cache and refresh the page.
                            </li>
                            <li className="flex items-center">
                              <span className="text-blue-500 mr-2">•</span>
                              Make sure you're using a supported browser (Chrome, Edge, Firefox).
                            </li>
                            <li className="flex items-center">
                              <span className="text-blue-500 mr-2">•</span>
                              If the issue persists, contact technical support through the Help section or email support.
                            </li>
                          </ul>
                        </div>
                      </div>
                      
                      <div className="border border-blue-100 rounded-lg p-4 bg-white shadow-sm hover:shadow-md transition-shadow duration-300">
                        <h4 className="font-medium text-blue-700 mb-2 flex items-center">
                          <span className="bg-blue-100 h-6 w-6 rounded-full flex items-center justify-center mr-2 text-sm">9</span>
                          Is there a fee to file a case?
                        </h4>
                        <p className="text-black ml-8">
                          Some case categories might require a processing fee. You will be prompted during 
                          the case submission process if payment is required. All fees are in Indian Rupees (₹).
                        </p>
                      </div>
                      
                      <div className="border border-blue-100 rounded-lg p-4 bg-white shadow-sm hover:shadow-md transition-shadow duration-300">
                        <h4 className="font-medium text-blue-700 mb-2 flex items-center">
                          <span className="bg-blue-100 h-6 w-6 rounded-full flex items-center justify-center mr-2 text-sm">10</span>
                          How do I contact support?
                        </h4>
                        <p className="text-black ml-8">
                          Use the "Help & Support" link in the navigation bar or footer. You can also send 
                          a query from your dashboard under the "Support" tab.
                        </p>
                      </div>
                    </div>
                  </section>
                </div>
              )}
              
              {activeSection === 'case-filing' && (
                <div>
                  <h2 className="text-2xl font-bold mb-6 text-gray-900 pb-2 border-b border-gray-200">Case Filing Guide</h2>
                  
                  <section className="mb-8 hover:bg-blue-50 p-4 rounded-lg transition-colors duration-300">
                    <h3 className="text-xl font-semibold text-gray-800 mb-3 flex items-center">
                      <span className="text-2xl mr-2">📋</span>
                      <span className="bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">Filing a New Case</span>
                    </h3>
                    <p className="text-black mb-4 ml-8">
                      Filing a case requires several important pieces of information. Follow these steps to ensure your case is submitted properly:
                    </p>
                    
                    <div className="ml-8 space-y-4">
                      <div className="border border-blue-100 rounded-lg p-4 bg-white shadow-sm">
                        <h4 className="font-medium text-blue-700 mb-2">Step 1: Navigate to the Case Filing Section</h4>
                        <p className="text-black">
                          After logging in, go to your dashboard and click on the "File a New Case" button.
                        </p>
                      </div>
                      
                      <div className="border border-blue-100 rounded-lg p-4 bg-white shadow-sm">
                        <h4 className="font-medium text-blue-700 mb-2">Step 2: Fill in Case Details</h4>
                        <p className="text-black">
                          Enter the case title, select the appropriate case type, and provide a detailed description of your case.
                        </p>
                      </div>
                      
                      <div className="border border-red-100 rounded-lg p-4 bg-white shadow-sm">
                        <h4 className="font-medium text-red-700 mb-2 flex items-center">
                          <span className="bg-red-100 p-1 rounded-full mr-2">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
                          </span>
                          Step 3: Add Plaintiffs and Defendants (Required)
                        </h4>
                        <div className="text-black">
                          <p className="mb-3">
                            <strong>Plaintiffs:</strong> Enter the names of all plaintiffs (the party filing the case). For multiple plaintiffs, separate each name with a comma.
                          </p>
                          <p className="mb-3">
                            <strong>Defendants:</strong> Enter the names of all defendants (the party against whom the case is filed). For multiple defendants, separate each name with a comma.
                          </p>
                          <div className="bg-red-50 p-3 rounded-md mt-2">
                            <p className="flex items-start text-sm">
                              <span className="text-red-600 mr-2">⚠️</span>
                              <span><strong>Important:</strong> Both plaintiffs and defendants are mandatory fields. Your case cannot be submitted without this information.</span>
                            </p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="border border-blue-100 rounded-lg p-4 bg-white shadow-sm">
                        <h4 className="font-medium text-blue-700 mb-2">Step 4: Additional Information</h4>
                        <p className="text-black">
                          Enter the court location (if applicable) and the filing fee. The system will calculate the appropriate fee based on the case type.
                        </p>
                      </div>
                      
                      <div className="border border-blue-100 rounded-lg p-4 bg-white shadow-sm">
                        <h4 className="font-medium text-blue-700 mb-2">Step 5: Submit Your Case</h4>
                        <p className="text-black">
                          Review all the information you've entered, then click the "Submit Case" button. If any required fields are missing, you'll see an error message prompting you to complete them.
                        </p>
                      </div>
                    </div>
                  </section>
                  
                  <section className="mb-8 hover:bg-blue-50 p-4 rounded-lg transition-colors duration-300">
                    <h3 className="text-xl font-semibold text-gray-800 mb-3 flex items-center">
                      <span className="text-2xl mr-2">📝</span>
                      <span className="bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">Tips for Successful Case Filing</span>
                    </h3>
                    
                    <ul className="list-disc pl-12 space-y-2 text-black">
                      <li>Be as detailed as possible in your case description.</li>
                      <li>Double-check the spelling of all plaintiff and defendant names.</li>
                      <li>Include proper titles (Mr., Mrs., Dr., etc.) and full legal names where applicable.</li>
                      <li>For organizations as plaintiffs or defendants, include their full registered name.</li>
                      <li>Keep a copy of all information you submit for your records.</li>
                    </ul>
                  </section>
                  
                  <section className="hover:bg-blue-50 p-4 rounded-lg transition-colors duration-300">
                    <h3 className="text-xl font-semibold text-gray-800 mb-3 flex items-center">
                      <span className="text-2xl mr-2">⏭️</span>
                      <span className="bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">What Happens Next?</span>
                    </h3>
                    
                    <div className="ml-8 bg-blue-50 rounded-lg p-4">
                      <ol className="list-decimal pl-4 space-y-2">
                        <li className="text-black">Your case will be reviewed by court officials</li>
                        <li className="text-black">You'll be notified when your case status changes</li>
                        <li className="text-black">You may be required to upload supporting evidence</li>
                        <li className="text-black">Court fees will need to be paid to proceed</li>
                      </ol>
                    </div>
                  </section>
                </div>
              )}
              
              {activeSection === 'evidence' && (
                <div>
                  <h2 className="text-2xl font-bold mb-4">Evidence Upload</h2>
                  <p className="text-black">
                    This section will contain information about uploading evidence.
                  </p>
                  {/* Content will be added in subsequent steps */}
                </div>
              )}
              
              {activeSection === 'payment' && (
                <div>
                  <h2 className="text-2xl font-bold mb-4">Payment & Fees</h2>
                  <p className="text-black">
                    This section will contain information about payments and fees.
                  </p>
                  {/* Content will be added in subsequent steps */}
                </div>
              )}
              
              {activeSection === 'contact' && (
                <div>
                  <h2 className="text-2xl font-bold mb-4">Contact Support</h2>
                  <p className="text-black">
                    This section will contain contact information and support options.
                  </p>
                  {/* Content will be added in subsequent steps */}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 