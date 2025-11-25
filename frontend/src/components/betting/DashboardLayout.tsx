'use client'

import React from 'react'

interface DashboardLayoutProps {
  leftColumn: React.ReactNode
  centerColumn: React.ReactNode
  rightColumn: React.ReactNode
  header?: React.ReactNode
}

export function DashboardLayout({
  leftColumn,
  centerColumn,
  rightColumn,
  header
}: DashboardLayoutProps) {
  return (
    <div className="w-full">
      {/* Header Section */}
      {header && (
        <div className="mb-4">
          {header}
        </div>
      )}

      {/* 3-Column Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-[25%_45%_30%] gap-3">
        {/* Left Column - 25% */}
        <div className="min-w-[280px] h-[calc(100vh-200px)] overflow-y-auto scroll-smooth bg-gray-900/40 backdrop-blur-sm rounded-lg p-4 custom-scrollbar">
          {leftColumn}
        </div>

        {/* Center Column - 45% */}
        <div className="flex-1 h-[calc(100vh-200px)] overflow-y-auto scroll-smooth bg-gray-900/40 backdrop-blur-sm rounded-lg p-4 custom-scrollbar">
          {centerColumn}
        </div>

        {/* Right Column - 30% */}
        <div className="min-w-[320px] h-[calc(100vh-200px)] overflow-y-auto scroll-smooth bg-gray-900/40 backdrop-blur-sm rounded-lg p-4 custom-scrollbar md:col-span-2 xl:col-span-1">
          {rightColumn}
        </div>
      </div>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }

        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(31, 41, 55, 0.3);
          border-radius: 4px;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(75, 85, 99, 0.5);
          border-radius: 4px;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(107, 114, 128, 0.7);
        }

        /* Firefox scrollbar styling */
        .custom-scrollbar {
          scrollbar-width: thin;
          scrollbar-color: rgba(75, 85, 99, 0.5) rgba(31, 41, 55, 0.3);
        }
      `}</style>
    </div>
  )
}
