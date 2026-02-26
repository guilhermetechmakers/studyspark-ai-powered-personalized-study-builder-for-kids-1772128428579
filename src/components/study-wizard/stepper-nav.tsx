import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface StepConfig {
  id: number
  title: string
  icon: React.ComponentType<{ className?: string }>
}

export interface StepperNavProps {
  steps: StepConfig[]
  currentStep: number
  onStepClick?: (stepId: number) => void
  disabled?: boolean
}

export function StepperNav({
  steps,
  currentStep,
  onStepClick,
  disabled = false,
}: StepperNavProps) {
  const safeSteps = steps ?? []

  return (
    <div className="flex items-center gap-2 overflow-x-auto py-2">
      {safeSteps.map((step) => {
        const Icon = step.icon
        const isActive = step.id === currentStep
        const isComplete = step.id < currentStep
        const isClickable = !disabled && step.id < currentStep

        return (
          <button
            key={step.id}
            type="button"
            onClick={() => isClickable && onStepClick?.(step.id)}
            disabled={!isClickable}
            aria-current={isActive ? 'step' : undefined}
            aria-label={`Step ${step.id}: ${step.title}`}
            className={cn(
              'flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-all duration-200',
              isActive && 'bg-primary text-primary-foreground shadow-md',
              isComplete && 'bg-primary/10 text-primary',
              !isActive && !isComplete && 'text-muted-foreground',
              isClickable && 'hover:bg-primary/20 cursor-pointer',
              !isClickable && !isActive && 'cursor-default'
            )}
          >
            <span
              className={cn(
                'flex h-6 w-6 shrink-0 items-center justify-center rounded-full',
                isActive && 'bg-primary-foreground/20',
                isComplete && 'bg-primary/30'
              )}
            >
              {isComplete ? (
                <Check className="h-3.5 w-3.5" aria-hidden />
              ) : (
                <Icon className="h-3.5 w-3.5" aria-hidden />
              )}
            </span>
            <span className="hidden sm:inline">{step.title}</span>
          </button>
        )
      })}
    </div>
  )
}
