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
  blockId?: string
  blockIds?: string[]
  prompt: string
  intent?: RevisionIntent
  aiResponse: string | null
  resultContent?: Record<string, unknown> | SectionBlock[]
  createdAt: string
  status: 'pending' | 'completed' | 'failed'
}

/** Payload for creating a revision request with block context */
export interface RevisionRequestPayload {
  blockIds: string[]
  prompt: string
  intent: RevisionIntent
  notes?: string
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

/** Revision intent for targeted AI revisions */
export type RevisionIntent =
  | 'clarify'
  | 'expand'
  | 'shorten'
  | 'rephrase'
  | 'upgrade_difficulty'
  | 'adjust_tone'

export const REVISION_INTENTS: { id: RevisionIntent; label: string; desc: string }[] = [
  { id: 'clarify', label: 'Clarify', desc: 'Make the content clearer and easier to understand' },
  { id: 'expand', label: 'Expand', desc: 'Add more detail and examples' },
  { id: 'shorten', label: 'Shorten', desc: 'Make it more concise' },
  { id: 'rephrase', label: 'Rephrase', desc: 'Use different wording' },
  { id: 'upgrade_difficulty', label: 'Upgrade difficulty', desc: 'Make it more challenging' },
  { id: 'adjust_tone', label: 'Adjust tone', desc: 'Change the tone (e.g. more playful)' },
]

/** Block-level diff for version comparison */
export interface BlockDiff {
  blockId: string
  before: string
  after: string
  type?: SectionType | 'added' | 'removed' | 'modified' | 'unchanged'
}

/** Autosave status */
export type AutosaveStatus = 'idle' | 'saving' | 'saved' | 'error'

/** Conflict resolution strategy */
export type ConflictResolutionStrategy = 'keep_local' | 'keep_server' | 'merge'

/** User role for permissions */
export type UserRole = 'parent' | 'teacher' | 'admin'

export const REVISION_INTENT_LABELS: Record<RevisionIntent, string> = {
  clarify: 'Clarify',
  expand: 'Expand',
  shorten: 'Shorten',
  rephrase: 'Rephrase',
  upgrade_difficulty: 'Upgrade difficulty',
  adjust_tone: 'Adjust tone',
}

/** Revision job response */
export interface RevisionJobResponse {
  id: string
  studyId: string
  status: 'pending' | 'completed' | 'failed'
  resultContent?: SectionBlock[] | Record<string, unknown>
  createdAt: string
}

/** Conflict log entry */
export interface ConflictLogEntry {
  id: string
  studyId: string
  conflictAt: string
  details: Record<string, unknown>
}
