/**
 * FileUploadCard - Displays file upload progress and status.
 */

import { FileText, Download, Trash2, Edit3, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { cn } from '@/lib/utils'
import type { FileMeta, OcrStatus } from '@/types/files'

export interface FileUploadCardProps {
  file: FileMeta
  uploadProgress?: number
  isUploading?: boolean
  onDownload?: (id: string) => void
  onEdit?: (id: string) => void
  onDelete?: (id: string) => void
  className?: string
}

const OCR_STATUS_LABELS: Record<OcrStatus, string> = {
  pending: 'Pending',
  in_progress: 'Processing...',
  completed: 'Complete',
  failed: 'Failed',
  corrected: 'Corrected',
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function formatDate(iso: string): string {
  try {
    const d = new Date(iso)
    return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
  } catch {
    return ''
  }
}

export function FileUploadCard({
  file,
  uploadProgress = 100,
  isUploading = false,
  onDownload,
  onEdit,
  onDelete,
  className,
}: FileUploadCardProps) {
  const status = file.ocrStatus ?? 'pending'
  const isProcessing = status === 'in_progress' || status === 'pending'
  const isComplete = status === 'completed' || status === 'corrected'
  const isFailed = status === 'failed'

  return (
    <div
      className={cn(
        'rounded-2xl border-2 border-border bg-card p-4 shadow-card transition-all duration-200 hover:shadow-card-hover',
        className
      )}
    >
      <div className="flex items-start gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[rgb(var(--lavender))]/20">
          <FileText className="h-6 w-6 text-primary" aria-hidden />
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate font-semibold text-foreground">{file.filename}</p>
          <p className="mt-0.5 text-sm text-muted-foreground">
            {formatSize(file.size ?? 0)} • {formatDate(file.createdAt ?? '')}
          </p>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <span
              className={cn(
                'rounded-full px-2.5 py-0.5 text-xs font-medium',
                isComplete && 'bg-success/20 text-success-foreground',
                isProcessing && 'bg-warning/20 text-warning-foreground',
                isFailed && 'bg-destructive/20 text-destructive'
              )}
            >
              {isUploading ? (
                <span className="flex items-center gap-1">
                  <Loader2 className="h-3 w-3 animate-pulse" />
                  Uploading...
                </span>
              ) : (
                OCR_STATUS_LABELS[status as OcrStatus] ?? status
              )}
            </span>
            {file.ocrConfidence != null && isComplete && (
              <span className="rounded-full bg-muted px-2.5 py-0.5 text-xs text-muted-foreground">
                {(Number(file.ocrConfidence) * 100).toFixed(0)}% confidence
              </span>
            )}
          </div>
          {isUploading && (
            <Progress value={uploadProgress} className="mt-2 h-1.5" />
          )}
        </div>
        <div className="flex shrink-0 gap-1">
          {onDownload && isComplete && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onDownload(file.id)}
              className="h-9 w-9 rounded-full"
              aria-label="Download"
            >
              <Download className="h-4 w-4" />
            </Button>
          )}
          {onEdit && isComplete && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onEdit(file.id)}
              className="h-9 w-9 rounded-full"
              aria-label="Edit OCR"
            >
              <Edit3 className="h-4 w-4" />
            </Button>
          )}
          {onDelete && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onDelete(file.id)}
              className="h-9 w-9 rounded-full text-destructive hover:bg-destructive/10 hover:text-destructive"
              aria-label="Delete"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
