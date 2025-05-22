import React from 'react';

interface ConnectionErrorAlertProps {
  message?: string;
  onRetry?: () => void;
}

export function ConnectionErrorAlert({ 
  message = "Server connection timed out. Please try again later.", 
  onRetry 
}: ConnectionErrorAlertProps) {
  return (
    <div className="rounded-md bg-red-50 p-4 mb-6">
      <div className="flex">
        <div className="flex-shrink-0">
          <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
        </div>
        <div className="ml-3">
          <h3 className="text-sm font-medium text-red-800">Connection Error</h3>
          <div className="mt-2 text-sm text-red-700">
            <p>{message}</p>
            
            <div className="mt-4">
              <h4 className="text-sm font-medium text-red-800">Possible solutions:</h4>
              <ul className="list-disc pl-5 mt-1 text-sm text-red-700">
                <li>Check your internet connection</li>
                <li>Make sure MongoDB is running correctly</li>
                <li>Verify your database connection string</li>
                <li>Wait a few minutes and try again</li>
              </ul>
            </div>
          </div>
          
          {onRetry && (
            <div className="mt-4">
              <button
                type="button"
                onClick={onRetry}
                className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                Try Again
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 