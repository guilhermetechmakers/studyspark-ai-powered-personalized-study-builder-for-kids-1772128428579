import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export interface ConsentActionsProps {
  onSave: () => void
  onRevoke: () => void
  saving?: boolean
  className?: string
}

export function ConsentActions({
  onSave,
  onRevoke,
  saving = false,
  className,
}: ConsentActionsProps) {
  return (
    <div
      className={cn(
        'flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-6',
        className
      )}
    >
      <Button
        onClick={onSave}
        disabled={saving}
        size="lg"
        className="min-w-[180px] transition-all duration-200 hover:scale-[1.02] hover:shadow-lg active:scale-[0.98]"
      >
        {saving ? (
          <span className="flex items-center gap-2">
            <span
              className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent"
              aria-hidden
            />
            Saving…
          </span>
        ) : (
          'Save Preferences'
        )}
      </Button>
      <Button
        onClick={onRevoke}
        variant="outline"
        disabled={saving}
        size="lg"
        className="min-w-[180px] transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
      >
        Revoke Consent
      </Button>
    </div>
  )
}
