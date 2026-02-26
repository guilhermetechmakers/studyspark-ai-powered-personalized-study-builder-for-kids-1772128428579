import { Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Snippet } from '@/types/upload-materials'
import { dataGuard } from '@/lib/data-guard'

export interface PreviewPanelProps {
  selectedContextSnippets: Snippet[]
  className?: string
}

export function PreviewPanel({
  selectedContextSnippets = [],
  className,
}: PreviewPanelProps) {
  const snippets = dataGuard(selectedContextSnippets).filter((s) => s?.important === true)

  if (snippets.length === 0) {
    return (
      <div
        className={cn(
          'rounded-xl border border-dashed border-muted-foreground/30 bg-muted/20 px-4 py-6',
          className
        )}
      >
        <div className="flex items-center gap-2 text-muted-foreground">
          <Sparkles className="h-5 w-5" />
          <span className="text-sm font-medium">AI context preview</span>
        </div>
        <p className="mt-2 text-sm text-muted-foreground">
          Mark important snippets in the OCR panel to see how they might influence AI-generated
          study materials.
        </p>
      </div>
    )
  }

  const combinedPreview = snippets
    .map((s) => (s?.text ?? '').trim())
    .filter(Boolean)
    .join(' … ')
    .slice(0, 300)

  return (
    <div
      className={cn(
        'rounded-xl border border-primary/20 bg-gradient-to-br from-primary/5 to-transparent px-4 py-4',
        className
      )}
    >
      <div className="flex items-center gap-2 text-primary">
        <Sparkles className="h-5 w-5" />
        <span className="text-sm font-semibold">AI context preview</span>
      </div>
      <p className="mt-2 text-sm text-muted-foreground">
        The following context will be used to personalize AI-generated study materials:
      </p>
      <div className="mt-3 rounded-lg border border-border bg-card/50 p-3">
        <p className="text-sm leading-relaxed text-foreground">
          {combinedPreview}
          {combinedPreview.length >= 300 ? '…' : ''}
        </p>
      </div>
    </div>
  )
}
