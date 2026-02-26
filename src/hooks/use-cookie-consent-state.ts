import { useState, useCallback } from 'react'
import type { CookieCategory } from '@/types/cookie-policy'
import {
  COOKIE_CONSENT_STORAGE_KEY,
  DEFAULT_CATEGORIES,
} from '@/types/cookie-policy'

function loadPersistedCategories(): CookieCategory[] {
  try {
    const raw = localStorage.getItem(COOKIE_CONSENT_STORAGE_KEY)
    if (!raw) return DEFAULT_CATEGORIES

    const parsed = JSON.parse(raw) as unknown
    if (!parsed || typeof parsed !== 'object') return DEFAULT_CATEGORIES

    const data = parsed as { categories?: unknown }
    const categories = data?.categories

    if (!Array.isArray(categories)) return DEFAULT_CATEGORIES

    const validated: CookieCategory[] = (categories ?? []).map((item) => {
      if (!item || typeof item !== 'object') return null
      const c = item as Record<string, unknown>
      const id = typeof c.id === 'string' ? c.id : ''
      const label = typeof c.label === 'string' ? c.label : ''
      const description = typeof c.description === 'string' ? c.description : ''
      const required = c.required === true
      const enabled = typeof c.enabled === 'boolean' ? c.enabled : false

      const defaultCat = DEFAULT_CATEGORIES.find((d) => d.id === id)
      if (!defaultCat) return null

      return {
        id: defaultCat.id,
        label: defaultCat.label,
        description: defaultCat.description,
        required: defaultCat.required,
        enabled: required ? true : enabled,
      }
    }).filter((c): c is CookieCategory => c !== null)

    if (validated.length === 0) return DEFAULT_CATEGORIES

    const merged = DEFAULT_CATEGORIES.map((d) => {
      const found = validated.find((v) => v.id === d.id)
      return found ?? d
    })

    return merged
  } catch {
    return DEFAULT_CATEGORIES
  }
}

function persistCategories(categories: CookieCategory[]): void {
  try {
    const safe = Array.isArray(categories) ? categories : []
    localStorage.setItem(
      COOKIE_CONSENT_STORAGE_KEY,
      JSON.stringify({ categories: safe })
    )
  } catch {
    // ignore storage errors
  }
}

export function useCookieConsentState() {
  const [categories, setCategories] = useState<CookieCategory[]>(
    () => loadPersistedCategories()
  )

  const setCategoriesSafe = useCallback((updater: (prev: CookieCategory[]) => CookieCategory[]) => {
    setCategories((prev) => {
      const safe = Array.isArray(prev) ? prev : []
      const next = updater(safe)
      return Array.isArray(next) ? next : safe
    })
  }, [])

  const saveConsent = useCallback(() => {
    setCategories((prev) => {
      const safe = Array.isArray(prev) ? prev : []
      persistCategories(safe)
      return safe
    })
  }, [])

  const revokeConsent = useCallback(() => {
    const defaults = DEFAULT_CATEGORIES.map((d) => ({
      ...d,
      enabled: d.required === true,
    }))
    setCategories(defaults)
    persistCategories(defaults)
  }, [])

  const updateCategory = useCallback((id: string, enabled: boolean) => {
    setCategoriesSafe((prev) =>
      prev.map((c) => (c.id === id ? { ...c, enabled } : c))
    )
  }, [setCategoriesSafe])

  return {
    categories,
    setCategories: setCategoriesSafe,
    updateCategory,
    saveConsent,
    revokeConsent,
  }
}
