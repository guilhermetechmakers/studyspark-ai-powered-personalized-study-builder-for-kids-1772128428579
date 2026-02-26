/**
 * Review, Edit & Iterative Revision Workflow - Type definitions.
 * Block-based model with autosave, revisions, versions, conflicts, approvals.
 * All types support runtime safety with optional chaining and defaults.
 */

export type BlockType = 'paragraph' | 'heading' | 'list' | 'image' | 'media'

export type RevisionIntent =
  | 'clarify'
  | 'expand'
  | 'shorten'
  | 'rephrase'
  | 'upgrade_difficulty'
  | 'adjust_tone'

export type RevisionStatus = 'pending' | 'completed' | 'failed'

export type ApprovalStatus = 'approved' | 'changes_requested'

export type UserRole = 'parent' | 'teacher' | 'admin'

export interface Block {
  id: string
  studyId: string
  index: number
  type: BlockType
  content: string | Record<string, unknown>
  updatedAt: string
}

export interface RevisionRequest {
  studyId: string
  blockContext: string[]
  prompt: string
  intent: RevisionIntent
}

export interface RevisionJob {
  id: string
  studyId: string
  promptedByUserId: string
  promptText: string
  intent: RevisionIntent
  blockContext: string[]
  status: RevisionStatus
  resultContent: string | Record<string, unknown> | null
  createdAt: string
}

export interface VersionSnapshot {
  id: string
  studyId: string
  versionNumber: number
  blocksSnapshot: Block[]
  note?: string
  createdBy: string
  createdAt: string
}

export interface BlockDiff {
  blockId: string
  before: string
  after: string
  type: 'added' | 'removed' | 'modified'
}

export interface Approval {
  id: string
  studyId: string
  approvedByUserId: string
  approvedAt: string
  status: ApprovalStatus
  notes?: string
}

export interface ConflictLog {
  id: string
  studyId: string
  conflictAt: string
  details: Record<string, unknown>
}

export interface AutosaveStatus {
  blockId?: string
  status: 'idle' | 'saving' | 'saved' | 'error'
  lastSavedAt?: string
}

export const REVISION_INTENTS: { id: RevisionIntent; label: string }[] = [
  { id: 'clarify', label: 'Clarify' },
  { id: 'expand', label: 'Expand' },
  { id: 'shorten', label: 'Shorten' },
  { id: 'rephrase', label: 'Rephrase' },
  { id: 'upgrade_difficulty', label: 'Upgrade difficulty' },
  { id: 'adjust_tone', label: 'Adjust tone' },
]

export const BLOCK_TYPE_LABELS: Record<BlockType, string> = {
  paragraph: 'Paragraph',
  heading: 'Heading',
  list: 'List',
  image: 'Image',
  media: 'Media',
}
