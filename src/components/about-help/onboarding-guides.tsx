import { useState, useEffect, useCallback } from 'react'
import { ChevronDown, ChevronUp, Printer, Download, Lightbulb, BookOpen, AlertCircle } from 'lucide-react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Skeleton } from '@/components/ui/skeleton'
import { EmptyState } from '@/components/settings/empty-state'
import { fetchOnboardingGuides } from '@/api/help'
import type { Guide, GuideStep } from '@/types/help'
function GuideStepItem({
  step,
  index,
  expanded,
  onToggle,
}: {
  step: GuideStep
  index: number
  expanded: boolean
  onToggle: () => void
}) {
  return (
    <div className="border-b border-border last:border-b-0">
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center justify-between gap-4 py-4 text-left transition-colors hover:bg-muted/50"
        aria-expanded={expanded}
      >
        <span className="flex items-center gap-2">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
            {index + 1}
          </span>
          <span className="font-medium text-foreground">{step.title}</span>
        </span>
        {expanded ? (
          <ChevronUp className="h-4 w-4 shrink-0 text-muted-foreground" />
        ) : (
          <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />
        )}
      </button>
      {expanded && (
        <div className="animate-fade-in pb-4 pl-10 pr-4">
          <p className="text-sm text-muted-foreground">{step.content}</p>
          {step.tip && (
            <div className="mt-3 flex gap-2 rounded-xl bg-accent/10 p-3">
              <Lightbulb className="h-4 w-4 shrink-0 text-accent" />
              <p className="text-sm text-foreground">
                <span className="font-medium">Tip:</span> {step.tip}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function GuideCard({ guide }: { guide: Guide }) {
  const [expandedSteps, setExpandedSteps] = useState<Set<string>>(new Set())
  const steps = (guide.steps ?? []) as GuideStep[]

  const toggleStep = (stepId: string) => {
    setExpandedSteps((prev) => {
      const next = new Set(prev)
      if (next.has(stepId)) {
        next.delete(stepId)
      } else {
        next.add(stepId)
      }
      return next
    })
  }

  const progress = steps.length > 0
    ? Math.round(
        ((expandedSteps.size / steps.length) * 100)
      )
    : 0

  const handlePrint = () => {
    window.print()
  }

  const handleExport = () => {
    const content = steps
      .map((s, i) => `${i + 1}. ${s.title}\n   ${s.content}${s.tip ? `\n   Tip: ${s.tip}` : ''}`)
      .join('\n\n')
    const blob = new Blob([`${guide.title}\n\n${content}`], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `studyspark-${guide.title.toLowerCase().replace(/\s+/g, '-')}.txt`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <Card className="overflow-hidden transition-all duration-200 hover:shadow-card-hover">
      <CardHeader className="flex flex-row items-center justify-between gap-4 pb-2">
        <div>
          <h3 className="text-lg font-semibold text-foreground">{guide.title}</h3>
          <Progress value={progress} className="mt-2 h-2 w-32" />
        </div>
        {guide.printable && (
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              className="rounded-full"
              onClick={handlePrint}
              aria-label="Print guide"
            >
              <Printer className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="rounded-full"
              onClick={handleExport}
              aria-label="Export guide"
            >
              <Download className="h-4 w-4" />
            </Button>
          </div>
        )}
      </CardHeader>
      <CardContent className="pt-0">
        <div className="rounded-xl border border-border bg-muted/30">
          {(steps ?? []).map((step, index) => (
            <GuideStepItem
              key={step.id}
              step={step}
              index={index}
              expanded={expandedSteps.has(step.id)}
              onToggle={() => toggleStep(step.id)}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

export function OnboardingGuides() {
  const [guides, setGuides] = useState<Guide[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadGuides = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await fetchOnboardingGuides()
      setGuides(Array.isArray(data) ? data : [])
    } catch {
      setGuides([])
      setError('Failed to load guides. Please try again.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadGuides()
  }, [loadGuides])

  return (
    <section aria-labelledby="guides-heading" className="space-y-6">
      <h2 id="guides-heading" className="text-xl font-bold text-foreground">
        Onboarding Guides
      </h2>
      <p className="text-sm text-muted-foreground">
        Step-by-step guides to help you get started with StudySpark
      </p>

      {loading ? (
        <div className="space-y-4" role="status" aria-live="polite" aria-label="Loading onboarding guides">
          <p className="text-sm text-muted-foreground">Loading guides...</p>
          <div className="grid gap-4 md:grid-cols-2">
            {[1, 2].map((i) => (
              <Card key={i}>
                <CardHeader>
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="mt-2 h-2 w-32" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-24 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      ) : error ? (
        <Card>
          <CardContent className="p-6 py-12">
            <EmptyState
              icon={AlertCircle}
              title="Couldn't load guides"
              description={error}
              actionLabel="Try again"
              onAction={loadGuides}
            />
          </CardContent>
        </Card>
      ) : (guides ?? []).length === 0 ? (
        <Card>
          <CardContent className="p-6 py-12">
            <EmptyState
              icon={BookOpen}
              title="No guides available yet"
              description="Check back later or try refreshing to load guides."
              actionLabel="Refresh guides"
              onAction={loadGuides}
            />
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {(guides ?? []).map((guide) => (
            <GuideCard key={guide.id} guide={guide} />
          ))}
        </div>
      )}
    </section>
  )
}
