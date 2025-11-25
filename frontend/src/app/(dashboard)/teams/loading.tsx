import { Card, CardContent, CardHeader } from '@/components/ui/card'

export default function TeamsLoading() {
  return (
    <div className="space-y-6">
      {/* Conference Title Skeleton */}
      <div className="h-8 w-64 bg-muted animate-pulse rounded" />

      {/* Teams Table Skeleton */}
      <Card>
        <CardHeader>
          <div className="h-6 w-48 bg-muted animate-pulse rounded" />
        </CardHeader>
        <CardContent className="px-0 sm:px-6">
          <div className="rounded-md border overflow-hidden">
            <div className="min-w-[700px] space-y-2 p-4">
              {/* Table Header */}
              <div className="flex gap-4 pb-2 border-b">
                <div className="h-4 w-8 bg-muted animate-pulse rounded" />
                <div className="h-4 w-32 bg-muted animate-pulse rounded" />
                <div className="h-4 w-20 bg-muted animate-pulse rounded" />
                <div className="h-4 w-16 bg-muted animate-pulse rounded" />
                <div className="h-4 w-16 bg-muted animate-pulse rounded" />
                <div className="h-4 w-16 bg-muted animate-pulse rounded" />
              </div>
              {/* Table Rows */}
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15].map((i) => (
                <div key={i} className="flex gap-4 py-2">
                  <div className="h-4 w-8 bg-muted animate-pulse rounded" />
                  <div className="h-4 w-32 bg-muted animate-pulse rounded" />
                  <div className="h-4 w-20 bg-muted animate-pulse rounded" />
                  <div className="h-4 w-16 bg-muted animate-pulse rounded" />
                  <div className="h-4 w-16 bg-muted animate-pulse rounded" />
                  <div className="h-4 w-16 bg-muted animate-pulse rounded" />
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Second Conference */}
      <div className="h-8 w-64 bg-muted animate-pulse rounded" />

      <Card>
        <CardHeader>
          <div className="h-6 w-48 bg-muted animate-pulse rounded" />
        </CardHeader>
        <CardContent className="px-0 sm:px-6">
          <div className="rounded-md border overflow-hidden">
            <div className="min-w-[700px] space-y-2 p-4">
              <div className="flex gap-4 pb-2 border-b">
                <div className="h-4 w-8 bg-muted animate-pulse rounded" />
                <div className="h-4 w-32 bg-muted animate-pulse rounded" />
                <div className="h-4 w-20 bg-muted animate-pulse rounded" />
                <div className="h-4 w-16 bg-muted animate-pulse rounded" />
                <div className="h-4 w-16 bg-muted animate-pulse rounded" />
                <div className="h-4 w-16 bg-muted animate-pulse rounded" />
              </div>
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15].map((i) => (
                <div key={i} className="flex gap-4 py-2">
                  <div className="h-4 w-8 bg-muted animate-pulse rounded" />
                  <div className="h-4 w-32 bg-muted animate-pulse rounded" />
                  <div className="h-4 w-20 bg-muted animate-pulse rounded" />
                  <div className="h-4 w-16 bg-muted animate-pulse rounded" />
                  <div className="h-4 w-16 bg-muted animate-pulse rounded" />
                  <div className="h-4 w-16 bg-muted animate-pulse rounded" />
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
