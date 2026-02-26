/**
 * Maps draft content_payload to StudySet format for the Study Player.
 * Handles lessons, flashcards, quizzes from blocks or legacy format.
 */

import type {
  StudySet,
  Activity,
  CardItem,
  Question,
  LessonChapter,
} from '@/types/study-viewer'
import type { StudyContentPayload, LessonBlock, FlashcardBlock, QuizBlock } from '@/types/studies'

function safeArray<T>(v: unknown): T[] {
  return Array.isArray(v) ? v : []
}

/** Map draft payload to StudySet */
export function draftPayloadToStudySet(
  studyId: string,
  title: string,
  payload: Record<string, unknown> | StudyContentPayload
): StudySet {
  const activities: Activity[] = []
  const blocks = safeArray<(LessonBlock | FlashcardBlock | QuizBlock) & { type?: string }>(
    (payload as { blocks?: unknown[] }).blocks ?? []
  )
  const lessons = safeArray<LessonBlock>(payload.lessons ?? [])
  const flashcards = safeArray<FlashcardBlock>(payload.flashcards ?? [])
  const quizzes = safeArray<QuizBlock>(payload.quizzes ?? [])

  if (blocks.length > 0) {
    blocks.forEach((b, i) => {
      const type = (b as { type?: string }).type ?? 'text'
      const id = String((b as { id?: string }).id ?? `a-${i}`)
      const hasFront = (b as FlashcardBlock).front !== undefined
      const hasQuestion = (b as QuizBlock).question !== undefined
      if (type === 'flashcards' || hasFront) {
        const cards: CardItem[] = type === 'flashcards' && typeof (b as { content?: { cards?: unknown[] } }).content === 'object'
          ? safeArray((b as { content?: { cards?: unknown[] } }).content?.cards ?? []).map((c: unknown, j: number) => {
              const card = c as { front?: string; back?: string; id?: string }
              return {
              id: String(card?.id ?? `c-${i}-${j}`),
              front: card?.front ?? '',
              back: card?.back ?? '',
            }
          })
          : flashcards.map((f, j) => ({
              id: f.id ?? `c-${j}`,
              front: f.front ?? '',
              back: f.back ?? '',
            }))
        if (cards.length > 0) {
          activities.push({ id: `act-${id}`, type: 'flashcard', content: cards, progress: 0 })
        }
      } else if (type === 'quizzes' || hasQuestion) {
        const qs: Question[] = type === 'quizzes' && typeof (b as { content?: { questions?: unknown[] } }).content === 'object'
          ? safeArray((b as { content?: { questions?: unknown[] } }).content?.questions ?? []).map((q: unknown, j: number) => {
              const qq = q as { question?: string; options?: string[]; correctIndex?: number; id?: string; explanation?: string }
              return {
                id: String(qq?.id ?? `q-${i}-${j}`),
                type: 'MCQ' as const,
                prompt: qq?.question ?? '',
                options: Array.isArray(qq?.options) ? qq.options : [],
                answer: (() => {
                  const opts = Array.isArray(qq?.options) ? qq.options : []
                  const idx = qq?.correctIndex
                  return typeof idx === 'number' && opts[idx] ? opts[idx] : ''
                })(),
                hint: qq?.explanation,
              }
            })
          : quizzes.map((q, j) => ({
              id: q.id ?? `q-${j}`,
              type: 'MCQ' as const,
              prompt: q.question ?? '',
              options: Array.isArray(q.options) ? q.options : [],
              answer: Array.isArray(q.options) && typeof q.correctIndex === 'number' ? (q.options[q.correctIndex] ?? '') : '',
              hint: q.explanation,
            }))
        if (qs.length > 0) {
          activities.push({ id: `act-${id}`, type: 'quiz', content: qs, progress: 0 })
        }
      } else {
        const content = (b as LessonBlock).content ?? ''
        const lessonChapters: LessonChapter[] = [{
          id: String((b as { id?: string }).id ?? `l-${i}`),
          title: (b as { title?: string }).title ?? 'Section',
          content: typeof content === 'string' ? content : JSON.stringify(content),
          steps: 1,
        }]
        activities.push({ id: `act-${id}`, type: 'lesson', content: lessonChapters, progress: 0 })
      }
    })
  }

  if (activities.length === 0) {
    if (lessons.length > 0) {
      const lessonChapters: LessonChapter[] = lessons.map((l, i) => ({
        id: l.id ?? `l-${i}`,
        title: l.title ?? 'Section',
        content: l.content ?? '',
        steps: 1,
      }))
      activities.push({ id: 'act-lessons', type: 'lesson', content: lessonChapters, progress: 0 })
    }
    if (flashcards.length > 0) {
      const cards: CardItem[] = flashcards.map((f, i) => ({
        id: f.id ?? `c-${i}`,
        front: f.front ?? '',
        back: f.back ?? '',
      }))
      activities.push({ id: 'act-flashcards', type: 'flashcard', content: cards, progress: 0 })
    }
    if (quizzes.length > 0) {
      const questions: Question[] = quizzes.map((q, i) => ({
        id: q.id ?? `q-${i}`,
        type: 'MCQ' as const,
        prompt: q.question ?? '',
        options: Array.isArray(q.options) ? q.options : [],
        answer: Array.isArray(q.options) && typeof q.correctIndex === 'number' ? (q.options[q.correctIndex] ?? '') : '',
        hint: q.explanation,
      }))
      activities.push({ id: 'act-quiz', type: 'quiz', content: questions, progress: 0 })
    }
  }

  if (activities.length === 0) {
    activities.push({
      id: 'act-empty',
      type: 'lesson',
      content: [{ id: 'l1', title: 'No content yet', content: 'This study set has no content. Add lessons, flashcards, or quizzes.', steps: 1 }],
      progress: 0,
    })
  }

  return {
    id: studyId,
    title,
    activities,
    progress: {
      total: activities.length,
      completed: 0,
      stars: 0,
      timeSpent: 0,
      streak: 0,
      badges: [],
    },
  }
}
