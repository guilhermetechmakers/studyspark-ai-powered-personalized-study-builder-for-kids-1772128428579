/**
 * Admin Audit Logs - Immutable audit log for admin actions.
 * Searchable, filterable, exportable audit logs.
 */

import { useCallback, useEffect, useState } from 'react'
import { Search, Download, Filter } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { DataTable, PillBadge } from '@/components/admin/shared'
import type { Column } from '@/components/admin/shared'
import { fetchAuditLogs, exportAuditLogsCSV } from '@/api/admin'
import type { AdminAuditLog } from '@/types/admin'
import { toast } from 'sonner'

function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(t)
  }, [value, delay])
  return debounced
}

export function AdminAuditLogsPage() {
  const [logs, setLogs] = useState<AdminAuditLog[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [actionFilter, setActionFilter] = useState<string>('all')
  const [targetTypeFilter, setTargetTypeFilter] = useState<string>('all')
  const [search, setSearch] = useState('')
  const debouncedSearch = useDebounce(search, 300)

  const loadLogs = useCallback(async () => {
    setIsLoading(true)
    try {
      const res = await fetchAuditLogs({
        action: actionFilter === 'all' ? undefined : actionFilter,
        resource_type: targetTypeFilter === 'all' ? undefined : targetTypeFilter,
        limit: 100,
      })
      const data = Array.isArray(res?.data) ? res.data : []
      setLogs(data)
    } catch {
      toast.error('Failed to load audit logs')
      setLogs([])
    } finally {
      setIsLoading(false)
    }
  }, [actionFilter, targetTypeFilter])

  useEffect(() => {
    loadLogs()
  }, [loadLogs])

  const filteredLogs = (logs ?? []).filter((log) => {
    if (!debouncedSearch.trim()) return true
    const q = debouncedSearch.toLowerCase()
    return (
      log.action.toLowerCase().includes(q) ||
      (log.adminEmail ?? '').toLowerCase().includes(q) ||
      (log.targetType ?? '').toLowerCase().includes(q) ||
      (log.targetId ?? '').toLowerCase().includes(q)
    )
  })

  const handleExport = async () => {
    try {
      const blob = await exportAuditLogsCSV({
        action: actionFilter === 'all' ? undefined : actionFilter,
        resource_type: targetTypeFilter === 'all' ? undefined : targetTypeFilter,
      })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `audit-logs-${new Date().toISOString().slice(0, 10)}.csv`
      a.click()
      URL.revokeObjectURL(url)
      toast.success('Export started')
    } catch {
      toast.error('Failed to export')
    }
  }

  const columns: Column<AdminAuditLog>[] = [
    {
      id: 'createdAt',
      header: 'Time',
      accessor: (r) => new Date(r.createdAt).toLocaleString(),
      className: 'font-mono text-xs',
    },
    {
      id: 'adminEmail',
      header: 'Admin',
      accessor: (r) => r.adminEmail ?? r.adminId,
    },
    {
      id: 'action',
      header: 'Action',
      accessor: (r) => (
        <PillBadge variant="outline">{r.action.replace(/_/g, ' ')}</PillBadge>
      ),
    },
    { id: 'targetType', header: 'Target Type', accessor: 'targetType' },
    { id: 'targetId', header: 'Target ID', accessor: (r) => r.targetId ?? '-', className: 'font-mono text-xs' },
    {
      id: 'payload',
      header: 'Details',
      accessor: (r) =>
        r.payload && Object.keys(r.payload).length > 0
          ? JSON.stringify(r.payload).slice(0, 60) + (JSON.stringify(r.payload).length > 60 ? '…' : '')
          : '-',
      className: 'max-w-[200px] truncate',
    },
  ]

  return (
    <div className="flex flex-1 flex-col gap-6 p-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground md:text-3xl">Audit Logs</h1>
          <p className="mt-1 text-muted-foreground">
            Immutable audit trail for admin actions. Searchable and exportable.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={handleExport} className="gap-2">
          <Download className="h-4 w-4" />
          Export CSV
        </Button>
      </header>

      <div className="flex flex-wrap items-center gap-4">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search logs..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
            aria-label="Search audit logs"
          />
        </div>
        <Select value={actionFilter} onValueChange={setActionFilter}>
          <SelectTrigger className="w-[160px]">
            <Filter className="mr-2 h-4 w-4" />
            <SelectValue placeholder="Action" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All actions</SelectItem>
            <SelectItem value="user_suspended">User suspended</SelectItem>
            <SelectItem value="content_approved">Content approved</SelectItem>
            <SelectItem value="content_rejected">Content rejected</SelectItem>
            <SelectItem value="export_report">Export report</SelectItem>
          </SelectContent>
        </Select>
        <Select value={targetTypeFilter} onValueChange={setTargetTypeFilter}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Target type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All types</SelectItem>
            <SelectItem value="user">User</SelectItem>
            <SelectItem value="content">Content</SelectItem>
            <SelectItem value="report">Report</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <DataTable<AdminAuditLog>
        columns={columns}
        data={filteredLogs}
        rowId={(r) => r.id}
        isLoading={isLoading}
        emptyMessage="No audit logs found"
      />
    </div>
  )
}
