import { Switch } from '@/components/ui/switch'
import { cn } from '@/lib/utils'
import type { LucideIcon } from 'lucide-react'

export interface CategoryToggleProps {
  id: string
  label: string
  description: string
  value: boolean
  onChange: (id: string, value: boolean) => void
  disabled?: boolean
  icon?: LucideIcon
  className?: string
}

export function CategoryToggle({
  id,
  label,
  description,
  value,
  onChange,
  disabled = false,
  icon: Icon,
  className,
}: CategoryToggleProps) {
  const handleChange = (checked: boolean) => {
    if (!disabled) {
      onChange(id, checked)
    }
  }

  return (
    <div
      className={cn(
        'flex flex-col gap-3 rounded-2xl border border-border/60 bg-card p-5 transition-all duration-200 hover:shadow-card md:flex-row md:items-start md:justify-between md:gap-6',
        className
      )}
    >
      <div className="flex min-w-0 flex-1 gap-4">
        {Icon && (
          <div
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary"
            aria-hidden
          >
            <Icon className="h-5 w-5" />
          </div>
        )}
        <div className="min-w-0 flex-1">
          <h3 className="text-base font-semibold text-foreground">{label}</h3>
          <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-3">
        <Switch
          id={`cookie-${id}`}
          checked={value}
          onCheckedChange={handleChange}
          disabled={disabled}
          role="switch"
          aria-checked={value}
          aria-label={`${label} cookies: ${value ? 'enabled' : 'disabled'}`}
          className="data-[state=checked]:bg-primary"
        />
      </div>
    </div>
  )
}
