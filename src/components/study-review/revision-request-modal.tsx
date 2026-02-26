/**
 * RevisionRequestModal - Select blocks, compose AI prompt, set revision intent, submit.
 * Design: playful, rounded, pastel gradients per StudySpark design system.
 */

import { useState, useCallback } from 'react'
import { MessageSquare, Send } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { cn } from '@/lib/utils'
import type { SectionBlock, RevisionIntent, RevisionRequestPayload } from '@/types/study-review'
import { REVISION_INTENTS } from '@/types/study-review'
import { dataGuard } from '@/lib/data-guard'

export interface RevisionRequestModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  blocks: SectionBlock[]
  selectedBlockIds: string[]
  onSelectedBlockIdsChange: (ids: string[]) => void
  onSubmit: (payload: RevisionRequestPayload) => void
  isSubmitting?: boolean
}

export function RevisionRequestModal({
  open,
  onOpenChange,
  blocks,
  selectedBlockIds,
  onSelectedBlockIdsChange,
  onSubmit,
  isSubmitting = false,
}: RevisionRequestModalProps) {
  const [prompt, setPrompt] = useState('')
  const [notes, setNotes] = useState('')
  const [intent, setIntent] = useState<RevisionIntent>('rephrase')

  const safeBlocks = dataGuard(blocks)
  const blockIds = selectedBlockIds.length > 0 ? selectedBlockIds : safeBlocks.map((b) => b.id).filter(Boolean)
  const selectedBlocks = safeBlocks.filter((b) => blockIds.includes(b.id))
  const draftTextPreview = selectedBlocks
    .map((b) => (typeof b.content === 'string' ? b.content : JSON.stringify(b.content ?? {})))
    .join(' ')
    .slice(0, 200)

  const toggleBlock = (id: string) => {
    if (selectedBlockIds.includes(id)) {
      onSelectedBlockIdsChange(selectedBlockIds.filter((x) => x !== id))
    } else {
      onSelectedBlockIdsChange([...selectedBlockIds, id])
    }
  }

  const handleSubmit = useCallback(() => {
    const textToSend = prompt.trim() || 'Please revise this content.'
    if (!textToSend) return
    onSubmit({ blockIds, prompt: textToSend, intent, notes: notes.trim() || undefined })
    setPrompt('')
    setNotes('')
    onOpenChange(false)
  }, [blockIds, prompt, intent, notes, onSubmit, onOpenChange])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-lg rounded-2xl border-2 border-border bg-gradient-to-br from-[rgb(var(--lavender))]/10 to-white"
        aria-describedby="revision-modal-desc"
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-primary" />
            Request AI Revision
          </DialogTitle>
          <DialogDescription id="revision-modal-desc">
            {blockIds.length > 0
              ? `Revising ${blockIds.length} selected block(s)`
              : 'Select blocks below to revise'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {safeBlocks.length > 0 && (
            <div className="space-y-2">
              <Label>Select blocks to revise</Label>
              <div className="flex flex-wrap gap-2">
                {safeBlocks.map((b) => (
                  <label key={b.id} className="flex cursor-pointer items-center gap-2 rounded-full border border-border px-3 py-1.5 text-sm hover:bg-muted/50">
                    <Checkbox
                      checked={blockIds.includes(b.id)}
                      onCheckedChange={() => toggleBlock(b.id)}
                    />
                    <span className="truncate max-w-[120px]">{b.id}</span>
                  </label>
                ))}
              </div>
            </div>
          )}
          {blockIds.length > 0 && (
            <div className="rounded-xl border border-border bg-muted/30 p-3">
              <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Selected content preview
              </p>
              <p className="mt-1 line-clamp-3 text-sm">{draftTextPreview || 'No content'}</p>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="revision-intent">Revision intent</Label>
            <div className="flex flex-wrap gap-2">
              {REVISION_INTENTS.map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setIntent(opt.id)}
                  className={cn(
                    'rounded-full px-4 py-2 text-sm font-medium transition-all',
                    intent === opt.id
                      ? 'bg-primary text-primary-foreground shadow-md'
                      : 'bg-muted/50 text-muted-foreground hover:bg-muted'
                  )}
                  aria-pressed={intent === opt.id}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="revision-prompt">Revision prompt</Label>
            <Textarea
              id="revision-prompt"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="e.g. Make it simpler for a 3rd grader..."
              rows={3}
              className="rounded-xl"
              disabled={isSubmitting}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="revision-notes">Additional notes (optional)</Label>
            <Textarea
              id="revision-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Focus on vocabulary..."
              rows={2}
              className="rounded-xl"
              disabled={isSubmitting}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || blockIds.length === 0}
            className="rounded-full"
          >
            <Send className="mr-2 h-4 w-4" />
            {isSubmitting ? 'Submitting...' : 'Submit Revision'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
