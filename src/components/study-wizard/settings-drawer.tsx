import { useState } from 'react'
import { Settings, Zap } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import type { QuotaInfo } from '@/types/study-builder'
import { cn } from '@/lib/utils'

export interface SettingsDrawerProps {
  quota?: QuotaInfo | null
  trigger?: React.ReactNode
  className?: string
}

export function SettingsDrawer({
  quota,
  trigger,
  className,
}: SettingsDrawerProps) {
  const [open, setOpen] = useState(false)
  const used = quota?.usedCount ?? 0
  const limit = quota?.limit ?? 10
  const remaining = Math.max(0, limit - used)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button variant="ghost" size="icon" aria-label="Open settings">
            <Settings className="h-5 w-5" />
          </Button>
        )}
      </DialogTrigger>
      <DialogContent
        className={cn('sm:max-w-md', className)}
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Study Builder Settings
          </DialogTitle>
          <DialogDescription>
            Quotas, rate limits, and preferences.
          </DialogDescription>
        </DialogHeader>
        <div className="mt-6 space-y-6">
          <div className="rounded-xl border border-border/60 bg-gradient-to-br from-[rgb(var(--peach-light))]/20 to-white p-4">
            <h4 className="mb-2 flex items-center gap-2 text-sm font-semibold text-foreground">
              <Zap className="h-4 w-4 text-primary" />
              Generation Quota
            </h4>
            <p className="text-xs text-muted-foreground">
              {remaining} of {limit} generations remaining this period.
            </p>
            <div className="mt-2 h-2 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-primary transition-all duration-300"
                style={{ width: `${Math.min(100, (used / limit) * 100)}%` }}
              />
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
