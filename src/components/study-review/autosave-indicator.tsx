/**
 * AutosaveIndicator - Shows save status per block/document.
 * Design: playful, rounded, pastel gradients per StudySpark design system.
 */

import { Cloud, CloudOff, Check, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { AutosaveStatus } from '@/types/study-review'

export interface AutosaveIndicatorProps {
  status: AutosaveStatus
  lastSavedAt?: string
  className?: string
}

const STATUS_CONFIG: Record<AutosaveStatus, { icon: typeof Cloud; label: string; className: string }> = {
  idle: {
    icon: Cloud,
    label: 'Unsaved changes',
    className: 'text-muted-foreground',
  },
  saving: {
    icon: Loader2,
    label: 'Saving...',
    className: 'text-primary animate-pulse',
  },
  saved: {
    icon: Check,
    label: 'Saved',
    className: 'text-green-600 dark:text-green-400',
  },
  error: {
    icon: CloudOff,
    label: 'Save failed',
    className: 'text-destructive',
  },
}

export function AutosaveIndicator({
  status,
  lastSavedAt,
  className,
}: AutosaveIndicatorProps) {
  const config = STATUS_CONFIG[status]
  const Icon = config.icon

  return (
    <div
      className={cn(
        'flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-medium',
        'bg-muted/50 border border-border/60',
        'transition-all duration-200',
        className
      )}
      role="status"
      aria-live="polite"
      aria-label={`Autosave: ${config.label}`}
    >
      {status === 'saving' ? (
        <Loader2 className="h-3.5 w-3.5 animate-spin shrink-0" aria-hidden />
      ) : (
        <Icon className={cn('h-3.5 w-3.5 shrink-0', config.className)} aria-hidden />
      )}
      <span className={config.className}>{config.label}</span>
      {lastSavedAt && status === 'saved' && (
        <span className="text-muted-foreground/80">
          {new Date(lastSavedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </span>
      )}
    </div>
  )
}
