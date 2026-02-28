/**
 * Study customization types - Parent-controlled theme, content, and gamification.
 * Persisted per study.
 */

export interface StudyTheme {
  primary: string
  secondary: string
  background: string
}

export interface StudyCard {
  id: string
  question: string
  answer: string
  imageUrl?: string
  template?: string
}

export interface StudyGamification {
  score: number
  level: number
  badges: string[]
}

export interface StudyCustomization {
  theme: StudyTheme
  cards: StudyCard[]
  gamification: StudyGamification
  isLocked?: boolean
}

export const DEFAULT_THEME: StudyTheme = {
  primary: '91 87 165',
  secondary: '169 166 249',
  background: '255 249 242',
}

export const DEFAULT_GAMIFICATION: StudyGamification = {
  score: 0,
  level: 1,
  badges: [],
}

export const THEME_PRESETS: { id: string; label: string; theme: StudyTheme }[] = [
  { id: 'default', label: 'StudySpark', theme: DEFAULT_THEME },
  {
    id: 'ocean',
    label: 'Ocean',
    theme: {
      primary: '14 116 144',
      secondary: '56 189 248',
      background: '240 249 255',
    },
  },
  {
    id: 'forest',
    label: 'Forest',
    theme: {
      primary: '22 163 74',
      secondary: '134 239 172',
      background: '240 253 244',
    },
  },
  {
    id: 'sunset',
    label: 'Sunset',
    theme: {
      primary: '194 65 12',
      secondary: '251 146 60',
      background: '255 247 237',
    },
  },
  {
    id: 'lavender',
    label: 'Lavender',
    theme: {
      primary: '126 34 206',
      secondary: '192 132 252',
      background: '250 245 255',
    },
  },
]
