import { Users, BookOpen } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import type { DashboardOverview } from '@/types/dashboard'

interface DashboardOverviewMetricsProps {
  overview: DashboardOverview
  isLoading?: boolean
}

export function DashboardOverviewMetrics({
  overview,
  isLoading = false,
}: DashboardOverviewMetricsProps) {
  const hasData = overview.childrenCount > 0 || overview.studiesCount > 0

  if (isLoading) {
    return (
      <section
        data-testid="dashboard-overview"
        className="grid gap-4 sm:grid-cols-2"
        aria-label="Overview metrics"
        aria-busy="true"
      >
        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <Skeleton className="h-12 w-12 rounded-xl" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-8 w-16" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <Skeleton className="h-12 w-12 rounded-xl" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-8 w-16" />
            </div>
          </CardContent>
        </Card>
      </section>
    )
  }

  if (!hasData) {
    return (
      <section
        data-testid="dashboard-overview"
        aria-label="Overview metrics"
        aria-live="polite"
      >
        <Card
          data-testid="empty-overview"
          className="border-dashed border-2 bg-muted/30"
        >
          <CardContent className="flex flex-col items-center justify-center gap-4 py-12">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-muted">
              <Users className="h-8 w-8 text-muted-foreground" />
            </div>
            <div className="text-center">
              <h3 className="font-semibold text-foreground">
                No overview data available
              </h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Add a child profile and create studies to see your dashboard metrics.
              </p>
            </div>
          </CardContent>
        </Card>
      </section>
    )
  }

  return (
    <section
      data-testid="dashboard-overview"
      className="grid gap-4 sm:grid-cols-2"
      aria-label="Overview metrics"
      aria-live="polite"
    >
      <Card className="overflow-hidden transition-all duration-300 hover:shadow-card-hover">
        <CardContent className="flex items-center gap-4 p-6">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[rgb(var(--peach-light))]/20">
            <Users className="h-6 w-6 text-primary" />
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">
              Children
            </p>
            <p className="text-2xl font-bold text-foreground">
              {overview.childrenCount}
            </p>
          </div>
        </CardContent>
      </Card>
      <Card className="overflow-hidden transition-all duration-300 hover:shadow-card-hover">
        <CardContent className="flex items-center gap-4 p-6">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[rgb(var(--lavender))]/20">
            <BookOpen className="h-6 w-6 text-primary" />
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">
              Studies
            </p>
            <p className="text-2xl font-bold text-foreground">
              {overview.studiesCount}
            </p>
          </div>
        </CardContent>
      </Card>
    </section>
  )
}
