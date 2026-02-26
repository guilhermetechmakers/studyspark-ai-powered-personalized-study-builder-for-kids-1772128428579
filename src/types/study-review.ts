/**
 * Study Review & Edit Page - Type definitions.
 * All types support runtime safety with optional chaining and defaults.
 */

export type StudyStatus = 'draft' | 'pending' | 'approved'

export type SectionType =
  | 'summary'
  | 'lessons'
  | 'flashcards'
  | 'quizzes'
  | 'references'

export interface Study {
  id: string
  title: string
  ownerId: string
  status: StudyStatus
  createdAt: string
  updatedAt: string
}

export interface SectionBlock {
  id: string
  studyId: string
  type: SectionType
  content: string | SectionContent
  order: number
}

export interface SectionContent {
  summary?: string
  lessons?: Array<{ title: string; body: string }>
  flashcards?: Array<{ front: string; back: string }>
  quizzes?: Array<{ question: string; options: string[]; answer: string }>
  references?: Array<{ url: string; citation?: string }>
}

export interface Revision {
  id: string
  studyId: string
  blockId: string
  prompt: string
  aiResponse: string | null
  createdAt: string
  status: 'pending' | 'completed' | 'failed'
}

export interface AIInteractionEntry {
  id: string
  blockId: string
  prompt: string
  aiResponse: string | null
  timestamp: string
  status: 'pending' | 'completed' | 'failed'
}

export interface Version {
  id: string
  studyId: string
  versionNumber: number
  diffSummary?: string
  diffs?: Array<{ blockId: string; before: string; after: string }>
  createdAt: string
}

export interface SourceReference {
  id: string
  studyId: string
  url: string
  citation: string
}

export interface StudyReviewData {
  study: Study
  sections: SectionBlock[]
  references: SourceReference[]
  versions: Version[]
  revisions: Revision[]
}

export const SECTION_TYPE_LABELS: Record<SectionType, string> = {
  summary: 'Summary',
  lessons: 'Lessons',
  flashcards: 'Flashcards',
  quizzes: 'Quizzes',
  references: 'References',
}

export const DEFAULT_REVISION_PROMPTS: Record<SectionType, string> = {
  summary: 'Please revise this summary to be clearer and more concise.',
  lessons: 'Please revise this lesson to be more engaging for children.',
  flashcards: 'Please simplify these flashcards.',
  quizzes: 'Please revise these quiz questions to be easier.',
  references: 'Please add more relevant references.',
}
