'use client';

import React, { useState, useRef } from 'react';
import { cn } from '@/lib/utils';

interface FileUploadProps extends React.InputHTMLAttributes<HTMLInputElement> {
  onFileChange: (file: File | null) => void;
  label?: string;
  description?: string;
  error?: string;
  acceptedFileTypes?: string;
  maxSizeMB?: number;
}

export function FileUpload({
  onFileChange,
  label = 'Upload a file',
  description,
  error,
  className,
  acceptedFileTypes = '*',
  maxSizeMB = 5,
  ...props
}: FileUploadProps) {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [localError, setLocalError] = useState<string>('');
  const inputRef = useRef<HTMLInputElement>(null);
  
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };
  
  const validateFile = (file: File): boolean => {
    // Check file size
    if (file.size > maxSizeBytes) {
      setLocalError(`File size exceeds the maximum limit of ${maxSizeMB}MB.`);
      return false;
    }
    
    // Check file type if specified
    if (acceptedFileTypes !== '*') {
      const fileType = file.type;
      const acceptedTypes = acceptedFileTypes.split(',');
      
      if (!acceptedTypes.some(type => {
        // Handle mime types like "image/*"
        if (type.endsWith('/*')) {
          const category = type.split('/')[0];
          return fileType.startsWith(`${category}/`);
        }
        return type === fileType;
      })) {
        setLocalError(`File type not supported. Please upload ${acceptedFileTypes.replace(/,/g, ' or ')}.`);
        return false;
      }
    }
    
    setLocalError('');
    return true;
  };
  
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      
      if (validateFile(file)) {
        setSelectedFile(file);
        onFileChange(file);
      } else {
        onFileChange(null);
      }
    }
  };
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      if (validateFile(file)) {
        setSelectedFile(file);
        onFileChange(file);
      } else {
        onFileChange(null);
      }
    }
  };
  
  const handleButtonClick = () => {
    inputRef.current?.click();
  };
  
  const displayError = error || localError;
  
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
      )}
      
      <div
        className={cn(
          "mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-dashed rounded-md cursor-pointer",
          dragActive ? "border-blue-500 bg-blue-50" : "border-gray-300 bg-gray-50",
          displayError && "border-red-500 bg-red-50",
          className
        )}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={handleButtonClick}
      >
        <div className="space-y-1 text-center">
          <svg
            className={cn(
              "mx-auto h-12 w-12",
              displayError ? "text-red-500" : "text-gray-400"
            )}
            stroke="currentColor"
            fill="none"
            viewBox="0 0 48 48"
            aria-hidden="true"
          >
            <path
              d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          
          <div className="flex text-sm text-gray-600">
            <span>{selectedFile ? selectedFile.name : 'Drop a file or click to select'}</span>
            <input
              ref={inputRef}
              id="file-upload"
              name="file-upload"
              type="file"
              className="sr-only"
              onChange={handleChange}
              accept={acceptedFileTypes}
              {...props}
            />
          </div>
          
          {description && !selectedFile && (
            <p className="text-xs text-gray-500">{description}</p>
          )}
          
          {selectedFile && (
            <p className="text-xs text-gray-500">
              {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
            </p>
          )}
        </div>
      </div>
      
      {displayError && (
        <p className="mt-1 text-sm text-red-500">{displayError}</p>
      )}
    </div>
  );
} 