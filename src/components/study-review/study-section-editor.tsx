import { useState, useCallback, useEffect } from 'react'
import { Pencil, Trash2, Plus } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import type { SectionBlock, SectionContent } from '@/types/study-review'
import { SECTION_TYPE_LABELS } from '@/types/study-review'
import { cn } from '@/lib/utils'

export interface StudySectionEditorProps {
  sectionId: string
  sectionData: SectionBlock | null | undefined
  onUpdateSection: (sectionId: string, content: string | SectionContent | Record<string, unknown>) => void
  onBlur?: (sectionId: string, content: string | SectionContent | Record<string, unknown>) => void
  className?: string
}

function getContentAsString(content: string | SectionContent | null | undefined): string {
  if (typeof content === 'string') return content
  if (!content) return ''
  if (content.summary) return content.summary
  return JSON.stringify(content)
}

function getContentAsObject(
  content: string | SectionContent | null | undefined
): SectionContent {
  if (!content) return {}
  if (typeof content === 'object') return content
  try {
    const parsed = JSON.parse(content)
    return typeof parsed === 'object' ? parsed : {}
  } catch {
    return { summary: content }
  }
}

export function StudySectionEditor({
  sectionId,
  sectionData,
  onUpdateSection,
  onBlur,
  className,
}: StudySectionEditorProps) {
  const content = sectionData?.content ?? ''
  const sectionType = sectionData?.type ?? 'summary'
  const [isEditing, setIsEditing] = useState(false)
  const [editValue, setEditValue] = useState('')
  const [editObject, setEditObject] = useState<SectionContent>({})
  useEffect(() => {
    if (sectionType === 'summary' || sectionType === 'lessons') {
      setEditValue(getContentAsString(content))
    } else {
      setEditObject(getContentAsObject(content))
    }
  }, [content, sectionType])

  const handleSaveText = useCallback(() => {
    if (!sectionId) return
    onUpdateSection(sectionId, editValue)
    onBlur?.(sectionId, editValue)
    setIsEditing(false)
  }, [sectionId, editValue, onUpdateSection, onBlur])

  const handleBlurText = useCallback(() => {
    if (!sectionId || editValue === getContentAsString(content)) return
    onUpdateSection(sectionId, editValue)
    onBlur?.(sectionId, editValue)
  }, [sectionId, editValue, content, onUpdateSection, onBlur])

  const handleSaveObject = useCallback(() => {
    if (!sectionId) return
    onUpdateSection(sectionId, editObject)
    onBlur?.(sectionId, editObject)
    setIsEditing(false)
  }, [sectionId, editObject, onUpdateSection, onBlur])

  const handleCancel = useCallback(() => {
    setEditValue(getContentAsString(content))
    setEditObject(getContentAsObject(content))
    setIsEditing(false)
  }, [content])

  const updateFlashcard = useCallback(
    (index: number, field: 'front' | 'back', value: string) => {
      const cards = Array.isArray(editObject.flashcards) ? [...editObject.flashcards] : []
      const card = cards[index] ?? { front: '', back: '' }
      cards[index] = { ...card, [field]: value }
      setEditObject((prev) => ({ ...prev, flashcards: cards }))
    },
    [editObject.flashcards]
  )

  const addFlashcard = useCallback(() => {
    const cards = Array.isArray(editObject.flashcards) ? [...editObject.flashcards] : []
    setEditObject((prev) => ({ ...prev, flashcards: [...cards, { front: '', back: '' }] }))
  }, [editObject.flashcards])

  const removeFlashcard = useCallback((index: number) => {
    setEditObject((prev) => {
      const cards = Array.isArray(prev.flashcards) ? prev.flashcards : []
      return { ...prev, flashcards: cards.filter((_, i) => i !== index) }
    })
  }, [])

  const updateQuizQuestion = useCallback(
    (index: number, value: string) => {
      setEditObject((prev) => {
        const quizzes = [...(prev.quizzes ?? [])]
        const quiz = quizzes[index] ?? { question: '', options: [''], answer: '' }
        quizzes[index] = { ...quiz, question: value }
        return { ...prev, quizzes }
      })
    },
    []
  )

  const updateQuizAnswer = useCallback(
    (index: number, value: string) => {
      setEditObject((prev) => {
        const quizzes = [...(prev.quizzes ?? [])]
        const quiz = quizzes[index] ?? { question: '', options: [''], answer: '' }
        quizzes[index] = { ...quiz, answer: value }
        return { ...prev, quizzes }
      })
    },
    []
  )

  const updateQuizOption = useCallback(
    (index: number, optionIndex: number, value: string) => {
      setEditObject((prev) => {
        const quizzes = [...(prev.quizzes ?? [])]
        const quiz = quizzes[index] ?? { question: '', options: [''], answer: '' }
        const opts = [...(quiz.options ?? [])]
        opts[optionIndex] = value
        quizzes[index] = { ...quiz, options: opts }
        return { ...prev, quizzes }
      })
    },
    []
  )

  const addQuiz = useCallback(() => {
    const quizzes = Array.isArray(editObject.quizzes) ? [...editObject.quizzes] : []
    setEditObject((prev) => ({ ...prev, quizzes: [...quizzes, { question: '', options: [''], answer: '' }] }))
  }, [editObject.quizzes])

  const removeQuiz = useCallback((index: number) => {
    setEditObject((prev) => {
      const quizzes = Array.isArray(prev.quizzes) ? prev.quizzes : []
      return { ...prev, quizzes: quizzes.filter((_, i) => i !== index) }
    })
  }, [])

  const updateLesson = useCallback(
    (index: number, field: 'title' | 'body', value: string) => {
      const lessons = Array.isArray(editObject.lessons) ? [...editObject.lessons] : []
      const lesson = lessons[index] ?? { title: '', body: '' }
      lessons[index] = { ...lesson, [field]: value }
      setEditObject((prev) => ({ ...prev, lessons }))
    },
    [editObject.lessons]
  )

  const addLesson = useCallback(() => {
    const lessons = Array.isArray(editObject.lessons) ? [...editObject.lessons] : []
    setEditObject((prev) => ({ ...prev, lessons: [...lessons, { title: '', body: '' }] }))
  }, [editObject.lessons])

  const removeLesson = useCallback((index: number) => {
    setEditObject((prev) => {
      const lessons = Array.isArray(prev.lessons) ? prev.lessons : []
      return { ...prev, lessons: lessons.filter((_, i) => i !== index) }
    })
  }, [])

  const label = SECTION_TYPE_LABELS[sectionType] ?? sectionType

  const safeSection = sectionData ?? null
  if (!safeSection) {
    return (
      <Card className={cn('animate-fade-in', className)}>
        <CardContent className="py-8 text-center text-muted-foreground">
          Section not found.
        </CardContent>
      </Card>
    )
  }

  const isListType = sectionType === 'flashcards' || sectionType === 'quizzes' || sectionType === 'lessons'

  return (
    <Card
      className={cn(
        'overflow-hidden border-2 border-border/60 bg-gradient-to-br from-[rgb(var(--peach-light))]/20 to-white',
        'transition-all duration-300 hover:shadow-card-hover',
        className
      )}
      aria-label={`Edit ${label} section`}
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-lg font-bold">{label}</CardTitle>
        {!isEditing ? (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsEditing(true)}
            aria-label={`Edit ${label}`}
          >
            <Pencil className="h-4 w-4" />
          </Button>
        ) : (
          <div className="flex gap-2">
            <Button size="sm" onClick={isListType ? handleSaveObject : handleSaveText}>
              Save
            </Button>
            <Button variant="outline" size="sm" onClick={handleCancel}>
              Cancel
            </Button>
          </div>
        )}
      </CardHeader>
      <CardContent>
        {!isEditing ? (
          <div className="prose prose-sm max-w-none dark:prose-invert">
            {sectionType === 'summary' && (
              <p className="whitespace-pre-wrap">{getContentAsString(content) || 'No content yet.'}</p>
            )}
            {sectionType === 'lessons' && (
              <div className="space-y-4">
                {(getContentAsObject(content).lessons ?? []).map((lesson, i) => (
                  <div key={i} className="rounded-lg border border-border p-4">
                    <h4 className="font-semibold">{lesson.title || 'Untitled'}</h4>
                    <p className="mt-2 text-sm text-muted-foreground">{lesson.body}</p>
                  </div>
                ))}
                {((getContentAsObject(content).lessons ?? []).length === 0) && (
                  <p className="text-muted-foreground">No lessons yet.</p>
                )}
              </div>
            )}
            {sectionType === 'flashcards' && (
              <div className="space-y-2">
                {(getContentAsObject(content).flashcards ?? []).map((card, i) => (
                  <div key={i} className="rounded-lg border border-border p-3">
                    <p className="font-medium">{card.front}</p>
                    <p className="mt-1 text-sm text-muted-foreground">{card.back}</p>
                  </div>
                ))}
                {((getContentAsObject(content).flashcards ?? []).length === 0) && (
                  <p className="text-muted-foreground">No flashcards yet.</p>
                )}
              </div>
            )}
            {sectionType === 'quizzes' && (
              <div className="space-y-4">
                {(getContentAsObject(content).quizzes ?? []).map((quiz, i) => (
                  <div key={i} className="rounded-lg border border-border p-4">
                    <p className="font-medium">{quiz.question}</p>
                    <ul className="mt-2 list-inside list-disc text-sm text-muted-foreground">
                      {(quiz.options ?? []).map((opt, j) => (
                        <li key={j}>{opt}</li>
                      ))}
                    </ul>
                    <p className="mt-2 text-sm font-medium text-primary">Answer: {quiz.answer}</p>
                  </div>
                ))}
                {((getContentAsObject(content).quizzes ?? []).length === 0) && (
                  <p className="text-muted-foreground">No quizzes yet.</p>
                )}
              </div>
            )}
            {sectionType === 'references' && (
              <ul className="space-y-2">
                {(getContentAsObject(content).references ?? []).map((ref, i) => (
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
                {((getContentAsObject(content).references ?? []).length === 0) && (
                  <p className="text-muted-foreground">No references yet.</p>
                )}
              </ul>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {sectionType === 'summary' && (
              <Textarea
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                onBlur={handleBlurText}
                rows={8}
                className="rounded-xl"
                aria-label="Edit summary"
              />
            )}
            {sectionType === 'lessons' && (
              <div className="space-y-4">
                {(editObject.lessons ?? []).map((lesson, i) => (
                  <div key={i} className="space-y-2 rounded-lg border border-border p-4">
                    <Input
                      placeholder="Lesson title"
                      value={lesson.title}
                      onChange={(e) => updateLesson(i, 'title', e.target.value)}
                    />
                    <Textarea
                      placeholder="Lesson content"
                      value={lesson.body}
                      onChange={(e) => updateLesson(i, 'body', e.target.value)}
                      rows={4}
                    />
                    <Button variant="ghost" size="sm" onClick={() => removeLesson(i)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <Button variant="outline" size="sm" onClick={addLesson}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add lesson
                </Button>
              </div>
            )}
            {sectionType === 'flashcards' && (
              <div className="space-y-4">
                {(editObject.flashcards ?? []).map((card, i) => (
                  <div key={i} className="flex gap-2 rounded-lg border border-border p-3">
                    <Input
                      placeholder="Front"
                      value={card.front}
                      onChange={(e) => updateFlashcard(i, 'front', e.target.value)}
                      className="flex-1"
                    />
                    <Input
                      placeholder="Back"
                      value={card.back}
                      onChange={(e) => updateFlashcard(i, 'back', e.target.value)}
                      className="flex-1"
                    />
                    <Button variant="ghost" size="icon" onClick={() => removeFlashcard(i)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <Button variant="outline" size="sm" onClick={addFlashcard}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add flashcard
                </Button>
              </div>
            )}
            {sectionType === 'quizzes' && (
              <div className="space-y-4">
                {(editObject.quizzes ?? []).map((quiz, i) => (
                  <div key={i} className="space-y-2 rounded-lg border border-border p-4">
                    <Input
                      placeholder="Question"
                      value={quiz.question}
                      onChange={(e) => updateQuizQuestion(i, e.target.value)}
                    />
                    {(quiz.options ?? []).map((opt, j) => (
                      <Input
                        key={j}
                        placeholder={`Option ${j + 1}`}
                        value={opt}
                        onChange={(e) => updateQuizOption(i, j, e.target.value)}
                      />
                    ))}
                    <Input
                      placeholder="Correct answer"
                      value={quiz.answer}
                      onChange={(e) => updateQuizAnswer(i, e.target.value)}
                    />
                    <Button variant="ghost" size="sm" onClick={() => removeQuiz(i)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <Button variant="outline" size="sm" onClick={addQuiz}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add quiz
                </Button>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
