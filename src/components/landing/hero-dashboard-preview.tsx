import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  LayoutDashboard,
  BookOpen,
  Flame,
  PlusCircle,
  FileText,
  LayoutTemplate,
  Sparkles,
  ChevronRight,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
} from 'recharts'
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

const MOCK_CHILDREN = [
  { id: '1', name: 'Emma', age: 8, progress: 72, streak: 5, lastActive: 'Today' },
  { id: '2', name: 'Jake', age: 10, progress: 88, streak: 12, lastActive: 'Yesterday' },
]

const MOCK_STUDIES = [
  { id: '1', title: 'Multiplication Tables', updatedAt: '2 hours ago', status: 'completed' as const },
  { id: '2', title: 'Solar System Facts', updatedAt: 'Yesterday', status: 'in-progress' as const },
  { id: '3', title: 'Spelling Week 5', updatedAt: '2 days ago', status: 'saved' as const },
]

const STATUS_LABELS: Record<string, string> = {
  saved: 'Saved',
  completed: 'Completed',
  'in-progress': 'In Progress',
}

const STATUS_COLORS: Record<string, string> = {
  saved: 'bg-primary/10 text-primary',
  completed: 'bg-green-500/10 text-green-600',
  'in-progress': 'bg-[rgb(var(--tangerine))]/20 text-[rgb(var(--tangerine))]',
}

type HighlightStep = 'upload' | 'ai' | 'review' | null

/**
 * HeroDashboardPreview - Interactive dashboard preview for the landing hero.
 * Displays a realistic mini-dashboard with progress cards, studies, and quick create.
 * Includes cycling highlight to demonstrate the app flow (Upload → AI → Review).
 */
