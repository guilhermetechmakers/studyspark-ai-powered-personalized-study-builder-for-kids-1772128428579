import { useCallback, useEffect, useState } from 'react'
import { RefreshCw, AlertCircle, CheckCircle, Activity } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { DataTable, PillBadge } from '@/components/admin/shared'
import type { Column } from '@/components/admin/shared'
import { fetchSystemHealthSummary, fetchSystemLogs } from '@/api/admin'
import type { SystemLog } from '@/types/admin'

export function AdminHealthPage() {
  const [summary, setSummary] = useState<{
    queueBacklog: number
    aiApiUsage: number
    errorCount: number
    lastUpdated?: string
  } | null>(null)
  const [logs, setLogs] = useState<SystemLog[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [levelFilter, setLevelFilter] = useState<string>('all')
  const [componentFilter, setComponentFilter] = useState<string>('all')
  const [search, setSearch] = useState('')

  const loadData = useCallback(async () => {
    setIsLoading(true)
    try {
      const [s, l] = await Promise.all([
        fetchSystemHealthSummary(),
        fetchSystemLogs({
          level: levelFilter === 'all' ? undefined : levelFilter,
          component: componentFilter === 'all' ? undefined : componentFilter,
        }),
      ])
      setSummary(s ?? null)
      setLogs(Array.isArray(l) ? l : [])
    } catch {
      setSummary(null)
      setLogs([])
    } finally {
      setIsLoading(false)
    }
  }, [levelFilter, componentFilter])

  useEffect(() => {
    loadData()
  }, [loadData])

  const filteredLogs = (logs ?? []).filter((log) => {
    if (!search.trim()) return true
    const q = search.toLowerCase()
    return (
      log.message.toLowerCase().includes(q) ||
      log.component.toLowerCase().includes(q) ||
      (log.correlationId ?? '').toLowerCase().includes(q)
    )
  })

  const columns: Column<SystemLog>[] = [
    {
      id: 'timestamp',
      header: 'Time',
      accessor: (r) => new Date(r.timestamp).toLocaleString(),
      className: 'font-mono text-xs',
    },
    {
      id: 'level',
      header: 'Level',
      accessor: (r) => (
        <PillBadge
          variant={
            r.level === 'error'
              ? 'destructive'
              : r.level === 'warn'
                ? 'warning'
                : r.level === 'debug'
                  ? 'outline'
                  : 'default'
          }
        >
          {r.level}
        </PillBadge>
      ),
    },
    { id: 'component', header: 'Component', accessor: 'component' },
    { id: 'message', header: 'Message', accessor: 'message', className: 'max-w-md truncate' },
    { id: 'correlationId', header: 'Correlation ID', accessor: (r) => r.correlationId ?? '-' },
  ]

  return (
    <div className="flex flex-1 flex-col gap-8 p-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground md:text-3xl">System Health</h1>
          <p className="mt-1 text-muted-foreground">
            Queue status, AI usage, and error logs.
          </p>
        </div>
        <Button variant="outline" size="sm" className="gap-2" onClick={loadData}>
          <RefreshCw className="h-4 w-4" />
          Refresh
        </Button>
      </header>

      {summary && (
        <section aria-labelledby="status-heading">
          <h2 id="status-heading" className="mb-4 text-lg font-semibold">
            Status Overview
          </h2>
          <div className="grid gap-4 sm:grid-cols-3">
            <Card className="border-l-4 border-l-primary">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Queue Backlog
                </CardTitle>
                <Activity className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">{summary.queueBacklog}</p>
                <p className="text-xs text-muted-foreground">Items pending</p>
              </CardContent>
            </Card>
            <Card className="border-l-4 border-l-accent">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  AI API Usage
                </CardTitle>
                <CheckCircle className="h-4 w-4 text-accent" />
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">{summary.aiApiUsage}%</p>
                <p className="text-xs text-muted-foreground">Current period</p>
              </CardContent>
            </Card>
            <Card
              className={
                summary.errorCount > 0
                  ? 'border-l-4 border-l-destructive'
                  : 'border-l-4 border-l-emerald-500'
              }
            >
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Errors (24h)
                </CardTitle>
                <AlertCircle
                  className={
                    summary.errorCount > 0 ? 'h-4 w-4 text-destructive' : 'h-4 w-4 text-emerald-500'
                  }
                />
              </CardHeader>
              <CardContent>
                <p
                  className={`text-2xl font-bold ${summary.errorCount > 0 ? 'text-destructive' : ''}`}
                >
                  {summary.errorCount}
                </p>
                <p className="text-xs text-muted-foreground">Last 24 hours</p>
              </CardContent>
            </Card>
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            Last updated: {summary.lastUpdated ? new Date(summary.lastUpdated).toLocaleString() : '—'}
          </p>
        </section>
      )}

      <section aria-labelledby="logs-heading">
        <h2 id="logs-heading" className="mb-4 text-lg font-semibold">
          Logs
        </h2>
        <div className="mb-4 flex flex-wrap items-center gap-4">
          <Input
            placeholder="Search logs..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="max-w-xs"
            aria-label="Search logs"
          />
          <Select value={levelFilter} onValueChange={setLevelFilter}>
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="Level" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All levels</SelectItem>
              <SelectItem value="info">Info</SelectItem>
              <SelectItem value="warn">Warn</SelectItem>
              <SelectItem value="error">Error</SelectItem>
              <SelectItem value="debug">Debug</SelectItem>
            </SelectContent>
          </Select>
          <Select value={componentFilter} onValueChange={setComponentFilter}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Component" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All components</SelectItem>
              <SelectItem value="auth">Auth</SelectItem>
              <SelectItem value="ai">AI</SelectItem>
              <SelectItem value="storage">Storage</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <DataTable<SystemLog>
          columns={columns}
          data={filteredLogs}
          rowId={(r) => r.id}
          isLoading={isLoading}
          emptyMessage="No logs found"
        />
      </section>
    </div>
  )
}
