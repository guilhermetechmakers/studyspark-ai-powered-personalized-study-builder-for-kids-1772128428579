import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Eye, EyeOff } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { TermsConsent } from './terms-consent'
import { PasswordStrengthMeter, getPasswordStrength } from './password-strength-meter'

const signupSchema = z
  .object({
    name: z.string().min(1, 'Name is required'),
    email: z.string().email('Please enter a valid email'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string(),
    acceptTerms: z.boolean().refine((v) => v === true, 'You must accept the terms'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })

export type SignUpFormData = z.infer<typeof signupSchema>

export interface SignUpFormProps {
  onSubmit: (data: SignUpFormData) => Promise<{ onboardingRequired: boolean }>
}

export function SignUpForm({ onSubmit }: SignUpFormProps) {
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

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
  const strength = getPasswordStrength(password)

  const handleSubmit = form.handleSubmit(async (data) => {
    setIsLoading(true)
    form.clearErrors('root')
    try {
      const result = await onSubmit({
        name: data.name,
        email: data.email,
        password: data.password,
        confirmPassword: data.confirmPassword,
        acceptTerms: data.acceptTerms,
      })
      if (!result?.onboardingRequired) {
        // Will be handled by parent (redirect)
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Something went wrong'
      form.setError('root', { message: msg })
    } finally {
      setIsLoading(false)
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
        <Label htmlFor="signup-name">Name</Label>
        <Input
          id="signup-name"
          type="text"
          placeholder="Your name"
          autoComplete="name"
          aria-invalid={Boolean(form.formState.errors.name)}
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
        <Label htmlFor="signup-password">Password</Label>
        <div className="relative">
          <Input
            id="signup-password"
            type={showPassword ? 'text' : 'password'}
            placeholder="At least 8 characters"
            autoComplete="new-password"
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
        <PasswordStrengthMeter password={password} />
        <p className="text-xs text-muted-foreground">
          Use 8+ characters, mix of letters, numbers, and symbols.
        </p>
        {form.formState.errors.password && (
          <p className="text-sm text-destructive" role="alert">
            {form.formState.errors.password.message}
          </p>
        )}
      </div>
      <div className="space-y-2">
        <Label htmlFor="signup-confirm">Confirm password</Label>
        <Input
          id="signup-confirm"
          type={showPassword ? 'text' : 'password'}
          placeholder="Confirm your password"
          autoComplete="new-password"
          aria-invalid={Boolean(form.formState.errors.confirmPassword)}
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
      />
      <Button
        type="submit"
        className="w-full"
        disabled={isLoading || strength < 1}
      >
        {isLoading ? 'Creating account...' : 'Create account'}
      </Button>
    </form>
  )
}
