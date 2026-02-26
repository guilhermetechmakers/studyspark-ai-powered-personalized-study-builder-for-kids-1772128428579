/**
 * WatermarkToggle - Switch to apply watermark with preview badge
 */

import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

export interface WatermarkToggleProps {
  checked: boolean
  onCheckedChange: (checked: boolean) => void
  disabled?: boolean
  showPreviewBadge?: boolean
  className?: string
}

export function WatermarkToggle({
  checked,
  onCheckedChange,
  disabled = false,
  showPreviewBadge = true,
  className,
}: WatermarkToggleProps) {
  return (
    <div
      className={cn(
        'flex flex-col gap-2 rounded-xl border border-border bg-muted/30 p-4',
        className
      )}
    >
      <div className="flex items-center justify-between gap-4">
        <div className="space-y-0.5">
          <Label htmlFor="watermark" className="text-sm font-medium">
            Add watermark
          </Label>
          <p className="text-xs text-muted-foreground">
            Free tier exports include a &quot;StudySpark - Preview&quot; watermark
          </p>
        </div>
        <Switch
          id="watermark"
          checked={checked}
          onCheckedChange={onCheckedChange}
          disabled={disabled}
        />
      </div>
      {showPreviewBadge && checked && (
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="font-normal">
            Preview
          </Badge>
          <span className="text-xs text-muted-foreground">
            Watermark will appear on exported pages
          </span>
        </div>
      )}
    </div>
  )
}
