/**
 * CategoryToggle - Accessible toggle switch for cookie consent categories.
 * Uses role="switch", aria-checked, and keyboard support.
 */
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'

export interface CategoryToggleProps {
  id: string
  label: string
  description: string
  value: boolean
  onChange: (id: string, value: boolean) => void
  disabled?: boolean
  icon?: React.ReactNode
  className?: string
}

export function CategoryToggle({
  id,
  label,
  description,
  value,
  onChange,
  disabled = false,
  icon,
  className,
}: CategoryToggleProps) {
  const handleChange = (checked: boolean) => {
    if (!disabled) onChange(id, checked)
  }

  return (
    <div
      className={cn(
        'flex flex-col gap-3 rounded-2xl border border-border/60 bg-gradient-to-br from-[rgb(var(--peach-light))]/30 via-white to-[rgb(var(--lavender))]/15 p-5 md:p-6 shadow-card transition-all duration-300 hover:shadow-card-hover',
        disabled && 'opacity-90',
        className
      )}
      role="group"
      aria-labelledby={`${id}-label`}
      aria-describedby={`${id}-desc`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex min-w-0 flex-1 items-start gap-3">
          {icon && (
            <div
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary"
              aria-hidden
            >
              {icon}
            </div>
          )}
          <div className="min-w-0 flex-1">
            <Label
              id={`${id}-label`}
              htmlFor={`${id}-toggle`}
              className="text-base font-semibold text-foreground cursor-pointer"
            >
              {label}
              {disabled && (
                <span className="ml-2 text-xs font-normal text-muted-foreground">
                  (Required)
                </span>
              )}
            </Label>
            <p
              id={`${id}-desc`}
              className="mt-1 text-sm text-muted-foreground leading-relaxed"
            >
              {description}
            </p>
          </div>
        </div>
        <Switch
          id={`${id}-toggle`}
          checked={value}
          onCheckedChange={handleChange}
          disabled={disabled}
          role="switch"
          aria-checked={value}
          aria-label={`${label} cookies: ${value ? 'enabled' : 'disabled'}`}
          className="shrink-0 mt-1"
        />
      </div>
    </div>
  )
}
