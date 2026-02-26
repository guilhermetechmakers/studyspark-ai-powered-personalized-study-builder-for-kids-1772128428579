import * as React from 'react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { ChevronDown, ChevronUp, MoreHorizontal } from 'lucide-react'
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
  className?: string
}

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
  className,
}: DataTableProps<T>) {
  const rows = Array.isArray(data) ? data : []
  const allSelected = rows.length > 0 && rows.every((r) => selectedIds.has(rowId(r)))

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
      <div className={cn('overflow-hidden rounded-2xl border border-border bg-card', className)}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                {selectable && (
                  <th className="w-12 px-4 py-3 text-left">
                    <Skeleton className="h-4 w-4" />
                  </th>
                )}
                {columns.map((col) => (
                  <th key={col.id} className={cn('px-4 py-3 text-left text-sm font-medium', col.className)}>
                    <Skeleton className="h-4 w-24" />
                  </th>
                ))}
                {rowActions && <th className="w-12" />}
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} className="border-b border-border last:border-0">
                  {selectable && <td className="px-4 py-3"><Skeleton className="h-4 w-4" /></td>}
                  {columns.map((col) => (
                    <td key={col.id} className="px-4 py-3">
                      <Skeleton className="h-4 w-full max-w-[120px]" />
                    </td>
                  ))}
                  {rowActions && <td className="px-4 py-3" />}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    )
  }

  if (rows.length === 0) {
    return (
      <div
        className={cn(
          'flex items-center justify-center rounded-2xl border border-border bg-card py-16 text-muted-foreground',
          className
        )}
      >
        {emptyMessage}
      </div>
    )
  }

  return (
    <div className={cn('overflow-hidden rounded-2xl border border-border bg-card', className)}>
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
                    <td key={col.id} className={cn('px-4 py-3 text-sm', col.className)}>
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
    </div>
  )
}
