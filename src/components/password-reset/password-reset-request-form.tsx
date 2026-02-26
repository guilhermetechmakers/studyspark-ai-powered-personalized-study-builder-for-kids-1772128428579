import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { requestPasswordReset } from '@/api/auth'
import { SuccessModal } from './success-modal'
import { isValidEmail } from '@/lib/validation'

const schema = z.object({
  email: z.string().min(1, 'Email is required').email('Please enter a valid email'),
})

type FormData = z.infer<typeof schema>

export interface PasswordResetRequestFormProps {
  onSuccess?: (tokenSent?: boolean) => void
  onError?: (error: Error) => void
}

export function PasswordResetRequestForm({ onSuccess, onError }: PasswordResetRequestFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string>('')
  const [showSuccessModal, setShowSuccessModal] = useState(false)

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { email: '' },
  })

  const email = form.watch('email') ?? ''
  const isEmailValid = isValidEmail(email)

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true)
    setError('')
    try {
      await requestPasswordReset(data.email.trim().toLowerCase())
      setShowSuccessModal(true)
      onSuccess?.(true)
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Something went wrong. Please try again.'
      setError(msg)
      onError?.(err instanceof Error ? err : new Error(msg))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="reset-email">Email</Label>
          <Input
            id="reset-email"
            type="email"
            placeholder="you@example.com"
            autoComplete="email"
            aria-invalid={Boolean(form.formState.errors.email)}
            aria-describedby={form.formState.errors.email ? 'reset-email-error' : undefined}
            {...form.register('email')}
          />
          <p id="reset-email-helper" className="text-xs text-muted-foreground">
            Enter the email address associated with your account.
          </p>
          {form.formState.errors.email && (
            <p id="reset-email-error" className="text-sm text-destructive" role="alert">
              {form.formState.errors.email.message}
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
          disabled={isSubmitting || !isEmailValid}
          aria-busy={isSubmitting}
        >
          {isSubmitting ? 'Sending...' : 'Send reset link'}
        </Button>
      </form>

      <SuccessModal
        open={showSuccessModal}
        onOpenChange={setShowSuccessModal}
      />
    </>
  )
}
