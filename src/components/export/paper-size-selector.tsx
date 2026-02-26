/**
 * PaperSizeSelector - Responsive dropdown for A4/Letter/Legal with orientation
 */

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import type { PaperSize, Orientation } from '@/types/exports'
import { cn } from '@/lib/utils'

const PAPER_OPTIONS: { value: PaperSize; label: string }[] = [
  { value: 'A4', label: 'A4' },
  { value: 'Letter', label: 'Letter' },
  { value: 'Legal', label: 'Legal' },
]

const ORIENTATION_OPTIONS: { value: Orientation; label: string }[] = [
  { value: 'portrait', label: 'Portrait' },
  { value: 'landscape', label: 'Landscape' },
]

export interface PaperSizeSelectorProps {
  paperSize: PaperSize
  orientation: Orientation
  onPaperSizeChange: (v: PaperSize) => void
  onOrientationChange: (v: Orientation) => void
  className?: string
}

export function PaperSizeSelector({
  paperSize,
  orientation,
  onPaperSizeChange,
  onOrientationChange,
  className,
}: PaperSizeSelectorProps) {
  return (
    <div className={cn('flex flex-col gap-4 sm:flex-row sm:items-end', className)}>
      <div className="flex-1 space-y-2">
        <Label htmlFor="paper-size">Paper size</Label>
        <Select
          value={paperSize}
          onValueChange={(v) => onPaperSizeChange(v as PaperSize)}
        >
          <SelectTrigger id="paper-size" className="w-full">
            <SelectValue placeholder="Select size" />
          </SelectTrigger>
          <SelectContent>
            {PAPER_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="flex-1 space-y-2">
        <Label htmlFor="orientation">Orientation</Label>
        <Select
          value={orientation}
          onValueChange={(v) => onOrientationChange(v as Orientation)}
        >
          <SelectTrigger id="orientation" className="w-full">
            <SelectValue placeholder="Select orientation" />
          </SelectTrigger>
          <SelectContent>
            {ORIENTATION_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}
