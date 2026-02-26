/**
 * AuditLogViewer - Modal/panel showing library audit trail.
 * Displays who did what and when for studies/folders.
 */

import { useState, useEffect } from 'react'
import { History, FileText, Folder, Tag, Loader2 } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import { cn } from '@/lib/utils'
import type { LibraryAuditLog } from '@/types/study-library'

export interface AuditLogViewerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  fetchLogs: (params?: {
    resourceType?: string
    resourceId?: string
    limit?: number
  }) => Promise<LibraryAuditLog[]>
  resourceType?: string
  resourceId?: string
  className?: string
}

const ACTION_LABELS: Record<string, string> = {
  created: 'Created',
  updated: 'Updated',
  duplicated: 'Duplicated',
  moved: 'Moved',
  deleted: 'Deleted',
  shared: 'Shared',
  tag_added: 'Tag added',
  tag_removed: 'Tag removed',
}

const RESOURCE_ICONS: Record<string, typeof FileText> = {
  study: FileText,
  folder: Folder,
  tag: Tag,
}

function formatTimestamp(iso: string): string {
  try {
    const d = new Date(iso)
    const now = new Date()
    const diff = now.getTime() - d.getTime()
    const mins = Math.floor(diff / 60000)
    if (mins < 1) return 'Just now'
    if (mins < 60) return `${mins}m ago`
    const hours = Math.floor(mins / 60)
    if (hours < 24) return `${hours}h ago`
    const days = Math.floor(hours / 24)
    if (days < 7) return `${days}d ago`
    return d.toLocaleDateString()
  } catch {
    return ''
  }
}

export function AuditLogViewer({
  open,
  onOpenChange,
  fetchLogs,
  resourceType,
  resourceId,
  className,
}: AuditLogViewerProps) {
  const [logs, setLogs] = useState<LibraryAuditLog[]>([])
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (!open) return
    setIsLoading(true)
    fetchLogs({ resourceType, resourceId, limit: 50 })
      .then((list) => setLogs(list ?? []))
      .finally(() => setIsLoading(false))
  }, [open, resourceType, resourceId, fetchLogs])

  const logList = logs ?? []

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn(
          'max-w-lg rounded-2xl border-border bg-card shadow-card',
          'animate-in fade-in-0 zoom-in-95 duration-200',
          className
        )}
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg font-bold text-foreground">
            <History className="h-5 w-5 text-primary" />
            Activity log
          </DialogTitle>
          <DialogDescription>
            Recent changes to your library
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[320px] pr-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : logList.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <History className="mb-4 h-12 w-12 text-muted-foreground/50" />
              <p className="text-sm text-muted-foreground">No activity yet</p>
            </div>
          ) : (
            <ul className="space-y-3">
              {logList.map((log) => {
                const Icon = RESOURCE_ICONS[log.resourceType] ?? FileText
                const actionLabel = ACTION_LABELS[log.action] ?? log.action
                return (
                  <li
                    key={log.id}
                    className="flex items-start gap-3 rounded-xl border border-border bg-muted/20 p-3"
                  >
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                      <Icon className="h-4 w-4 text-primary" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-foreground">
                        {actionLabel} {log.resourceType}
                      </p>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {formatTimestamp(log.timestamp)}
                      </p>
                    </div>
                  </li>
                )
              })}
            </ul>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}
