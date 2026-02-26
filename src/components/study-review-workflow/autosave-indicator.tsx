import { Check, Loader2, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { AutosaveStatus } from '@/types/review-workflow'

export interface AutosaveIndicatorProps {
  status: AutosaveStatus
  className?: string
}

export function AutosaveIndicator({ status, className }: AutosaveIndicatorProps) {
  const s = status?.status ?? 'idle'
  const lastSaved = status?.lastSavedAt

  return (
    <div
      className={cn(
        'flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-medium transition-all duration-200',
        s === 'saving' && 'bg-[rgb(var(--lavender))]/20 text-primary',
        s === 'saved' && 'bg-success/20 text-success-foreground',
        s === 'error' && 'bg-destructive/20 text-destructive',
        s === 'idle' && 'bg-muted/50 text-muted-foreground',
        className
      )}
      role="status"
      aria-live="polite"
      aria-label={`Autosave ${s}`}
    >
      {s === 'saving' && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
      {s === 'saved' && <Check className="h-3.5 w-3.5" />}
      {s === 'error' && <AlertCircle className="h-3.5 w-3.5" />}
      <span>
        {s === 'saving' && 'Saving...'}
        {s === 'saved' && (lastSaved ? `Saved ${new Date(lastSaved).toLocaleTimeString()}` : 'Saved')}
        {s === 'error' && 'Save failed'}
        {s === 'idle' && 'Unsaved changes'}
      </span>
    </div>
  )
}
