import { useState, useCallback } from 'react'
import {
  LayoutDashboard,
  BookOpen,
  Target,
  Sparkles,
  ChevronRight,
  FileText,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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

type ViewMode = 'dashboard' | 'assignments'

const SPARKLINE_DATA = [
  { day: 'M', value: 2 },
  { day: 'T', value: 4 },
  { day: 'W', value: 3 },
  { day: 'T', value: 6 },
  { day: 'F', value: 5 },
  { day: 'S', value: 7 },
  { day: 'S', value: 4 },
]

const DASHBOARD_ITEMS = [
  { id: '1', title: 'Today\'s Goals', detail: '3 of 5 tasks completed', progress: 60 },
  { id: '2', title: 'Math Practice', detail: 'Multiplication tables - 80% mastery', progress: 80 },
  { id: '3', title: 'Reading Time', detail: '15 min daily target', progress: 100 },
]

const ASSIGNMENTS_ITEMS = [
  { id: '1', title: 'Solar System Quiz', type: 'quiz', status: 'Completed' },
  { id: '2', title: 'Spelling Week 5', type: 'flashcards', status: 'In progress' },
  { id: '3', title: 'Fractions Printable', type: 'printable', status: 'Not started' },
]

/**
 * InteractiveDemoPreview - Realistic dashboard mock for the landing hero.
 * Switch between Student Dashboard and Studies/Assignments views.
 * Hover to reveal brief details; includes simulated progress bar and chart.
 */
export function InteractiveDemoPreview() {
  const [viewMode, setViewMode] = useState<ViewMode>('dashboard')
  const [hoveredId, setHoveredId] = useState<string | null>(null)

  const handleViewKeyDown = useCallback(
    (e: React.KeyboardEvent, mode: ViewMode) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault()
        setViewMode(mode)
      }
      if (e.key === 'ArrowRight' && mode === 'dashboard') setViewMode('assignments')
      if (e.key === 'ArrowLeft' && mode === 'assignments') setViewMode('dashboard')
    },
    []
  )

  const items: { id: string; title: string; detail: string; progress: number }[] =
    viewMode === 'dashboard'
      ? DASHBOARD_ITEMS
      : ASSIGNMENTS_ITEMS.map((a) => ({
          id: a.id,
          title: a.title,
          detail: `${a.type} · ${a.status}`,
          progress: a.status === 'Completed' ? 100 : a.status === 'In progress' ? 50 : 0,
        }))

  return (
    <div
      className="group relative w-full max-w-lg"
      role="region"
      aria-label="StudySpark interactive demo preview"
    >
      <div className="overflow-hidden rounded-2xl border border-border/80 bg-card shadow-card transition-all duration-300 hover:shadow-card-hover">
        {/* Header with view toggle */}
        <div className="flex items-center justify-between border-b border-border/80 bg-muted/50 px-4 py-3">
          <h3 className="text-sm font-bold text-foreground">
            StudySpark Preview
          </h3>
          <div
            className="flex rounded-lg bg-muted/80 p-0.5"
            role="tablist"
            aria-label="Switch between dashboard and assignments view"
          >
            <button
              type="button"
              role="tab"
              aria-selected={viewMode === 'dashboard'}
              aria-controls="demo-panel"
              id="tab-dashboard"
              onClick={() => setViewMode('dashboard')}
              onKeyDown={(e) => handleViewKeyDown(e, 'dashboard')}
              className={cn(
                'flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-all duration-200',
                viewMode === 'dashboard'
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              )}
            >
              <LayoutDashboard className="h-3.5 w-3.5" aria-hidden />
              Dashboard
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={viewMode === 'assignments'}
              aria-controls="demo-panel"
              id="tab-assignments"
              onClick={() => setViewMode('assignments')}
              onKeyDown={(e) => handleViewKeyDown(e, 'assignments')}
              className={cn(
                'flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-all duration-200',
                viewMode === 'assignments'
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              )}
            >
              <BookOpen className="h-3.5 w-3.5" aria-hidden />
              Studies
            </button>
          </div>
        </div>

        {/* Main content panel */}
        <div
          id="demo-panel"
          role="tabpanel"
          aria-labelledby={viewMode === 'dashboard' ? 'tab-dashboard' : 'tab-assignments'}
          className="flex min-h-[280px] flex-col gap-3 p-4"
        >
          {/* Widget 1: Progress bar */}
          <Card className="overflow-hidden transition-shadow duration-200 hover:shadow-md">
            <CardHeader className="p-2 pb-0">
              <CardTitle className="flex items-center gap-1.5 text-xs font-semibold">
                <Target className="h-3.5 w-3.5 text-[rgb(var(--tangerine))]" aria-hidden />
                {viewMode === 'dashboard' ? "Today's Plan" : 'Study Progress'}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-2 pt-1">
              <div className="mb-0.5 flex items-center justify-between text-[10px]">
                <span className="text-muted-foreground">Progress</span>
                <span className="font-bold text-primary">65%</span>
              </div>
              <Progress
                value={65}
                className="h-2"
                aria-label="Overall progress 65%"
              />
            </CardContent>
          </Card>

          {/* Widget 2: List with hover details */}
          <Card className="flex-1 overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between p-2 pb-0">
              <CardTitle className="flex items-center gap-1 text-xs font-semibold">
                <Sparkles className="h-3.5 w-3.5 text-[rgb(var(--tangerine))]" aria-hidden />
                {viewMode === 'dashboard' ? 'AI-tailored Suggestions' : 'Assignments'}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-1 p-2">
              {items.map((item) => (
                <div
                  key={item.id}
                  onMouseEnter={() => setHoveredId(item.id)}
                  onMouseLeave={() => setHoveredId(null)}
                  onFocus={() => setHoveredId(item.id)}
                  onBlur={() => setHoveredId(null)}
                  className={cn(
                    'rounded-lg border p-2 transition-all duration-200',
                    hoveredId === item.id
                      ? 'border-primary/40 bg-primary/5 shadow-sm'
                      : 'border-border/60 hover:bg-muted/30'
                  )}
                  tabIndex={0}
                  role="button"
                  aria-label={`${item.title}. ${item.detail}. ${item.progress}% complete`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[11px] font-medium text-foreground">
                        {item.title}
                      </p>
                      <p
                        className={cn(
                          'mt-0.5 text-[10px] text-muted-foreground transition-opacity duration-200',
                          hoveredId === item.id ? 'opacity-100' : 'opacity-70'
                        )}
                      >
                        {item.detail}
                      </p>
                      <Progress
                        value={item.progress}
                        className="mt-1 h-1"
                        aria-hidden
                      />
                    </div>
                    <ChevronRight className="h-3 w-3 shrink-0 text-muted-foreground" aria-hidden />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Widget 3: Mini sparkline chart */}
          <Card className="overflow-hidden">
            <CardHeader className="p-2 pb-0">
              <CardTitle className="flex items-center gap-1 text-xs font-semibold">
                <FileText className="h-3.5 w-3.5 text-muted-foreground" aria-hidden />
                Weekly Activity
              </CardTitle>
            </CardHeader>
            <CardContent className="p-2 pt-1">
              <div className="h-10 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={SPARKLINE_DATA}>
                    <XAxis dataKey="day" hide />
                    <YAxis hide domain={[0, 10]} />
                    <Tooltip
                      contentStyle={{
                        fontSize: 10,
                        padding: '4px 8px',
                        borderRadius: 6,
                      }}
                    />
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
        </div>
      </div>

      <p className="mt-3 text-center text-xs text-muted-foreground">
        Sign up to see your real dashboard
      </p>
    </div>
  )
}
