/**
 * Search utilities - Safe helpers for search results.
 */

import type { ResultItem } from '@/types/search'

/** Safe map for arrays - returns [] if items is null/undefined */
export function safeMap<T, U>(items: T[] | null | undefined, fn: (item: T) => U): U[] {
  const list = items ?? []
  return Array.isArray(list) ? list.map(fn) : []
}

/** Safe filter for arrays */
export function safeFilter<T>(items: T[] | null | undefined, fn: (item: T) => boolean): T[] {
  const list = items ?? []
  return Array.isArray(list) ? list.filter(fn) : []
}

/** Format date for display */
export function formatDate(iso: string): string {
  try {
    const d = new Date(iso)
    return d.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  } catch {
    return ''
  }
}

/** Highlight search snippet - wraps matching terms in <mark> */
export function highlightSnippet(text: string, query: string): string {
  if (!text || !query?.trim()) return text
  const q = query.trim().toLowerCase()
  const parts = text.split(new RegExp(`(${escapeRegex(q)})`, 'gi'))
  return parts
    .map((p) => (p.toLowerCase() === q ? `<mark class="bg-accent/30 rounded px-0.5">${p}</mark>` : p))
    .join('')
}

function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

/** Ensure ResultItem array is safe */
export function asResultItems(data: unknown): ResultItem[] {
  const list = data ?? []
  return Array.isArray(list) ? (list as ResultItem[]) : []
}
