/**
 * Study Viewer types - Child-facing interactive player.
 * All types support runtime-safe defaults and null-safety.
 */

export type ActivityType = 'flashcard' | 'quiz' | 'lesson'

export interface Activity {
  id: string
  type: ActivityType
  content: unknown
  progress?: number
}

export interface CardItem {
  id: string
  front: string
  back: string
  audio?: string
}

export type QuestionType = 'MCQ' | 'DRAG' | 'FILL'

export interface Question {
  id: string
  type: QuestionType
  prompt: string
  options?: string[]
  answer?: string
  hint?: string
}

export interface LessonChapter {
  id: string
  title: string
  content: string
  steps?: number
}

export interface ProgressData {
  total: number
  completed: number
  stars: number
  timeSpent: number
  streak: number
  badges: string[]
}

export interface StudySet {
  id: string
  title: string
  activities?: Activity[]
  progress?: ProgressData
}

export type StudyViewerMode = 'flashcards' | 'quizzes' | 'lessons'

export type TextSizeLevel = 'normal' | 'large' | 'xlarge'
