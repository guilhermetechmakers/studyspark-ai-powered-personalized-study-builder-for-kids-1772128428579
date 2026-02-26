import { CheckCircle2, AlertCircle, Loader2 } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export type StatusPanelStatus = 'pending' | 'verified' | 'error'

export interface StatusPanelProps {
  status: StatusPanelStatus
  email: string
  onContinue: () => void
}

const statusConfig: Record<
  StatusPanelStatus,
  { label: string; icon: typeof CheckCircle2; className: string }
> = {
  pending: {
    label: 'Pending',
    icon: Loader2,
    className: 'text-primary',
  },
  verified: {
    label: 'Verified',
    icon: CheckCircle2,
    className: 'text-green-600 dark:text-green-500',
  },
  error: {
    label: 'Error',
    icon: AlertCircle,
    className: 'text-destructive',
  },
}

export function StatusPanel({ status, email, onContinue }: StatusPanelProps) {
  const config = statusConfig[status]
  const Icon = config.icon

  return (
    <Card className="rounded-[20px] border border-border bg-card shadow-card">
      <CardContent className="p-6">
        <div className="flex flex-col items-center gap-4">
          <div className="flex items-center gap-3">
            <span
              className={cn(
                'flex h-10 w-10 items-center justify-center rounded-full',
                status === 'pending' && 'bg-primary/10',
                status === 'verified' && 'bg-green-500/10',
                status === 'error' && 'bg-destructive/10'
              )}
              aria-hidden
            >
              <Icon
                className={cn(
                  'h-6 w-6',
                  config.className,
                  status === 'pending' && 'animate-spin'
                )}
                aria-hidden
              />
            </span>
            <div className="text-left">
              <p className="font-semibold text-foreground">Status: {config.label}</p>
              {email ? (
                <p className="text-sm text-muted-foreground" title={email}>
                  {email}
                </p>
              ) : null}
            </div>
          </div>

          {status === 'pending' && (
            <p className="text-center text-sm text-muted-foreground animate-pulse">
              Checking verification status...
            </p>
          )}

          {status === 'verified' && (
            <Button
              size="lg"
              className="w-full rounded-full bg-gradient-to-r from-[rgb(var(--lavender))] to-[rgb(var(--violet))] font-semibold shadow-md hover:scale-[1.02] hover:shadow-lg active:scale-[0.98]"
              onClick={onContinue}
            >
              Continue to App
            </Button>
          )}

          {status === 'error' && (
            <p className="text-center text-sm text-muted-foreground">
              Something went wrong. Please try refreshing the page or contact support.
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
