/**
 * DownloadCard - Downloadable asset or PDF with preview thumbnail
 */

import { Download, FileText, FileArchive } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export interface DownloadCardProps {
  title: string
  type?: 'pdf' | 'bundle'
  createdAt?: string
  onDownload: () => void
  isDownloading?: boolean
  className?: string
}

export function DownloadCard({
  title,
  type: _type = 'pdf',
  createdAt,
  onDownload,
  isDownloading = false,
  className,
}: DownloadCardProps) {
  return (
    <Card
      className={cn(
        'overflow-hidden transition-all duration-200 hover:shadow-card-hover',
        className
      )}
    >
      <CardContent className="flex items-center gap-4 p-4">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[rgb(var(--lavender))]/30 to-[rgb(var(--violet))]/20">
          {_type === 'bundle' ? (
            <FileArchive className="h-7 w-7 text-primary" />
          ) : (
            <FileText className="h-7 w-7 text-primary" />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate font-medium text-foreground">{title}</p>
          {createdAt && (
            <p className="text-xs text-muted-foreground">
              {new Date(createdAt).toLocaleDateString()}
            </p>
          )}
        </div>
        <Button
          size="sm"
          onClick={onDownload}
          disabled={isDownloading}
          className="shrink-0 rounded-full"
        >
          {isDownloading ? (
            'Downloading...'
          ) : (
            <>
              <Download className="mr-2 h-4 w-4" />
              Download
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  )
}
