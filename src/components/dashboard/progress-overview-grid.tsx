import { Link } from 'react-router-dom'
import { Flame, TrendingUp, User } from 'lucide-react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { Child } from '@/types/dashboard'
import { dataGuard } from '@/lib/data-guard'

export interface ProgressOverviewGridProps {
  children: Child[]
  isLoading?: boolean
  className?: string
}

export function ProgressOverviewGrid({
  children,
  isLoading = false,
  className,
}: ProgressOverviewGridProps) {
  const safeChildren = dataGuard(children)

  if (isLoading) {
    return (
      <div className={cn('grid gap-4 md:grid-cols-2 lg:grid-cols-3', className)}>
        {[1, 2].map((i) => (
          <Card
            key={i}
            className="animate-pulse bg-gradient-to-br from-[rgb(var(--peach-light))]/20 to-transparent"
          >
            <CardHeader className="pb-2">
              <div className="h-4 w-24 rounded bg-muted" />
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="h-6 w-16 rounded bg-muted" />
              <div className="h-2 w-full rounded bg-muted" />
              <div className="h-4 w-20 rounded bg-muted" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (safeChildren.length === 0) {
    return (
      <Card
        className={cn(
          'border-dashed border-2 border-border bg-gradient-to-br from-[rgb(var(--peach-light))]/30 to-transparent',
          className
        )}
      >
        <CardContent className="flex flex-col items-center justify-center gap-4 py-12">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
            <User className="h-8 w-8 text-primary" />
          </div>
          <div className="text-center">
            <h3 className="font-semibold text-foreground">No children yet</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Add a child profile to track their progress and get personalized recommendations.
            </p>
          </div>
          <Button asChild variant="outline" className="rounded-full">
            <Link to="/dashboard/settings">Add Child</Link>
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className={cn('grid gap-4 md:grid-cols-2 lg:grid-cols-3', className)}>
      {safeChildren.map((child, index) => (
        <Card
          key={child.id}
          className={cn(
            'overflow-hidden transition-all duration-300 hover:shadow-card-hover hover:-translate-y-0.5',
            index % 2 === 0
              ? 'bg-gradient-to-br from-[rgb(var(--peach-light))]/40 to-transparent'
              : 'bg-gradient-to-br from-[rgb(var(--lavender))]/20 to-transparent'
          )}
          style={{ animationDelay: `${index * 50}ms` }}
        >
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <h3 className="font-semibold text-foreground">{child.name}</h3>
              <p className="text-sm text-muted-foreground">
                Age {child.age} · {child.lastActive ?? 'No recent activity'}
              </p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
              <TrendingUp className="h-5 w-5 text-primary" />
            </div>
          </CardHeader>
          <CardContent className="space-y-3 pt-0">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-muted-foreground">Progress</span>
              <span className="text-lg font-bold text-primary">{child.progress}%</span>
            </div>
            <Progress value={child.progress} className="h-2" />
            <div className="flex items-center gap-2">
              <Flame className="h-4 w-4 text-[rgb(var(--tangerine))]" />
              <span className="text-sm font-medium">
                {child.streak} day streak
              </span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
