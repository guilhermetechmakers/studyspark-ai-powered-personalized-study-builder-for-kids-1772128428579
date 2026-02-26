/**
 * Terms of Service content model - localization-ready structure.
 * All data access should use data ?? [] and Array.isArray checks.
 */

export type ToSBlockType = 'p' | 'ul' | 'ol' | 'h3'

export interface ToSBlock {
  type: ToSBlockType
  text?: string
  items?: string[]
}

export interface ToSSection {
  id: string
  title: string
  blocks: ToSBlock[]
  subsections?: ToSSection[]
}

export interface ToSContent {
  version: string
  effectiveDate: string
  sections: ToSSection[]
}
