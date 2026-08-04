import React from 'react';

export const LoadingSkeleton = ({ type = 'card', rows = 3, className = '' }) => {
  if (type === 'table') {
    return (
      <div className={`w-full overflow-hidden rounded-lg border border-gray-200 bg-white ${className}`}>
        <div className="bg-gray-50/50 border-b border-gray-200 px-4 py-3 flex gap-4">
          <div className="h-4 bg-gray-200 rounded w-1/4 animate-pulse"></div>
          <div className="h-4 bg-gray-200 rounded w-1/4 animate-pulse"></div>
          <div className="h-4 bg-gray-200 rounded w-1/4 animate-pulse"></div>
          <div className="h-4 bg-gray-200 rounded w-1/4 animate-pulse"></div>
        </div>
        <div className="divide-y divide-gray-100">
          {Array.from({ length: rows }).map((_, i) => (
            <div key={i} className="px-4 py-4 flex gap-4">
              <div className="h-4 bg-gray-100 rounded w-1/4 animate-pulse"></div>
              <div className="h-4 bg-gray-100 rounded w-1/4 animate-pulse"></div>
              <div className="h-4 bg-gray-100 rounded w-1/4 animate-pulse"></div>
              <div className="h-4 bg-gray-100 rounded w-1/4 animate-pulse"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (type === 'text') {
    return (
      <div className={`space-y-3 ${className}`}>
        <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2 animate-pulse"></div>
        <div className="h-4 bg-gray-200 rounded w-5/6 animate-pulse"></div>
      </div>
    );
  }

  // Default card skeleton
  return (
    <div className={`bg-white border border-gray-200 rounded-xl p-6 ${className}`}>
      <div className="flex items-center gap-4 mb-4">
        <div className="w-10 h-10 rounded-full bg-gray-200 animate-pulse"></div>
        <div className="space-y-2 flex-1">
          <div className="h-4 bg-gray-200 rounded w-1/3 animate-pulse"></div>
          <div className="h-3 bg-gray-100 rounded w-1/4 animate-pulse"></div>
        </div>
      </div>
      <div className="space-y-3">
        <div className="h-3 bg-gray-100 rounded w-full animate-pulse"></div>
        <div className="h-3 bg-gray-100 rounded w-5/6 animate-pulse"></div>
      </div>
    </div>
  );
};
