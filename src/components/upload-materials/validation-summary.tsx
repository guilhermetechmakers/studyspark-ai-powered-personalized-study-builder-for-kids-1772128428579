import { AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { ValidationError } from '@/types/upload-materials'
import { dataGuard } from '@/lib/data-guard'

export interface ValidationSummaryProps {
  errors: ValidationError[]
  className?: string
}

export function ValidationSummary({ errors = [], className }: ValidationSummaryProps) {
  const safeErrors = dataGuard(errors)

  if (safeErrors.length === 0) return null

  return (
    <div
      className={cn(
        'rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3',
        className
      )}
      role="alert"
    >
      <div className="flex items-start gap-3">
        <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-destructive" aria-hidden />
        <div className="min-w-0 flex-1">
          <p className="font-medium text-destructive">Please fix the following:</p>
          <ul className="mt-2 space-y-1">
            {safeErrors.map((err, i) => (
              <li key={err.id ?? i} className="text-sm text-destructive/90">
                {err.field && <span className="font-medium">{err.field}: </span>}
                {err.message}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}
