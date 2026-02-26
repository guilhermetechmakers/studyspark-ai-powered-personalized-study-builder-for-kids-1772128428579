import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Eye, EyeOff } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { PasswordResetLink } from './password-reset-link'
import { PasswordStrengthMeter } from './password-strength-meter'
import { getRememberMe, setRememberMe } from '@/lib/supabase'

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email'),
  password: z.string().min(1, 'Password is required'),
  rememberMe: z.boolean().optional(),
})

export type LoginFormData = z.infer<typeof loginSchema>

export interface EmailAuthFormProps {
  mode: 'login' | 'signup'
  onSubmit: (data: LoginFormData) => Promise<void>
  isLoading?: boolean
  showPasswordStrength?: boolean
  showPasswordReset?: boolean
}

export function EmailAuthForm({
  mode,
  onSubmit,
  isLoading = false,
  showPasswordStrength = false,
  showPasswordReset = true,
}: EmailAuthFormProps) {
  const [showPassword, setShowPassword] = useState(false)

  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '', rememberMe: getRememberMe() },
  })

  const password = form.watch('password') ?? ''

  const handleSubmit = form.handleSubmit(async (data) => {
    try {
      if (mode === 'login') {
        setRememberMe(data.rememberMe ?? true)
      }
      await onSubmit(data)
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Something went wrong'
      form.setError('root', { message: msg })
    }
  })

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {form.formState.errors.root && (
        <p className="text-sm text-destructive" role="alert">
          {form.formState.errors.root.message}
        </p>
      )}
      <div className="space-y-2">
        <Label htmlFor="auth-email">Email</Label>
        <Input
          id="auth-email"
          type="email"
          placeholder="you@example.com"
          autoComplete="email"
          aria-invalid={Boolean(form.formState.errors.email)}
          {...form.register('email')}
        />
        {form.formState.errors.email && (
          <p className="text-sm text-destructive" role="alert">
            {form.formState.errors.email.message}
          </p>
        )}
      </div>
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="auth-password">Password</Label>
          {mode === 'login' && showPasswordReset && <PasswordResetLink />}
        </div>
        <div className="relative">
          <Input
            id="auth-password"
            type={showPassword ? 'text' : 'password'}
            placeholder={mode === 'signup' ? 'At least 8 characters' : '••••••••'}
            autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
            aria-invalid={Boolean(form.formState.errors.password)}
            className="pr-10"
            {...form.register('password')}
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded p-1"
            aria-label={showPassword ? 'Hide password' : 'Show password'}
            tabIndex={-1}
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
        {showPasswordStrength && (
          <PasswordStrengthMeter password={password} />
        )}
        {form.formState.errors.password && (
          <p className="text-sm text-destructive" role="alert">
            {form.formState.errors.password.message}
          </p>
        )}
      </div>
      {mode === 'login' && (
        <div className="flex items-center gap-2">
          <Checkbox
            id="auth-remember"
            checked={form.watch('rememberMe') ?? true}
            onCheckedChange={(v) => form.setValue('rememberMe', v === true)}
            aria-describedby="auth-remember-desc"
            className="rounded"
          />
          <Label
            htmlFor="auth-remember"
            id="auth-remember-desc"
            className="text-sm font-normal cursor-pointer"
          >
            Remember me
          </Label>
        </div>
      )}
      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? (mode === 'login' ? 'Signing in...' : 'Creating account...') : mode === 'login' ? 'Log in' : 'Create account'}
      </Button>
    </form>
  )
}
