/**
 * SessionsPanel - Shows login status and sign out from all devices.
 * Uses Supabase session; revokes all sessions via Edge Function.
 */

import { useState } from 'react'
import { Monitor, LogOut, Shield } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { supabase } from '@/lib/supabase'
import { useAuthContext } from '@/contexts/auth-context'
import { toast } from 'sonner'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL ?? ''

export function SessionsPanel() {
  const { user, signOut } = useAuthContext()
  const [isRevoking, setIsRevoking] = useState(false)

  const sessionInfo = (() => {
    const u = user
    if (!u) return null
    return {
      email: u.email,
      lastActive: new Date().toLocaleString(),
    }
  })()

  const handleRevokeAllSessions = async () => {
    if (!supabaseUrl) {
      toast.error('Sessions management is not configured.')
      return
    }
    setIsRevoking(true)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      const token = session?.access_token
      if (!token) {
        toast.error('Not signed in.')
        return
      }
      const res = await fetch(`${supabaseUrl}/functions/v1/revoke-all-sessions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      })
      const json = (await res.json().catch(() => ({}))) as { success?: boolean; message?: string }
      if (json.success) {
        await signOut()
        toast.success('Signed out from all devices.')
        window.location.href = '/login'
      } else {
        toast.error(json.message ?? 'Failed to revoke sessions.')
      }
    } catch {
      toast.error('Failed to revoke sessions. Please try again.')
    } finally {
      setIsRevoking(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 rounded-xl border-2 border-border/60 bg-card p-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10">
          <Shield className="h-6 w-6 text-primary" aria-hidden />
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="font-semibold text-foreground">Sessions & security</h3>
          <p className="text-sm text-muted-foreground">
            Manage your active sessions and sign out from other devices.
          </p>
        </div>
      </div>

      {sessionInfo && (
        <div className="flex items-center gap-3 rounded-xl border border-border bg-muted/30 p-4">
          <Monitor className="h-5 w-5 text-muted-foreground" aria-hidden />
          <div className="min-w-0 flex-1">
            <p className="font-medium text-foreground">Current session</p>
            <p className="text-sm text-muted-foreground">{sessionInfo.email}</p>
            <p className="text-xs text-muted-foreground mt-1">
              Last active: {sessionInfo.lastActive}
            </p>
          </div>
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => signOut().then(() => (window.location.href = '/'))}
          disabled={isRevoking}
          className="rounded-full"
        >
          <LogOut className="h-4 w-4" />
          Sign out this device
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={handleRevokeAllSessions}
          disabled={isRevoking}
          className="rounded-full border-destructive/50 text-destructive hover:bg-destructive/10 hover:text-destructive"
        >
          {isRevoking ? 'Revoking…' : 'Sign out from all devices'}
        </Button>
      </div>
    </div>
  )
}
