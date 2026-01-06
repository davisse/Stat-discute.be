'use client'

import { AppLayout } from '@/components/layout'
import { AlertCircle, RefreshCw, TrendingUp } from 'lucide-react'
import { useEffect } from 'react'

export default function ValueFinderError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Value Finder page error:', error)
  }, [error])

  return (
    <AppLayout>
      <div style={{
        maxWidth: '1400px',
        margin: '0 auto',
        padding: '32px 24px'
      }}>
        <div className="flex flex-col items-center justify-center py-20">
          <div className="bg-white/5 rounded-xl border border-white/10 p-8 max-w-md text-center">
            <div className="flex items-center justify-center gap-2 mb-4">
              <TrendingUp className="h-8 w-8 text-gray-500" />
              <AlertCircle className="h-6 w-6 text-red-500" />
            </div>
            <h2 className="text-xl font-bold text-white mb-2">
              Failed to Load Value Analysis
            </h2>
            <p className="text-gray-400 text-sm mb-4">
              We encountered an error while loading betting value recommendations. This could be due to a temporary connection issue or missing analysis data.
            </p>
            <div className="bg-gray-900 rounded-lg p-3 mb-4">
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
              If the problem persists, try running the analysis script first.
            </p>
          </div>
        </div>
      </div>
    </AppLayout>
  )
}
