import { History, ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'
import type { VersionSnapshot } from '@/types/review-workflow'

export interface VersionPickerProps {
  versions: VersionSnapshot[]
  selectedVersionId: string | null
  onSelectVersion: (versionId: string) => void
  onRestore?: (versionId: string) => void
  isRestoring?: boolean
  className?: string
}

export function VersionPicker({
  versions,
  selectedVersionId,
  onSelectVersion,
  onRestore,
  isRestoring = false,
  className,
}: VersionPickerProps) {
  const safeVersions = Array.isArray(versions) ? versions : []
  const selected = safeVersions.find((v) => v.id === selectedVersionId)

  return (
    <div className={cn('space-y-2', className)}>
      <div className="flex items-center gap-2">
        <History className="h-5 w-5 text-primary" />
        <span className="font-medium text-foreground">Version history</span>
      </div>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            className="w-full justify-between rounded-xl border-2"
            aria-label="Select version"
          >
            <span className="truncate">
              {selected
                ? `Version ${selected.versionNumber}`
                : safeVersions.length === 0
                  ? 'No versions'
                  : 'Select version'}
            </span>
            <ChevronDown className="h-4 w-4 shrink-0" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-[var(--radix-dropdown-menu-trigger-width)]">
          {safeVersions.map((v) => (
            <DropdownMenuItem
              key={v.id}
              onSelect={() => onSelectVersion(v.id)}
              className="flex flex-col items-start gap-1"
            >
              <span className="font-medium">Version {v.versionNumber}</span>
              <span className="text-xs text-muted-foreground">
                {new Date(v.createdAt).toLocaleString()}
              </span>
              {onRestore && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="mt-1 h-auto py-1 text-xs"
                  onClick={(e) => {
                    e.stopPropagation()
                    onRestore(v.id)
                  }}
                  disabled={isRestoring}
                >
                  Restore
                </Button>
              )}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
