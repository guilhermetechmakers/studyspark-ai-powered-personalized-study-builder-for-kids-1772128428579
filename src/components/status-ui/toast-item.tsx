import * as React from 'react'
import { X, CheckCircle2, AlertCircle, Info, AlertTriangle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

export type ToastType = 'success' | 'error' | 'info' | 'warning'

export interface ToastAction {
  label: string
  onClick: () => void
}

export interface Toast {
  id: string
  type: ToastType
  title: string
  description?: string
  duration?: number
  action?: ToastAction
}

export interface ToastItemProps {
  id: string
  type: ToastType
  title: string
  description?: string
  duration?: number
  action?: ToastAction
  onDismiss: (id: string) => void
}

const TOAST_ICONS: Record<ToastType, React.ComponentType<{ className?: string }>> = {
  success: CheckCircle2,
  error: AlertCircle,
  info: Info,
  warning: AlertTriangle,
}

const TOAST_STYLES: Record<ToastType, string> = {
  success:
    'border-l-4 border-l-success bg-card/95 shadow-card hover:shadow-card-hover',
  error:
    'border-l-4 border-l-destructive bg-card/95 shadow-card hover:shadow-card-hover',
  info:
    'border-l-4 border-l-info bg-card/95 shadow-card hover:shadow-card-hover',
  warning:
    'border-l-4 border-l-warning bg-card/95 shadow-card hover:shadow-card-hover',
}

const TOAST_ICON_STYLES: Record<ToastType, string> = {
  success: 'text-success',
  error: 'text-destructive',
  info: 'text-info',
  warning: 'text-warning',
}

const DEFAULT_DURATION = 5000

export function ToastItem({
  id,
  type,
  title,
  description = '',
  duration = DEFAULT_DURATION,
  action,
  onDismiss,
}: ToastItemProps) {
  const [isExiting, setIsExiting] = React.useState(false)
  const [isPaused, setIsPaused] = React.useState(false)
  const timeoutRef = React.useRef<ReturnType<typeof setTimeout> | null>(null)
  const remainingRef = React.useRef(duration)
  const startTimeRef = React.useRef<number | null>(null)

  const Icon = TOAST_ICONS[type]
  const iconClassName = TOAST_ICON_STYLES[type]
  const containerClassName = TOAST_STYLES[type]

  const scheduleDismiss = React.useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }
    if (duration > 0 && !isPaused && remainingRef.current > 0) {
      timeoutRef.current = setTimeout(() => {
        setIsExiting(true)
        setTimeout(() => onDismiss(id), 200)
      }, remainingRef.current)
      startTimeRef.current = Date.now()
    }
  }, [duration, id, isPaused, onDismiss])

  const handlePause = React.useCallback(() => {
    if (timeoutRef.current && startTimeRef.current) {
      remainingRef.current -= Date.now() - startTimeRef.current
      clearTimeout(timeoutRef.current)
      timeoutRef.current = null
      setIsPaused(true)
    }
  }, [])

  const handleResume = React.useCallback(() => {
    setIsPaused(false)
    if (remainingRef.current > 0) {
      scheduleDismiss()
    }
  }, [scheduleDismiss])

  React.useEffect(() => {
    scheduleDismiss()
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [scheduleDismiss])

  const handleDismiss = () => {
    setIsExiting(true)
    setTimeout(() => onDismiss(id), 200)
  }

  const handleActionClick = () => {
    if (action?.onClick) {
      action.onClick()
      handleDismiss()
    }
  }

  const containerRef = React.useRef<HTMLDivElement>(null)
  React.useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const onFocusIn = () => handlePause()
    const onFocusOut = (e: FocusEvent) => {
      if (!el.contains(e.relatedTarget as Node)) handleResume()
    }
    el.addEventListener('focusin', onFocusIn)
    el.addEventListener('focusout', onFocusOut)
    return () => {
      el.removeEventListener('focusin', onFocusIn)
      el.removeEventListener('focusout', onFocusOut)
    }
  }, [handlePause, handleResume])

  return (
    <div
      ref={containerRef}
      role="status"
      aria-live="polite"
      aria-atomic="true"
      aria-label={`${title}${description ? `: ${description}` : ''}`}
      tabIndex={0}
      className={cn(
        'flex min-w-[280px] max-w-[420px] items-start gap-3 rounded-2xl border border-border/60 p-4 shadow-card transition-all duration-200',
        containerClassName,
        !isExiting && 'animate-toast-in',
        isExiting && 'animate-toast-out opacity-0'
      )}
      onMouseEnter={handlePause}
      onMouseLeave={handleResume}
    >
      <Icon className={cn('h-5 w-5 shrink-0', iconClassName)} aria-hidden="true" />
      <div className="min-w-0 flex-1 space-y-1">
        <p className="text-sm font-medium text-foreground">{title}</p>
        {description && (
          <p className="text-sm text-muted-foreground">{description}</p>
        )}
        {action && (
          <Button
            variant="link"
            size="sm"
            onClick={handleActionClick}
            className="h-auto p-0 text-primary font-medium hover:text-primary/90"
          >
            {action.label}
          </Button>
        )}
      </div>
      <button
        type="button"
        onClick={handleDismiss}
        className="shrink-0 rounded-full p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
        aria-label="Dismiss notification"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  )
}
