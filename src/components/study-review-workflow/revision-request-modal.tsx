import { useState, useCallback } from 'react'
import { Send, Sparkles } from 'lucide-react'
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { ScrollArea } from '@/components/ui/scroll-area'
import { cn } from '@/lib/utils'
import type { SectionBlock } from '@/types/study-review'
import type { RevisionIntent } from '@/types/review-workflow'
import { REVISION_INTENTS } from '@/types/review-workflow'
import { SECTION_TYPE_LABELS } from '@/types/study-review'
import { dataGuard } from '@/lib/data-guard'

export interface RevisionRequestModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  sections: SectionBlock[]
  selectedBlockIds: string[]
  onSelectBlocks: (ids: string[]) => void
  onSubmit: (payload: { blockContext: string[]; prompt: string; intent: RevisionIntent }) => void
  isSubmitting?: boolean
}

function getBlockPreview(content: string | Record<string, unknown> | null | undefined): string {
  if (typeof content === 'string') return content.slice(0, 80)
  if (!content || typeof content !== 'object') return ''
  return JSON.stringify(content).slice(0, 80)
}

export function RevisionRequestModal({
  open,
  onOpenChange,
  sections,
  selectedBlockIds,
  onSelectBlocks,
  onSubmit,
  isSubmitting = false,
}: RevisionRequestModalProps) {
  const [prompt, setPrompt] = useState('')
  const [intent, setIntent] = useState<RevisionIntent>('rephrase')

  const safeSections = dataGuard(sections)
  const safeSelected = new Set(selectedBlockIds ?? [])

  const handleToggleBlock = useCallback(
    (id: string) => {
      const next = new Set(safeSelected)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      onSelectBlocks(Array.from(next))
    },
    [safeSelected, onSelectBlocks]
  )

  const handleSelectAll = useCallback(() => {
    onSelectBlocks(safeSections.map((s) => s.id))
  }, [safeSections, onSelectBlocks])

  const handleSubmit = useCallback(() => {
    const blockContext = selectedBlockIds?.length > 0 ? selectedBlockIds : safeSections.map((s) => s.id)
    const text = prompt.trim()
    if (!text) return
    onSubmit({ blockContext, prompt: text, intent })
    setPrompt('')
    onOpenChange(false)
  }, [selectedBlockIds, safeSections, prompt, intent, onSubmit, onOpenChange])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg rounded-2xl border-2 border-border bg-gradient-to-br from-[rgb(var(--lavender))]/10 to-white">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl font-bold">
            <Sparkles className="h-5 w-5 text-primary" />
            Request AI Revision
          </DialogTitle>
          <DialogDescription>
            Select blocks to revise, write your prompt, and choose the revision intent.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label className="mb-2 block">Select blocks</Label>
            <ScrollArea className="h-[160px] rounded-xl border border-border p-2">
              <div className="space-y-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleSelectAll}
                  className="text-xs"
                >
                  Select all
                </Button>
                {safeSections.map((s) => (
                  <div
                    key={s.id}
                    className={cn(
                      'flex items-start gap-2 rounded-lg border p-3 transition-colors',
                      safeSelected.has(s.id) ? 'border-primary bg-primary/5' : 'border-border'
                    )}
                  >
                    <Checkbox
                      id={`block-${s.id}`}
                      checked={safeSelected.has(s.id)}
                      onCheckedChange={() => handleToggleBlock(s.id)}
                      aria-label={`Select ${SECTION_TYPE_LABELS[s.type as keyof typeof SECTION_TYPE_LABELS] ?? s.type}`}
                    />
                    <label
                      htmlFor={`block-${s.id}`}
                      className="flex-1 cursor-pointer text-sm"
                    >
                      <span className="font-medium">{SECTION_TYPE_LABELS[s.type as keyof typeof SECTION_TYPE_LABELS] ?? s.type}</span>
                      <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">
                        {getBlockPreview(s.content as string | Record<string, unknown>)}
                      </p>
                    </label>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>

          <div>
            <Label htmlFor="revision-intent">Revision intent</Label>
            <Select value={intent} onValueChange={(v) => setIntent(v as RevisionIntent)}>
              <SelectTrigger id="revision-intent" className="rounded-xl mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {REVISION_INTENTS.map((i) => (
                  <SelectItem key={i.id} value={i.id}>
                    {i.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="revision-prompt">Your prompt</Label>
            <Textarea
              id="revision-prompt"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="e.g. Make this simpler for a 3rd grader..."
              rows={4}
              className="mt-1 rounded-xl"
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
            disabled={isSubmitting || !prompt.trim()}
            className="rounded-full"
          >
            <Send className="mr-2 h-4 w-4" />
            {isSubmitting ? 'Submitting...' : 'Submit revision'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
