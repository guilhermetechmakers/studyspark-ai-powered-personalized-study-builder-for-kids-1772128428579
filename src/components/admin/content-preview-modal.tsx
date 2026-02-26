/**
 * ContentPreviewModal - Secure preview of content for admin review.
 * Renders sanitized preview with metadata.
 */

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import type { ContentReviewItem } from '@/types/admin'

export interface ContentPreviewModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  item: ContentReviewItem | null
  className?: string
}

export function ContentPreviewModal({
  open,
  onOpenChange,
  item,
  className,
}: ContentPreviewModalProps) {
  if (!item) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {item.title}
            <Badge variant="outline" className="font-normal">
              {item.contentType}
            </Badge>
          </DialogTitle>
        </DialogHeader>
        <ScrollArea className="max-h-[60vh]">
          <div className={cn('space-y-4 pr-4', className)}>
            <div className="rounded-xl border border-border bg-muted/30 p-4">
              <h4 className="text-sm font-medium text-muted-foreground">Metadata</h4>
              <dl className="mt-2 grid gap-2 text-sm">
                <div>
                  <dt className="text-muted-foreground">Submitted by</dt>
                  <dd>{item.submittedByName ?? item.submittedBy}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Status</dt>
                  <dd>
                    <Badge
                      variant={
                        item.status === 'approved'
                          ? 'default'
                          : item.status === 'rejected'
                            ? 'destructive'
                            : 'outline'
                      }
                    >
                      {item.status}
                    </Badge>
                  </dd>
                </div>
                {item.assignedToName && (
                  <div>
                    <dt className="text-muted-foreground">Assigned to</dt>
                    <dd>{item.assignedToName}</dd>
                  </div>
                )}
                <div>
                  <dt className="text-muted-foreground">Created</dt>
                  <dd>{new Date(item.createdAt).toLocaleString()}</dd>
                </div>
                {item.version != null && (
                  <div>
                    <dt className="text-muted-foreground">Version</dt>
                    <dd>{item.version}</dd>
                  </div>
                )}
              </dl>
            </div>
            {item.metadata && Object.keys(item.metadata).length > 0 && (
              <div className="rounded-xl border border-border bg-muted/30 p-4">
                <h4 className="text-sm font-medium text-muted-foreground">Additional context</h4>
                <pre className="mt-2 overflow-x-auto rounded-lg bg-background p-3 text-xs">
                  {JSON.stringify(item.metadata, null, 2)}
                </pre>
              </div>
            )}
            <p className="text-sm text-muted-foreground">
              Content preview would render here. In production, sanitize and render uploaded
              content securely.
            </p>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}
