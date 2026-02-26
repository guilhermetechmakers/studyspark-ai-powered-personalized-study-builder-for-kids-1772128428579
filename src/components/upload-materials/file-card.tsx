import { useCallback, useState } from 'react'
import {
  FileText,
  Image,
  Loader2,
  Check,
  AlertCircle,
  Eye,
  RotateCcw,
  Trash2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { cn } from '@/lib/utils'
import type { FileItem, OcrStatus } from '@/types/upload-materials'

export interface FileCardProps {
  file: FileItem
  onRemove: (id: string) => void
  onRetryOcr?: (id: string) => void
  onPreview?: (file: FileItem) => void
}

function getFileIcon(type: string) {
  if (type?.includes('pdf') || type?.includes('document') || type?.includes('word')) {
    return FileText
  }
  return Image
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function formatDate(iso: string): string {
  try {
    const d = new Date(iso)
    return d.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch {
    return ''
  }
}

function OcrStatusBadge({ status }: { status: OcrStatus }) {
  switch (status) {
    case 'pending':
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
          Pending
        </span>
      )
    case 'in_progress':
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
          <Loader2 className="h-3 w-3 animate-spin" />
          In progress
        </span>
      )
    case 'complete':
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-green-500/10 px-2.5 py-0.5 text-xs font-medium text-green-700 dark:text-green-400">
          <Check className="h-3 w-3" />
          Complete
        </span>
      )
    case 'failed':
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-destructive/10 px-2.5 py-0.5 text-xs font-medium text-destructive">
          <AlertCircle className="h-3 w-3" />
          Failed
        </span>
      )
    default:
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
          Pending
        </span>
      )
  }
}

export function FileCard({ file, onRemove, onRetryOcr, onPreview }: FileCardProps) {
  const [previewOpen, setPreviewOpen] = useState(false)
  const Icon = getFileIcon(file.type ?? '')

  const handlePreview = useCallback(() => {
    if (file.url && (file.type?.startsWith('image/') || file.type?.includes('pdf'))) {
      setPreviewOpen(true)
    }
    onPreview?.(file)
  }, [file, onPreview])

  const handleRemove = useCallback(() => {
    onRemove(file.id)
  }, [file.id, onRemove])

  const handleRetryOcr = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation()
      onRetryOcr?.(file.id)
    },
    [file.id, onRetryOcr]
  )

  const thumbnailUrl = file.type?.startsWith('image/') ? file.url : undefined

  return (
    <>
      <Card
        className={cn(
          'group overflow-hidden transition-all duration-300',
          'hover:shadow-card-hover hover:-translate-y-0.5',
          'border-[rgb(var(--border))] bg-gradient-to-br from-white to-[rgb(var(--peach-light))]/5'
        )}
      >
        <CardContent className="p-4">
          <div className="flex gap-4">
            <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-muted">
              {thumbnailUrl ? (
                <img
                  src={thumbnailUrl}
                  alt=""
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center">
                  <Icon className="h-8 w-8 text-muted-foreground" />
                </div>
              )}
            </div>

            <div className="min-w-0 flex-1">
              <p className="truncate font-medium text-foreground">{file.name}</p>
              <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                <span>{formatSize(file.size ?? 0)}</span>
                <span>•</span>
                <span>{formatDate(file.uploadedAt ?? '')}</span>
                <span>•</span>
                <OcrStatusBadge status={file.ocrStatus ?? 'pending'} />
              </div>
              <div className="mt-2 flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handlePreview}
                  className="h-8 rounded-full text-xs"
                >
                  <Eye className="mr-1.5 h-3.5 w-3.5" />
                  Preview
                </Button>
                {(file.ocrStatus === 'failed' || file.ocrStatus === 'complete') && onRetryOcr && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleRetryOcr}
                    className="h-8 rounded-full text-xs"
                  >
                    <RotateCcw className="mr-1.5 h-3.5 w-3.5" />
                    Retry OCR
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleRemove}
                  className="h-8 rounded-full text-xs text-destructive hover:bg-destructive/10 hover:text-destructive"
                  aria-label="Remove file"
                >
                  <Trash2 className="mr-1.5 h-3.5 w-3.5" />
                  Remove
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="max-h-[90vh] max-w-3xl">
          <DialogHeader>
            <DialogTitle>{file.name}</DialogTitle>
          </DialogHeader>
          <div className="flex max-h-[70vh] items-center justify-center overflow-auto rounded-xl bg-muted">
            {file.url && file.type?.startsWith('image/') ? (
              <img
                src={file.url}
                alt={file.name}
                className="max-h-[70vh] max-w-full object-contain"
              />
            ) : (
              <div className="flex flex-col items-center gap-2 p-8 text-muted-foreground">
                <FileText className="h-16 w-16" />
                <p>Preview not available for this file type</p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
