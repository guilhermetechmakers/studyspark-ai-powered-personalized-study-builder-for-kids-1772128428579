import { useState } from 'react'
import { HardDrive, Cloud, GraduationCap, Loader2 } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import type { Integration } from '@/types/settings'
import { INTEGRATION_PROVIDERS } from '@/types/settings'
import { cn } from '@/lib/utils'

const PROVIDER_ICONS: Record<string, typeof HardDrive> = {
  google_drive: HardDrive,
  dropbox: Cloud,
  classroom: GraduationCap,
}

function formatLastSync(lastSync?: string | null): string {
  if (!lastSync) return 'Never'
  try {
    const d = new Date(lastSync)
    if (isNaN(d.getTime())) return 'Never'
    const now = new Date()
    const diff = now.getTime() - d.getTime()
    if (diff < 60000) return 'Just now'
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`
    return d.toLocaleDateString()
  } catch {
    return 'Never'
  }
}

export interface IntegrationsPanelProps {
  integrations: Integration[]
  onConnect?: (provider: Integration['provider']) => void | Promise<void>
  onDisconnect?: (provider: Integration['provider']) => void | Promise<void>
}

export function IntegrationsPanel({
  integrations,
  onConnect,
  onDisconnect,
}: IntegrationsPanelProps) {
  const [connecting, setConnecting] = useState<string | null>(null)
  const [disconnecting, setDisconnecting] = useState<string | null>(null)

  const safeIntegrations = Array.isArray(integrations) ? integrations : []

  const getOrCreateIntegration = (provider: Integration['provider']): Integration => {
    const existing = safeIntegrations.find((i) => i.provider === provider)
    if (existing) return existing
    return {
      id: `temp-${provider}`,
      provider,
      connected: false,
    }
  }

  const handleConnect = async (provider: Integration['provider']) => {
    setConnecting(provider)
    try {
      if (onConnect) {
        await onConnect(provider)
      }
    } finally {
      setConnecting(null)
    }
  }

  const handleDisconnect = async (provider: Integration['provider']) => {
    setDisconnecting(provider)
    try {
      if (onDisconnect) {
        await onDisconnect(provider)
      }
    } finally {
      setDisconnecting(null)
    }
  }

  const displayList = INTEGRATION_PROVIDERS.length > 0
    ? INTEGRATION_PROVIDERS
    : [
        { id: 'google_drive' as const, name: 'Google Drive', icon: 'drive' },
        { id: 'dropbox' as const, name: 'Dropbox', icon: 'dropbox' },
        { id: 'classroom' as const, name: 'Google Classroom', icon: 'classroom' },
      ]

  return (
    <Card>
      <CardHeader>
        <CardTitle>Integrations</CardTitle>
        <CardDescription>
          Connect Google Drive, Dropbox, or classroom tools to import materials
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {displayList.map((p) => {
            const integration = getOrCreateIntegration(p.id)
            const Icon = PROVIDER_ICONS[p.id] ?? HardDrive
            const isConnecting = connecting === p.id
            const isDisconnecting = disconnecting === p.id
            const busy = isConnecting || isDisconnecting

            return (
              <div
                key={p.id}
                className={cn(
                  'flex items-center justify-between rounded-2xl border border-border p-4 transition-all',
                  integration.connected && 'bg-muted/30'
                )}
              >
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-muted">
                    <Icon className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="font-medium">{p.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {integration.connected
                        ? `Last sync: ${formatLastSync(integration.lastSync)}`
                        : 'Not connected'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {integration.connected ? (
                    <>
                      <Badge variant="success">Connected</Badge>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDisconnect(p.id)}
                        disabled={busy}
                        className="rounded-full"
                      >
                        {isDisconnecting ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          'Disconnect'
                        )}
                      </Button>
                    </>
                  ) : (
                    <Button
                      size="sm"
                      onClick={() => handleConnect(p.id)}
                      disabled={busy}
                      className="rounded-full"
                    >
                      {isConnecting ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        'Connect'
                      )}
                    </Button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
