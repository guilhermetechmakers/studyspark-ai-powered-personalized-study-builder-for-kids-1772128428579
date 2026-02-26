/**
 * Validation utilities for forms.
 * Email, password strength, and cross-field validation.
 * RFC5322 basic pattern for email; null-safe.
 */

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function isValidEmail(value: string): boolean {
  const trimmed = (value ?? '').trim()
  if (!trimmed) return false
  return EMAIL_REGEX.test(trimmed)
}

export function normalizeEmail(value: string): string {
  return (value ?? '').trim().toLowerCase()
}

export type PasswordStrength = 0 | 1 | 2 | 3 | 4

export function getPasswordStrength(password: string): PasswordStrength {
  if (!password?.length) return 0
  let score = 0
  if (password.length >= 8) score++
  if (password.length >= 12) score++
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++
  if (/\d/.test(password)) score++
  if (/[^a-zA-Z0-9]/.test(password)) score++
  return Math.min(4, Math.max(1, Math.ceil(score / 1.25))) as PasswordStrength
}

export function getStrengthLabel(strength: PasswordStrength): string {
  const labels: Record<PasswordStrength, string> = {
    0: 'Enter a password',
    1: 'Weak',
    2: 'Fair',
    3: 'Good',
    4: 'Strong',
  }
  return labels[strength] ?? 'Weak'
}

export function isPasswordValid(password: string): boolean {
  return (
    (password?.length ?? 0) >= 8 &&
    /[a-z]/.test(password ?? '') &&
    /[A-Z]/.test(password ?? '') &&
    /\d/.test(password ?? '')
  )
}

export function doPasswordsMatch(password: string, confirmPassword: string): boolean {
  const p = password ?? ''
  const c = confirmPassword ?? ''
  return p.length > 0 && p === c
}
