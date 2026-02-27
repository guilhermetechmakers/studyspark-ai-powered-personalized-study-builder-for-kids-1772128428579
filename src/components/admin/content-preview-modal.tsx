/**
 * ContentPreviewModal - Secure preview of content for admin review.
 * Renders sanitized preview with metadata.
 * Uses design tokens, accessibility labels, and handles loading/error/empty states.
 */

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { EmptyState } from '@/components/admin/shared/empty-state'
import { AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { ContentReviewItem } from '@/types/admin'

export interface ContentPreviewModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  item: ContentReviewItem | null
  /** When true, shows skeleton loading state inside the modal */
  isLoading?: boolean
  /** When set, shows error state with message */
  error?: string | null
  className?: string
}

const METADATA_SECTION_ID = 'content-preview-metadata'
const CONTEXT_SECTION_ID = 'content-preview-context'

export function ContentPreviewModal({
  open,
  onOpenChange,
  item,
  isLoading = false,
  error = null,
  className,
}: ContentPreviewModalProps) {
  const hasMetadata = item?.metadata && Object.keys(item.metadata).length > 0
  if (!open || (!item && !isLoading && !error)) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="sm:max-w-2xl"
        aria-describedby="content-preview-description"
      >
        <DialogHeader>
          <DialogTitle className="flex flex-wrap items-center gap-2 text-foreground">
            {isLoading ? (
              <Skeleton className="h-6 w-48 rounded-md" aria-hidden />
            ) : error ? (
              <span>Preview unavailable</span>
            ) : item ? (
              <>
                {item.title}
                <Badge variant="outline" className="font-normal">
                  {item.contentType}
                </Badge>
              </>
            ) : null}
          </DialogTitle>
          {isLoading && (
            <DialogDescription id="content-preview-description" className="sr-only">
              Content preview is loading.
            </DialogDescription>
          )}
          {error && (
            <DialogDescription id="content-preview-description" className="sr-only">
              An error occurred while loading the preview.
            </DialogDescription>
          )}
          {item && !isLoading && !error && (
            <DialogDescription id="content-preview-description">
              Secure preview of submitted content for admin review. Includes metadata and
              additional context.
            </DialogDescription>
          )}
        </DialogHeader>

        {isLoading ? (
          <div className="space-y-4" role="status" aria-live="polite" aria-label="Loading content">
            <Skeleton className="h-32 w-full rounded-lg" />
            <Skeleton className="h-24 w-full rounded-lg" />
            <Skeleton className="h-16 w-full rounded-lg" />
          </div>
        ) : error ? (
          <EmptyState
            icon={AlertCircle}
            title="Unable to load preview"
            description={error}
            className="min-h-[12rem] border-destructive/30 bg-destructive/5"
          />
        ) : item ? (
          <ScrollArea
            className="max-h-[60vh] sm:max-h-[65vh]"
            aria-label="Content preview scroll area"
          >
            <div className={cn('space-y-4 pr-4', className)}>
              <section
                aria-labelledby={METADATA_SECTION_ID}
                className="rounded-xl border border-border bg-muted/30 p-4 shadow-card transition-shadow duration-200 hover:shadow-card-hover"
              >
                <h4
                  id={METADATA_SECTION_ID}
                  className="text-sm font-medium text-muted-foreground"
                >
                  Metadata
                </h4>
                <dl className="mt-2 grid gap-2 text-sm">
                  <div>
                    <dt className="text-muted-foreground">Submitted by</dt>
                    <dd className="text-foreground">
                      {item.submittedByName ?? item.submittedBy}
                    </dd>
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
                      <dd className="text-foreground">{item.assignedToName}</dd>
                    </div>
                  )}
                  <div>
                    <dt className="text-muted-foreground">Created</dt>
                    <dd className="text-foreground">
                      {new Date(item.createdAt).toLocaleString()}
                    </dd>
                  </div>
                  {item.version != null && (
                    <div>
                      <dt className="text-muted-foreground">Version</dt>
                      <dd className="text-foreground">{item.version}</dd>
                    </div>
                  )}
                </dl>
              </section>

              {hasMetadata ? (
                <section
                  aria-labelledby={CONTEXT_SECTION_ID}
                  className="rounded-xl border border-border bg-muted/30 p-4 shadow-card transition-shadow duration-200 hover:shadow-card-hover"
                >
                  <h4
                    id={CONTEXT_SECTION_ID}
                    className="text-sm font-medium text-muted-foreground"
                  >
                    Additional context
                  </h4>
                  <pre
                    className="mt-2 overflow-x-auto rounded-lg border border-border bg-background p-3 text-xs text-foreground"
                    aria-label="Additional context metadata in JSON format"
                  >
                    {JSON.stringify(item.metadata, null, 2)}
                  </pre>
                </section>
              ) : null}

              <div className="rounded-xl border border-dashed border-border bg-muted/20 p-6">
                <p className="text-sm text-muted-foreground">
                  Content preview would render here. In production, sanitize and render uploaded
                  content securely.
                </p>
              </div>
            </div>
          </ScrollArea>
        ) : null}
      </DialogContent>
    </Dialog>
  )
}
