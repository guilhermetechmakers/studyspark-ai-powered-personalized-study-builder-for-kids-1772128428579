/**
 * VersionPicker - Timeline or dropdown to select previous versions.
 * Design: playful, rounded, pastel gradients per StudySpark design system.
 */

import { History } from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'
import type { Version } from '@/types/study-review'
import { dataGuard } from '@/lib/data-guard'

export interface VersionPickerProps {
  versions: Version[]
  selectedVersionId: string | null
  onSelect: (versionId: string | null) => void
  className?: string
}

export function VersionPicker({
  versions,
  selectedVersionId,
  onSelect,
  className,
}: VersionPickerProps) {
  const safeVersions = dataGuard(versions)

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <History className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
      <Select
        value={selectedVersionId ?? 'current'}
        onValueChange={(v) => onSelect(v === 'current' ? null : v)}
      >
        <SelectTrigger className="w-[200px] rounded-xl">
          <SelectValue placeholder="Select version" />
        </SelectTrigger>
        <SelectContent className="rounded-xl">
          <SelectItem value="current" className="rounded-lg">
            Current
          </SelectItem>
          {safeVersions.map((v) => (
            <SelectItem key={v.id} value={v.id} className="rounded-lg">
              Version {v.versionNumber} · {new Date(v.createdAt).toLocaleDateString()}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
