/**
 * PreviewPane - Renders final study as it would appear to the child.
 * Design: playful, rounded, pastel gradients per StudySpark design system.
 */

import { Eye } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { cn } from '@/lib/utils'
import type { SectionBlock, SectionContent } from '@/types/study-review'
import { SECTION_TYPE_LABELS } from '@/types/study-review'
import { dataGuard } from '@/lib/data-guard'

export interface PreviewPaneProps {
  sections?: SectionBlock[]
  blocks?: SectionBlock[]
  className?: string
}

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

export function PreviewPane({ sections, blocks, className }: PreviewPaneProps) {
  const safeSections = dataGuard(sections ?? blocks ?? [])
  const sorted = [...safeSections].sort((a, b) => (a.order ?? 0) - (b.order ?? 0))

  return (
    <Card
      className={cn(
        'overflow-hidden border-2 border-border/60',
        'bg-gradient-to-br from-[rgb(var(--peach-light))]/15 to-white',
        'transition-all duration-300',
        className
      )}
    >
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-lg font-bold">
          <Eye className="h-5 w-5 text-primary" />
          Child Preview
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          How the study will appear to your child
        </p>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[320px] pr-4">
          <div className="space-y-6">
            {sorted.length === 0 ? (
              <p className="text-center text-sm text-muted-foreground">No content yet</p>
            ) : (
              sorted.map((section) => {
                const type = section.type ?? 'summary'
                const content = section.content
                const label = SECTION_TYPE_LABELS[type as keyof typeof SECTION_TYPE_LABELS] ?? type

                return (
                  <div
                    key={section.id}
                    className="rounded-xl border border-border bg-card p-4"
                  >
                    <h4 className="mb-2 font-semibold text-foreground">{label}</h4>
                    {type === 'summary' && (
                      <p className="whitespace-pre-wrap text-sm text-muted-foreground">
                        {getContentAsString(content) || 'No content'}
                      </p>
                    )}
                    {type === 'lessons' && (
                      <div className="space-y-3">
                        {(getContentAsObject(content).lessons ?? []).map((lesson, i) => (
                          <div key={i} className="rounded-lg border border-border/60 p-3">
                            <p className="font-medium">{lesson.title || 'Untitled'}</p>
                            <p className="mt-1 text-sm text-muted-foreground">{lesson.body}</p>
                          </div>
                        ))}
                      </div>
                    )}
                    {type === 'flashcards' && (
                      <div className="space-y-2">
                        {(getContentAsObject(content).flashcards ?? []).map((card, i) => (
                          <div key={i} className="rounded-lg border border-border/60 p-2">
                            <p className="text-sm font-medium">{card.front}</p>
                            <p className="text-xs text-muted-foreground">{card.back}</p>
                          </div>
                        ))}
                      </div>
                    )}
                    {type === 'quizzes' && (
                      <div className="space-y-3">
                        {(getContentAsObject(content).quizzes ?? []).map((quiz, i) => (
                          <div key={i} className="rounded-lg border border-border/60 p-3">
                            <p className="text-sm font-medium">{quiz.question}</p>
                            <ul className="mt-1 list-inside list-disc text-xs text-muted-foreground">
                              {(quiz.options ?? []).map((opt, j) => (
                                <li key={j}>{opt}</li>
                              ))}
                            </ul>
                            <p className="mt-1 text-xs font-medium text-primary">Answer: {quiz.answer}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )
              })
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
