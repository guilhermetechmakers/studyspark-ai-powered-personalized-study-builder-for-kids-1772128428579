import { useState, useCallback } from 'react'
import {
  Check,
  Copy,
  Download,
  MessageSquare,
  FileText,
  Pencil,
} from 'lucide-react'
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
    [safeBlocks],
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
      {/* Step header */}
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-orange-500 text-white font-black text-lg shadow-sm">
          6
        </div>
        <div>
          <h2 className="text-xl font-black text-foreground">Review & Approve</h2>
          <p className="text-sm text-muted-foreground">Edit blocks, request AI revisions, then approve for your child.</p>
        </div>
      </div>

      {/* Empty state */}
      {sortedBlocks.length === 0 ? (
        <div className="rounded-3xl border-2 border-dashed border-orange-200 bg-orange-50/50 p-12 text-center dark:border-orange-800 dark:bg-orange-900/10">
          <span className="text-5xl select-none">📄</span>
          <p className="mt-4 font-bold text-foreground">No content yet</p>
          <p className="mt-2 text-sm text-muted-foreground">
            Go back to Step 5 to generate your study content.
          </p>
        </div>
      ) : (
        <>
          {/* Content blocks */}
          <div className="space-y-3">
            {sortedBlocks.map((block, i) => {
              const isEditing = editingBlockIndex === i
              return (
                <div
                  key={`${block.order}-${i}`}
                  className={cn(
                    'overflow-hidden rounded-2xl border-2 transition-all duration-200',
                    isEditing
                      ? 'border-primary shadow-md'
                      : 'border-border bg-card hover:border-primary/30 hover:shadow-sm',
                  )}
                >
                  <div className="flex items-center justify-between gap-2 border-b border-border/50 bg-muted/30 px-4 py-2">
                    <div className="flex items-center gap-2">
                      <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-bold text-primary capitalize">
                        {block.type}
                      </span>
                      <span className="text-xs text-muted-foreground">Block {block.order + 1}</span>
                    </div>
                    {onBlocksChange && !isEditing && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleBlockEdit(i)}
                        className="h-7 gap-1 rounded-lg px-2 text-xs"
                      >
                        <Pencil className="h-3 w-3" />
                        Edit
                      </Button>
                    )}
                  </div>

                  <div className="p-4">
                    {isEditing ? (
                      <div className="space-y-3">
                        <Textarea
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          rows={6}
                          className="rounded-xl font-mono text-sm"
                          autoFocus
                        />
                        <div className="flex gap-2">
                          <Button size="sm" onClick={saveBlockEdit} className="rounded-xl gap-1">
                            <Check className="h-3.5 w-3.5" />
                            Save
                          </Button>
                          <Button size="sm" variant="outline" onClick={cancelBlockEdit} className="rounded-xl">
                            Cancel
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="prose prose-sm max-w-none dark:prose-invert">
                        {block.type === 'list' ? (
                          <ul className="list-inside list-disc space-y-1">
                            {block.content.split('\n').filter(Boolean).map((line, j) => (
                              <li key={j}>{line.replace(/^[-*]\s*/, '')}</li>
                            ))}
                          </ul>
                        ) : (
                          block.content.split('\n').map((line, j) => (
                            <p key={j} className="mb-1 last:mb-0">{line}</p>
                          ))
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>

          {/* Action bar */}
          <div className="rounded-3xl border-2 border-orange-200 bg-gradient-to-br from-orange-50 to-amber-50 dark:border-orange-800 dark:from-orange-900/20 dark:to-amber-900/10 p-5 space-y-4">
            <p className="text-sm font-bold text-foreground">📋 Actions</p>
            <div className="flex flex-wrap gap-3">
              <Button
                size="lg"
                onClick={onApprove}
                disabled={!onApprove || sortedBlocks.length === 0 || isApproving}
                className="gap-2 rounded-2xl font-black bg-gradient-to-r from-emerald-500 to-teal-500 text-white hover:opacity-90"
              >
                <Check className="h-5 w-5" />
                {isApproving ? 'Approving…' : 'Approve & Share ✨'}
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={() => setRevisionModalOpen(true)}
                disabled={!onRequestRevision}
                className="gap-2 rounded-2xl"
              >
                <MessageSquare className="h-4 w-4" />
                Ask AI to Revise
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={onDuplicate}
                disabled={!onDuplicate || isDuplicating}
                className="gap-2 rounded-2xl"
              >
                <Copy className="h-4 w-4" />
                {isDuplicating ? 'Duplicating…' : 'Duplicate'}
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={() => onExport?.('pdf')}
                disabled={!onExport || isExporting}
                className="gap-2 rounded-2xl"
              >
                <Download className="h-4 w-4" />
                Export PDF
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={() => onExport?.('json')}
                disabled={!onExport || isExporting}
                className="gap-2 rounded-2xl"
              >
                <FileText className="h-4 w-4" />
                Export JSON
              </Button>
            </div>
          </div>
        </>
      )}

      {/* Revision dialog */}
      <Dialog open={revisionModalOpen} onOpenChange={setRevisionModalOpen}>
        <DialogContent className="rounded-3xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <span className="text-2xl">🤖</span>
              Ask AI to Revise
            </DialogTitle>
            <DialogDescription>
              Tell the AI what you'd like changed and it will regenerate the content.
            </DialogDescription>
          </DialogHeader>
          <Textarea
            placeholder="e.g. Make the flashcards simpler for a 7 year old, add more examples, focus on key dates…"
            value={revisionComments}
            onChange={(e) => setRevisionComments(e.target.value)}
            rows={4}
            className="rounded-2xl"
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setRevisionModalOpen(false)} className="rounded-xl">
              Cancel
            </Button>
            <Button
              onClick={submitRevision}
              disabled={!revisionComments.trim()}
              className="gap-2 rounded-xl"
            >
              <MessageSquare className="h-4 w-4" />
              Submit Revision
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
