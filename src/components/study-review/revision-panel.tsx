import { useState, useCallback } from 'react'
import { MessageSquare, Send, ChevronDown, ChevronUp } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { ScrollArea } from '@/components/ui/scroll-area'
import { cn } from '@/lib/utils'
import type { SectionBlock, AIInteractionEntry, SectionType } from '@/types/study-review'
import { SECTION_TYPE_LABELS, DEFAULT_REVISION_PROMPTS } from '@/types/study-review'
import { dataGuard } from '@/lib/data-guard'

export interface RevisionPanelProps {
  selectedBlock: SectionBlock | null | undefined
  draftText: string
  onSubmitRevision: (blockId: string, prompt: string, notes?: string) => void
  revisionsHistory: AIInteractionEntry[]
  isSubmitting?: boolean
  className?: string
}

export function RevisionPanel({
  selectedBlock,
  draftText,
  onSubmitRevision,
  revisionsHistory,
  isSubmitting = false,
  className,
}: RevisionPanelProps) {
  const [prompt, setPrompt] = useState('')
  const [notes, setNotes] = useState('')
  const [historyExpanded, setHistoryExpanded] = useState(true)

  const safeBlock = selectedBlock ?? null
  const safeHistory = dataGuard(revisionsHistory)
  const sectionType = (safeBlock?.type ?? 'summary') as SectionType
  const prefilledPrompt = DEFAULT_REVISION_PROMPTS[sectionType] ?? 'Please revise this content.'

  const handleSubmit = useCallback(() => {
    if (!safeBlock?.id) return
    const textToSend = prompt.trim() || prefilledPrompt
    if (!textToSend) return
    onSubmitRevision(safeBlock.id, textToSend, notes.trim() || undefined)
    setPrompt('')
    setNotes('')
  }, [safeBlock?.id, prompt, prefilledPrompt, notes, onSubmitRevision])

  return (
    <Card
      className={cn(
        'overflow-hidden border-2 border-border/60 bg-gradient-to-br from-[rgb(var(--lavender))]/15 to-white transition-all duration-300',
        className
      )}
      aria-label="AI Revision Panel"
    >
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-lg font-bold">
          <MessageSquare className="h-5 w-5 text-primary" />
          Request AI Revision
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          {safeBlock
            ? `Revise: ${SECTION_TYPE_LABELS[sectionType] ?? sectionType}`
            : 'Select a section to request revisions'}
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {safeBlock ? (
          <>
            <div className="rounded-lg border border-border bg-muted/30 p-3">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Selected content preview
              </p>
              <p className="mt-1 line-clamp-2 text-sm">{draftText || 'No content'}</p>
            </div>
            <div className="space-y-2">
              <label htmlFor="revision-prompt" className="text-sm font-medium">
                Revision prompt
              </label>
              <Textarea
                id="revision-prompt"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder={prefilledPrompt}
                rows={3}
                className="rounded-xl"
                disabled={isSubmitting}
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="revision-notes" className="text-sm font-medium">
                Additional notes (optional)
              </label>
              <Textarea
                id="revision-notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. Make it simpler for a 3rd grader..."
                rows={2}
                className="rounded-xl"
                disabled={isSubmitting}
              />
            </div>
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="w-full rounded-full"
              aria-label="Submit revision request"
            >
              <Send className="mr-2 h-4 w-4" />
              {isSubmitting ? 'Submitting...' : 'Submit Revision'}
            </Button>

            {safeHistory.length > 0 && (
              <div className="space-y-2 border-t border-border pt-4">
                <button
                  type="button"
                  onClick={() => setHistoryExpanded(!historyExpanded)}
                  className="flex w-full items-center justify-between text-sm font-medium text-foreground hover:text-primary"
                  aria-expanded={historyExpanded}
                >
                  Interaction history ({safeHistory.length})
                  {historyExpanded ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </button>
                {historyExpanded && (
                  <ScrollArea className="h-[200px] rounded-xl border border-border bg-muted/30 p-3">
                    <div className="space-y-3">
                      {(safeHistory ?? []).slice().reverse().map((entry) => (
                        <div
                          key={entry.id}
                          className="rounded-lg border border-border bg-card p-3 text-sm"
                        >
                          <p className="font-medium text-foreground">Your prompt:</p>
                          <p className="mt-1 text-muted-foreground">{entry.prompt}</p>
                          {entry.aiResponse && (
                            <>
                              <p className="mt-2 font-medium text-foreground">AI response:</p>
                              <p className="mt-1 text-muted-foreground">{entry.aiResponse}</p>
                            </>
                          )}
                          <p className="mt-2 text-xs text-muted-foreground">
                            {new Date(entry.timestamp).toLocaleString()} · {entry.status}
                          </p>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                )}
              </div>
            )}
          </>
        ) : (
          <div className="rounded-xl border border-dashed border-border bg-muted/30 p-8 text-center">
            <p className="text-sm text-muted-foreground">
              Click on a section in the content area to request AI revisions for it.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
