import { useCallback, useEffect, useMemo, useState } from 'react'
import { Loader2, Check, Star, StarOff, HelpCircle } from 'lucide-react'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { ScrollArea } from '@/components/ui/scroll-area'
import { cn } from '@/lib/utils'
import { useDebouncedCallback } from '@/hooks/use-debounce'
import type { Snippet } from '@/types/upload-materials'
import { dataGuard } from '@/lib/data-guard'

export interface OCRPanelProps {
  ocrText?: string
  snippets: Snippet[]
  ocrStatus?: 'pending' | 'in_progress' | 'complete' | 'completed' | 'failed' | 'corrected'
  onSnippetEdit: (id: string, newText: string) => void
  onToggleImportant: (id: string) => void
  className?: string
}

function getConfidenceColor(confidence: number): string {
  if (confidence >= 0.9) return 'bg-green-500/20 border-green-500/40 text-green-800 dark:text-green-300'
  if (confidence >= 0.7) return 'bg-amber-500/20 border-amber-500/40 text-amber-800 dark:text-amber-300'
  return 'bg-red-500/20 border-red-500/40 text-red-800 dark:text-red-300'
}

export function OCRPanel({
  ocrText,
  snippets = [],
  ocrStatus = 'pending',
  onSnippetEdit,
  onToggleImportant,
  className,
}: OCRPanelProps) {
  const safeSnippets = dataGuard(snippets)
  const [editedTexts, setEditedTexts] = useState<Record<string, string>>({})

  const debouncedEdit = useDebouncedCallback(
    (id: string, text: string) => {
      onSnippetEdit(id, text)
    },
    400
  )

  const handleSnippetChange = useCallback(
    (id: string, value: string) => {
      setEditedTexts((prev) => ({ ...prev, [id]: value }))
      debouncedEdit(id, value)
    },
    [debouncedEdit]
  )

  useEffect(() => {
    const initial: Record<string, string> = {}
    for (const s of safeSnippets) {
      if (s?.text != null && s?.id != null) {
        initial[s.id] = s.text
      }
    }
    setEditedTexts((prev) => {
      const next = { ...prev }
      for (const s of safeSnippets) {
        if (s?.id != null && next[s.id] === undefined) {
          next[s.id] = s.text ?? ''
        }
      }
      return next
    })
  }, [safeSnippets])

  const displaySnippets = useMemo(() => {
    if (safeSnippets.length > 0) return safeSnippets
    if (ocrText?.trim()) {
      return [
        {
          id: 'full-text',
          text: ocrText.trim(),
          confidence: 1,
          important: false,
        } as Snippet,
      ]
    }
    return []
  }, [safeSnippets, ocrText])

  if (ocrStatus === 'in_progress') {
    return (
      <div
        className={cn(
          'flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-primary/30 bg-[rgb(var(--peach-light))]/10 py-16',
          className
        )}
      >
        <Loader2 className="mb-4 h-12 w-12 animate-spin text-primary" aria-hidden />
        <p className="font-medium text-foreground">OCR in progress</p>
        <p className="text-sm text-muted-foreground">Extracting text from your document...</p>
      </div>
    )
  }

  if (ocrStatus === 'failed') {
    return (
      <div
        className={cn(
          'flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-destructive/30 bg-destructive/5 py-16',
          className
        )}
      >
        <p className="font-medium text-destructive">OCR failed</p>
        <p className="text-sm text-muted-foreground">We couldn&apos;t extract text from this file.</p>
      </div>
    )
  }

  if (displaySnippets.length === 0) {
    return (
      <div
        className={cn(
          'flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-muted-foreground/20 bg-muted/30 py-16',
          className
        )}
      >
        <p className="text-sm text-muted-foreground">No OCR results yet</p>
        <p className="mt-1 text-xs text-muted-foreground">
          Upload a file and run OCR to see extracted text here.
        </p>
      </div>
    )
  }

  return (
    <div className={cn('space-y-4', className)}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1 rounded-full bg-green-500/10 px-2.5 py-0.5 text-xs font-medium text-green-700 dark:text-green-400">
            <Check className="h-3 w-3" />
            OCR complete
          </span>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  className="rounded-full p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
                  aria-label="Help"
                >
                  <HelpCircle className="h-4 w-4" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="max-w-xs">
                <p>
                  Highlight colors show OCR confidence: green (high), amber (medium), red (low).
                  Edit text inline and mark important snippets to use as AI context.
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>

      <ScrollArea className="h-[280px] rounded-xl border border-border bg-card">
        <div className="space-y-3 p-4">
          {displaySnippets.map((snippet) => {
            const text = editedTexts[snippet.id] ?? snippet.text ?? ''
            const confidence = snippet.confidence ?? 1
            const isImportant = snippet.important ?? false

            return (
              <div
                key={snippet.id}
                className={cn(
                  'rounded-xl border p-3 transition-all duration-200',
                  getConfidenceColor(confidence),
                  isImportant && 'ring-2 ring-primary/50'
                )}
              >
                <div className="mb-2 flex items-center justify-between gap-2">
                  <span className="text-xs font-medium opacity-80">
                    Confidence: {Math.round(confidence * 100)}%
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onToggleImportant(snippet.id)}
                    className={cn(
                      'h-8 rounded-full',
                      isImportant
                        ? 'text-primary hover:bg-primary/20'
                        : 'text-muted-foreground hover:bg-muted'
                    )}
                    aria-label={isImportant ? 'Unmark as important' : 'Mark as important'}
                  >
                    {isImportant ? (
                      <Star className="h-4 w-4 fill-current" />
                    ) : (
                      <StarOff className="h-4 w-4" />
                    )}
                    <span className="ml-1.5 text-xs">
                      {isImportant ? 'Important' : 'Mark important'}
                    </span>
                  </Button>
                </div>
                <Textarea
                  value={text}
                  onChange={(e) => handleSnippetChange(snippet.id, e.target.value)}
                  className="min-h-[60px] resize-none border-0 bg-transparent text-sm focus-visible:ring-2"
                  placeholder="Edit extracted text..."
                  rows={2}
                />
              </div>
            )
          })}
        </div>
      </ScrollArea>
    </div>
  )
}
