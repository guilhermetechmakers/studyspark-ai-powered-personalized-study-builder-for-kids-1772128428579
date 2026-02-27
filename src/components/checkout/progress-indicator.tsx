import { ShoppingCart, CreditCard, CheckCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

export type CheckoutStep = 'cart' | 'payment' | 'confirmation'

const STEPS: {
  id: CheckoutStep
  label: string
  icon: React.ComponentType<{ className?: string }>
}[] = [
  { id: 'cart', label: 'Cart', icon: ShoppingCart },
  { id: 'payment', label: 'Payment', icon: CreditCard },
  { id: 'confirmation', label: 'Confirmation', icon: CheckCircle },
]

export interface ProgressIndicatorProps {
  currentStep: CheckoutStep
  className?: string
}

export function ProgressIndicator({ currentStep, className }: ProgressIndicatorProps) {
  const currentIndex = STEPS.findIndex((s) => s.id === currentStep)
  const safeIndex = currentIndex >= 0 ? currentIndex : 0

  return (
    <nav
      aria-label="Checkout progress"
      className={cn('w-full', className)}
    >
      <ol className="flex items-center justify-between gap-2">
        {(STEPS ?? []).map((step, i) => {
          const Icon = step.icon
          const isCompleted = i < safeIndex
          const isCurrent = i === safeIndex
          const stepStatus = isCompleted
            ? `${step.label}, completed`
            : isCurrent
              ? `${step.label}, current step`
              : step.label
          return (
            <li
              key={step.id}
              className={cn(
                'flex flex-1 items-center',
                i < STEPS.length - 1 &&
                  'after:flex-1 after:border-t after:border-border after:content-[""]'
              )}
              aria-current={isCurrent ? 'step' : undefined}
              aria-label={stepStatus}
            >
              <div
                className={cn(
                  'flex items-center gap-2 rounded-full px-3 py-2 transition-all duration-200',
                  'hover:shadow-card-hover',
                  isCompleted && 'bg-primary/10 text-primary',
                  isCurrent && 'bg-primary text-primary-foreground shadow-card',
                  !isCompleted && !isCurrent && 'bg-muted text-muted-foreground'
                )}
              >
                <span title={step.label} className="inline-flex shrink-0">
                  <Icon className="h-4 w-4" aria-hidden />
                </span>
                <span
                  className={cn(
                    'text-sm font-medium',
                    'sr-only sm:not-sr-only sm:inline'
                  )}
                >
                  {step.label}
                </span>
              </div>
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
