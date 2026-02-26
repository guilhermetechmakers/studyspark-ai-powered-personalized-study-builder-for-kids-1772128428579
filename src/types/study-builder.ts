/**
 * Study Builder API types.
 * Aligned with AI Generation Engine spec; supports runtime safety.
 */

import type { AIOutputBlock } from '@/types/study-wizard'

export interface PrepareStudyRequest {
  topic: string
  subject?: string
  contextNotes?: string
  uploadedMaterials?: { id: string; type: string; sourceUrl?: string; metadata?: Record<string, unknown> }[]
  childProfile: { id: string; age: number; grade: string; learningPreferences?: string[] }
  learningStyle: string
}

export interface PrepareStudyResponse {
  studyId: string
  contextBlocks: { id: string; type: string; content: string }[]
  topicTags: string[]
}

export interface GenerateStudyRequest {
  studyId: string
  promptOverrides?: Record<string, string>
  versioningFlags?: { createVersion?: boolean }
}

export interface StreamChunk {
  type: 'progress' | 'block' | 'complete' | 'error'
  stage?: string
  progressPct?: number
  block?: AIOutputBlock
  content?: string
  error?: string
}

export interface ReviseStudyRequest {
  studyId: string
  revisionPrompt: string
}

export interface ReviseStudyResponse {
  studyId: string
  blocks: AIOutputBlock[]
  version: number
}

export interface VersionMetadata {
  id: string
  studyId: string
  versionNumber: number
  createdAt: string
}

export interface VersionDetail {
  id: string
  studyId: string
  versionNumber: number
  contentSnapshot: { blocks?: AIOutputBlock[] }
  diffs?: Record<string, unknown>
  createdAt: string
}

export interface ApproveStudyResponse {
  studyId: string
  status: 'ready'
  exportUrl?: string
}

export interface ModerationResult {
  status: 'passed' | 'flagged'
  issues: { type: string; message: string }[]
}

export interface QuotaInfo {
  usedCount: number
  limit: number
  windowEnd: string
}
