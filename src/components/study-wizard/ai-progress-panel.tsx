import { useEffect, useRef } from 'react'
import { Sparkles, XCircle, RotateCcw, RefreshCw } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
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

  if (!isGenerating && safeBlocks.length === 0 && !error) {
    return (
      <Card
        className={cn(
          'overflow-hidden border-2 border-dashed border-primary/40 bg-gradient-to-br from-[rgb(var(--peach-light))]/20 to-white',
          className
        )}
      >
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-primary" />
            AI Generation
          </CardTitle>
          <CardDescription>
            Ready to generate. Click the button below to start. Content will stream in real time.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-xl border border-border bg-muted/30 p-8 text-center">
            <Sparkles className="mx-auto mb-4 h-14 w-14 text-primary" aria-hidden />
            <p className="font-medium text-foreground">All set!</p>
            <p className="mt-2 text-sm text-muted-foreground">
              Click Generate to create your personalized study set. You can review and edit each
              block before sharing with your child.
            </p>
            <Button
              className="mt-6"
              size="lg"
              onClick={onStartGeneration}
              disabled={!onStartGeneration}
            >
              <Sparkles className="mr-2 h-5 w-5" />
              Generate Study
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card
      className={cn(
        'overflow-hidden border-2 border-border/60',
        isGenerating && 'border-primary/40',
        className
      )}
    >
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              {isGenerating ? (
                <>
                  <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-primary" />
                  Generating...
                </>
              ) : error ? (
                <>
                  <XCircle className="h-5 w-5 text-destructive" />
                  Generation failed
                </>
              ) : (
                <>
                  <Sparkles className="h-5 w-5 text-primary" />
                  Generation complete
                </>
              )}
            </CardTitle>
            <CardDescription>
              {isGenerating
                ? 'AI is creating your study materials. Content appears below as it\'s generated.'
                : error
                  ? 'Something went wrong. You can retry or regenerate.'
                  : 'Review and edit the content below.'}
            </CardDescription>
          </div>
          {isGenerating && (
            <Button variant="outline" size="sm" onClick={onCancel} aria-label="Cancel generation">
              <XCircle className="mr-1 h-4 w-4" />
              Cancel
            </Button>
          )}
          {!isGenerating && error && (
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={onRetry}>
                <RefreshCw className="mr-1 h-4 w-4" />
                Retry
              </Button>
              <Button size="sm" onClick={onRegenerate}>
                <RotateCcw className="mr-1 h-4 w-4" />
                Regenerate
              </Button>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {isGenerating && (
          <Progress value={progress} className="h-2" aria-label="Generation progress" />
        )}

        {error && (
          <div className="rounded-xl border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive">
            {error}
          </div>
        )}

        {safeBlocks.length > 0 && (
          <div
            ref={scrollRef}
            className="max-h-[400px] overflow-y-auto rounded-xl border border-border bg-muted/20 p-4"
          >
            <div className="space-y-3 animate-fade-in">
              {[...safeBlocks]
                .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
                .map((block, i) => (
                  <div
                    key={`${block.order}-${i}`}
                    className="rounded-lg border border-border/60 bg-card p-3 text-sm animate-fade-in-up"
                    style={{ animationDelay: `${i * 50}ms` }}
                  >
                    {block.type === 'list' && (
                      <ul className="list-inside list-disc space-y-1">
                        {block.content.split('\n').filter(Boolean).map((line, j) => (
                          <li key={j}>{line.replace(/^[-*]\s*/, '')}</li>
                        ))}
                      </ul>
                    )}
                    {block.type !== 'list' && (
                      <div className="prose prose-sm max-w-none dark:prose-invert">
                        {block.content.split('\n').map((line, j) => (
                          <p key={j} className="mb-1 last:mb-0">
                            {line}
                          </p>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
