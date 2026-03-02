import { useEffect, useRef } from 'react'
import { Sparkles, XCircle, RotateCcw, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { dataGuard } from '@/lib/data-guard'
import type { AIOutputBlock } from '@/types/study-wizard'
import { cn } from '@/lib/utils'

export interface AIProgressPanelProps {
  isGenerating: boolean
  progress: number
  blocks: AIOutputBlock[]
  error?: string | null
  onCancel?: () => void
  onRetry?: () => void
  onRegenerate?: () => void
  onStartGeneration?: () => void
  className?: string
}

const THINKING_MESSAGES = [
  'Reading your materials…',
  'Thinking really hard… 🧠',
  'Building flashcards…',
  'Crafting quiz questions…',
  'Adding a sprinkle of magic… ✨',
  'Almost there!',
]

export function AIProgressPanel({
  isGenerating,
  progress,
  blocks,
  error,
  onCancel,
  onRetry,
  onRegenerate,
  onStartGeneration,
  className,
}: AIProgressPanelProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const safeBlocks = dataGuard(blocks)

  useEffect(() => {
    if (scrollRef.current && safeBlocks.length > 0) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [safeBlocks.length])

  const thinkingMsg = THINKING_MESSAGES[Math.floor((progress / 100) * (THINKING_MESSAGES.length - 1))]

  /* ── Idle / Ready state ───────────────────────────────── */
  if (!isGenerating && safeBlocks.length === 0 && !error) {
    return (
      <div className={cn('space-y-6', className)}>
        {/* Step header */}
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-500 text-white font-black text-lg shadow-sm">
            5
          </div>
          <div>
            <h2 className="text-xl font-black text-foreground">AI Generation</h2>
            <p className="text-sm text-muted-foreground">Watch your personalised study content appear live.</p>
          </div>
        </div>

        <div className="overflow-hidden rounded-3xl border-2 border-emerald-200 bg-gradient-to-br from-emerald-50 to-teal-50 dark:border-emerald-800 dark:from-emerald-900/20 dark:to-teal-900/10 p-10 text-center">
          <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-3xl bg-gradient-to-br from-emerald-400 to-teal-500 shadow-lg">
            <span className="text-5xl select-none animate-float">🤖</span>
          </div>
          <h3 className="text-2xl font-black text-foreground">Ready to generate!</h3>
          <p className="mt-3 mx-auto max-w-sm text-muted-foreground text-sm leading-relaxed">
            Your AI tutor will create personalised flashcards, quizzes, and lessons based on everything you've set up.
          </p>
          <Button
            size="lg"
            onClick={onStartGeneration}
            disabled={!onStartGeneration}
            className="mt-6 gap-2 rounded-2xl px-8 font-black text-base bg-gradient-to-r from-emerald-500 to-teal-500 text-white hover:opacity-90 shadow-lg"
          >
            <Sparkles className="h-5 w-5" />
            Generate My Study Set ✨
          </Button>
        </div>

        <div className="flex items-start gap-3 rounded-2xl border border-blue-200 bg-blue-50 px-5 py-4 dark:border-blue-800 dark:bg-blue-900/20">
          <span className="text-2xl shrink-0 select-none">⚡</span>
          <p className="text-sm text-blue-800 dark:text-blue-200">
            <strong>This usually takes 30–60 seconds.</strong> The AI will stream content as it generates — you'll see flashcards and questions appear in real time!
          </p>
        </div>
      </div>
    )
  }

  /* ── Generating / Done / Error ────────────────────────── */
  return (
    <div className={cn('space-y-6', className)}>
      {/* Step header */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className={cn(
            'flex h-10 w-10 items-center justify-center rounded-2xl text-white font-black text-lg shadow-sm',
            error ? 'bg-destructive' : 'bg-emerald-500',
          )}>
            5
          </div>
          <div>
            <h2 className="text-xl font-black text-foreground">
              {isGenerating ? 'Generating…' : error ? 'Generation failed' : 'Content ready!'}
            </h2>
            <p className="text-sm text-muted-foreground">
              {isGenerating
                ? thinkingMsg
                : error
                ? 'Something went wrong. You can retry or regenerate.'
                : 'Review and approve your study set below.'}
            </p>
          </div>
        </div>
        <div className="flex gap-2 shrink-0">
          {isGenerating && (
            <Button variant="outline" size="sm" onClick={onCancel} className="rounded-xl">
              <XCircle className="mr-1 h-4 w-4" />
              Cancel
            </Button>
          )}
          {!isGenerating && error && (
            <>
              <Button variant="outline" size="sm" onClick={onRetry} className="rounded-xl">
                <RefreshCw className="mr-1 h-4 w-4" />
                Retry
              </Button>
              <Button size="sm" onClick={onRegenerate} className="rounded-xl">
                <RotateCcw className="mr-1 h-4 w-4" />
                Regenerate
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Progress strip */}
      {isGenerating && (
        <div className="overflow-hidden rounded-3xl border-2 border-emerald-200 bg-gradient-to-br from-emerald-50 to-teal-50 dark:border-emerald-800 dark:from-emerald-900/20 dark:to-teal-900/10 p-6 space-y-4">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-500 shadow-sm">
              <Sparkles className="h-6 w-6 text-white animate-spin-slow" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-foreground text-sm">{thinkingMsg}</p>
              <p className="text-xs text-muted-foreground">{Math.round(progress)}% complete</p>
            </div>
          </div>
          {/* Animated progress bar */}
          <div className="h-4 w-full overflow-hidden rounded-full bg-emerald-100 dark:bg-emerald-900/40">
            <div
              className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-teal-500 transition-all duration-700 ease-out relative overflow-hidden"
              style={{ width: `${progress}%` }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-[xp-fill_1.5s_ease-in-out_infinite]" />
            </div>
          </div>
        </div>
      )}

      {/* Error banner */}
      {error && (
        <div className="rounded-2xl border-2 border-destructive/50 bg-destructive/10 p-5 text-sm text-destructive">
          <p className="font-bold flex items-center gap-2">
            <span>⚠️</span> Generation error
          </p>
          <p className="mt-1">{error}</p>
        </div>
      )}

      {/* Streamed content blocks */}
      {safeBlocks.length > 0 && (
        <div>
          <p className="mb-3 text-sm font-bold text-foreground">
            {isGenerating ? '✨ Content streaming in…' : '✅ Generated content'}
            <span className="ml-2 rounded-full bg-emerald-100 px-2 py-0.5 text-xs text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300">
              {safeBlocks.length} blocks
            </span>
          </p>
          <div
            ref={scrollRef}
            className="max-h-[420px] overflow-y-auto rounded-3xl border-2 border-border bg-card/50 p-4 space-y-3"
          >
            {[...safeBlocks]
              .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
              .map((block, i) => (
                <div
                  key={`${block.order}-${i}`}
                  className="rounded-2xl border border-border/60 bg-card p-4 text-sm animate-fade-in"
                  style={{ animationDelay: `${i * 60}ms` }}
                >
                  <div className="mb-2 flex items-center gap-1.5">
                    <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-bold text-primary capitalize">
                      {block.type}
                    </span>
                    <span className="text-xs text-muted-foreground">#{block.order + 1}</span>
                  </div>
                  {block.type === 'list' ? (
                    <ul className="list-inside list-disc space-y-1 text-foreground">
                      {block.content.split('\n').filter(Boolean).map((line, j) => (
                        <li key={j}>{line.replace(/^[-*]\s*/, '')}</li>
                      ))}
                    </ul>
                  ) : (
                    <div className="prose prose-sm max-w-none dark:prose-invert">
                      {block.content.split('\n').map((line, j) => (
                        <p key={j} className="mb-1 last:mb-0">{line}</p>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            {isGenerating && (
              <div className="flex items-center gap-2 rounded-2xl border border-dashed border-emerald-300 bg-emerald-50 p-3 text-sm text-emerald-700 dark:border-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-300">
                <span className="inline-flex gap-1">
                  <span className="h-2 w-2 animate-bounce rounded-full bg-emerald-500" style={{ animationDelay: '0ms' }} />
                  <span className="h-2 w-2 animate-bounce rounded-full bg-emerald-500" style={{ animationDelay: '150ms' }} />
                  <span className="h-2 w-2 animate-bounce rounded-full bg-emerald-500" style={{ animationDelay: '300ms' }} />
                </span>
                More content coming…
              </div>
            )}
          </div>
        </div>
      )}

      {/* Complete celebration */}
      {!isGenerating && safeBlocks.length > 0 && !error && (
        <div className="flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4 dark:border-emerald-800 dark:bg-emerald-900/20">
          <span className="text-2xl shrink-0 select-none animate-bounce-in">🎉</span>
          <p className="text-sm font-semibold text-emerald-800 dark:text-emerald-200">
            <strong>Generation complete!</strong> Review the content below and click "Approve" when you're happy with it.
          </p>
        </div>
      )}
    </div>
  )
}
