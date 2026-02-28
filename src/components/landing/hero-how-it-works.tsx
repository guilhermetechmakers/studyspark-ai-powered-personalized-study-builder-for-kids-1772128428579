import { useState, useCallback } from 'react'
import { Target, Sparkles, BarChart3 } from 'lucide-react'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  ResponsiveContainer,
} from 'recharts'
import { cn } from '@/lib/utils'

const STEPS = [
  { id: 1, title: 'Choose goals', icon: Target },
  { id: 2, title: 'Generate study plan', icon: Sparkles },
  { id: 3, title: 'Track progress', icon: BarChart3 },
] as const

const MOCK_CHART_DATA = [
  { day: 'Mon', value: 3 },
  { day: 'Tue', value: 5 },
  { day: 'Wed', value: 4 },
  { day: 'Thu', value: 7 },
  { day: 'Fri', value: 6 },
]

/**
 * HeroHowItWorks - Compact 3-step "How it works" with interactivity.
 * Click steps to highlight; step 3 shows a mock progress chart.
 */
export function HeroHowItWorks() {
  const [activeStep, setActiveStep] = useState<number>(1)

  const handleStepKeyDown = useCallback((e: React.KeyboardEvent, stepId: number) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      setActiveStep(stepId)
    }
    if (e.key === 'ArrowRight' && stepId < 3) setActiveStep(stepId + 1)
    if (e.key === 'ArrowLeft' && stepId > 1) setActiveStep(stepId - 1)
  }, [])

  return (
    <section
      className="mt-12 md:mt-16"
      aria-labelledby="hero-how-it-works-heading"
    >
      <h2
        id="hero-how-it-works-heading"
        className="text-center text-lg font-semibold text-foreground sm:text-xl"
      >
        How it works
      </h2>
      <div className="mt-6 flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-center">
        {STEPS.map(({ id, title, icon: Icon }) => (
          <button
            key={id}
            type="button"
            onClick={() => setActiveStep(id)}
            onKeyDown={(e) => handleStepKeyDown(e, id)}
            className={cn(
              'group flex flex-1 flex-col items-center rounded-xl border p-4 text-center transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
              activeStep === id
                ? 'border-primary bg-primary/10 shadow-md'
                : 'border-border/80 bg-muted/30 hover:border-primary/50 hover:bg-muted/50'
            )}
            aria-pressed={activeStep === id}
            aria-label={`Step ${id}: ${title}. ${activeStep === id ? 'Selected' : 'Click to select'}`}
          >
            <div
              className={cn(
                'flex h-10 w-10 items-center justify-center rounded-xl transition-colors duration-200',
                activeStep === id ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground group-hover:bg-primary/20 group-hover:text-primary'
              )}
            >
              <Icon className="h-5 w-5" aria-hidden />
            </div>
            <span className="mt-2 text-sm font-medium text-foreground">
              {id}. {title}
            </span>
          </button>
        ))}
      </div>
      {/* Mock chart - visible when step 3 is active */}
      {activeStep === 3 && (
        <div
          className="mt-6 animate-fade-in-up rounded-xl border border-border/80 bg-card p-4"
          role="img"
          aria-label="Sample progress chart showing weekly study activity"
        >
          <p className="mb-3 text-center text-xs font-medium text-muted-foreground">
            Sample progress
          </p>
          <div className="h-24 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={MOCK_CHART_DATA}>
                <XAxis dataKey="day" tick={{ fontSize: 10 }} />
                <YAxis hide domain={[0, 10]} />
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
        </div>
      )}
    </section>
  )
}
