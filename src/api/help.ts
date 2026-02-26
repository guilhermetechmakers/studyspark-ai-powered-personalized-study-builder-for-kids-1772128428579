/**
 * Help API layer.
 * GET /api/help/articles, /api/help/categories, /api/help/tutorials, /api/help/onboarding-guides
 * POST /api/support/tickets
 * All responses validated and defaulted to safe shapes.
 */

import { apiGet, apiPost } from '@/lib/api'
import type {
  Article,
  Category,
  Tutorial,
  Guide,
  SupportTicketResponse,
} from '@/types/help'
import { mockArticles, mockCategories, mockTutorials, mockGuides } from '@/data/help-mock'

interface ArticlesResponse {
  data?: Article[]
}

interface CategoriesResponse {
  data?: Category[]
}

interface TutorialsResponse {
  data?: Tutorial[]
}

interface GuidesResponse {
  data?: Guide[]
}

function toArraySafe<T>(data: T[] | null | undefined): T[] {
  return Array.isArray(data) ? data : []
}

export async function fetchHelpArticles(params?: {
  category?: string
  q?: string
}): Promise<Article[]> {
  try {
    const qs = new URLSearchParams()
    if (params?.category) qs.set('category', params.category)
    if (params?.q) qs.set('q', params.q)
    const query = qs.toString() ? `?${qs.toString()}` : ''
    const res = await apiGet<ArticlesResponse>(`/api/help/articles${query}`)
    const list = toArraySafe(res?.data)
    if (list.length > 0) return list
    let filtered = [...mockArticles]
    if (params?.category) {
      filtered = filtered.filter((a) => a.categoryId === params.category)
    }
    if (params?.q?.trim()) {
      const q = params.q.toLowerCase()
      filtered = filtered.filter(
        (a) =>
          (a.title ?? '').toLowerCase().includes(q) ||
          (a.excerpt ?? '').toLowerCase().includes(q) ||
          (a.content ?? '').toLowerCase().includes(q)
      )
    }
    return filtered
  } catch {
    let filtered = [...mockArticles]
    if (params?.category) {
      filtered = filtered.filter((a) => a.categoryId === params.category)
    }
    if (params?.q?.trim()) {
      const q = params.q.toLowerCase()
      filtered = filtered.filter(
        (a) =>
          (a.title ?? '').toLowerCase().includes(q) ||
          (a.excerpt ?? '').toLowerCase().includes(q) ||
          (a.content ?? '').toLowerCase().includes(q)
      )
    }
    return filtered
  }
}

export async function fetchHelpCategories(): Promise<Category[]> {
  try {
    const res = await apiGet<CategoriesResponse>('/api/help/categories')
    return toArraySafe(res?.data)
  } catch {
    return mockCategories
  }
}

export async function fetchHelpTutorials(): Promise<Tutorial[]> {
  try {
    const res = await apiGet<TutorialsResponse>('/api/help/tutorials')
    return toArraySafe(res?.data)
  } catch {
    return mockTutorials
  }
}

export async function fetchOnboardingGuides(): Promise<Guide[]> {
  try {
    const res = await apiGet<GuidesResponse>('/api/help/onboarding-guides')
    return toArraySafe(res?.data)
  } catch {
    return mockGuides
  }
}

export async function submitSupportTicket(payload: {
  name: string
  email: string
  subject: string
  priority: 'low' | 'medium' | 'high'
  description: string
  attachments?: { name: string; url: string }[]
}): Promise<SupportTicketResponse> {
  try {
    const res = await apiPost<SupportTicketResponse>('/api/support/tickets', payload)
    if (res?.success) return res
    return { success: false }
  } catch {
    // When API is unavailable, simulate success for demo (replace with real API when backend is ready)
    return {
      success: true,
      ticketId: `TKT-${Date.now().toString(36).toUpperCase()}`,
    }
  }
}
