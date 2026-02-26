/**
 * Types for About / Help page.
 * Article, Category, Tutorial, Guide, SupportTicket.
 */

export interface Category {
  id: string
  name: string
  description?: string
}

export interface Article {
  id: string
  title: string
  excerpt: string
  content: string
  categoryId: string
  lastUpdated: string
}

export interface Tutorial {
  id: string
  title: string
  videoUrl: string
  thumbnailUrl?: string
  duration: string
  transcript?: string
}

export interface GuideStep {
  id: string
  title: string
  content: string
  tip?: string
}

export interface Guide {
  id: string
  title: string
  steps: GuideStep[]
  progress?: number
  printable?: boolean
}

export type SupportPriority = 'low' | 'medium' | 'high'

export interface SupportTicket {
  id?: string
  name: string
  email: string
  subject: string
  priority: SupportPriority
  description: string
  attachments?: string[]
  status?: string
  createdAt?: string
}

export interface SupportTicketResponse {
  success: boolean
  ticketId?: string
  message?: string
}
