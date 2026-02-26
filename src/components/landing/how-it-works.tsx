import { Link } from 'react-router-dom'
import { ChevronRight, Upload, Sparkles, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export interface HowItWorksStep {
  step: number
  title: string
  description: string
}

const DEFAULT_STEPS: HowItWorksStep[] = [
  {
    step: 1,
    title: 'Upload teacher materials',
    description: 'Add exam topic, subject, and teacher-provided documents or photos.',
  },
  {
    step: 2,
    title: 'AI generates',
    description: 'Choose age, grade, and style. AI creates flashcards, quizzes, and PDFs.',
  },
  {
    step: 3,
    title: 'Review & share',
    description: 'Review, edit, request changes. Approve when ready. Share or print.',
  },
]

const STEP_ICONS = [Upload, Sparkles, CheckCircle2] as const

export interface HowItWorksProps {
  steps?: HowItWorksStep[]
  className?: string
}

export function HowItWorks({ steps = DEFAULT_STEPS, className }: HowItWorksProps) {
  const stepList = Array.isArray(steps) ? steps : DEFAULT_STEPS

  return (
    <section
      id="how-it-works"
      className={cn('bg-muted/50 py-20 md:py-28', className)}
      aria-labelledby="how-it-works-heading"
    >
      <div className="container">
        <div className="mx-auto max-w-2xl text-center">
          <h2 id="how-it-works-heading" className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            How It Works
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Three simple steps from materials to study sets.
          </p>
        </div>
        <div className="mt-16 grid gap-8 md:grid-cols-3">
          {(stepList ?? []).map((s, i) => {
            const StepIcon = STEP_ICONS[i] ?? Sparkles
            return (
              <div
                key={s.step ?? i}
                className="relative flex flex-col items-center text-center animate-fade-in-up"
                style={{ animationDelay: `${i * 100}ms` }}
              >
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
                  <StepIcon className="h-7 w-7" aria-hidden />
                </div>
                <h3 className="mt-4 text-lg font-semibold text-foreground">{s.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{s.description}</p>
                {i < stepList.length - 1 && (
                  <ChevronRight
                    className="absolute -right-4 top-7 hidden h-8 w-8 text-muted-foreground md:block"
                    aria-hidden
                  />
                )}
              </div>
            )
          })}
        </div>
        <div className="mt-12 text-center">
          <Button size="lg" asChild>
            <Link to="/signup">Get Started Free</Link>
          </Button>
        </div>
      </div>
    </section>
  )
}
