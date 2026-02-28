import { useState, useCallback } from 'react'
import {
  LayoutDashboard,
  Hammer,
  BarChart3,
  Sparkles,
  ChevronRight,
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
  PieChart,
  Pie,
  Cell,
} from 'recharts'
import { cn } from '@/lib/utils'

type NavItem = 'overview' | 'build' | 'insights'

const NAV_ITEMS: { id: NavItem; label: string; icon: typeof LayoutDashboard }[] = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'build', label: 'Build', icon: Hammer },
  { id: 'insights', label: 'Insights', icon: BarChart3 },
]

const SPARKLINE_DATA = [
  { day: 'M', value: 2 },
  { day: 'T', value: 4 },
  { day: 'W', value: 3 },
  { day: 'T', value: 6 },
  { day: 'F', value: 5 },
  { day: 'S', value: 7 },
  { day: 'S', value: 4 },
]

const OVERVIEW_SUGGESTIONS = [
  { id: '1', title: 'Multiplication Tables', type: 'flashcards', progress: 60 },
  { id: '2', title: 'Solar System Facts', type: 'quiz', progress: 100 },
  { id: '3', title: 'Spelling Week 5', type: 'printable', progress: 30 },
]

const BUILD_SUGGESTIONS = [
  { id: '1', title: 'Start from teacher notes', type: 'upload' },
  { id: '2', title: 'Use a template', type: 'template' },
  { id: '3', title: 'Create from scratch', type: 'scratch' },
]

const INSIGHTS_SUGGESTIONS = [
  { id: '1', title: 'Study streak: 5 days', type: 'streak' },
  { id: '2', title: 'Best time: Morning', type: 'time' },
  { id: '3', title: 'Top subject: Math', type: 'subject' },
]

const DONUT_DATA = [
  { name: 'Done', value: 65, color: 'rgb(var(--primary))' },
  { name: 'Remaining', value: 35, color: 'rgb(var(--muted))' },
]

/**
 * HeroDashboardPreview - Interactive dashboard preview for the landing hero.
 * Layout: header, left vertical nav (Overview, Build, Insights), main pane with three widgets.
 * Widgets: Today's Plan (progress/donut), AI-tailored Suggestions, Mini sparkline.
 */
export function HeroDashboardPreview() {
  const [activeNav, setActiveNav] = useState<NavItem>('overview')

  const suggestions =
    activeNav === 'overview'
      ? OVERVIEW_SUGGESTIONS
      : activeNav === 'build'
        ? BUILD_SUGGESTIONS
        : INSIGHTS_SUGGESTIONS

  const handleNavKeyDown = useCallback(
    (e: React.KeyboardEvent, id: NavItem) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault()
        setActiveNav(id)
      }
      if (e.key === 'ArrowDown' && id === 'overview') setActiveNav('build')
      if (e.key === 'ArrowDown' && id === 'build') setActiveNav('insights')
      if (e.key === 'ArrowUp' && id === 'insights') setActiveNav('build')
      if (e.key === 'ArrowUp' && id === 'build') setActiveNav('overview')
    },
    []
  )

  return (
    <div
      className="group relative w-full max-w-lg"
      role="region"
      aria-label="StudySpark Dashboard Preview"
    >
      <div className="overflow-hidden rounded-2xl border border-border/80 bg-card shadow-card-hover transition-all duration-300 group-hover:shadow-glow">
        {/* Header */}
        <div className="border-b border-border/80 bg-muted/50 px-4 py-3">
          <h3 className="text-sm font-bold text-foreground">
            StudySpark Dashboard Preview
          </h3>
        </div>

        <div className="flex min-h-[280px]">
          {/* Left vertical nav */}
          <nav
            className="flex w-24 flex-shrink-0 flex-col border-r border-border/80 bg-muted/30 p-2"
            aria-label="Dashboard navigation"
          >
            {NAV_ITEMS.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                type="button"
                onClick={() => setActiveNav(id)}
                onKeyDown={(e) => handleNavKeyDown(e, id)}
                className={cn(
                  'flex items-center gap-2 rounded-lg px-2 py-2.5 text-left text-xs font-medium transition-all duration-200',
                  activeNav === id
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                )}
                aria-label={`Switch to ${label} view`}
                aria-pressed={activeNav === id}
                aria-current={activeNav === id ? 'page' : undefined}
              >
                <Icon className="h-4 w-4 shrink-0" aria-hidden />
                <span>{label}</span>
              </button>
            ))}
          </nav>

          {/* Main pane */}
          <div className="flex flex-1 flex-col gap-2 p-3">
            {/* Widget 1: Today's Plan - progress bar or donut */}
            <Card className="overflow-hidden">
              <CardHeader className="p-2 pb-0">
                <CardTitle className="text-xs font-semibold">Today&apos;s Plan</CardTitle>
              </CardHeader>
              <CardContent className="p-2 pt-1">
                <div className="flex items-center gap-2">
                  <div className="h-12 w-12 shrink-0">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={DONUT_DATA}
                          cx="50%"
                          cy="50%"
                          innerRadius={14}
                          outerRadius={22}
                          paddingAngle={2}
                          dataKey="value"
                        >
                          {DONUT_DATA.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="mb-0.5 flex items-center justify-between text-[10px]">
                      <span className="text-muted-foreground">Progress</span>
                      <span className="font-bold text-primary">65%</span>
                    </div>
                    <Progress value={65} className="h-1.5" aria-label="Today's plan progress 65%" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Widget 2: AI-tailored Suggestions */}
            <Card className="flex-1 overflow-hidden">
              <CardHeader className="flex flex-row items-center justify-between p-2 pb-0">
                <CardTitle className="flex items-center gap-1 text-xs font-semibold">
                  <Sparkles className="h-3.5 w-3.5 text-[rgb(var(--tangerine))]" aria-hidden />
                  AI-tailored Suggestions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-1 p-2">
                {suggestions.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    className="flex w-full items-center justify-between gap-2 rounded-lg border border-border/60 p-2 text-left transition-all duration-200 hover:bg-muted/50 hover:border-primary/30 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                    aria-label={`Suggestion: ${item.title}`}
                  >
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[11px] font-medium text-foreground">
                        {item.title}
                      </p>
                      {'progress' in item && typeof item.progress === 'number' && (
                        <Progress
                          value={item.progress}
                          className="mt-1 h-1"
                          aria-label={`${item.progress}% complete`}
                        />
                      )}
                    </div>
                    <ChevronRight className="h-3 w-3 shrink-0 text-muted-foreground" aria-hidden />
                  </button>
                ))}
              </CardContent>
            </Card>

            {/* Widget 3: Mini sparkline */}
            <Card className="overflow-hidden">
              <CardHeader className="p-2 pb-0">
                <CardTitle className="text-xs font-semibold">Weekly Activity</CardTitle>
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
      </div>

      <p className="mt-3 text-center text-xs text-muted-foreground">
        Sign up to see your real dashboard
      </p>
    </div>
  )
}
