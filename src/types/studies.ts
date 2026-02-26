/**
 * Studies API type definitions.
 * Aligned with supabase/migrations/20250226130000_studies_and_ai_engine.sql
 * All types support runtime safety with optional chaining and defaults.
 */

export type StudyStatus =
  | 'draft'
  | 'drafting'
  | 'streaming'
  | 'ready'
  | 'exported'

export type MaterialType = 'document' | 'photo' | 'text'

export type ModerationStatus = 'pending' | 'approved' | 'flagged'

export interface Study {
  id: string
  userId: string
  childProfileId: string | null
  topic: string
  topicTags: string[]
  learningStyle: string
  age: number
  foldersPath: string[]
  status: StudyStatus
  createdAt: string
  updatedAt: string
}

export interface Material {
  id: string
  studyId: string
  type: MaterialType
  sourceUrl: string | null
  metadata: Record<string, unknown>
  createdAt: string
}

export interface Draft {
  id: string
  studyId: string
  version: number
  contentPayload: StudyContentPayload
  createdAt: string
  updatedAt: string
}

export interface StudyContentPayload {
  lessons?: LessonBlock[]
  flashcards?: FlashcardBlock[]
  quizzes?: QuizBlock[]
  printableLayouts?: PrintableLayout[]
  meta?: {
    topic?: string
    age?: number
    learningStyle?: string
    version?: number
    generatedAt?: string
  }
}

export interface LessonBlock {
  id: string
  type: 'text' | 'list' | 'table' | 'image'
  content: string
  order: number
  title?: string
}

export interface FlashcardBlock {
  id: string
  front: string
  back: string
  order: number
}

export interface QuizBlock {
  id: string
  question: string
  options: string[]
  correctIndex: number
  explanation?: string
  order: number
}

export interface PrintableLayout {
  id: string
  type: 'lesson' | 'flashcards' | 'quiz'
  title: string
  content: string
  order: number
}

export interface Version {
  id: string
  studyId: string
  versionNumber: number
  diffs: Array<{ before: string; after: string }>
  contentSnapshot: StudyContentPayload
  createdAt: string
}

export interface Progress {
  studyId: string
  stage: string
  progressPct: number
  streamingToken: string | null
  updatedAt: string
}

export interface Moderation {
  id: string
  studyId: string
  status: ModerationStatus
  issues: ModerationIssue[]
  reviewedAt: string | null
  createdAt: string
}

export interface ModerationIssue {
  type: string
  severity: 'low' | 'medium' | 'high'
  message: string
  blockId?: string
}

export interface PrepareStudyPayload {
  topic: string
  topicTags?: string[]
  contextNotes?: string
  childProfileId?: string | null
  childAge?: number
  learningStyle: string
  materials?: Array<{ id: string; type: MaterialType; sourceUrl?: string; metadata?: Record<string, unknown> }>
}

export interface PrepareStudyResponse {
  studyId: string
  contextBlocks: string[]
  topicTags: string[]
  ready: boolean
}

export interface GenerateStudyPayload {
  studyId: string
  promptOverrides?: Record<string, string>
  outputs?: ('flashcards' | 'quizzes' | 'lessonPlan' | 'printablePDF')[]
}

export interface StreamChunk {
  type: 'progress' | 'block' | 'complete' | 'error'
  progressPct?: number
  stage?: string
  block?: LessonBlock | FlashcardBlock | QuizBlock
  error?: string
}

export interface ReviseStudyPayload {
  studyId: string
  blockId?: string
  prompt: string
  notes?: string
}

export interface ApproveStudyPayload {
  studyId: string
}

export interface CreateStudyInput {
  topic: string
  subject?: string
  topicTags?: string[]
  contextNotes?: string
  childProfileId?: string | null
  learningStyle: string
  age: number
  foldersPath?: string[]
}
