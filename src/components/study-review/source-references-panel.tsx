import { ExternalLink, FileText } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { cn } from '@/lib/utils'
import type { SourceReference } from '@/types/study-review'
import { dataGuard } from '@/lib/data-guard'

export interface SourceReferencesPanelProps {
  references: SourceReference[]
  className?: string
}

export function SourceReferencesPanel({
  references,
  className,
}: SourceReferencesPanelProps) {
  const safeRefs = dataGuard(references)

  return (
    <Card
      className={cn(
        'overflow-hidden border-2 border-border/60 bg-gradient-to-br from-[rgb(var(--tangerine))]/10 to-white transition-all duration-300',
        className
      )}
      aria-label="Source References"
    >
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-lg font-bold">
          <FileText className="h-5 w-5 text-primary" />
          Source References
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Materials used as context for this study
        </p>
      </CardHeader>
      <CardContent>
        {safeRefs.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border bg-muted/30 p-8 text-center">
            <p className="text-sm text-muted-foreground">No source references yet.</p>
          </div>
        ) : (
          <ScrollArea className="h-[200px]">
            <ul className="space-y-2 pr-4" role="list">
              {(safeRefs ?? []).map((ref) => (
                <li key={ref.id}>
                  <a
                    href={ref.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={cn(
                      'flex items-start gap-2 rounded-xl border border-border bg-card p-3',
                      'transition-all hover:shadow-sm hover:border-primary/30',
                      'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2'
                    )}
                    aria-label={`Open source: ${ref.citation || ref.url}`}
                  >
                    <ExternalLink className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-foreground line-clamp-2">
                        {ref.citation || ref.url}
                      </p>
                      <p className="mt-1 truncate text-xs text-muted-foreground">{ref.url}</p>
                    </div>
                  </a>
                </li>
              ))}
            </ul>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  )
}
