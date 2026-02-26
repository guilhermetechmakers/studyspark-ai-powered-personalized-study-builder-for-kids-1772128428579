import { useCallback, useEffect, useState } from 'react'
import { Check, Ban, MessageSquare, Filter } from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { DataTable, PillBadge } from '@/components/admin/shared'
import type { Column } from '@/components/admin/shared'
import { DropdownMenuItem } from '@/components/ui/dropdown-menu'
import {
  fetchModerationQueue,
  approveContent,
  banContent,
  requestChanges,
} from '@/api/admin'
import type { ContentItem } from '@/types/admin'
import { toast } from 'sonner'

export function AdminModerationPage() {
  const [items, setItems] = useState<ContentItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [typeFilter, setTypeFilter] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<string>('all')

  const loadQueue = useCallback(async () => {
    setIsLoading(true)
    try {
      const list = await fetchModerationQueue({
        type: typeFilter === 'all' ? undefined : typeFilter,
        status: statusFilter === 'all' ? undefined : statusFilter,
      })
      setItems(Array.isArray(list) ? list : [])
    } catch {
      toast.error('Failed to load moderation queue')
      setItems([])
    } finally {
      setIsLoading(false)
    }
  }, [typeFilter, statusFilter])

  useEffect(() => {
    loadQueue()
  }, [loadQueue])

  const handleApprove = async (id: string) => {
    try {
      await approveContent(id)
      toast.success('Content approved')
      loadQueue()
    } catch {
      toast.error('Failed to approve')
    }
  }

  const handleBan = async (id: string) => {
    try {
      await banContent(id)
      toast.success('Content banned')
      loadQueue()
    } catch {
      toast.error('Failed to ban')
    }
  }

  const handleRequestChanges = async (id: string) => {
    const note = window.prompt('Add a note for the author:')
    if (note == null) return
    try {
      await requestChanges(id, note)
      toast.success('Change requested')
      loadQueue()
    } catch {
      toast.error('Failed to request changes')
    }
  }

  const columns: Column<ContentItem>[] = [
    { id: 'id', header: 'ID', accessor: 'id', className: 'font-mono text-xs' },
    { id: 'title', header: 'Title', accessor: 'title' },
    {
      id: 'type',
      header: 'Type',
      accessor: (r) => <PillBadge variant="outline">{r.type}</PillBadge>,
    },
    { id: 'flagReason', header: 'Flag Reason', accessor: 'flagReason' },
    {
      id: 'severity',
      header: 'Severity',
      accessor: (r) =>
        r.severity ? (
          <PillBadge
            variant={
              r.severity === 'high' ? 'destructive' : r.severity === 'medium' ? 'warning' : 'default'
            }
          >
            {r.severity}
          </PillBadge>
        ) : (
          '-'
        ),
    },
    {
      id: 'status',
      header: 'Status',
      accessor: (r) => (
        <PillBadge
          variant={
            r.status === 'approved'
              ? 'success'
              : r.status === 'banned'
                ? 'destructive'
                : 'warning'
          }
        >
          {r.status}
        </PillBadge>
      ),
    },
    {
      id: 'createdAt',
      header: 'Flagged',
      accessor: (r) => new Date(r.createdAt).toLocaleDateString(),
    },
  ]

  const rowActions = (row: ContentItem) => (
    <>
      <DropdownMenuItem onClick={() => handleApprove(row.id)}>
        <Check className="mr-2 h-4 w-4" />
        Approve
      </DropdownMenuItem>
      <DropdownMenuItem onClick={() => handleBan(row.id)}>
        <Ban className="mr-2 h-4 w-4" />
        Ban
      </DropdownMenuItem>
      <DropdownMenuItem onClick={() => handleRequestChanges(row.id)}>
        <MessageSquare className="mr-2 h-4 w-4" />
        Request Changes
      </DropdownMenuItem>
    </>
  )

  return (
    <div className="flex flex-1 flex-col gap-6 p-6">
      <header className="animate-fade-in">
        <h1 className="text-2xl font-bold text-foreground md:text-3xl">Content Moderation</h1>
        <p className="mt-1 text-muted-foreground">
          Review and moderate flagged content.
        </p>
      </header>

      <div className="flex flex-wrap items-center gap-4">
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-[160px]">
            <Filter className="mr-2 h-4 w-4" />
            <SelectValue placeholder="Content type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All types</SelectItem>
            <SelectItem value="study">Study</SelectItem>
            <SelectItem value="material">Material</SelectItem>
            <SelectItem value="comment">Comment</SelectItem>
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All status</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="reviewed">Reviewed</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="banned">Banned</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <DataTable<ContentItem>
        columns={columns}
        data={items}
        rowId={(r) => r.id}
        rowActions={rowActions}
        isLoading={isLoading}
        emptyMessage="No flagged content in queue"
      />
    </div>
  )
}
