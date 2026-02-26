/**
 * AccountSecurityPanel - Account & security settings.
 * Shows connected auth methods, OAuth link options, and sign out.
 */

import { useState, useEffect } from 'react'
import { Shield, LogOut, Chrome, Apple, Facebook, Mail, Loader2 } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useAuthContext } from '@/contexts/auth-context'
import { getLinkedProviders, linkOAuthProvider } from '@/api/auth'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

const OAUTH_PROVIDERS = [
  { id: 'google' as const, label: 'Google', icon: Chrome },
  { id: 'apple' as const, label: 'Apple', icon: Apple },
  { id: 'facebook' as const, label: 'Facebook', icon: Facebook },
] as const

export function AccountSecurityPanel() {
  const { user, signOut } = useAuthContext()
  const [linkedProviders, setLinkedProviders] = useState<string[]>([])
  const [loadingProviders, setLoadingProviders] = useState(true)
  const [linkingProvider, setLinkingProvider] = useState<string | null>(null)
  const [signingOut, setSigningOut] = useState(false)

  useEffect(() => {
    getLinkedProviders()
      .then((p) => setLinkedProviders(Array.isArray(p) ? p : []))
      .catch(() => setLinkedProviders([]))
      .finally(() => setLoadingProviders(false))
  }, [])

  const hasEmail = Boolean(user?.email)
  const safeLinked = Array.isArray(linkedProviders) ? linkedProviders : []

  const handleLinkProvider = async (provider: 'google' | 'apple' | 'facebook') => {
    if (linkingProvider) return
    setLinkingProvider(provider)
    try {
      await linkOAuthProvider(provider)
      toast.success(`Redirecting to link ${provider}…`)
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to link. Try again.'
      toast.error(msg)
    } finally {
      setLinkingProvider(null)
    }
  }

  const handleSignOut = async () => {
    if (signingOut) return
    setSigningOut(true)
    try {
      await signOut()
      toast.success('Signed out')
      window.location.href = '/login'
    } catch {
      toast.error('Failed to sign out')
    } finally {
      setSigningOut(false)
    }
  }

  return (
    <Card className="border-2 border-border/60">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-primary" aria-hidden />
          Account & security
        </CardTitle>
        <CardDescription>
          Manage sign-in methods and sign out from this device
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <p className="mb-3 text-sm font-medium text-foreground">Connected sign-in methods</p>
          <div className="space-y-2">
            {hasEmail && (
              <div className="flex items-center justify-between rounded-xl border border-border bg-muted/30 px-4 py-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <Mail className="h-5 w-5 text-primary" aria-hidden />
                  </div>
                  <div>
                    <p className="font-medium">Email</p>
                    <p className="text-sm text-muted-foreground">{user?.email ?? '—'}</p>
                  </div>
                </div>
                <Badge variant="secondary">Primary</Badge>
              </div>
            )}
            {loadingProviders ? (
              <div className="flex items-center gap-2 py-4 text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                <span className="text-sm">Loading…</span>
              </div>
            ) : (
              OAUTH_PROVIDERS.map(({ id, label, icon: Icon }) => {
                const isLinked = safeLinked.includes(id)
                const isLinking = linkingProvider === id
                return (
                  <div
                    key={id}
                    className={cn(
                      'flex items-center justify-between rounded-xl border border-border px-4 py-3 transition-colors',
                      isLinked && 'bg-muted/30'
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                        <Icon className="h-5 w-5 text-muted-foreground" aria-hidden />
                      </div>
                      <div>
                        <p className="font-medium">{label}</p>
                        <p className="text-sm text-muted-foreground">
                          {isLinked ? 'Connected' : 'Not connected'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {isLinked ? (
                        <Badge variant="success">Connected</Badge>
                      ) : (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleLinkProvider(id)}
                          disabled={isLinking}
                          className="rounded-full"
                        >
                          {isLinking ? (
                            <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                          ) : (
                            'Connect'
                          )}
                        </Button>
                      )}
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>

        <div className="border-t border-border pt-6">
          <p className="mb-3 text-sm font-medium text-foreground">Sign out</p>
          <Button
            variant="outline"
            onClick={handleSignOut}
            disabled={signingOut}
            className="rounded-full border-destructive/50 text-destructive hover:bg-destructive/10 hover:text-destructive"
          >
            {signingOut ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden />
            ) : (
              <LogOut className="mr-2 h-4 w-4" aria-hidden />
            )}
            Sign out from this device
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
