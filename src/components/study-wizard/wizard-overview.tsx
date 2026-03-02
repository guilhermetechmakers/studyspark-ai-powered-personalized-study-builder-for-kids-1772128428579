import { Sparkles, FileText, Upload, User, Settings, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const STEPS = [
  {
    id: 1,
    emoji: '✏️',
    icon: FileText,
    title: 'Topic & Context',
    desc: 'Enter the study topic and any teacher notes',
    color: 'from-blue-100 to-sky-50 dark:from-blue-900/30 dark:to-sky-900/20',
    border: 'border-blue-200 dark:border-blue-800',
    num: 'bg-blue-500',
  },
  {
    id: 2,
    emoji: '📎',
    icon: Upload,
    title: 'Upload Materials',
    desc: 'Attach worksheets, photos, or documents',
    color: 'from-violet-100 to-purple-50 dark:from-violet-900/30 dark:to-purple-900/20',
    border: 'border-violet-200 dark:border-violet-800',
    num: 'bg-violet-500',
  },
  {
    id: 3,
    emoji: '🧒',
    icon: User,
    title: 'Child & Style',
    desc: 'Pick your child and how they learn best',
    color: 'from-pink-100 to-rose-50 dark:from-pink-900/30 dark:to-rose-900/20',
    border: 'border-pink-200 dark:border-pink-800',
    num: 'bg-pink-500',
  },
  {
    id: 4,
    emoji: '⚙️',
    icon: Settings,
    title: 'Generation Options',
    desc: 'Choose depth, flashcards, quizzes & more',
    color: 'from-amber-100 to-yellow-50 dark:from-amber-900/30 dark:to-yellow-900/20',
    border: 'border-amber-200 dark:border-amber-800',
    num: 'bg-amber-500',
  },
  {
    id: 5,
    emoji: '✨',
    icon: Sparkles,
    title: 'AI Generation',
    desc: 'Watch personalised content appear live',
    color: 'from-emerald-100 to-green-50 dark:from-emerald-900/30 dark:to-green-900/20',
    border: 'border-emerald-200 dark:border-emerald-800',
    num: 'bg-emerald-500',
  },
  {
    id: 6,
    emoji: '🎉',
    icon: CheckCircle2,
    title: 'Review & Save',
    desc: 'Edit, approve, and share with your child',
    color: 'from-orange-100 to-amber-50 dark:from-orange-900/30 dark:to-amber-900/20',
    border: 'border-orange-200 dark:border-orange-800',
    num: 'bg-orange-500',
  },
]

export interface WizardOverviewProps {
  onStart: () => void
  className?: string
}

export function WizardOverview({ onStart, className }: WizardOverviewProps) {
  return (
    <div className={cn('space-y-8', className)}>
      {/* Hero banner */}
      <div className="overflow-hidden rounded-3xl bg-gradient-to-br from-primary/20 via-[rgb(var(--lavender))]/20 to-[rgb(var(--peach-light))]/30 p-8 text-center">
        <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-primary to-secondary shadow-lg">
          <span className="text-4xl select-none animate-float">✨</span>
        </div>
        <h1 className="text-3xl font-black tracking-tight text-foreground sm:text-4xl">
          Create a Study Set
        </h1>
        <p className="mt-3 max-w-xl mx-auto text-muted-foreground text-base leading-relaxed">
          Build a personalised, AI-powered study experience for your child in just a few steps.
          Upload materials, pick a learning style, and let the magic happen!
        </p>
        <Button
          size="lg"
          onClick={onStart}
          className="mt-6 gap-2 rounded-2xl px-8 font-black text-base bg-gradient-to-r from-primary to-secondary text-white hover:opacity-90 shadow-lg"
        >
          <Sparkles className="h-5 w-5" />
          Let's Get Started!
        </Button>
      </div>

      {/* Step cards grid */}
      <div>
        <p className="mb-4 text-center text-sm font-bold uppercase tracking-widest text-muted-foreground">
          How it works — 6 easy steps
        </p>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {STEPS.map((step) => (
            <div
              key={step.id}
              className={cn(
                'flex items-start gap-4 rounded-2xl border-2 p-4 transition-all duration-200 hover:scale-[1.02] hover:shadow-md',
                step.color,
                step.border,
              )}
            >
              <div className={cn('flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-white text-sm font-black shadow-sm', step.num)}>
                {step.id}
              </div>
              <div className="min-w-0">
                <p className="font-bold text-foreground">
                  {step.emoji} {step.title}
                </p>
                <p className="mt-0.5 text-xs text-muted-foreground leading-relaxed">{step.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Tip banner */}
      <div className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 dark:border-amber-800 dark:bg-amber-900/20">
        <span className="text-2xl select-none shrink-0">💡</span>
        <p className="text-sm text-amber-800 dark:text-amber-200">
          <strong>Pro tip:</strong> Uploading your child's worksheets or photos of class notes gives the AI much better context — the study materials will be laser-focused on what's relevant!
        </p>
      </div>
    </div>
  )
}