export function HeroDashboardPreview() {
  const [highlightStep, setHighlightStep] = useState<HighlightStep>(null)

  useEffect(() => {
    const steps: HighlightStep[] = ['upload', 'ai', 'review', null]
    let idx = 0
    const interval = setInterval(() => {
      idx = (idx + 1) % steps.length
      setHighlightStep(steps[idx])
    }, 2500)
    return () => clearInterval(interval)
  }, [])

  const isUploadHighlighted = highlightStep === 'upload'
  const isAIHighlighted = highlightStep === 'ai'
  const isReviewHighlighted = highlightStep === 'review'

  return (
    <div className="group relative w-full max-w-lg">
      {/* Browser-style frame */}
      <div className="overflow-hidden rounded-2xl border border-border/80 bg-card shadow-card-hover transition-all duration-300 group-hover:shadow-glow">
        {/* Browser chrome */}
        <div className="flex items-center gap-2 border-b border-border/80 bg-muted/50 px-4 py-2.5">
          <div className="flex gap-1.5">
            <div className="h-2 w-2 rounded-full bg-red-400/80" />
            <div className="h-2 w-2 rounded-full bg-amber-400/80" />
            <div className="h-2 w-2 rounded-full bg-green-400/80" />
          </div>
          <div className="mx-auto flex flex-1 items-center justify-center gap-2 rounded-lg bg-background/80 px-4 py-1.5 text-xs text-muted-foreground">
            <LayoutDashboard className="h-3.5 w-3.5" />
            <span>app.studyspark.com/dashboard</span>
          </div>
        </div>

        {/* Dashboard content - scaled preview */}
        <div className="space-y-3 p-4">
          {/* Header */}
          <div className="animate-fade-in">
            <h3 className="text-sm font-bold text-foreground">Dashboard</h3>
            <p className="text-xs text-muted-foreground">Welcome back! Here&apos;s how your children are doing.</p>
          </div>

          {/* Progress cards */}
          <div className="grid grid-cols-2 gap-2">
            {MOCK_CHILDREN.map((child, idx) => (
              <Card
                key={child.id}
                className={cn(
                  'overflow-hidden transition-all duration-200 hover:shadow-sm',
                  idx === 0 && 'bg-gradient-to-br from-[rgb(var(--peach-light))]/30 to-transparent',
                  idx === 1 && 'bg-gradient-to-br from-[rgb(var(--lavender))]/20 to-transparent'
                )}
              >
                <CardHeader className="flex flex-row items-center justify-between p-2 pb-0">
                  <CardTitle className="text-xs font-semibold">{child.name}</CardTitle>
                  <span className="text-[10px] text-muted-foreground">Age {child.age}</span>
                </CardHeader>
                <CardContent className="space-y-2 p-2 pt-1">
                  <div>
                    <div className="mb-0.5 flex items-center justify-between text-[10px]">
                      <span className="text-muted-foreground">Progress</span>
                      <span className="font-bold text-primary">{child.progress}%</span>
                    </div>
                    <Progress value={child.progress} className="h-1.5" />
                  </div>
                  <div className="flex items-center gap-1">
                    <Flame className="h-3 w-3 text-[rgb(var(--tangerine))]" />
                    <span className="text-[10px] font-semibold">{child.streak} day streak</span>
                  </div>
                  <div className="h-6">
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
                          strokeWidth={1.5}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Main content grid */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-[1fr_auto]">
            {/* Recent studies - represents "Review" step */}
            <Card
              className={cn(
                'transition-all duration-200',
                isReviewHighlighted && 'ring-2 ring-primary ring-offset-2 shadow-glow'
              )}
            >
              <CardHeader className="flex flex-row items-center justify-between p-2 pb-0">
                <div>
                  <CardTitle className="text-xs font-semibold">Recent Studies</CardTitle>
                  <p className="text-[10px] text-muted-foreground">Your latest study sets</p>
                </div>
                <Button variant="ghost" size="sm" className="h-6 px-2 text-[10px]" asChild>
                  <Link to="/dashboard/studies">View all</Link>
                </Button>
              </CardHeader>
              <CardContent className="space-y-1.5 p-2">
                {MOCK_STUDIES.map((study) => (
                  <div
                    key={study.id}
                    className="flex items-center justify-between gap-2 rounded-lg border border-border/60 p-2 transition-all duration-200 hover:bg-muted/50"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[11px] font-medium text-foreground">{study.title}</p>
                      <div className="mt-0.5 flex items-center gap-1.5">
                        <span
                          className={cn(
                            'inline-flex rounded px-1.5 py-0.5 text-[9px] font-medium',
                            STATUS_COLORS[study.status]
                          )}
                        >
                          {STATUS_LABELS[study.status]}
                        </span>
                        <span className="text-[9px] text-muted-foreground">{study.updatedAt}</span>
                      </div>
                    </div>
                    <ChevronRight className="h-3 w-3 shrink-0 text-muted-foreground" />
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Quick create - represents "Upload" and "AI" steps */}
            <Card
              className={cn(
                'border-primary/30 bg-gradient-to-br from-primary/5 to-[rgb(var(--peach-light))]/20 transition-all duration-200',
                (isUploadHighlighted || isAIHighlighted) && 'ring-2 ring-primary ring-offset-2 shadow-glow'
              )}
            >
              <CardHeader className="flex flex-row items-center justify-between p-2 pb-0">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                    <PlusCircle className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-xs font-semibold">Quick Create</CardTitle>
                    <p className="text-[10px] text-muted-foreground">Start in seconds</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-1.5 p-2">
                <Button
                  size="sm"
                  className="h-8 w-full justify-start gap-2 px-2 text-[11px]"
                  asChild
                >
                  <Link to="/signup">
                    <FileText className="h-3.5 w-3.5 shrink-0" />
                    <span className="truncate">Use teacher materials</span>
                  </Link>
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="h-8 w-full justify-start gap-2 px-2 text-[11px]"
                  asChild
                >
                  <Link to="/signup">
                    <LayoutTemplate className="h-3.5 w-3.5 shrink-0" />
                    <span className="truncate">Start from template</span>
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Flow indicator - interactive step labels */}
          <div className="flex items-center justify-center gap-2 rounded-lg bg-muted/30 px-3 py-2">
            <span
              className={cn(
                'flex items-center gap-1 rounded-md px-2 py-1 text-[10px] font-medium transition-all duration-300',
                isUploadHighlighted ? 'bg-primary/20 text-primary' : 'text-muted-foreground'
              )}
            >
              <FileText className="h-3 w-3" />
              1. Upload
            </span>
            <ChevronRight className="h-3 w-3 text-muted-foreground" />
            <span
              className={cn(
                'flex items-center gap-1 rounded-md px-2 py-1 text-[10px] font-medium transition-all duration-300',
                isAIHighlighted ? 'bg-primary/20 text-primary' : 'text-muted-foreground'
              )}
            >
              <Sparkles className="h-3 w-3" />
              2. AI generates
            </span>
            <ChevronRight className="h-3 w-3 text-muted-foreground" />
            <span
              className={cn(
                'flex items-center gap-1 rounded-md px-2 py-1 text-[10px] font-medium transition-all duration-300',
                isReviewHighlighted ? 'bg-primary/20 text-primary' : 'text-muted-foreground'
              )}
            >
              <BookOpen className="h-3 w-3" />
              3. Review
            </span>
          </div>
        </div>
      </div>

      {/* Subtle CTA hint */}
      <p className="mt-3 text-center text-xs text-muted-foreground">
        Sign up to see your real dashboard
      </p>
    </div>
  )
}
