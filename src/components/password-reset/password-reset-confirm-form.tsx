import { useState, useCallback } from 'react'
import { Eye, EyeOff } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { updatePassword } from '@/api/auth'
import { TokenStatusBanner } from './token-status-banner'
import { PasswordStrengthIndicator } from './password-strength-indicator'
import {
  isPasswordValid,
  doPasswordsMatch,
} from '@/lib/validation'

export interface PasswordResetConfirmFormProps {
  isTokenValid: boolean
  tokenExpiresIn?: string
  onSuccess?: () => void
  onError?: (error: Error) => void
}

export function PasswordResetConfirmForm({
  isTokenValid,
  tokenExpiresIn,
  onSuccess,
  onError,
}: PasswordResetConfirmFormProps) {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string>('')

  const passwordValid = isPasswordValid(password)
  const passwordsMatch = doPasswordsMatch(password, confirmPassword)
  const canSubmit =
    isTokenValid &&
    passwordValid &&
    passwordsMatch &&
    (confirmPassword?.length ?? 0) > 0 &&
    !isSubmitting

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault()
      if (!canSubmit) return
      setIsSubmitting(true)
      setError('')
      try {
        await updatePassword(password)
        onSuccess?.()
      } catch (err) {
        const msg =
          err instanceof Error ? err.message : 'Something went wrong. Please try again.'
        setError(msg)
        onError?.(err instanceof Error ? err : new Error(msg))
      } finally {
        setIsSubmitting(false)
      }
    },
    [canSubmit, password, onSuccess, onError]
  )

  if (!isTokenValid) {
    return (
      <div className="space-y-4">
        <TokenStatusBanner isValid={false} />
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <TokenStatusBanner isValid={true} expiresIn={tokenExpiresIn} />

      <div className="space-y-2">
        <Label htmlFor="new-password">New password</Label>
        <div className="relative">
          <Input
            id="new-password"
            type={showPassword ? 'text' : 'password'}
            placeholder="At least 8 characters"
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            aria-invalid={password.length > 0 && !passwordValid}
            className="pr-10"
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded p-1"
            aria-label={showPassword ? 'Hide password' : 'Show password'}
            tabIndex={0}
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
        <PasswordStrengthIndicator password={password} />
        <p className="text-xs text-muted-foreground">
          Use at least 8 characters with uppercase, lowercase, and numbers.
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="confirm-password">Confirm password</Label>
        <div className="relative">
          <Input
            id="confirm-password"
            type={showConfirmPassword ? 'text' : 'password'}
            placeholder="Re-enter your password"
            autoComplete="new-password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            aria-invalid={
              confirmPassword.length > 0 && !doPasswordsMatch(password, confirmPassword)
            }
            className="pr-10"
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword((v) => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded p-1"
            aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
            tabIndex={0}
          >
            {showConfirmPassword ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </button>
        </div>
        {confirmPassword.length > 0 && !passwordsMatch && (
          <p className="text-sm text-destructive" role="alert">
            Passwords do not match
          </p>
        )}
      </div>

      {error && (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      )}

      <Button
        type="submit"
        className="w-full rounded-full"
        disabled={!canSubmit}
        aria-busy={isSubmitting}
      >
        {isSubmitting ? 'Updating...' : 'Set new password'}
      </Button>
    </form>
  )
}
