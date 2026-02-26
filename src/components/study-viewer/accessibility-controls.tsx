'use client'

import { Type, Contrast, Volume2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'
import type { TextSizeLevel } from '@/types/study-viewer'

interface AccessibilityControlsProps {
  textSize: TextSizeLevel
  highContrast: boolean
  readAloud: boolean
  onTextSizeChange: (size: TextSizeLevel) => void
  onHighContrastChange: (enabled: boolean) => void
  onReadAloudChange: (enabled: boolean) => void
  className?: string
}

const TEXT_SIZES: { value: TextSizeLevel; label: string }[] = [
  { value: 'normal', label: 'Normal' },
  { value: 'large', label: 'Large' },
  { value: 'xlarge', label: 'Extra Large' },
]

export function AccessibilityControls({
  textSize,
  highContrast,
  readAloud,
  onTextSizeChange,
  onHighContrastChange,
  onReadAloudChange,
  className,
}: AccessibilityControlsProps) {
  return (
    <div
      className={cn(
        'flex flex-wrap items-center gap-4 rounded-2xl border border-border bg-card p-4',
        highContrast && 'border-2 border-primary bg-primary/5',
        className
      )}
      role="group"
      aria-label="Accessibility controls"
    >
      <div className="flex items-center gap-2">
        <Type className="h-5 w-5 text-muted-foreground" aria-hidden />
        <span className="text-sm font-medium text-foreground">Text size</span>
      </div>
      <div className="flex gap-2">
        {TEXT_SIZES.map(({ value, label }) => (
          <Button
            key={value}
            variant={textSize === value ? 'default' : 'outline'}
            size="sm"
            onClick={() => onTextSizeChange(value)}
            aria-pressed={textSize === value}
            aria-label={`Set text size to ${label}`}
            className="min-h-[44px] rounded-xl"
          >
            {label}
          </Button>
        ))}
      </div>

      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <Contrast className="h-5 w-5 text-muted-foreground" aria-hidden />
          <Label htmlFor="high-contrast" className="text-sm font-medium cursor-pointer">
            High contrast
          </Label>
        </div>
        <Switch
          id="high-contrast"
          checked={highContrast}
          onCheckedChange={onHighContrastChange}
          aria-label="Toggle high contrast mode"
        />
      </div>

      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <Volume2 className="h-5 w-5 text-muted-foreground" aria-hidden />
          <Label htmlFor="read-aloud" className="text-sm font-medium cursor-pointer">
            Read aloud
          </Label>
        </div>
        <Switch
          id="read-aloud"
          checked={readAloud}
          onCheckedChange={onReadAloudChange}
          aria-label="Toggle read aloud"
        />
      </div>
    </div>
  )
}
