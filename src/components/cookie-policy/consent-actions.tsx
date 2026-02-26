/**
 * ConsentActions - Save Preferences and Revoke Consent buttons with feedback.
 */
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export interface ConsentActionsProps {
  onSave: () => void
  onRevoke: () => void
  saving?: boolean
  savedMessage?: string | null
  className?: string
}

export function ConsentActions({
  onSave,
  onRevoke,
  saving = false,
  savedMessage = null,
  className,
}: ConsentActionsProps) {
  return (
    <div
      className={cn(
        'flex flex-col gap-4 rounded-2xl border border-border/60 bg-gradient-to-br from-[rgb(var(--lavender))]/20 via-white to-[rgb(var(--peach-light))]/30 p-6 md:p-8 transition-shadow duration-300 hover:shadow-card-hover',
        className
      )}
      role="group"
      aria-label="Cookie consent actions"
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
        <Button
          onClick={onSave}
          disabled={saving}
          size="lg"
          className="rounded-full shadow-md hover:shadow-lg min-w-[160px]"
          aria-busy={saving}
          aria-live="polite"
        >
          {saving ? 'Saving…' : 'Save Preferences'}
        </Button>
        <Button
          onClick={onRevoke}
          variant="outline"
          size="lg"
          className="rounded-full min-w-[160px]"
          disabled={saving}
          aria-label="Revoke all cookie consent and reset to defaults"
        >
          Revoke Consent
        </Button>
      </div>
      {savedMessage && (
        <div
          role="status"
          aria-live="polite"
          className="text-sm font-medium text-primary"
        >
          {savedMessage}
        </div>
      )}
    </div>
  )
}
