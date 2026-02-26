/**
 * Admin Settings - Role definitions, permissions matrix, security controls.
 */

import { useCallback, useEffect, useState } from 'react'
import { Shield, Lock, Settings } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { PillBadge } from '@/components/admin/shared'
import { fetchAdminRoles, fetchAdminPermissions } from '@/api/admin'
import type { AdminRole, AdminPermission } from '@/types/admin'

export function AdminSettingsPage() {
  const [roles, setRoles] = useState<AdminRole[]>([])
  const [permissions, setPermissions] = useState<AdminPermission[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const loadData = useCallback(async () => {
    setIsLoading(true)
    try {
      const [r, p] = await Promise.all([
        fetchAdminRoles(),
        fetchAdminPermissions(),
      ])
      setRoles(Array.isArray(r) ? r : [])
      setPermissions(Array.isArray(p) ? p : [])
    } catch {
      setRoles([])
      setPermissions([])
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])

  return (
    <div className="flex flex-1 flex-col gap-8 p-6">
      <header className="animate-fade-in">
        <h1 className="text-2xl font-bold text-foreground md:text-3xl">Admin Settings</h1>
        <p className="mt-1 text-muted-foreground">
          Manage admin roles, permissions, and security controls.
        </p>
      </header>

      {isLoading ? (
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <Skeleton className="h-5 w-32" />
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <Skeleton className="h-5 w-40" />
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          <Card className="rounded-2xl border border-border bg-card shadow-card">
            <CardHeader className="flex flex-row items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                <Shield className="h-5 w-5 text-primary" />
              </div>
              <CardTitle className="text-lg">Admin Roles</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4 text-sm text-muted-foreground">
                Role definitions with permissions. Assign roles to admin users.
              </p>
              <ul className="space-y-3">
                {(roles ?? []).map((role) => (
                  <li
                    key={role.id}
                    className="flex items-center justify-between rounded-xl border border-border bg-muted/30 px-4 py-3"
                  >
                    <div>
                      <p className="font-medium">{role.name}</p>
                      {role.description && (
                        <p className="text-xs text-muted-foreground">{role.description}</p>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {(role.permissions ?? []).slice(0, 3).map((perm) => (
                        <PillBadge key={perm} variant="outline" className="text-xs">
                          {perm}
                        </PillBadge>
                      ))}
                      {(role.permissions ?? []).length > 3 && (
                        <PillBadge variant="outline" className="text-xs">
                          +{(role.permissions ?? []).length - 3}
                        </PillBadge>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
              {(roles ?? []).length === 0 && (
                <p className="py-8 text-center text-sm text-muted-foreground">
                  No roles configured
                </p>
              )}
            </CardContent>
          </Card>

          <Card className="rounded-2xl border border-border bg-card shadow-card">
            <CardHeader className="flex flex-row items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/10">
                <Lock className="h-5 w-5 text-accent" />
              </div>
              <CardTitle className="text-lg">Permissions Matrix</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4 text-sm text-muted-foreground">
                Available permissions for admin actions.
              </p>
              <ul className="space-y-2">
                {(permissions ?? []).map((perm) => (
                  <li
                    key={perm.id}
                    className="flex items-center justify-between rounded-lg border border-border px-3 py-2"
                  >
                    <span className="font-mono text-sm">{perm.name}</span>
                    {perm.category && (
                      <PillBadge variant="outline" className="text-xs">
                        {perm.category}
                      </PillBadge>
                    )}
                  </li>
                ))}
              </ul>
              {(permissions ?? []).length === 0 && (
                <p className="py-8 text-center text-sm text-muted-foreground">
                  No permissions defined
                </p>
              )}
            </CardContent>
          </Card>

          <Card className="md:col-span-2 rounded-2xl border border-border bg-card shadow-card">
            <CardHeader className="flex flex-row items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-secondary/10">
                <Settings className="h-5 w-5 text-secondary" />
              </div>
              <CardTitle className="text-lg">Security Controls</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4 text-sm text-muted-foreground">
                Session invalidation, IP allowlists, and two-factor enforcement options.
              </p>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <div className="rounded-xl border border-border bg-muted/30 px-4 py-3">
                  <p className="text-sm font-medium">Session Management</p>
                  <p className="text-xs text-muted-foreground">
                    Invalidate admin sessions remotely
                  </p>
                </div>
                <div className="rounded-xl border border-border bg-muted/30 px-4 py-3">
                  <p className="text-sm font-medium">IP Allowlist</p>
                  <p className="text-xs text-muted-foreground">
                    Restrict admin access by IP
                  </p>
                </div>
                <div className="rounded-xl border border-border bg-muted/30 px-4 py-3">
                  <p className="text-sm font-medium">2FA Enforcement</p>
                  <p className="text-xs text-muted-foreground">
                    Require two-factor for admins
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
