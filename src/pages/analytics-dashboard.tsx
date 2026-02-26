/**
 * Parent Analytics Dashboard (page_p010)
 * Progress, time spent, mastery by topic, streaks. Filters by child and date range.
 */

import { useState, useEffect, useCallback } from 'react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
} from 'recharts'
import { Flame, Clock, Award, TrendingUp, Filter } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { fetchParentAnalytics } from '@/api/study-player'
import { supabase } from '@/lib/supabase'
import { cn } from '@/lib/utils'

interface ChildOption {
  id: string
  name: string
}

export function AnalyticsDashboardPage() {
  const [analytics, setAnalytics] = useState<{
    totalTimeMs: number
    averageScore: number
    streakDays: number
    totalAttempts: number
    byStudy: Array<{ studyId: string; topic: string; totalScore: number; totalTimeMs: number; attemptCount: number }>
    byDay: Array<{ date: string; count: number }>
  } | null>(null)
  const [children, setChildren] = useState<ChildOption[]>([])
  const [selectedChildId, setSelectedChildId] = useState<string>('')
  const [range, setRange] = useState<'week' | 'month' | 'all'>('month')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadChildren = useCallback(async () => {
    const { data } = await supabase
      .from('child_profiles')
      .select('id, name')
      .order('name')
    const list = Array.isArray(data) ? data : []
    setChildren(list)
    if (list.length > 0 && !selectedChildId) {
      setSelectedChildId(list[0].id)
    }
  }, [selectedChildId])

  const loadAnalytics = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const data = await fetchParentAnalytics(selectedChildId || undefined, range)
      const totalTimeMs = (data.metrics?.totalTimeMinutes ?? 0) * 60_000
      setAnalytics({
        totalTimeMs,
        averageScore: data.metrics?.averageScore ?? 0,
        streakDays: data.metrics?.streak ?? 0,
        totalAttempts: data.metrics?.attemptCount ?? 0,
        byStudy: data.byStudy ?? [],
        byDay: data.byDay ?? data.timeByDay ?? [],
      })
    } catch (err) {
      setError((err as Error).message)
      setAnalytics(null)
    } finally {
      setIsLoading(false)
    }
  }, [selectedChildId, range])

  useEffect(() => {
    loadChildren()
  }, [loadChildren])

  useEffect(() => {
    loadAnalytics()
  }, [loadAnalytics])

  const formatTime = (ms: number) => {
    const m = Math.floor(ms / 60_000)
    const s = Math.floor((ms % 60_000) / 1000)
    return m > 0 ? `${m}m ${s}s` : `${s}s`
  }

  if (isLoading && !analytics) {
    return (
      <main className="container mx-auto max-w-6xl space-y-6 p-4 sm:p-6">
        <Skeleton className="h-10 w-48" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-32 rounded-2xl" />
          ))}
        </div>
        <Skeleton className="h-64 w-full rounded-2xl" />
      </main>
    )
  }

  return (
    <main
      className="container mx-auto max-w-6xl space-y-6 p-4 animate-fade-in sm:p-6"
      aria-labelledby="analytics-heading"
    >
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground md:text-3xl" id="analytics-heading">
            Progress & Analytics
          </h1>
          <p className="mt-1 text-muted-foreground">
            Track learning progress, time spent, and mastery by topic
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Filter className="h-5 w-5 text-muted-foreground" />
          <Select value={selectedChildId} onValueChange={setSelectedChildId}>
            <SelectTrigger className="w-[180px] rounded-xl">
              <SelectValue placeholder="Select child" />
            </SelectTrigger>
            <SelectContent>
              {children.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.name}
                </SelectItem>
              ))}
              {children.length === 0 && (
                <SelectItem value="all" disabled>
                  No children
                </SelectItem>
              )}
            </SelectContent>
          </Select>
          <Select value={range} onValueChange={(v) => setRange(v as 'week' | 'month' | 'all')}>
            <SelectTrigger className="w-[140px] rounded-xl">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">Last 7 days</SelectItem>
              <SelectItem value="month">Last 30 days</SelectItem>
              <SelectItem value="all">All time</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm" onClick={loadAnalytics} className="rounded-xl">
            Refresh
          </Button>
        </div>
      </header>

      {error && (
        <Card className="border-destructive/50 bg-destructive/5">
          <CardContent className="py-4">
            <p className="text-destructive">{error}</p>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card
          className={cn(
            'overflow-hidden transition-all duration-300 hover:shadow-card-hover',
            'bg-gradient-to-br from-[rgb(var(--peach-light))]/30 to-transparent'
          )}
        >
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Time
            </CardTitle>
            <Clock className="h-5 w-5 text-[rgb(var(--tangerine))]" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-foreground">
              {analytics ? formatTime(analytics.totalTimeMs) : '0s'}
            </p>
          </CardContent>
        </Card>

        <Card
          className={cn(
            'overflow-hidden transition-all duration-300 hover:shadow-card-hover',
            'bg-gradient-to-br from-[rgb(var(--lavender))]/20 to-transparent'
          )}
        >
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Average Score
            </CardTitle>
            <Award className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-foreground">
              {analytics?.averageScore ?? 0}
            </p>
          </CardContent>
        </Card>

        <Card
          className={cn(
            'overflow-hidden transition-all duration-300 hover:shadow-card-hover',
            'bg-gradient-to-br from-[rgb(var(--coral))]/20 to-transparent'
          )}
        >
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Streak
            </CardTitle>
            <Flame className="h-5 w-5 text-[rgb(var(--coral))]" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-foreground">
              {analytics?.streakDays ?? 0} days
            </p>
          </CardContent>
        </Card>

        <Card
          className={cn(
            'overflow-hidden transition-all duration-300 hover:shadow-card-hover',
            'bg-gradient-to-br from-primary/10 to-transparent'
          )}
        >
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Attempts
            </CardTitle>
            <TrendingUp className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-foreground">
              {analytics?.totalAttempts ?? 0}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="overflow-hidden rounded-2xl">
          <CardHeader>
            <CardTitle>Activity by Day</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              {analytics?.byDay && analytics.byDay.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={analytics.byDay}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="date" className="text-xs" />
                    <YAxis className="text-xs" />
                    <Tooltip
                      contentStyle={{
                        borderRadius: '12px',
                        border: '1px solid rgb(var(--border))',
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="count"
                      stroke="rgb(var(--primary))"
                      fill="rgb(var(--primary))"
                      fillOpacity={0.2}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex h-full items-center justify-center text-muted-foreground">
                  No activity data yet
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="overflow-hidden rounded-2xl">
          <CardHeader>
            <CardTitle>Mastery by Topic</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              {analytics?.byStudy && analytics.byStudy.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={analytics.byStudy}
                    layout="vertical"
                    margin={{ left: 8, right: 8 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis type="number" className="text-xs" />
                    <YAxis
                      type="category"
                      dataKey="topic"
                      width={100}
                      tick={{ fontSize: 12 }}
                    />
                    <Tooltip
                      contentStyle={{
                        borderRadius: '12px',
                        border: '1px solid rgb(var(--border))',
                      }}
                    />
                    <Bar
                      dataKey="totalScore"
                      fill="rgb(var(--primary))"
                      radius={[0, 4, 4, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex h-full items-center justify-center text-muted-foreground">
                  No study data yet
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  )
}
