import { Eye } from 'lucide-react'
import { ScrollArea } from '@/components/ui/scroll-area'
import { cn } from '@/lib/utils'
import type { SectionBlock, SectionContent } from '@/types/study-review'
import { SECTION_TYPE_LABELS } from '@/types/study-review'
import { dataGuard } from '@/lib/data-guard'

function getContentAsString(content: string | SectionContent | null | undefined): string {
  if (typeof content === 'string') return content
  if (!content) return ''
  if (content.summary) return content.summary
  return JSON.stringify(content)
}

function getContentAsObject(content: string | SectionContent | null | undefined): SectionContent {
  if (!content) return {}
  if (typeof content === 'object') return content
  try {
    const parsed = JSON.parse(content)
    return typeof parsed === 'object' ? parsed : {}
  } catch {
    return { summary: content }
  }
}

export interface PreviewPaneProps {
  blocks: SectionBlock[]
  className?: string
}

export function PreviewPane({ blocks, className }: PreviewPaneProps) {
  const safeBlocks = dataGuard(blocks)
  const sorted = [...safeBlocks].sort((a, b) => (a.order ?? 0) - (b.order ?? 0))

  return (
    <div
      className={cn(
        'rounded-2xl border-2 border-border bg-white p-6 shadow-sm',
        className
      )}
      aria-label="Study preview"
    >
      <div className="mb-4 flex items-center gap-2">
        <Eye className="h-5 w-5 text-primary" />
        <h3 className="font-semibold text-foreground">Preview</h3>
      </div>
      <ScrollArea className="h-[400px]">
        <div className="prose prose-sm max-w-none dark:prose-invert">
          {sorted.map((block) => {
            const label = SECTION_TYPE_LABELS[block.type as keyof typeof SECTION_TYPE_LABELS] ?? block.type
            const content = block.content ?? ''
            const obj = getContentAsObject(content)

            return (
              <div key={block.id} className="mb-6">
                <h4 className="text-lg font-semibold text-foreground">{label}</h4>
                {block.type === 'summary' && (
                  <p className="mt-2 whitespace-pre-wrap">{getContentAsString(content)}</p>
                )}
                {block.type === 'lessons' && (
                  <div className="mt-2 space-y-3">
                    {(obj.lessons ?? []).map((lesson, i) => (
                      <div key={i} className="rounded-lg border border-border p-3">
                        <h5 className="font-medium">{lesson.title || 'Untitled'}</h5>
                        <p className="mt-1 text-sm text-muted-foreground">{lesson.body}</p>
                      </div>
                    ))}
                  </div>
                )}
                {block.type === 'flashcards' && (
                  <div className="mt-2 space-y-2">
                    {(obj.flashcards ?? []).map((card, i) => (
                      <div key={i} className="rounded-lg border border-border p-3">
                        <p className="font-medium">{card.front}</p>
                        <p className="mt-1 text-sm text-muted-foreground">{card.back}</p>
                      </div>
                    ))}
                  </div>
                )}
                {block.type === 'quizzes' && (
                  <div className="mt-2 space-y-3">
                    {(obj.quizzes ?? []).map((quiz, i) => (
                      <div key={i} className="rounded-lg border border-border p-3">
                        <p className="font-medium">{quiz.question}</p>
                        <ul className="mt-2 list-inside list-disc text-sm text-muted-foreground">
                          {(quiz.options ?? []).map((opt, j) => (
                            <li key={j}>{opt}</li>
                          ))}
                        </ul>
                        <p className="mt-2 text-sm font-medium text-primary">Answer: {quiz.answer}</p>
                      </div>
                    ))}
                  </div>
                )}
                {block.type === 'references' && (
                  <ul className="mt-2 space-y-1">
                    {(obj.references ?? []).map((ref, i) => (
                      <li key={i}>
                        <a
                          href={ref.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:underline"
                        >
                          {ref.citation || ref.url}
                        </a>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )
          })}
        </div>
      </ScrollArea>
    </div>
  )
}
