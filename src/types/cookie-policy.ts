export interface CookieCategory {
  id: string
  label: string
  description: string
  required?: boolean
  enabled: boolean
}

export interface ConsentState {
  categories: CookieCategory[]
}

export const COOKIE_CONSENT_STORAGE_KEY = 'studyspark-cookie-consent'

export const DEFAULT_CATEGORIES: CookieCategory[] = [
  {
    id: 'essential',
    label: 'Essential',
    description:
      'Required for authentication, security, and core functionality. These cookies cannot be disabled.',
    required: true,
    enabled: true,
  },
  {
    id: 'analytics',
    label: 'Analytics',
    description:
      'Help us understand how you use StudySpark so we can improve the experience. These cookies collect anonymous usage data.',
    required: false,
    enabled: false,
  },
  {
    id: 'advertising',
    label: 'Advertising',
    description:
      'Used to deliver relevant content and measure ad effectiveness. These cookies may track your activity across sites.',
    required: false,
    enabled: false,
  },
]
