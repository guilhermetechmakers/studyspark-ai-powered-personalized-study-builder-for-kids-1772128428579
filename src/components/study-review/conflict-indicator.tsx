/**
 * ConflictIndicator - Shows when edits collide; provides resolve options.
 * Design: playful, rounded, pastel gradients per StudySpark design system.
 */

import { useState } from 'react'
import { AlertTriangle, RefreshCw, Download, Upload } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { cn } from '@/lib/utils'
import type { ConflictResolutionStrategy } from '@/types/study-review'

export interface ConflictIndicatorProps {
  hasConflict?: boolean
  conflictId?: string
  studyId?: string
  onResolve: (strategy: ConflictResolutionStrategy) => void
  isResolving?: boolean
  className?: string
}

export function ConflictIndicator({
  hasConflict = true,
  conflictId = '',
  studyId: _studyId = '',
  onResolve,
  isResolving = false,
  className,
}: ConflictIndicatorProps) {
  if (!hasConflict) return null
  const [open, setOpen] = useState(false)

  const handleResolve = (strategy: ConflictResolutionStrategy) => {
    onResolve(strategy)
    setOpen(false)
  }

  return (
    <div
      className={cn(
        'flex items-center gap-3 rounded-2xl border-2 border-warning/50',
        'bg-gradient-to-br from-[rgb(var(--warning))]/20 to-white p-4',
        'animate-fade-in transition-all duration-300',
        className
      )}
      role="alert"
      aria-live="assertive"
    >
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-warning/30">
        <AlertTriangle className="h-5 w-5 text-warning-foreground" aria-hidden />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-foreground">Edit conflict detected</p>
        <p className="text-sm text-muted-foreground">
          Your changes may conflict with recent edits. Choose how to resolve.
        </p>
      </div>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm" className="rounded-full">
            Resolve
          </Button>
        </DialogTrigger>
        <DialogContent
          className="rounded-2xl border-2 border-border bg-card"
          aria-describedby="conflict-dialog-desc"
        >
          <DialogHeader>
            <DialogTitle>Resolve conflict</DialogTitle>
            <DialogDescription id="conflict-dialog-desc">
              Another change was made while you were editing. Choose which version to keep.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-2 py-4">
            <Button
              variant="outline"
              className="w-full justify-start gap-3 rounded-xl"
              onClick={() => handleResolve('keep_local' as ConflictResolutionStrategy)}
              disabled={isResolving}
            >
              <Upload className="h-4 w-4" />
              Keep my changes
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start gap-3 rounded-xl"
              onClick={() => handleResolve('keep_server')}
              disabled={isResolving}
            >
              <Download className="h-4 w-4" />
              Use server version
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start gap-3 rounded-xl"
              onClick={() => handleResolve('merge')}
              disabled={isResolving}
            >
              <RefreshCw className="h-4 w-4" />
              Merge both (manual)
            </Button>
          </div>
          <DialogFooter>
            <p className="text-xs text-muted-foreground">
              Conflict ID: {conflictId}
            </p>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

/** Standalone modal for conflict resolution (used when ConflictIndicator is not visible) */
export interface ConflictResolutionModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onResolve: (strategy: ConflictResolutionStrategy) => void
  conflictId?: string
  studyId?: string
}

export function ConflictResolutionModal({
  open,
  onOpenChange,
  onResolve,
  conflictId = '',
  studyId: _studyId = '',
}: ConflictResolutionModalProps) {
  const handleResolve = (strategy: ConflictResolutionStrategy) => {
    onResolve(strategy)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-md rounded-2xl border-2 border-border bg-card"
        aria-describedby="conflict-resolution-desc"
      >
        <DialogHeader>
          <DialogTitle>Resolve conflict</DialogTitle>
          <DialogDescription id="conflict-resolution-desc">
            Another change was made while you were editing. Choose which version to keep.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-2 py-4">
          <Button
            variant="outline"
            className="w-full justify-start gap-3 rounded-xl"
            onClick={() => handleResolve('keep_local')}
          >
            <Upload className="h-4 w-4" />
            Keep my changes
          </Button>
          <Button
            variant="outline"
            className="w-full justify-start gap-3 rounded-xl"
              onClick={() => handleResolve('keep_server')}
          >
            <Download className="h-4 w-4" />
            Use server version
          </Button>
          <Button
            variant="outline"
            className="w-full justify-start gap-3 rounded-xl"
            onClick={() => handleResolve('merge')}
          >
            <RefreshCw className="h-4 w-4" />
            Merge both (manual)
          </Button>
        </div>
        <DialogFooter>
          <p className="text-xs text-muted-foreground">
            {conflictId && `Conflict ID: ${conflictId}`}
          </p>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
