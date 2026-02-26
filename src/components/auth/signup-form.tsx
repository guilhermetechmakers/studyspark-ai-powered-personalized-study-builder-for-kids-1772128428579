import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Eye, EyeOff } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { TermsConsent } from './terms-consent'
import {
  getPasswordStrength,
  getStrengthLabel,
  isPasswordValid,
  type PasswordStrength,
} from '@/lib/password-strength'
import { cn } from '@/lib/utils'

const signupSchema = z
  .object({
    name: z.string().min(1, 'Name is required'),
    email: z.string().email('Please enter a valid email'),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .refine(isPasswordValid, {
        message: 'Password needs uppercase, lowercase, and a number',
      }),
    confirmPassword: z.string(),
    acceptTerms: z.boolean().refine((v) => v === true, 'You must accept the terms'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })

export type SignUpFormData = z.infer<typeof signupSchema>

export interface SignUpFormProps {
  onSubmit: (data: SignUpFormData) => Promise<void>
  isLoading?: boolean
}

export function SignUpForm({ onSubmit, isLoading = false }: SignUpFormProps) {
  const [showPassword, setShowPassword] = useState(false)

  const form = useForm<SignUpFormData>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      acceptTerms: false,
    },
  })

  const password = form.watch('password') ?? ''
  const strength: PasswordStrength = getPasswordStrength(password)

  const handleSubmit = async (data: SignUpFormData) => {
    try {
      await onSubmit(data)
    } catch (err) {
      form.setError('root', {
        message: err instanceof Error ? err.message : 'Something went wrong',
      })
    }
  }

  return (
    <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="signup-name">Name</Label>
        <Input
          id="signup-name"
          type="text"
          placeholder="Your name"
          autoComplete="name"
          aria-invalid={!!form.formState.errors.name}
          {...form.register('name')}
        />
        {form.formState.errors.name && (
          <p className="text-sm text-destructive" role="alert">
            {form.formState.errors.name.message}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="signup-email">Email</Label>
        <Input
          id="signup-email"
          type="email"
          placeholder="you@example.com"
          autoComplete="email"
          aria-invalid={!!form.formState.errors.email}
          {...form.register('email')}
        />
        {form.formState.errors.email && (
          <p className="text-sm text-destructive" role="alert">
            {form.formState.errors.email.message}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="signup-password">Password</Label>
        <div className="relative">
          <Input
            id="signup-password"
            type={showPassword ? 'text' : 'password'}
            placeholder="At least 8 characters, mix of types"
            autoComplete="new-password"
            aria-invalid={!!form.formState.errors.password}
            className="pr-10"
            {...form.register('password')}
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded"
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
        {form.formState.errors.password && (
          <p className="text-sm text-destructive" role="alert">
            {form.formState.errors.password.message}
          </p>
        )}
        {password.length > 0 && (
          <div className="space-y-1">
            <div className="flex gap-1">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className={cn(
                    'h-1 flex-1 rounded-full transition-colors',
                    i <= strength
                      ? strength <= 1
                        ? 'bg-destructive'
                        : strength <= 2
                          ? 'bg-amber-500'
                          : strength <= 3
                            ? 'bg-yellow-500'
                            : 'bg-green-500'
                      : 'bg-muted'
                  )}
                />
              ))}
            </div>
            <p className="text-xs text-muted-foreground">
              {getStrengthLabel(strength)} • 8+ chars, uppercase, lowercase, number
            </p>
          </div>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="signup-confirm">Confirm password</Label>
        <Input
          id="signup-confirm"
          type={showPassword ? 'text' : 'password'}
          placeholder="Confirm your password"
          autoComplete="new-password"
          aria-invalid={!!form.formState.errors.confirmPassword}
          {...form.register('confirmPassword')}
        />
        {form.formState.errors.confirmPassword && (
          <p className="text-sm text-destructive" role="alert">
            {form.formState.errors.confirmPassword.message}
          </p>
        )}
      </div>

      <TermsConsent
        id="signup-terms"
        checked={form.watch('acceptTerms')}
        onCheckedChange={(v) => form.setValue('acceptTerms', v)}
        error={form.formState.errors.acceptTerms?.message}
        disabled={isLoading}
      />

      {form.formState.errors.root && (
        <p className="text-sm text-destructive" role="alert">
          {form.formState.errors.root.message}
        </p>
      )}

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? 'Creating account...' : 'Create account'}
      </Button>
    </form>
  )
}
