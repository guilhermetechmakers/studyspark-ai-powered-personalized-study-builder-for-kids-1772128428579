import { useState } from 'react'
import { Printer, Monitor, FileText } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { dataGuard } from '@/lib/data-guard'
import type { AIOutputBlock } from '@/types/study-wizard'
import { cn } from '@/lib/utils'

export interface LayoutPreviewProps {
  blocks: AIOutputBlock[]
  topic?: string
  onExport?: (format: 'pdf' | 'html') => void
  isExporting?: boolean
  className?: string
}

export function LayoutPreview({
  blocks,
  topic = 'Study',
  onExport,
  isExporting = false,
  className,
}: LayoutPreviewProps) {
  const [mode, setMode] = useState<'interactive' | 'print'>('interactive')
  const safeBlocks = dataGuard(blocks)

  return (
    <Card
      className={cn(
        'overflow-hidden border-2 border-border/60',
        mode === 'print' && 'print:block print:shadow-none',
        className
      )}
    >
      <CardHeader className="print:hidden">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Layout Preview
            </CardTitle>
            <CardDescription>
              Toggle between interactive and printable view. Export as PDF or HTML.
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Button
              variant={mode === 'interactive' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setMode('interactive')}
            >
              <Monitor className="mr-1 h-4 w-4" />
              Interactive
            </Button>
            <Button
              variant={mode === 'print' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setMode('print')}
            >
              <Printer className="mr-1 h-4 w-4" />
              Printable
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div
          className={cn(
            'space-y-4',
            mode === 'print' &&
              'rounded-xl border border-border bg-white p-8 print:border-0 print:bg-white'
          )}
        >
          <h2 className="text-2xl font-bold text-foreground">{topic}</h2>
          {safeBlocks.length === 0 ? (
            <p className="text-muted-foreground">No content to preview.</p>
          ) : (
            [...safeBlocks]
              .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
              .map((block, i) => (
                <div key={`${block.order}-${i}`} className="animate-fade-in">
                  {block.type === 'list' ? (
                    <ul className="list-inside list-disc space-y-1">
                      {(block.content ?? '')
                        .split('\n')
                        .filter(Boolean)
                        .map((line, j) => (
                          <li key={j}>{line.replace(/^[-*]\s*/, '')}</li>
                        ))}
                    </ul>
                  ) : (
                    <div className="prose prose-sm max-w-none dark:prose-invert">
                      {(block.content ?? '').split('\n').map((line, j) => (
                        <p key={j} className="mb-1 last:mb-0">
                          {line}
                        </p>
                      ))}
                    </div>
                  )}
                </div>
              ))
          )}
        </div>
        {onExport && (
          <div className="mt-4 flex gap-2 print:hidden">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onExport('html')}
              disabled={isExporting || safeBlocks.length === 0}
            >
              Export HTML
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onExport('pdf')}
              disabled={isExporting || safeBlocks.length === 0}
            >
              Export PDF
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
