import { useCallback, useEffect, useState } from 'react'
import { Check, X, MessageSquare, AlertTriangle, Eye } from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { DataTable, PillBadge, ConfirmationDialog } from '@/components/admin/shared'
import type { Column } from '@/components/admin/shared'
import {
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'
import {
  fetchContentReviewQueue,
  contentReviewAction,
  bulkContentReviewAction,
} from '@/api/admin'
import type { ContentReviewItem } from '@/types/admin'
import { toast } from 'sonner'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

export function AdminContentReviewPage() {
  const [items, setItems] = useState<ContentReviewItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState<string>('pending')
  const [contentTypeFilter, setContentTypeFilter] = useState<string>('all')
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [previewItem, setPreviewItem] = useState<ContentReviewItem | null>(null)
  const [confirmState, setConfirmState] = useState<{
    open: boolean
    action: 'approve' | 'reject' | 'bulk-approve' | 'bulk-reject'
    itemId?: string
    isLoading?: boolean
  }>({ open: false, action: 'approve' })

  const loadQueue = useCallback(async () => {
    setIsLoading(true)
    try {
      const list = await fetchContentReviewQueue({
        status: statusFilter === 'all' ? undefined : statusFilter,
        contentType: contentTypeFilter === 'all' ? undefined : contentTypeFilter,
      })
      setItems(Array.isArray(list) ? list : [])
    } catch {
      toast.error('Failed to load content review queue')
      setItems([])
    } finally {
      setIsLoading(false)
    }
  }, [statusFilter, contentTypeFilter])

  useEffect(() => {
    loadQueue()
  }, [loadQueue])

  const handleAction = async (
    id: string,
    action: 'approve' | 'reject' | 'request_changes' | 'escalate'
  ) => {
    try {
      await contentReviewAction(id, action)
      toast.success(`Content ${action === 'approve' ? 'approved' : action === 'reject' ? 'rejected' : action}`)
      setConfirmState((s) => ({ ...s, open: false }))
      loadQueue()
    } catch {
      toast.error(`Failed to ${action}`)
    } finally {
      setConfirmState((s) => ({ ...s, isLoading: false }))
    }
  }

  const handleBulkAction = async (action: 'approve' | 'reject') => {
    const ids = Array.from(selectedIds ?? [])
    if (ids.length === 0) return
    try {
      await bulkContentReviewAction(ids, action)
      toast.success(`${ids.length} items ${action}d`)
      setSelectedIds(new Set())
      setConfirmState((s) => ({ ...s, open: false }))
      loadQueue()
    } catch {
      toast.error(`Failed to ${action}`)
    } finally {
      setConfirmState((s) => ({ ...s, isLoading: false }))
    }
  }

  const columns: Column<ContentReviewItem>[] = [
    { id: 'id', header: 'ID', accessor: 'id', className: 'font-mono text-xs' },
    { id: 'title', header: 'Title', accessor: 'title' },
    {
      id: 'contentType',
      header: 'Type',
      accessor: (r) => <PillBadge variant="outline">{r.contentType}</PillBadge>,
    },
    {
      id: 'status',
      header: 'Status',
      accessor: (r) => (
        <PillBadge
          variant={
            r.status === 'approved'
              ? 'success'
              : r.status === 'rejected'
                ? 'destructive'
                : r.status === 'escalated'
                  ? 'warning'
                  : 'default'
          }
        >
          {r.status}
        </PillBadge>
      ),
    },
    { id: 'submittedByName', header: 'Submitted By', accessor: (r) => r.submittedByName ?? r.submittedBy },
    { id: 'createdAt', header: 'Submitted', accessor: (r) => new Date(r.createdAt).toLocaleDateString() },
  ]

  const rowActions = (row: ContentReviewItem) => (
    <>
      <DropdownMenuItem onClick={() => setPreviewItem(row)}>
        <Eye className="mr-2 h-4 w-4" />
        Preview
      </DropdownMenuItem>
      <DropdownMenuSeparator />
      <DropdownMenuItem onClick={() => setConfirmState({ open: true, action: 'approve', itemId: row.id })}>
        <Check className="mr-2 h-4 w-4" />
        Approve
      </DropdownMenuItem>
      <DropdownMenuItem onClick={() => setConfirmState({ open: true, action: 'reject', itemId: row.id })}>
        <X className="mr-2 h-4 w-4" />
        Reject
      </DropdownMenuItem>
      <DropdownMenuItem onClick={() => handleAction(row.id, 'request_changes')}>
        <MessageSquare className="mr-2 h-4 w-4" />
        Request Changes
      </DropdownMenuItem>
      <DropdownMenuItem onClick={() => handleAction(row.id, 'escalate')}>
        <AlertTriangle className="mr-2 h-4 w-4" />
        Escalate
      </DropdownMenuItem>
    </>
  )

  const selectedCount = selectedIds?.size ?? 0

  return (
    <div className="flex flex-1 flex-col gap-6 p-6">
      <header className="animate-fade-in">
        <h1 className="text-2xl font-bold text-foreground md:text-3xl">Content Review</h1>
        <p className="mt-1 text-muted-foreground">
          Review and moderate submitted content (posts, documents, media).
        </p>
      </header>

      <div className="flex flex-wrap items-center gap-4">
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All status</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
            <SelectItem value="changes_requested">Changes Requested</SelectItem>
            <SelectItem value="escalated">Escalated</SelectItem>
          </SelectContent>
        </Select>
        <Select value={contentTypeFilter} onValueChange={setContentTypeFilter}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Content type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All types</SelectItem>
            <SelectItem value="study">Study</SelectItem>
            <SelectItem value="material">Material</SelectItem>
            <SelectItem value="post">Post</SelectItem>
            <SelectItem value="comment">Comment</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {selectedCount > 0 && (
        <div className="flex flex-wrap items-center gap-4 rounded-2xl border border-border bg-muted/30 px-4 py-3">
          <span className="text-sm font-medium">{selectedCount} selected</span>
          <Button
            variant="outline"
            size="sm"
            className="gap-2"
            onClick={() => setConfirmState({ open: true, action: 'bulk-approve' })}
          >
            <Check className="h-4 w-4" />
            Approve
          </Button>
          <Button
            variant="destructive"
            size="sm"
            className="gap-2"
            onClick={() => setConfirmState({ open: true, action: 'bulk-reject' })}
          >
            <X className="h-4 w-4" />
            Reject
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setSelectedIds(new Set())}>
            Clear selection
          </Button>
        </div>
      )}

      <DataTable<ContentReviewItem>
        columns={columns}
        data={items}
        rowId={(r) => r.id}
        rowActions={rowActions}
        selectable
        selectedIds={selectedIds}
        onSelectionChange={setSelectedIds}
        isLoading={isLoading}
        emptyMessage="No content in review queue"
      />

      <ConfirmationDialog
        open={confirmState.open}
        onOpenChange={(o) => setConfirmState((s) => ({ ...s, open: o }))}
        title={
          confirmState.action === 'reject' || confirmState.action === 'bulk-reject'
            ? 'Reject content?'
            : 'Approve content?'
        }
        description={
          confirmState.action === 'bulk-approve' || confirmState.action === 'bulk-reject'
            ? `This will affect ${selectedCount} item(s).`
            : 'This action will update the content status.'
        }
        confirmLabel={confirmState.action === 'reject' || confirmState.action === 'bulk-reject' ? 'Reject' : 'Approve'}
        variant={confirmState.action === 'reject' || confirmState.action === 'bulk-reject' ? 'destructive' : 'default'}
        isLoading={confirmState.isLoading}
        onConfirm={async () => {
          setConfirmState((s) => ({ ...s, isLoading: true }))
          if (confirmState.action === 'approve' && confirmState.itemId) {
            await handleAction(confirmState.itemId, 'approve')
          } else if (confirmState.action === 'reject' && confirmState.itemId) {
            await handleAction(confirmState.itemId, 'reject')
          } else if (confirmState.action === 'bulk-approve') {
            await handleBulkAction('approve')
          } else if (confirmState.action === 'bulk-reject') {
            await handleBulkAction('reject')
          }
        }}
      />

      <Dialog open={!!previewItem} onOpenChange={() => setPreviewItem(null)}>
        <DialogContent className="max-w-2xl rounded-2xl">
          <DialogHeader>
            <DialogTitle>{previewItem?.title ?? 'Content Preview'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {previewItem && (
              <>
                <p className="text-sm text-muted-foreground">
                  Type: {previewItem.contentType} · Status: {previewItem.status}
                </p>
                {previewItem.metadata && Object.keys(previewItem.metadata).length > 0 && (
                  <pre className="max-h-64 overflow-auto rounded-lg border border-border bg-muted/30 p-4 text-xs">
                    {JSON.stringify(previewItem.metadata, null, 2)}
                  </pre>
                )}
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
