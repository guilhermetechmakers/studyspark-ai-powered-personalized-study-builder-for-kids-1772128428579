/**
 * AuditTrailPanel - Read-only timeline of profile changes.
 */

import { useEffect } from 'react'
import { History, User, Users } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Skeleton } from '@/components/ui/skeleton'
import type { ProfileAuditLog } from '@/types/profile'
import { cn } from '@/lib/utils'

export interface AuditTrailPanelProps {
  auditLog: ProfileAuditLog[]
  isLoading?: boolean
  onLoad?: () => void
}

function formatAction(action: string): string {
  const map: Record<string, string> = {
    create_user: 'Profile created',
    update_user: 'Profile updated',
    delete_user: 'Profile deleted',
    create_child: 'Child profile added',
    update_child: 'Child profile updated',
    delete_child: 'Child profile removed',
  }
  return map[action] ?? action
}

function formatDate(iso: string): string {
  try {
    const d = new Date(iso)
    return d.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch {
    return iso
  }
}

export function AuditTrailPanel({
  auditLog,
  isLoading = false,
  onLoad,
}: AuditTrailPanelProps) {
  useEffect(() => {
    onLoad?.()
  }, [onLoad])

  const logs = Array.isArray(auditLog) ? auditLog : []

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <History className="h-5 w-5" />
          Audit trail
        </CardTitle>
        <CardDescription>
          Recent changes to your profile and child profiles
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-14 w-full rounded-xl" />
            ))}
          </div>
        ) : logs.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted-foreground">
            No changes recorded yet.
          </p>
        ) : (
          <ScrollArea className="h-[280px] pr-4">
            <div className="space-y-2">
              {logs.map((log) => (
                <div
                  key={log.id}
                  className={cn(
                    'flex items-start gap-3 rounded-xl border border-border/60 bg-muted/30 px-4 py-3'
                  )}
                >
                  <div
                    className={cn(
                      'flex h-9 w-9 shrink-0 items-center justify-center rounded-full',
                      log.targetType === 'user'
                        ? 'bg-primary/20 text-primary'
                        : 'bg-accent/20 text-accent-foreground'
                    )}
                  >
                    {log.targetType === 'user' ? (
                      <User className="h-4 w-4" />
                    ) : (
                      <Users className="h-4 w-4" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-foreground">
                      {formatAction(log.action)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatDate(log.createdAt)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  )
}
