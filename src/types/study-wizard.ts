/**
 * Study Wizard type definitions.
 * All types support runtime safety with optional chaining and defaults.
 */

export type LearningStyle =
  | 'playful'
  | 'exam-like'
  | 'research-based'
  | 'printable'
  | 'interactive'

export type DepthLevel = 'short' | 'medium' | 'deep'

export type StudyStatus =
  | 'draft'
  | 'generating'
  | 'review'
  | 'approved'
  | 'exported'

export type OCRStatus = 'not_started' | 'in_progress' | 'done' | 'failed'

export interface SnippetPosition {
  start: number
  end: number
}

export interface Snippet {
  id: string
  text: string
  confidence: number
  important: boolean
  position?: SnippetPosition
}

export interface TopicContext {
  topic: string
  subject: string
  contextNotes?: string
  examDate?: string
}

export interface Material {
  id: string
  studyId?: string
  name: string
  url: string
  type: 'document' | 'photo'
  uploadedAt: string
  ocrStatus?: OCRStatus
  transcription?: string
  ocrText?: string
  ocrSnippets?: Snippet[]
  file?: File
  size?: number
}

export interface ChildProfile {
  id: string
  name: string
  age: number
  grade: string
  avatarUrl?: string
}

export interface GenerationOptions {
  depth: DepthLevel
  outputs: ('flashcards' | 'quizzes' | 'lessonPlan' | 'printablePDF')[]
  curriculumAligned: boolean
}

export interface AIOutputBlock {
  type: 'text' | 'list' | 'table' | 'image'
  content: string
  order: number
  length?: number
}

export interface Revision {
  id: string
  studyId: string
  comments: string
  status: 'open' | 'closed'
  createdAt: string
}

export interface Version {
  id: string
  studyId: string
  snapshot: Record<string, unknown>
  createdAt: string
}

export interface Study {
  id: string
  topic: string
  subject: string
  contextNotes?: string
  examDate?: string
  childProfileId: string
  learningStyle: LearningStyle
  generationOptions: GenerationOptions
  materials: Material[]
  status: StudyStatus
  previews?: AIOutputBlock[]
  createdAt: string
  updatedAt: string
}

export interface PreviewBlock {
  type: string
  content: string
  order: number
}

export const SUBJECTS = [
  'Math',
  'Science',
  'History',
  'English',
  'Geography',
  'Art',
  'Music',
  'Other',
] as const

export const LEARNING_STYLES: {
  id: LearningStyle
  label: string
  desc: string
}[] = [
  { id: 'playful', label: 'Playful', desc: 'Games, stories, and fun activities' },
  { id: 'exam-like', label: 'Exam-like', desc: 'Practice tests and structured Q&A' },
  { id: 'research-based', label: 'Research-based', desc: 'Deep dives and critical thinking' },
  { id: 'printable', label: 'Printable', desc: 'Clean PDFs for printing' },
  { id: 'interactive', label: 'Interactive', desc: 'In-app activities and quizzes' },
]

export const DEPTH_LEVELS: { id: DepthLevel; label: string; desc: string }[] = [
  { id: 'short', label: 'Short', desc: 'Quick overview, key points only' },
  { id: 'medium', label: 'Medium', desc: 'Balanced depth with examples' },
  { id: 'deep', label: 'Deep', desc: 'Comprehensive coverage with details' },
]

export const OUTPUT_TYPES: {
  id: 'flashcards' | 'quizzes' | 'lessonPlan' | 'printablePDF'
  label: string
  desc: string
}[] = [
  { id: 'flashcards', label: 'Flashcards', desc: 'Key terms and definitions' },
  { id: 'quizzes', label: 'Quizzes', desc: 'Multiple choice and short answer' },
  { id: 'lessonPlan', label: 'Lesson Plan', desc: 'Structured learning sequence' },
  { id: 'printablePDF', label: 'Printable PDF', desc: 'Summary and study guide' },
]
