/**
 * ProgressPanel - Shows progress, estimated time, and live status
 */

import { Progress } from '@/components/ui/progress'
import { Card, CardContent } from '@/components/ui/card'
import type { ExportJobStatus } from '@/types/exports'
import { Loader2, CheckCircle2, XCircle, Clock } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface ProgressPanelProps {
  jobId: string
  status: ExportJobStatus
  progress: number
  resultUrl?: string | null
  error?: string | null
  onDownload?: () => void
  className?: string
}

const STATUS_LABELS: Record<ExportJobStatus, string> = {
  queued: 'Queued',
  processing: 'Processing',
  rendering: 'Rendering',
  completed: 'Completed',
  failed: 'Failed',
  partial: 'Partial',
  cancelled: 'Cancelled',
}

export function ProgressPanel({
  status,
  progress,
  resultUrl: _resultUrl,
  error,
  onDownload,
  className,
}: ProgressPanelProps) {
  const isComplete = status === 'completed'
  const isFailed = status === 'failed' || status === 'cancelled'
  const isInProgress = !isComplete && !isFailed

  return (
    <Card className={cn('overflow-hidden', className)}>
      <CardContent className="pt-6">
        <div className="flex items-start gap-4">
          <div
            className={cn(
              'flex h-12 w-12 shrink-0 items-center justify-center rounded-xl',
              isComplete && 'bg-success/20 text-success-foreground',
              isFailed && 'bg-destructive/20 text-destructive',
              isInProgress && 'bg-primary/10 text-primary'
            )}
          >
            {isComplete && <CheckCircle2 className="h-6 w-6" />}
            {isFailed && <XCircle className="h-6 w-6" />}
            {isInProgress && <Loader2 className="h-6 w-6 animate-spin" />}
            {status === 'queued' && !isInProgress && <Clock className="h-6 w-6" />}
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-medium text-foreground">{STATUS_LABELS[status]}</p>
            {error && (
              <p className="mt-1 text-sm text-destructive">{error}</p>
            )}
            {isInProgress && (
              <Progress value={progress} className="mt-3 h-2" />
            )}
            {isComplete && onDownload && (
              <button
                type="button"
                onClick={onDownload}
                className="mt-3 inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-all hover:scale-[1.02] hover:shadow-md"
              >
                Download
              </button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
