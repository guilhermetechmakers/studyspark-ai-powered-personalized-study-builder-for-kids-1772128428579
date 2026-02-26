import { History, RotateCcw, ChevronDown } from 'lucide-react'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { Button } from '@/components/ui/button'
import { dataGuard } from '@/lib/data-guard'
import type { VersionMetadata } from '@/types/study-builder'
import { cn } from '@/lib/utils'

export interface VersioningPanelProps {
  versions: VersionMetadata[]
  onRestore?: (versionId: string) => void
  isLoading?: boolean
  className?: string
}

export function VersioningPanel({
  versions,
  onRestore,
  isLoading = false,
  className,
}: VersioningPanelProps) {
  const safeVersions = dataGuard(versions)

  return (
    <div className={cn('space-y-2', className)}>
      <h4 className="flex items-center gap-2 text-sm font-semibold text-foreground">
        <History className="h-4 w-4" />
        Version History
      </h4>
      {safeVersions.length === 0 ? (
        <p className="text-xs italic text-muted-foreground">
          No versions yet. Approve or save a draft to create one.
        </p>
      ) : (
        <Accordion type="single" collapsible className="w-full">
          {safeVersions.map((v) => (
            <AccordionItem key={v.id} value={v.id} className="border-none">
              <AccordionTrigger className="rounded-xl border border-border/60 bg-muted/30 px-3 py-2 hover:no-underline [&[data-state=open]>svg]:rotate-180">
                <div className="flex flex-1 items-center justify-between text-left">
                  <span className="text-sm font-medium">
                    Version {v.versionNumber}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {new Date(v.createdAt).toLocaleString()}
                  </span>
                </div>
                <ChevronDown className="h-4 w-4 shrink-0 transition-transform" />
              </AccordionTrigger>
              <AccordionContent>
                <div className="mt-2 space-y-2 pl-1">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={() => onRestore?.(v.id)}
                    disabled={!onRestore || isLoading}
                  >
                    <RotateCcw className="mr-2 h-3.5 w-3.5" />
                    Restore this version
                  </Button>
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      )}
    </div>
  )
}
