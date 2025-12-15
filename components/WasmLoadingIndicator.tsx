'use client';

import React from 'react';

interface WasmLoadingIndicatorProps {
  initializing?: boolean;
  loading?: boolean;
  message?: string;
}

export function WasmLoadingIndicator({ 
  initializing, 
  loading, 
  message = "Initializing astronomical calculations..." 
}: WasmLoadingIndicatorProps) {
  if (!initializing && !loading) return null;

  return (
    <div className="fixed top-4 right-4 z-50 bg-blue-900 text-white px-4 py-3 rounded-lg shadow-lg flex items-center space-x-3 max-w-sm">
      <div className="flex space-x-1">
        <div className="w-2 h-2 bg-blue-300 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
        <div className="w-2 h-2 bg-blue-300 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
        <div className="w-2 h-2 bg-blue-300 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
      </div>
      <div className="flex-1">
        <p className="text-sm font-medium">
          {initializing ? message : "Calculating positions..."}
        </p>
        {initializing && (
          <p className="text-xs opacity-75 mt-1">
            Loading Swiss Ephemeris WASM module
          </p>
        )}
      </div>
    </div>
  );
}

// Inline loading component for use within other components
export function InlineWasmLoader({ 
  initializing, 
  loading, 
  size = 'sm' 
}: { 
  initializing?: boolean; 
  loading?: boolean; 
  size?: 'sm' | 'md' | 'lg';
}) {
  if (!initializing && !loading) return null;

  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6', 
    lg: 'w-8 h-8'
  };

  return (
    <div className="flex items-center space-x-2">
      <div className="flex space-x-1">
        <div className={`${sizeClasses[size]} bg-blue-500 rounded-full animate-bounce`} style={{ animationDelay: '0ms' }}></div>
        <div className={`${sizeClasses[size]} bg-blue-500 rounded-full animate-bounce`} style={{ animationDelay: '150ms' }}></div>
        <div className={`${sizeClasses[size]} bg-blue-500 rounded-full animate-bounce`} style={{ animationDelay: '300ms' }}></div>
      </div>
      <span className="text-sm text-gray-600">
        {initializing ? "Initializing..." : "Loading..."}
      </span>
    </div>
  );
}
