'use client'

import { Palette, Check } from 'lucide-react'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'
import type { StudyTheme } from '@/types/study-customization'
import { THEME_PRESETS } from '@/types/study-customization'

interface ThemeEditorProps {
  theme: StudyTheme
  onThemeChange: (theme: StudyTheme) => void
  disabled?: boolean
  className?: string
}

function rgbToHex(rgb: string): string {
  const parts = rgb.split(' ').map(Number)
  if (parts.length !== 3) return '#5b57a5'
  return '#' + parts.map((p) => p.toString(16).padStart(2, '0')).join('')
}

function hexToRgb(hex: string): string {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  if (!result) return '91 87 165'
  return `${parseInt(result[1], 16)} ${parseInt(result[2], 16)} ${parseInt(result[3], 16)}`
}

export function ThemeEditor({
  theme,
  onThemeChange,
  disabled = false,
  className,
}: ThemeEditorProps) {
  return (
    <div className={cn('space-y-4', className)}>
      <div className="flex items-center gap-2">
        <Palette className="h-5 w-5 text-primary" aria-hidden />
        <h3 className="font-semibold text-foreground">Color Theme</h3>
      </div>

      <div className="space-y-2">
        <Label className="text-sm text-muted-foreground">Presets</Label>
        <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3">
          {THEME_PRESETS.map((preset) => {
            const isActive =
              theme.primary === preset.theme.primary &&
              theme.secondary === preset.theme.secondary &&
              theme.background === preset.theme.background
            return (
              <button
                key={preset.id}
                type="button"
                onClick={() => !disabled && onThemeChange(preset.theme)}
                disabled={disabled}
                className={cn(
                  'flex items-center justify-between gap-2 rounded-xl border-2 p-3 transition-all duration-200',
                  'hover:scale-[1.02] hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                  isActive
                    ? 'border-primary bg-primary/10 shadow-sm'
                    : 'border-border bg-card hover:border-primary/50'
                )}
                aria-pressed={isActive}
                aria-label={`Select ${preset.label} theme`}
              >
                <div className="flex gap-1.5">
                  <div
                    className="h-6 w-6 rounded-full border border-border shadow-sm"
                    style={{ backgroundColor: `rgb(${preset.theme.primary})` }}
                  />
                  <div
                    className="h-6 w-6 rounded-full border border-border shadow-sm"
                    style={{ backgroundColor: `rgb(${preset.theme.secondary})` }}
                  />
                </div>
                <span className="text-sm font-medium">{preset.label}</span>
                {isActive && <Check className="h-4 w-4 text-primary" aria-hidden />}
              </button>
            )
          })}
        </div>
      </div>

      <div className="space-y-3">
        <Label className="text-sm text-muted-foreground">Custom colors</Label>
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="space-y-1.5">
            <Label htmlFor="primary-color" className="text-xs">
              Primary
            </Label>
            <input
              id="primary-color"
              type="color"
              value={rgbToHex(theme.primary)}
              onChange={(e) =>
                !disabled &&
                onThemeChange({
                  ...theme,
                  primary: hexToRgb(e.target.value),
                })
              }
              disabled={disabled}
              className="h-10 w-full cursor-pointer rounded-xl border border-input"
              aria-label="Primary color"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="secondary-color" className="text-xs">
              Secondary
            </Label>
            <input
              id="secondary-color"
              type="color"
              value={rgbToHex(theme.secondary)}
              onChange={(e) =>
                !disabled &&
                onThemeChange({
                  ...theme,
                  secondary: hexToRgb(e.target.value),
                })
              }
              disabled={disabled}
              className="h-10 w-full cursor-pointer rounded-xl border border-input"
              aria-label="Secondary color"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="background-color" className="text-xs">
              Background
            </Label>
            <input
              id="background-color"
              type="color"
              value={rgbToHex(theme.background)}
              onChange={(e) =>
                !disabled &&
                onThemeChange({
                  ...theme,
                  background: hexToRgb(e.target.value),
                })
              }
              disabled={disabled}
              className="h-10 w-full cursor-pointer rounded-xl border border-input"
              aria-label="Background color"
            />
          </div>
        </div>
      </div>
    </div>
  )
}
