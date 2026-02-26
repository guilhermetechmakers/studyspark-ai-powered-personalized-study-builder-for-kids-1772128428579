import { useState } from 'react'
import { Link } from 'react-router-dom'
import { HelpCircle, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface HelpWidgetProps {
  className?: string
}

export function HelpWidget({ className }: HelpWidgetProps) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className={cn('relative', className)}>
      <Button
        variant="outline"
        size="icon"
        className="fixed bottom-6 right-6 z-50 h-14 w-14 rounded-full shadow-lg"
        onClick={() => setIsOpen(!isOpen)}
        aria-label={isOpen ? 'Close help' : 'Open help'}
      >
        <HelpCircle className="h-6 w-6" />
      </Button>
      {isOpen && (
        <div
          className="fixed bottom-24 right-6 z-50 w-72 rounded-2xl border border-border bg-card p-4 shadow-lg animate-fade-in"
          role="dialog"
          aria-label="Help widget"
        >
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-foreground">Need help?</h3>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => setIsOpen(false)}
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <p className="mt-2 text-sm text-muted-foreground">
            Check out our help center for guides and FAQs.
          </p>
          <Button asChild className="mt-4 w-full" size="sm">
            <Link to="/help">Help Center</Link>
          </Button>
        </div>
      )}
    </div>
  )
}
