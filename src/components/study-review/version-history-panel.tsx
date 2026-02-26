import { useState, useCallback } from 'react'
import { History, RotateCcw, GitCompare } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { cn } from '@/lib/utils'
import type { Version } from '@/types/study-review'
import { dataGuard } from '@/lib/data-guard'

export interface VersionHistoryPanelProps {
  versions: Version[]
  onRestoreVersion: (versionId: string) => void
  onCompareDiff?: (versionId: string) => void
  isRestoring?: boolean
  className?: string
}

function SimpleDiffView({ before, after }: { before: string; after: string }) {
  const beforeLines = (before ?? '').split('\n').filter(Boolean)
  const afterLines = (after ?? '').split('\n').filter(Boolean)
  const maxLen = Math.max(beforeLines.length, afterLines.length)

  return (
    <div className="space-y-1 font-mono text-xs">
      {Array.from({ length: maxLen }, (_, i) => {
        const b = beforeLines[i]
        const a = afterLines[i]
        const isRemoved = b && !a
        const isAdded = !b && a
        const isChanged = b && a && b !== a
        return (
          <div key={i} className="flex gap-2">
            <span className="w-6 shrink-0 text-muted-foreground">{i + 1}</span>
            {isRemoved && (
              <span className="flex-1 bg-destructive/20 text-destructive line-through">{b}</span>
            )}
            {isAdded && (
              <span className="flex-1 bg-green-500/20 text-green-700 dark:text-green-400">{a}</span>
            )}
            {isChanged && (
              <>
                <span className="flex-1 bg-destructive/10 text-destructive line-through">{b}</span>
                <span className="flex-1 bg-green-500/10 text-green-700 dark:text-green-400">{a}</span>
              </>
            )}
            {!isRemoved && !isAdded && !isChanged && b && (
              <span className="flex-1 text-muted-foreground">{b}</span>
            )}
          </div>
        )
      })}
    </div>
  )
}

export function VersionHistoryPanel({
  versions,
  onRestoreVersion,
  onCompareDiff: _onCompareDiff,
  isRestoring = false,
  className,
}: VersionHistoryPanelProps) {
  const [selectedVersion, setSelectedVersion] = useState<Version | null>(null)
  const [confirmRestore, setConfirmRestore] = useState<Version | null>(null)

  const safeVersions = dataGuard(versions)

  const handleRestoreClick = useCallback((v: Version) => {
    setConfirmRestore(v)
  }, [])

  const handleConfirmRestore = useCallback(() => {
    if (confirmRestore?.id) {
      onRestoreVersion(confirmRestore.id)
      setConfirmRestore(null)
    }
  }, [confirmRestore, onRestoreVersion])

  const handleCancelRestore = useCallback(() => {
    setConfirmRestore(null)
  }, [])

  return (
    <>
      <Card
        className={cn(
          'overflow-hidden border-2 border-border/60 bg-gradient-to-br from-[rgb(var(--peach))]/15 to-white transition-all duration-300',
          className
        )}
        aria-label="Version History"
      >
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-lg font-bold">
            <History className="h-5 w-5 text-primary" />
            Version History
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            View changes and restore previous versions
          </p>
        </CardHeader>
        <CardContent>
          {safeVersions.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border bg-muted/30 p-8 text-center">
              <p className="text-sm text-muted-foreground">No version history yet.</p>
            </div>
          ) : (
            <ScrollArea className="h-[280px]">
              <div className="space-y-2 pr-4">
                {(safeVersions ?? []).map((v) => (
                  <div
                    key={v.id}
                    className={cn(
                      'rounded-xl border border-border bg-card p-4 transition-all hover:shadow-sm',
                      selectedVersion?.id === v.id && 'ring-2 ring-primary/50'
                    )}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-foreground">
                          Version {v.versionNumber}
                        </p>
                        <p className="text-sm text-muted-foreground truncate">
                          {v.diffSummary || 'No summary'}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {new Date(v.createdAt).toLocaleString()}
                        </p>
                      </div>
                      <div className="flex gap-1 shrink-0">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setSelectedVersion(selectedVersion?.id === v.id ? null : v)}
                          aria-label="View diff"
                        >
                          <GitCompare className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRestoreClick(v)}
                          disabled={isRestoring}
                          aria-label="Restore version"
                        >
                          <RotateCcw className="mr-1 h-4 w-4" />
                          Restore
                        </Button>
                      </div>
                    </div>
                    {selectedVersion?.id === v.id && Array.isArray(v.diffs) && v.diffs.length > 0 && (
                      <div className="mt-3 border-t border-border pt-3">
                        <p className="text-xs font-medium text-muted-foreground mb-2">Changes:</p>
                        {v.diffs.map((d, i) => (
                          <SimpleDiffView key={i} before={d.before} after={d.after} />
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>

      <Dialog open={!!confirmRestore} onOpenChange={(open) => !open && handleCancelRestore()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Restore version?</DialogTitle>
            <DialogDescription>
              This will replace the current content with the selected version. This action cannot be
              undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={handleCancelRestore}>
              Cancel
            </Button>
            <Button onClick={handleConfirmRestore} disabled={isRestoring}>
              {isRestoring ? 'Restoring...' : 'Restore'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
