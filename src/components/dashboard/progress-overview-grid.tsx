import { Link } from 'react-router-dom'
import { Flame, UserPlus } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Skeleton } from '@/components/ui/skeleton'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
} from 'recharts'
import type { Child } from '@/types/dashboard'
import { cn } from '@/lib/utils'

const SPARKLINE_DATA = [
  { day: 'M', value: 2 },
  { day: 'T', value: 4 },
  { day: 'W', value: 3 },
  { day: 'T', value: 6 },
  { day: 'F', value: 5 },
  { day: 'S', value: 7 },
  { day: 'S', value: 4 },
]

interface ProgressOverviewGridProps {
  children: Child[]
  isLoading?: boolean
}

export function ProgressOverviewGrid({ children, isLoading = false }: ProgressOverviewGridProps) {
  const list = Array.isArray(children) ? children : []

  if (isLoading) {
    return (
      <div
        className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
        data-testid="dashboard-children"
        aria-busy="true"
        aria-label="Children progress"
      >
        {[1, 2].map((i) => (
          <Card key={i} className="overflow-hidden">
            <CardHeader className="pb-2">
              <Skeleton className="h-5 w-32" />
            </CardHeader>
            <CardContent className="space-y-4">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-8 w-16" />
              <Skeleton className="h-20 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (list.length === 0) {
    return (
      <div data-testid="dashboard-children" aria-live="polite">
        <Card
          data-testid="empty-children"
          className="border-dashed border-2 bg-[rgb(var(--peach-light))]/20"
        >
        <CardContent className="flex flex-col items-center justify-center gap-4 py-12">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
            <UserPlus className="h-8 w-8 text-primary" />
          </div>
          <div className="text-center">
            <h3 className="font-semibold text-foreground">No children yet</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Add a child profile to track their learning progress.
            </p>
          </div>
          <Button asChild variant="outline">
            <Link to="/dashboard/children">Add Child</Link>
          </Button>
        </CardContent>
      </Card>
      </div>
    )
  }

  return (
    <div
      className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
      data-testid="dashboard-children"
      aria-live="polite"
    >
      {list.map((child, idx) => (
        <Card
          key={child.id}
          className={cn(
            'overflow-hidden transition-all duration-300 hover:shadow-card-hover',
            idx === 0 && 'bg-gradient-to-br from-[rgb(var(--peach-light))]/30 to-transparent',
            idx === 1 && 'bg-gradient-to-br from-[rgb(var(--lavender))]/20 to-transparent'
          )}
        >
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-base font-semibold">{child.name}</CardTitle>
            <span className="text-xs text-muted-foreground">Age {child.age}</span>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="mb-1 flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Progress</span>
                <span className="font-bold text-primary">{child.progress}%</span>
              </div>
              <Progress value={child.progress} className="h-2" />
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5">
                <Flame className="h-4 w-4 text-[rgb(var(--tangerine))]" />
                <span className="text-sm font-semibold">{child.streak} day streak</span>
              </div>
              {child.lastActive && (
                <span className="text-xs text-muted-foreground">Last: {child.lastActive}</span>
              )}
            </div>
            <div className="h-12">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={SPARKLINE_DATA}>
                  <XAxis dataKey="day" hide />
                  <YAxis hide domain={[0, 10]} />
                  <Tooltip contentStyle={{ display: 'none' }} />
                  <Area
                    type="monotone"
                    dataKey="value"
                    stroke="rgb(var(--primary))"
                    fill="rgb(var(--primary))"
                    fillOpacity={0.2}
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
