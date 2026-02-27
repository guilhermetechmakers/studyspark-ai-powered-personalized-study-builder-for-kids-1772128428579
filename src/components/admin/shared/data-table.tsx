import * as React from 'react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { ChevronDown, ChevronUp, Inbox, Loader2, MoreHorizontal, RefreshCw } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'

export interface Column<T> {
  id: string
  header: string
  accessor?: keyof T | ((row: T) => React.ReactNode)
  sortable?: boolean
  className?: string
}

export interface DataTableProps<T> {
  columns: Column<T>[]
  data: T[]
  rowId: (row: T) => string
  rowActions?: (row: T) => React.ReactNode
  selectable?: boolean
  selectedIds?: Set<string>
  onSelectionChange?: (ids: Set<string>) => void
  sort?: { key: string; dir: 'asc' | 'desc' }
  onSort?: (key: string) => void
  isLoading?: boolean
  emptyMessage?: string
  emptyTitle?: string
  emptyDescription?: string
  emptyActionLabel?: string
  onEmptyAction?: () => void
  error?: string | null
  onRetry?: () => void
  title?: string
  loadingLabel?: string
  className?: string
}

const TABLE_WRAPPER_CLASS =
  'overflow-hidden rounded-2xl border border-border bg-card shadow-card'
const TABLE_HEAD_CLASS = 'border-b border-border bg-muted/30'
const TABLE_ROW_CLASS = 'border-b border-border last:border-0'
const TABLE_CELL_CLASS = 'px-4 py-3 text-sm text-foreground'

