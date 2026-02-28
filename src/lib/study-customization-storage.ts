/**
 * Persists study customization (theme, cards, gamification) per study.
 * Uses localStorage; can be extended to Supabase later.
 */

import type {
  StudyCustomization,
  StudyTheme,
  StudyCard,
  StudyGamification,
} from '@/types/study-customization'
import {
  DEFAULT_THEME,
  DEFAULT_GAMIFICATION,
} from '@/types/study-customization'

const STORAGE_KEY_PREFIX = 'studyspark-study-custom-'

function storageKey(studyId: string): string {
  return `${STORAGE_KEY_PREFIX}${studyId}`
}

export function loadStudyCustomization(studyId: string): StudyCustomization | null {
  if (!studyId) return null
  try {
    const raw = localStorage.getItem(storageKey(studyId))
    if (!raw) return null
    const parsed = JSON.parse(raw) as StudyCustomization
    return {
      theme: parsed.theme ?? DEFAULT_THEME,
      cards: Array.isArray(parsed.cards) ? parsed.cards : [],
      gamification: parsed.gamification ?? DEFAULT_GAMIFICATION,
      isLocked: parsed.isLocked ?? false,
    }
  } catch {
    return null
  }
}

export function saveStudyCustomization(
  studyId: string,
  customization: Partial<StudyCustomization>
): void {
  if (!studyId) return
  const existing = loadStudyCustomization(studyId)
  const merged: StudyCustomization = {
    theme: customization.theme ?? existing?.theme ?? DEFAULT_THEME,
    cards: customization.cards ?? existing?.cards ?? [],
    gamification: customization.gamification ?? existing?.gamification ?? DEFAULT_GAMIFICATION,
    isLocked: customization.isLocked ?? existing?.isLocked ?? false,
  }
  try {
    localStorage.setItem(storageKey(studyId), JSON.stringify(merged))
  } catch {
    // Storage full or unavailable
  }
}

export function updateStudyTheme(studyId: string, theme: Partial<StudyTheme>): void {
  const existing = loadStudyCustomization(studyId)
  const merged: StudyTheme = {
    ...(existing?.theme ?? DEFAULT_THEME),
    ...theme,
  }
  saveStudyCustomization(studyId, { ...existing, theme: merged })
}

export function updateStudyCards(studyId: string, cards: StudyCard[]): void {
  const existing = loadStudyCustomization(studyId)
  saveStudyCustomization(studyId, { ...existing, cards })
}

export function updateStudyGamification(
  studyId: string,
  gamification: Partial<StudyGamification>
): void {
  const existing = loadStudyCustomization(studyId)
  const merged: StudyGamification = {
    ...(existing?.gamification ?? DEFAULT_GAMIFICATION),
    ...gamification,
  }
  saveStudyCustomization(studyId, { ...existing, gamification: merged })
}
