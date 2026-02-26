/**
 * Password strength calculation and validation.
 * Min 8 chars, mix of types (uppercase, lowercase, number, symbol).
 */

export type PasswordStrength = 0 | 1 | 2 | 3 | 4

export function getPasswordStrength(password: string): PasswordStrength {
  if (!password?.length) return 0
  let score = 0
  if (password.length >= 8) score++
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++
  if (/\d/.test(password)) score++
  if (/[^a-zA-Z0-9]/.test(password)) score++
  return Math.min(4, score) as PasswordStrength
}

export function getStrengthLabel(strength: PasswordStrength): string {
  const labels: Record<PasswordStrength, string> = {
    0: 'Too short',
    1: 'Weak',
    2: 'Fair',
    3: 'Good',
    4: 'Strong',
  }
  return labels[strength] ?? 'Weak'
}

export function isPasswordValid(password: string): boolean {
  return (
    password.length >= 8 &&
    /[a-z]/.test(password) &&
    /[A-Z]/.test(password) &&
    /\d/.test(password)
  )
}
