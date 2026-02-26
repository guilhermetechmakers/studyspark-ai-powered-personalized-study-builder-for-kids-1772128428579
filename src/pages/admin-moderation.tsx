import { useCallback, useEffect, useState } from 'react'
import { Ban, UserX, AlertTriangle, Unlock, UserPlus, Filter } from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { DataTable, PillBadge, ConfirmationDialog } from '@/components/admin/shared'
import type { Column } from '@/components/admin/shared'
import { BulkActionToolbar } from '@/components/admin/bulk-action-toolbar'
import { DropdownMenuItem } from '@/components/ui/dropdown-menu'
import {
  fetchModerationQueueItems,
  moderationAction,
  bulkModerationAction,
} from '@/api/admin'
import type { ModerationQueueItem } from '@/types/admin'
import { toast } from 'sonner'

export function AdminModerationPage() {
  const [items, setItems] = useState<ModerationQueueItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [confirmState, setConfirmState] = useState<{
    open: boolean
    action: 'suspend' | 'deactivate' | 'warn' | 'unblock' | 'bulk-suspend' | 'bulk-deactivate' | 'bulk-warn' | 'bulk-unblock'
    itemId?: string
    isLoading?: boolean
  }>({ open: false, action: 'suspend' })

  const loadQueue = useCallback(async () => {
    setIsLoading(true)
    try {
      const list = await fetchModerationQueueItems({
        status: statusFilter === 'all' ? undefined : statusFilter,
      })
      setItems(Array.isArray(list) ? list : [])
    } catch {
      toast.error('Failed to load moderation queue')
      setItems([])
    } finally {
      setIsLoading(false)
    }
  }, [statusFilter])

  useEffect(() => {
    loadQueue()
  }, [loadQueue])

  const handleAction = async (
    id: string,
    action: 'suspend' | 'deactivate' | 'warn' | 'unblock'
  ) => {
    setConfirmState((s) => ({ ...s, isLoading: true }))
    try {
      await moderationAction(id, action)
      toast.success(`User ${action}ed`)
      loadQueue()
    } catch {
      toast.error(`Failed to ${action} user`)
    } finally {
      setConfirmState((s) => ({ ...s, open: false, isLoading: false }))
    }
  }

  const handleBulkAction = async (
    action: 'suspend' | 'deactivate' | 'warn' | 'unblock'
  ) => {
    setConfirmState((s) => ({ ...s, isLoading: true }))
    try {
      await bulkModerationAction(Array.from(selectedIds ?? []), action)
      toast.success(`Users ${action}ed`)
      setSelectedIds(new Set())
      loadQueue()
    } catch {
      toast.error(`Failed to ${action} users`)
    } finally {
      setConfirmState((s) => ({ ...s, open: false, isLoading: false }))
    }
  }

  const statusVariant = (
    s: ModerationQueueItem['status']
  ): 'default' | 'success' | 'warning' | 'destructive' | 'outline' => {
    if (s === 'resolved') return 'success'
    if (s === 'in_review') return 'warning'
    return 'outline'
  }

  const columns: Column<ModerationQueueItem>[] = [
    { id: 'id', header: 'ID', accessor: 'id', className: 'font-mono text-xs' },
    { id: 'userName', header: 'User', accessor: (r) => r.userName ?? r.userEmail ?? r.userId },
    { id: 'userEmail', header: 'Email', accessor: (r) => r.userEmail ?? '-' },
    { id: 'reason', header: 'Reason', accessor: 'reason', className: 'max-w-xs truncate' },
    {
      id: 'status',
      header: 'Status',
      accessor: (r) => <PillBadge variant={statusVariant(r.status)}>{r.status}</PillBadge>,
    },
    {
      id: 'createdAt',
      header: 'Reported',
      accessor: (r) => new Date(r.createdAt).toLocaleDateString(),
    },
  ]

  const rowActions = (row: ModerationQueueItem) => (
    <>
      <DropdownMenuItem onClick={() => setConfirmState({ open: true, action: 'suspend', itemId: row.id })}>
        <Ban className="mr-2 h-4 w-4" />
        Suspend
      </DropdownMenuItem>
      <DropdownMenuItem onClick={() => setConfirmState({ open: true, action: 'deactivate', itemId: row.id })}>
        <UserX className="mr-2 h-4 w-4" />
        Deactivate
      </DropdownMenuItem>
      <DropdownMenuItem onClick={() => setConfirmState({ open: true, action: 'warn', itemId: row.id })}>
        <AlertTriangle className="mr-2 h-4 w-4" />
        Warn
      </DropdownMenuItem>
      <DropdownMenuItem onClick={() => setConfirmState({ open: true, action: 'unblock', itemId: row.id })}>
        <Unlock className="mr-2 h-4 w-4" />
        Unblock
      </DropdownMenuItem>
      <DropdownMenuItem onClick={() => moderationAction(row.id, 'assign_reviewer')}>
        <UserPlus className="mr-2 h-4 w-4" />
        Assign reviewer
      </DropdownMenuItem>
    </>
  )

  const selectedCount = selectedIds?.size ?? 0
  const actionLabels: Record<string, string> = {
    suspend: 'Suspend',
    deactivate: 'Deactivate',
    warn: 'Warn',
    unblock: 'Unblock',
  }

  return (
    <div className="flex flex-1 flex-col gap-6 p-6">
      <header className="animate-fade-in">
        <h1 className="text-2xl font-bold text-foreground md:text-3xl">
          User Moderation
        </h1>
        <p className="mt-1 text-muted-foreground">
          Review and moderate user accounts.
        </p>
      </header>

      <div className="flex flex-wrap items-center gap-4">
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[160px]">
            <Filter className="mr-2 h-4 w-4" />
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All status</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="in_review">In review</SelectItem>
            <SelectItem value="resolved">Resolved</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <BulkActionToolbar
        selectedCount={selectedCount}
        onClearSelection={() => setSelectedIds(new Set())}
        actions={[
          { label: 'Suspend', icon: <Ban className="h-4 w-4" />, variant: 'destructive', onClick: () => setConfirmState({ open: true, action: 'bulk-suspend' }) },
          { label: 'Deactivate', icon: <UserX className="h-4 w-4" />, onClick: () => setConfirmState({ open: true, action: 'bulk-deactivate' }) },
          { label: 'Warn', icon: <AlertTriangle className="h-4 w-4" />, onClick: () => setConfirmState({ open: true, action: 'bulk-warn' }) },
          { label: 'Unblock', icon: <Unlock className="h-4 w-4" />, onClick: () => setConfirmState({ open: true, action: 'bulk-unblock' }) },
        ]}
      />

      <DataTable<ModerationQueueItem>
        columns={columns}
        data={items}
        rowId={(r) => r.id}
        rowActions={rowActions}
        selectable
        selectedIds={selectedIds ?? new Set()}
        onSelectionChange={setSelectedIds}
        isLoading={isLoading}
        emptyMessage="No users in moderation queue"
      />

      <ConfirmationDialog
        open={confirmState.open}
        onOpenChange={(o) => setConfirmState((s) => ({ ...s, open: o }))}
        title={`${actionLabels[confirmState.action.replace('bulk-', '')] ?? confirmState.action} user(s)?`}
        description={
          confirmState.action.startsWith('bulk-')
            ? `This will affect ${selectedCount} user(s).`
            : 'This action will be logged in the audit trail.'
        }
        confirmLabel={actionLabels[confirmState.action.replace('bulk-', '')] ?? 'Confirm'}
        variant={confirmState.action.includes('suspend') ? 'destructive' : 'default'}
        isLoading={confirmState.isLoading}
        onConfirm={async () => {
          const baseAction = confirmState.action.replace('bulk-', '') as 'suspend' | 'deactivate' | 'warn' | 'unblock'
          if (confirmState.itemId) {
            await handleAction(confirmState.itemId, baseAction)
          } else if (confirmState.action.startsWith('bulk-')) {
            await handleBulkAction(baseAction)
          }
        }}
      />
    </div>
  )
}
