'use client'

import { AppLayout } from '@/components/layout'
import { AlertCircle, RefreshCw, Calendar } from 'lucide-react'
import { useEffect } from 'react'

export default function GamesError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Games page error:', error)
  }, [error])

  return (
    <AppLayout>
      <div className="min-h-[calc(100vh-11rem)] px-4 md:px-8 py-8 max-w-7xl mx-auto">
        <div className="flex flex-col items-center justify-center py-20">
          <div className="bg-gray-900 rounded-xl border border-gray-800 p-8 max-w-md text-center">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Calendar className="h-8 w-8 text-gray-500" />
              <AlertCircle className="h-6 w-6 text-red-500" />
            </div>
            <h2 className="text-xl font-bold text-white mb-2">
              Failed to Load Games
            </h2>
            <p className="text-gray-400 text-sm mb-4">
              We encountered an error while loading the game schedule. This could be due to a temporary connection issue or database problem.
            </p>
            <div className="bg-gray-800 rounded-lg p-3 mb-4">
              <p className="text-xs font-mono text-gray-500">
                {error.message || 'An unexpected error occurred'}
              </p>
            </div>
            <button
              onClick={reset}
              className="flex items-center justify-center gap-2 w-full rounded-lg bg-white px-4 py-2 text-sm font-medium text-black hover:bg-gray-200 transition-colors"
            >
              <RefreshCw className="h-4 w-4" />
              Try Again
            </button>
            <p className="text-xs text-gray-500 mt-4">
              If the problem persists, please check your connection.
            </p>
          </div>
        </div>
      </div>
    </AppLayout>
  )
}
