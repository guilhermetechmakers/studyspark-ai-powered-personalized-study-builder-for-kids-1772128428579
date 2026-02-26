import { AlertTriangle, RefreshCw, Check, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { ConflictLog } from '@/types/review-workflow'

export interface ConflictIndicatorProps {
  conflict: ConflictLog | null
  onResolve: (strategy: 'keep_local' | 'keep_remote' | 'merge') => void
  onDismiss?: () => void
  isResolving?: boolean
  className?: string
}

export function ConflictIndicator({
  conflict,
  onResolve,
  onDismiss,
  isResolving = false,
  className,
}: ConflictIndicatorProps) {
  if (!conflict) return null

  return (
    <div
      className={cn(
        'animate-fade-in rounded-2xl border-2 border-warning/50 bg-warning/10 p-4 shadow-lg',
        className
      )}
      role="alert"
      aria-live="assertive"
    >
      <div className="flex items-start gap-3">
        <AlertTriangle className="h-6 w-6 shrink-0 text-warning-foreground" />
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-foreground">Edit conflict detected</h4>
          <p className="mt-1 text-sm text-muted-foreground">
            Another change was saved while you were editing. Choose how to resolve:
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => onResolve('keep_local')}
              disabled={isResolving}
              className="rounded-full"
              aria-label="Keep my changes"
            >
              <Check className="mr-1.5 h-4 w-4" />
              Keep my changes
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => onResolve('keep_remote')}
              disabled={isResolving}
              className="rounded-full"
              aria-label="Use server version"
            >
              <RefreshCw className="mr-1.5 h-4 w-4" />
              Use server version
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => onResolve('merge')}
              disabled={isResolving}
              className="rounded-full"
              aria-label="Merge changes"
            >
              Merge
            </Button>
          </div>
        </div>
        {onDismiss && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onDismiss}
            aria-label="Dismiss"
            className="shrink-0"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  )
}
