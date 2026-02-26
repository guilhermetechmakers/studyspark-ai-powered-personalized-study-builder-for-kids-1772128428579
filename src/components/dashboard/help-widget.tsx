import { Link } from 'react-router-dom'
import { HelpCircle, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export interface HelpWidgetProps {
  className?: string
}

export function HelpWidget({ className }: HelpWidgetProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-between gap-4 rounded-2xl border border-border bg-gradient-to-br from-[rgb(var(--lavender))]/10 to-[rgb(var(--tangerine))]/10 p-6 md:flex-row',
        className
      )}
    >
      <div className="flex items-center gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary/10">
          <HelpCircle className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h3 className="font-semibold text-foreground">Need help getting started?</h3>
          <p className="text-sm text-muted-foreground">
            Check out our tutorial or contact support.
          </p>
        </div>
      </div>
      <Button variant="outline" asChild className="shrink-0 rounded-full">
        <Link to="/help" className="flex items-center gap-2">
          <Sparkles className="h-4 w-4" />
          Help Center
        </Link>
      </Button>
    </div>
  )
}
