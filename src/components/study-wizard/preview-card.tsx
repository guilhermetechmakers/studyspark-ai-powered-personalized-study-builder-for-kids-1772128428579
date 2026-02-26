import { FileText } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { dataGuard } from '@/lib/data-guard'
import type { TopicContext, ChildProfile, GenerationOptions, AIOutputBlock } from '@/types/study-wizard'
import { cn } from '@/lib/utils'

export interface PreviewCardProps {
  topicContext?: TopicContext | null
  childProfile?: ChildProfile | null
  learningStyle?: string | null
  generationOptions?: GenerationOptions | null
  blocks?: AIOutputBlock[]
  className?: string
}

export function PreviewCard({
  topicContext,
  childProfile,
  learningStyle,
  generationOptions,
  blocks = [],
  className,
}: PreviewCardProps) {
  const safeBlocks = dataGuard(blocks)
  const outputCount = (generationOptions?.outputs ?? []).length
  const estimatedLength = safeBlocks.reduce(
    (acc, b) => acc + (b.content?.length ?? 0),
    0
  )

  return (
    <Card
      className={cn(
        'overflow-hidden border border-border/60 bg-gradient-to-br from-[rgb(var(--peach-light))]/10 to-white',
        className
      )}
    >
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base">
          <FileText className="h-4 w-4 text-primary" />
          Study Set Preview
        </CardTitle>
        <CardDescription>
          Summary of your generated study set
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3 text-sm">
        {topicContext?.topic && (
          <div>
            <span className="font-medium text-muted-foreground">Topic:</span>{' '}
            {topicContext.topic}
          </div>
        )}
        {childProfile && (
          <div>
            <span className="font-medium text-muted-foreground">Target:</span>{' '}
            {childProfile.name}, Age {childProfile.age}
          </div>
        )}
        {learningStyle && (
          <div>
            <span className="font-medium text-muted-foreground">Style:</span>{' '}
            {learningStyle.replace('-', ' ')}
          </div>
        )}
        {outputCount > 0 && (
          <div>
            <span className="font-medium text-muted-foreground">Outputs:</span>{' '}
            {outputCount} type(s)
          </div>
        )}
        {estimatedLength > 0 && (
          <div>
            <span className="font-medium text-muted-foreground">Content:</span>{' '}
            ~{Math.round(estimatedLength / 4)} words
          </div>
        )}
        {!topicContext?.topic && !childProfile && (
          <p className="italic text-muted-foreground">
            Complete the wizard to see preview.
          </p>
        )}
      </CardContent>
    </Card>
  )
}
