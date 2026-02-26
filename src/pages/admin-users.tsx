import { useCallback, useEffect, useState } from 'react'
import { Search, Download, Ban, Trash2 } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  DataTable,
  ConfirmationDialog,
  PillBadge,
} from '@/components/admin/shared'
import type { Column } from '@/components/admin/shared'
import {
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'
import {
  fetchAdminUsers,
  suspendAdminUser,
  deleteAdminUser,
} from '@/api/admin'
import type { AdminUser } from '@/types/admin'
import { toast } from 'sonner'

function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(t)
  }, [value, delay])
  return debounced
}

export function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [role, setRole] = useState<string>('all')
  const [status, setStatus] = useState<string>('all')
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [sort, setSort] = useState<{ key: string; dir: 'asc' | 'desc' } | null>(null)
  const [confirmState, setConfirmState] = useState<{
    open: boolean
    action: 'suspend' | 'delete' | 'bulk-suspend' | 'bulk-delete'
    userId?: string
    isLoading?: boolean
  }>({ open: false, action: 'suspend' })

  const debouncedSearch = useDebounce(search, 300)

  const loadUsers = useCallback(async () => {
    setIsLoading(true)
    try {
      const res = await fetchAdminUsers({
        search: debouncedSearch || undefined,
        role: role === 'all' ? undefined : role,
        status: status === 'all' ? undefined : status,
        sort: sort ? `${sort.key}:${sort.dir}` : undefined,
      })
      setUsers(Array.isArray(res?.users) ? res.users : [])
    } catch (e) {
      toast.error('Failed to load users')
      setUsers([])
    } finally {
      setIsLoading(false)
    }
  }, [debouncedSearch, role, status, sort])

  useEffect(() => {
    loadUsers()
  }, [loadUsers])

  const handleSort = (key: string) => {
    setSort((prev) =>
      prev?.key === key
        ? { key, dir: prev.dir === 'asc' ? 'desc' : 'asc' }
        : { key, dir: 'asc' }
    )
  }

  const handleSuspend = async (id: string) => {
    setConfirmState((s) => ({ ...s, isLoading: true }))
    try {
      await suspendAdminUser(id, true)
      toast.success('User suspended')
      loadUsers()
    } catch {
      toast.error('Failed to suspend user')
    } finally {
      setConfirmState((s) => ({ ...s, open: false, isLoading: false }))
    }
  }

  const handleDelete = async (id: string) => {
    setConfirmState((s) => ({ ...s, isLoading: true }))
    try {
      await deleteAdminUser(id)
      toast.success('User deleted')
      loadUsers()
    } catch {
      toast.error('Failed to delete user')
    } finally {
      setConfirmState((s) => ({ ...s, open: false, isLoading: false }))
    }
  }

  const handleBulkSuspend = async () => {
    setConfirmState((s) => ({ ...s, isLoading: true }))
    try {
      await Promise.all(Array.from(selectedIds ?? []).map((id) => suspendAdminUser(id, true)))
      toast.success('Users suspended')
      setSelectedIds(new Set())
      loadUsers()
    } catch {
      toast.error('Failed to suspend users')
    } finally {
      setConfirmState((s) => ({ ...s, open: false, isLoading: false }))
    }
  }

  const handleBulkDelete = async () => {
    setConfirmState((s) => ({ ...s, isLoading: true }))
    try {
      await Promise.all(Array.from(selectedIds ?? []).map((id) => deleteAdminUser(id)))
      toast.success('Users deleted')
      setSelectedIds(new Set())
      loadUsers()
    } catch {
      toast.error('Failed to delete users')
    } finally {
      setConfirmState((s) => ({ ...s, open: false, isLoading: false }))
    }
  }

  const handleExport = () => {
    const headers = ['ID', 'Name', 'Email', 'Role', 'Status', 'Created', 'Last Active']
    const rows = (users ?? []).map((u) =>
      [u.id, u.name, u.email, u.role, u.status, u.createdAt, u.lastActive ?? ''].join(',')
    )
    const csv = [headers.join(','), ...rows].join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `users-${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
    toast.success('Export started')
  }

  const columns: Column<AdminUser>[] = [
    { id: 'id', header: 'ID', accessor: 'id', sortable: true, className: 'font-mono text-xs' },
    { id: 'name', header: 'Name', accessor: 'name', sortable: true },
    { id: 'email', header: 'Email', accessor: 'email', sortable: true },
    {
      id: 'role',
      header: 'Role',
      accessor: (r) => <PillBadge variant="default">{r.role}</PillBadge>,
      sortable: true,
    },
    {
      id: 'status',
      header: 'Status',
      accessor: (r) => (
        <PillBadge
          variant={
            r.status === 'active'
              ? 'success'
              : r.status === 'suspended'
                ? 'warning'
                : 'destructive'
          }
        >
          {r.status}
        </PillBadge>
      ),
      sortable: true,
    },
    { id: 'createdAt', header: 'Created', accessor: (r) => new Date(r.createdAt).toLocaleDateString(), sortable: true },
    { id: 'lastActive', header: 'Last Active', accessor: (r) => (r.lastActive ? new Date(r.lastActive).toLocaleDateString() : '-') },
  ]

  const rowActions = (row: AdminUser) => (
    <>
      <DropdownMenuItem onClick={() => {}}>Edit profile</DropdownMenuItem>
      <DropdownMenuItem onClick={() => {}}>Send message</DropdownMenuItem>
      <DropdownMenuItem onClick={() => {}}>Reset password</DropdownMenuItem>
      <DropdownMenuSeparator />
      <DropdownMenuItem
        className="text-destructive"
        onClick={() => setConfirmState({ open: true, action: 'suspend', userId: row.id })}
      >
        Suspend
      </DropdownMenuItem>
      <DropdownMenuItem
        className="text-destructive"
        onClick={() => setConfirmState({ open: true, action: 'delete', userId: row.id })}
      >
        Delete
      </DropdownMenuItem>
    </>
  )

  const selectedCount = selectedIds?.size ?? 0

  return (
    <div className="flex flex-1 flex-col gap-6 p-6">
      <header className="animate-fade-in">
        <h1 className="text-2xl font-bold text-foreground md:text-3xl">User Management</h1>
        <p className="mt-1 text-muted-foreground">
          Search, filter, and manage user accounts.
        </p>
      </header>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-4">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search users..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
              aria-label="Search users"
            />
          </div>
          <Select value={role} onValueChange={setRole}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All roles</SelectItem>
              <SelectItem value="parent">Parent</SelectItem>
              <SelectItem value="admin">Admin</SelectItem>
            </SelectContent>
          </Select>
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="suspended">Suspended</SelectItem>
              <SelectItem value="deleted">Deleted</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button variant="outline" size="sm" onClick={handleExport} className="gap-2">
          <Download className="h-4 w-4" />
          Export CSV
        </Button>
      </div>

      {selectedCount > 0 && (
        <div className="flex flex-wrap items-center gap-4 rounded-2xl border border-border bg-muted/30 px-4 py-3">
          <span className="text-sm font-medium">{selectedCount} selected</span>
          <Button
            variant="outline"
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
            onClick={() => setConfirmState({ open: true, action: 'bulk-delete' })}
          >
            <Trash2 className="h-4 w-4" />
            Delete
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setSelectedIds(new Set())}>
            Clear selection
          </Button>
        </div>
      )}

      <DataTable<AdminUser>
        columns={columns}
        data={users}
        rowId={(r) => r.id}
        rowActions={rowActions}
        selectable
        selectedIds={selectedIds}
        onSelectionChange={setSelectedIds}
        sort={sort ? { key: sort.key, dir: sort.dir } : undefined}
        onSort={handleSort}
        isLoading={isLoading}
        emptyMessage="No users found"
      />

      <ConfirmationDialog
        open={confirmState.open}
        onOpenChange={(o) => setConfirmState((s) => ({ ...s, open: o }))}
        title={
          confirmState.action === 'delete' || confirmState.action === 'bulk-delete'
            ? 'Delete user(s)?'
            : 'Suspend user(s)?'
        }
        description={
          confirmState.action === 'bulk-delete' || confirmState.action === 'bulk-suspend'
            ? `This will affect ${selectedCount} user(s).`
            : 'This action can be reversed later.'
        }
        confirmLabel={confirmState.action === 'delete' || confirmState.action === 'bulk-delete' ? 'Delete' : 'Suspend'}
        variant={confirmState.action === 'delete' || confirmState.action === 'bulk-delete' ? 'destructive' : 'default'}
        isLoading={confirmState.isLoading}
        onConfirm={async () => {
          if (confirmState.action === 'suspend' && confirmState.userId) {
            await handleSuspend(confirmState.userId)
          } else if (confirmState.action === 'delete' && confirmState.userId) {
            await handleDelete(confirmState.userId)
          } else if (confirmState.action === 'bulk-suspend') {
            await handleBulkSuspend()
          } else if (confirmState.action === 'bulk-delete') {
            await handleBulkDelete()
          }
        }}
      />
    </div>
  )
}
