/**
 * Admin User Moderation - User moderation queue.
 * Bulk actions: suspend, deactivate, warn, unblock, assign reviewer.
 */

import { useCallback, useEffect, useState } from 'react'
import { Ban, AlertTriangle, UserCheck, Filter, Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { DataTable, PillBadge, ConfirmationDialog } from '@/components/admin/shared'
import type { Column } from '@/components/admin/shared'
import { DropdownMenuItem } from '@/components/ui/dropdown-menu'
import {
  fetchModerationQueueItems,
  moderationAction,
  bulkModerationAction,
} from '@/api/admin'
import type { ModerationQueueItem } from '@/types/admin'
import { toast } from 'sonner'

function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(t)
  }, [value, delay])
  return debounced
}

export function AdminUserModerationPage() {
  const [items, setItems] = useState<ModerationQueueItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [search, setSearch] = useState('')
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [confirmState, setConfirmState] = useState<{
    open: boolean
    action: 'suspend' | 'warn' | 'bulk-suspend' | 'bulk-warn'
    itemId?: string
    isLoading?: boolean
  }>({ open: false, action: 'suspend' })

  const debouncedSearch = useDebounce(search, 300)

  const loadQueue = useCallback(async () => {
    setIsLoading(true)
    try {
      const list = await fetchModerationQueueItems({
        status: statusFilter === 'all' ? undefined : statusFilter,
        search: debouncedSearch || undefined,
      })
      setItems(Array.isArray(list) ? list : [])
    } catch {
      toast.error('Failed to load moderation queue')
      setItems([])
    } finally {
      setIsLoading(false)
    }
  }, [statusFilter, debouncedSearch])

  useEffect(() => {
    loadQueue()
  }, [loadQueue])

  const handleAction = async (
    id: string,
    action: 'suspend' | 'deactivate' | 'warn' | 'unblock'
  ) => {
    try {
      await moderationAction(id, action)
      toast.success(`User ${action === 'suspend' ? 'suspended' : action === 'warn' ? 'warned' : action}`)
      loadQueue()
    } catch {
      toast.error('Failed to perform action')
    } finally {
      setConfirmState((s) => ({ ...s, open: false }))
    }
  }

  const handleBulkAction = async (action: 'suspend' | 'warn') => {
    const ids = Array.from(selectedIds ?? [])
    if (ids.length === 0) return
    try {
      await bulkModerationAction(ids, action)
      toast.success(`${ids.length} user(s) ${action === 'suspend' ? 'suspended' : 'warned'}`)
      setSelectedIds(new Set())
      loadQueue()
    } catch {
      toast.error('Failed to perform bulk action')
    } finally {
      setConfirmState((s) => ({ ...s, open: false }))
    }
  }

  const columns: Column<ModerationQueueItem>[] = [
    { id: 'id', header: 'ID', accessor: 'id', className: 'font-mono text-xs' },
    { id: 'userName', header: 'User', accessor: (r) => r.userName ?? r.userId },
    { id: 'userEmail', header: 'Email', accessor: (r) => r.userEmail ?? '-' },
    { id: 'reason', header: 'Reason', accessor: 'reason' },
    {
      id: 'status',
      header: 'Status',
      accessor: (r) => (
        <PillBadge
          variant={
            r.status === 'suspended'
              ? 'destructive'
              : r.status === 'warned'
                ? 'warning'
                : r.status === 'resolved'
                  ? 'success'
                  : 'outline'
          }
        >
          {r.status}
        </PillBadge>
      ),
    },
    {
      id: 'createdAt',
      header: 'Reported',
      accessor: (r) => new Date(r.createdAt).toLocaleDateString(),
    },
  ]

  const rowActions = (row: ModerationQueueItem) => (
    <>
      <DropdownMenuItem
        onClick={() => handleAction(row.id, 'suspend')}
        disabled={row.status === 'suspended'}
      >
        <Ban className="mr-2 h-4 w-4" />
        Suspend
      </DropdownMenuItem>
      <DropdownMenuItem
        onClick={() => setConfirmState({ open: true, action: 'warn', itemId: row.id })}
        disabled={row.status === 'warned'}
      >
        <AlertTriangle className="mr-2 h-4 w-4" />
        Warn
      </DropdownMenuItem>
      <DropdownMenuItem
        onClick={() => handleAction(row.id, 'unblock')}
        disabled={row.status !== 'suspended'}
      >
        <UserCheck className="mr-2 h-4 w-4" />
        Unblock
      </DropdownMenuItem>
    </>
  )

  const selectedCount = selectedIds?.size ?? 0

  return (
    <div className="flex flex-1 flex-col gap-6 p-6">
      <header className="animate-fade-in">
        <h1 className="text-2xl font-bold text-foreground md:text-3xl">User Moderation</h1>
        <p className="mt-1 text-muted-foreground">
          Review and moderate reported users. Suspend, warn, or resolve.
        </p>
      </header>

      <div className="flex flex-wrap items-center gap-4">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search users..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
            aria-label="Search moderation queue"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[160px]">
            <Filter className="mr-2 h-4 w-4" />
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All status</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="in_review">In Review</SelectItem>
            <SelectItem value="suspended">Suspended</SelectItem>
            <SelectItem value="warned">Warned</SelectItem>
            <SelectItem value="resolved">Resolved</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {selectedCount > 0 && (
        <div className="flex flex-wrap items-center gap-4 rounded-2xl border border-border bg-muted/30 px-4 py-3">
          <span className="text-sm font-medium">{selectedCount} selected</span>
          <Button
            size="sm"
            className="gap-2"
            onClick={() => setConfirmState({ open: true, action: 'bulk-suspend' })}
          >
            <Ban className="h-4 w-4" />
            Suspend
          </Button>
          <Button
            variant="destructive"
            size="sm"
            className="gap-2"
            onClick={() => setConfirmState({ open: true, action: 'bulk-warn' })}
          >
            <AlertTriangle className="h-4 w-4" />
            Warn
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setSelectedIds(new Set())}>
            Clear selection
          </Button>
        </div>
      )}

      <DataTable<ModerationQueueItem>
        columns={columns}
        data={items}
        rowId={(r) => r.id}
        rowActions={rowActions}
        selectable
        selectedIds={selectedIds}
        onSelectionChange={setSelectedIds}
        isLoading={isLoading}
        emptyMessage="No users in moderation queue"
      />

      <ConfirmationDialog
        open={confirmState.open}
        onOpenChange={(o) => setConfirmState((s) => ({ ...s, open: o }))}
        title={
          confirmState.action === 'suspend' || confirmState.action === 'bulk-suspend'
            ? 'Suspend user(s)?'
            : 'Warn user(s)?'
        }
        description={
          confirmState.action === 'bulk-suspend' || confirmState.action === 'bulk-warn'
            ? `This will affect ${selectedCount} user(s).`
            : 'This action will be recorded in the audit log.'
        }
        confirmLabel={
          confirmState.action === 'suspend' || confirmState.action === 'bulk-suspend'
            ? 'Suspend'
            : 'Warn'
        }
        variant={
          confirmState.action === 'suspend' || confirmState.action === 'bulk-suspend'
            ? 'destructive'
            : 'default'
        }
        isLoading={confirmState.isLoading}
        onConfirm={async () => {
          if (confirmState.action === 'warn' && confirmState.itemId) {
            await handleAction(confirmState.itemId, 'warn')
          } else if (confirmState.action === 'bulk-suspend') {
            await handleBulkAction('suspend')
          } else if (confirmState.action === 'bulk-warn') {
            await handleBulkAction('warn')
          } else if (confirmState.action === 'suspend' && confirmState.itemId) {
            await handleAction(confirmState.itemId, 'suspend')
          }
        }}
      />
    </div>
  )
}
