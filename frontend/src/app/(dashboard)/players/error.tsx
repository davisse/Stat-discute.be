'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertCircle, RefreshCw } from 'lucide-react'
import { useEffect } from 'react'

export default function PlayersError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log error to error reporting service
    console.error('Players page error:', error)
  }, [error])

  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <Card className="max-w-md">
        <CardHeader>
          <div className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-destructive" />
            <CardTitle className="text-lg">Failed to Load Players Data</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            We encountered an error while loading player statistics. This could be due to a temporary
            connection issue or a problem with the database.
          </p>
          <div className="rounded-md bg-muted p-3">
            <p className="text-xs font-mono text-muted-foreground">
              {error.message || 'An unexpected error occurred'}
            </p>
          </div>
          <button
            onClick={reset}
            className="flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 transition-opacity"
          >
            <RefreshCw className="h-4 w-4" />
            Try Again
          </button>
          <p className="text-xs text-muted-foreground">
            If the problem persists, please check your connection or contact support.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
