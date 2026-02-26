/**
 * Converts draft content_payload to study-viewer Activity format.
 * Supports blocks, lessons, flashcards, quizzes structures.
 * All arrays guarded for runtime safety.
 */

import type { Activity, CardItem, Question, LessonChapter } from '@/types/study-viewer'

interface DraftFlashcard {
  front?: string
  back?: string
}

interface DraftQuiz {
  question?: string
  options?: string[]
  answer?: string
}

interface DraftLesson {
  title?: string
  body?: string
  content?: string
}

function draftToActivities(
  payload: Record<string, unknown>,
  studyId: string,
  activityIds?: string[]
): Activity[] {
  const activities: Activity[] = []
  let idx = 0

  const blocks = Array.isArray((payload as { blocks?: unknown[] }).blocks)
    ? (payload as { blocks: unknown[] }).blocks
    : []
  const flashcards = Array.isArray(payload.flashcards) ? payload.flashcards : []
  const quizzes = Array.isArray(payload.quizzes) ? payload.quizzes : []
  const lessons = Array.isArray(payload.lessons) ? payload.lessons : []

  const getId = (i: number) => activityIds?.[i] ?? `act-${studyId}-${i}`

  if (blocks.length > 0) {
    blocks.forEach((b: unknown, i: number) => {
      const block = b as Record<string, unknown>
      const type = (block?.type as string) ?? 'summary'
      const content = block?.content
      let actType: Activity['type'] = 'lesson'
      let actContent: unknown = content

      if (type === 'flashcards' || (typeof content === 'object' && content !== null && 'flashcards' in (content as object))) {
        actType = 'flashcard'
        const cards = (content as { flashcards?: DraftFlashcard[] })?.flashcards ?? []
        actContent = cards.map((c, j) => ({
          id: `c-${i}-${j}`,
          front: c?.front ?? '',
          back: c?.back ?? '',
        })) as CardItem[]
      } else if (type === 'quizzes' || (typeof content === 'object' && content !== null && 'quizzes' in (content as object))) {
        actType = 'quiz'
        const qs = (content as { quizzes?: DraftQuiz[] })?.quizzes ?? []
        actContent = qs.map((q, j) => ({
          id: `q-${i}-${j}`,
          type: 'MCQ' as const,
          prompt: q?.question ?? '',
          options: Array.isArray(q?.options) ? q.options : [],
          answer: q?.answer ?? '',
        })) as Question[]
      } else if (type === 'lessons' || (typeof content === 'object' && content !== null && 'lessons' in (content as object))) {
        actType = 'lesson'
        const ls = (content as { lessons?: DraftLesson[] })?.lessons ?? []
        actContent = ls.map((l, j) => ({
          id: `l-${i}-${j}`,
          title: l?.title ?? '',
          content: l?.body ?? l?.content ?? '',
          steps: 3,
        })) as LessonChapter[]
      } else {
        actContent = [{ id: `l-${i}`, title: 'Summary', content: typeof content === 'string' ? content : JSON.stringify(content ?? ''), steps: 1 }] as LessonChapter[]
      }

      activities.push({
        id: getId(idx++),
        type: actType,
        content: actContent,
        progress: 0,
      })
    })
  } else {
    if (lessons.length > 0) {
      const lessonChapters: LessonChapter[] = lessons.map((l: DraftLesson, j: number) => ({
        id: `l-${j}`,
        title: l?.title ?? '',
        content: l?.body ?? l?.content ?? '',
        steps: 3,
      }))
      activities.push({
        id: getId(idx++),
        type: 'lesson',
        content: lessonChapters,
        progress: 0,
      })
    }
    if (flashcards.length > 0) {
      const cards: CardItem[] = flashcards.map((c: DraftFlashcard, j: number) => ({
        id: `c-${j}`,
        front: c?.front ?? '',
        back: c?.back ?? '',
      }))
      activities.push({
        id: getId(idx++),
        type: 'flashcard',
        content: cards,
        progress: 0,
      })
    }
    if (quizzes.length > 0) {
      const questions: Question[] = quizzes.map((q: DraftQuiz, j: number) => ({
        id: `q-${j}`,
        type: 'MCQ' as const,
        prompt: q?.question ?? '',
        options: Array.isArray(q?.options) ? q.options : [],
        answer: q?.answer ?? '',
      }))
      activities.push({
        id: getId(idx++),
        type: 'quiz',
        content: questions,
        progress: 0,
      })
    }
  }

  if (activities.length === 0) {
    activities.push({
      id: getId(0),
      type: 'lesson',
      content: [{ id: 'l0', title: 'No content', content: 'This study has no content yet.', steps: 1 }] as LessonChapter[],
      progress: 0,
    })
  }

  return activities
}

export { draftToActivities }
