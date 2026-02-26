import { useState, useCallback } from 'react'
import {
  Check,
  Copy,
  Download,
  MessageSquare,
  FileText,
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { dataGuard } from '@/lib/data-guard'
import type { AIOutputBlock } from '@/types/study-wizard'
import { cn } from '@/lib/utils'

export interface ReviewEditPanelProps {
  blocks: AIOutputBlock[]
  onBlocksChange?: (blocks: AIOutputBlock[]) => void
  onApprove?: () => void
  onDuplicate?: () => void
  onExport?: (format: 'pdf' | 'json') => void
  onRequestRevision?: (comments: string) => void
  isApproving?: boolean
  isDuplicating?: boolean
  isExporting?: boolean
  className?: string
}

export function ReviewEditPanel({
  blocks,
  onBlocksChange,
  onApprove,
  onDuplicate,
  onExport,
  onRequestRevision,
  isApproving = false,
  isDuplicating = false,
  isExporting = false,
  className,
}: ReviewEditPanelProps) {
  const [revisionModalOpen, setRevisionModalOpen] = useState(false)
  const [revisionComments, setRevisionComments] = useState('')
  const [editingBlockIndex, setEditingBlockIndex] = useState<number | null>(null)
  const [editValue, setEditValue] = useState('')
  const safeBlocks = dataGuard(blocks)

  const handleBlockEdit = useCallback(
    (index: number) => {
      const block = safeBlocks[index]
      if (!block) return
      setEditingBlockIndex(index)
      setEditValue(block.content)
    },
    [safeBlocks]
  )

  const saveBlockEdit = useCallback(() => {
    if (editingBlockIndex == null || !onBlocksChange) return
    const next = [...safeBlocks]
    const block = next[editingBlockIndex]
    if (block) {
      next[editingBlockIndex] = { ...block, content: editValue }
      onBlocksChange(next)
    }
    setEditingBlockIndex(null)
    setEditValue('')
  }, [editingBlockIndex, editValue, safeBlocks, onBlocksChange])

  const cancelBlockEdit = useCallback(() => {
    setEditingBlockIndex(null)
    setEditValue('')
  }, [])

  const submitRevision = useCallback(() => {
    onRequestRevision?.(revisionComments)
    setRevisionComments('')
    setRevisionModalOpen(false)
  }, [revisionComments, onRequestRevision])

  const sortedBlocks = [...safeBlocks].sort((a, b) => (a.order ?? 0) - (b.order ?? 0))

  return (
    <div className={cn('space-y-6', className)}>
      <Card className="overflow-hidden border-2 border-border/60 bg-gradient-to-br from-[rgb(var(--peach-light))]/20 to-white">
        <CardHeader>
          <CardTitle>Review & Edit</CardTitle>
          <CardDescription>
            Edit content blocks, request revisions from AI, or approve and export.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {sortedBlocks.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border bg-muted/30 p-12 text-center">
              <FileText className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
              <p className="font-medium text-foreground">No content yet</p>
              <p className="mt-2 text-sm text-muted-foreground">
                Generate study content first, then review and edit here.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <h4 className="text-sm font-medium">Editable content blocks</h4>
              {sortedBlocks.map((block, i) => {
                const isEditing = editingBlockIndex === i
                return (
                  <div
                    key={`${block.order}-${i}`}
                    className="rounded-xl border border-border bg-card p-4 transition-shadow hover:shadow-sm"
                  >
                    {isEditing ? (
                      <div className="space-y-2">
                        <Textarea
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          rows={6}
                          className="font-mono text-sm"
                        />
                        <div className="flex gap-2">
                          <Button size="sm" onClick={saveBlockEdit}>
                            Save
                          </Button>
                          <Button size="sm" variant="outline" onClick={cancelBlockEdit}>
                            Cancel
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="prose prose-sm max-w-none dark:prose-invert">
                          {block.type === 'list' ? (
                            <ul className="list-inside list-disc space-y-1">
                              {block.content.split('\n').filter(Boolean).map((line, j) => (
                                <li key={j}>{line.replace(/^[-*]\s*/, '')}</li>
                              ))}
                            </ul>
                          ) : (
                            block.content.split('\n').map((line, j) => (
                              <p key={j} className="mb-1 last:mb-0">
                                {line}
                              </p>
                            ))
                          )}
                        </div>
                        {onBlocksChange && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="mt-2"
                            onClick={() => handleBlockEdit(i)}
                          >
                            Edit block
                          </Button>
                        )}
                      </>
                    )}
                  </div>
                )
              })}
            </div>
          )}

          <div className="flex flex-wrap gap-2 border-t border-border pt-4">
            <Button
              onClick={onApprove}
              disabled={!onApprove || sortedBlocks.length === 0 || isApproving}
            >
              <Check className="mr-2 h-4 w-4" />
              {isApproving ? 'Approving...' : 'Approve'}
            </Button>
            <Button
              variant="secondary"
              onClick={onDuplicate}
              disabled={!onDuplicate || isDuplicating}
            >
              <Copy className="mr-2 h-4 w-4" />
              {isDuplicating ? 'Duplicating...' : 'Duplicate'}
            </Button>
            <Button
              variant="outline"
              onClick={() => onExport?.('pdf')}
              disabled={!onExport || isExporting}
            >
              <Download className="mr-2 h-4 w-4" />
              Export PDF
            </Button>
            <Button
              variant="outline"
              onClick={() => onExport?.('json')}
              disabled={!onExport || isExporting}
            >
              <FileText className="mr-2 h-4 w-4" />
              Export JSON
            </Button>
            <Button
              variant="outline"
              onClick={() => setRevisionModalOpen(true)}
              disabled={!onRequestRevision}
            >
              <MessageSquare className="mr-2 h-4 w-4" />
              Request Revision
            </Button>
          </div>
        </CardContent>
      </Card>

      <Dialog open={revisionModalOpen} onOpenChange={setRevisionModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Request Revision</DialogTitle>
            <DialogDescription>
              Add notes for the AI. It will regenerate content based on your feedback.
            </DialogDescription>
          </DialogHeader>
          <Textarea
            placeholder="e.g. Make the flashcards simpler, add more examples..."
            value={revisionComments}
            onChange={(e) => setRevisionComments(e.target.value)}
            rows={4}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setRevisionModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={submitRevision} disabled={!revisionComments.trim()}>
              Submit Revision
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