export function DataTable<T>({
  columns,
  data,
  rowId,
  rowActions,
  selectable = false,
  selectedIds = new Set(),
  onSelectionChange,
  sort,
  onSort,
  isLoading = false,
  emptyMessage = 'No data found',
  emptyTitle,
  emptyDescription,
  emptyActionLabel,
  onEmptyAction,
  error = null,
  onRetry,
  title,
  loadingLabel = 'Loading…',
  className,
}: DataTableProps<T>) {
  const rows = Array.isArray(data) ? data : []
  const allSelected = rows.length > 0 && rows.every((r) => selectedIds.has(rowId(r)))
  const hasError = Boolean(error)

  const handleSelectAll = (checked: boolean) => {
    if (!onSelectionChange) return
    const next = new Set(selectedIds)
    if (checked) rows.forEach((r) => next.add(rowId(r)))
    else rows.forEach((r) => next.delete(rowId(r)))
    onSelectionChange(next)
  }

  const handleSelectRow = (id: string, checked: boolean) => {
    if (!onSelectionChange) return
    const next = new Set(selectedIds)
    if (checked) next.add(id)
    else next.delete(id)
    onSelectionChange(next)
  }

  const getCellValue = (row: T, col: Column<T>): React.ReactNode => {
    if (col.accessor === undefined) return null
    if (typeof col.accessor === 'function') return col.accessor(row)
    const val = row[col.accessor as keyof T]
    return val != null ? String(val) : ''
  }

  if (isLoading) {
    return (
      <section
        className={cn(TABLE_WRAPPER_CLASS, className)}
        aria-label={title ?? 'Data table'}
        aria-busy="true"
        aria-live="polite"
      >
        {title && (
          <h2 className="sr-only">{title}</h2>
        )}
        <div className="flex flex-col items-center justify-center gap-4 py-12 px-6">
          <Loader2 className="h-10 w-10 animate-spin text-primary" aria-hidden />
          <p className="text-sm font-medium text-muted-foreground">{loadingLabel}</p>
          <div className="w-full max-w-md overflow-hidden rounded-lg bg-muted">
            <div className="h-2 w-full animate-pulse rounded bg-primary/20" />
          </div>
        </div>
        <div className="overflow-x-auto border-t border-border">
          <table className="w-full">
            <thead>
              <tr className={TABLE_HEAD_CLASS}>
                {selectable && (
                  <th className="w-12 px-4 py-3 text-left">
                    <Skeleton className="h-4 w-4 rounded" />
                  </th>
                )}
                {columns.map((col) => (
                  <th key={col.id} className={cn('px-4 py-3 text-left text-sm font-medium text-foreground', col.className)}>
                    <Skeleton className="h-4 w-24 rounded" />
                  </th>
                ))}
                {rowActions && <th className="w-12" />}
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} className={TABLE_ROW_CLASS}>
                  {selectable && <td className="px-4 py-3"><Skeleton className="h-4 w-4 rounded" /></td>}
                  {columns.map((col) => (
                    <td key={col.id} className="px-4 py-3">
                      <Skeleton className="h-4 w-full max-w-[120px] rounded" />
                    </td>
                  ))}
                  {rowActions && <td className="px-4 py-3" />}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    )
  }

  if (hasError) {
    return (
      <section
        className={cn(
          'flex flex-col items-center justify-center gap-6 rounded-2xl border border-border border-destructive/30 bg-card py-16 px-6 text-center',
          className
        )}
        aria-label={title ?? 'Data table'}
        aria-live="polite"
      >
        {title && <h2 className="sr-only">{title}</h2>}
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-destructive/10 text-destructive">
          <RefreshCw className="h-7 w-7" aria-hidden />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-foreground">Something went wrong</h3>
          <p className="mt-2 max-w-sm text-sm text-muted-foreground">{error}</p>
        </div>
        {onRetry && (
          <Button variant="outline" size="sm" className="gap-2 rounded-full" onClick={onRetry}>
            <RefreshCw className="h-4 w-4" />
            Try again
          </Button>
        )}
      </section>
    )
  }

  if (rows.length === 0) {
    return (
      <section
        className={cn(
          'flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-muted/30 py-16 px-6 text-center',
          className
        )}
        aria-label={title ?? 'Data table'}
      >
        {title && <h2 className="sr-only">{title}</h2>}
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <Inbox className="h-7 w-7" aria-hidden />
        </div>
        <h3 className="mt-4 text-lg font-semibold text-foreground">
          {emptyTitle ?? emptyMessage}
        </h3>
        {emptyDescription && (
          <p className="mt-2 max-w-sm text-sm text-muted-foreground">{emptyDescription}</p>
        )}
        {emptyActionLabel && onEmptyAction && (
          <Button
            variant="default"
            className="mt-6 rounded-full"
            onClick={onEmptyAction}
          >
            {emptyActionLabel}
          </Button>
        )}
      </section>
    )
  }

  return (
    <section
      className={cn(TABLE_WRAPPER_CLASS, className)}
      aria-label={title ?? 'Data table'}
    >
      {title && <h2 className="sr-only">{title}</h2>}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="sticky top-0 z-10 bg-muted/50 backdrop-blur">
            <tr className="border-b border-border">
              {selectable && (
                <th className="w-12 px-4 py-3 text-left">
                  <Checkbox
                    checked={allSelected}
                    disabled={rows.length === 0}
                    onCheckedChange={(c) => handleSelectAll(c === true)}
                    aria-label="Select all"
                  />
                </th>
              )}
              {columns.map((col) => (
                <th
                  key={col.id}
                  className={cn(
                    'px-4 py-3 text-left text-sm font-medium text-foreground',
                    col.className
                  )}
                >
                  <div className="flex items-center gap-1">
                    {col.header}
                    {col.sortable && onSort && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => onSort(col.id)}
                        aria-label={`Sort by ${col.header}`}
                      >
                        {sort?.key === col.id ? (
                          sort.dir === 'asc' ? (
                            <ChevronUp className="h-4 w-4" />
                          ) : (
                            <ChevronDown className="h-4 w-4" />
                          )
                        ) : (
                          <ChevronDown className="h-4 w-4 opacity-50" />
                        )}
                      </Button>
                    )}
                  </div>
                </th>
              ))}
              {rowActions && <th className="w-12 px-4 py-3" />}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => {
              const id = rowId(row)
              return (
                <tr
                  key={id}
                  className="border-b border-border transition-colors last:border-0 hover:bg-muted/30"
                >
                  {selectable && (
                    <td className="px-4 py-3">
                      <Checkbox
                        checked={selectedIds.has(id)}
                        onCheckedChange={(c) => handleSelectRow(id, c === true)}
                        aria-label={`Select row ${id}`}
                      />
                    </td>
                  )}
                  {columns.map((col) => (
                    <td key={col.id} className={cn(TABLE_CELL_CLASS, col.className)}>
                      {getCellValue(row, col)}
                    </td>
                  ))}
                  {rowActions && (
                    <td className="px-4 py-3">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8" aria-label="Row actions">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">{rowActions(row)}</DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  )}
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </section>
  )
}
