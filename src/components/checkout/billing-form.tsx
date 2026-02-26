import { forwardRef, useEffect, useImperativeHandle } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'
import type { BillingDetails } from '@/types/checkout'

const billingSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  email: z.string().min(1, 'Email is required').email('Invalid email'),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  postalCode: z.string().optional(),
  country: z.string().optional(),
})

export type BillingFormValues = z.infer<typeof billingSchema>

export interface BillingFormRef {
  validateAndGetValues: () => Promise<BillingDetails | null>
}

export interface BillingFormProps {
  value?: Partial<BillingDetails>
  defaultValues?: Partial<BillingFormValues>
  onSubmit?: (data: BillingDetails) => void
  onChange?: (data: Partial<BillingDetails>) => void
  onValidationChange?: (isValid: boolean) => void
  disabled?: boolean
  className?: string
}

export const BillingForm = forwardRef<BillingFormRef, BillingFormProps>(function BillingForm({
  value,
  defaultValues,
  onSubmit,
  onChange,
  onValidationChange,
  disabled = false,
  className,
}, ref) {
  const {
    register,
    handleSubmit,
    watch,
    trigger,
    getValues,
    reset,
    formState: { errors, isValid },
  } = useForm<BillingFormValues>({
    resolver: zodResolver(billingSchema),
    mode: 'onChange',
    defaultValues: {
      name: value?.name ?? defaultValues?.name ?? '',
      email: value?.email ?? defaultValues?.email ?? '',
      address: value?.address ?? defaultValues?.address ?? '',
      city: defaultValues?.city ?? '',
      state: defaultValues?.state ?? '',
      postalCode: defaultValues?.postalCode ?? '',
      country: defaultValues?.country ?? '',
    },
  })

  useEffect(() => {
    if (value != null) {
      reset({
        name: value?.name ?? '',
        email: value?.email ?? '',
        address: value?.address ?? '',
        city: value?.city ?? '',
        state: value?.state ?? '',
        postalCode: value?.postalCode ?? '',
        country: value?.country ?? '',
      })
    }
  }, [value?.name, value?.email, value?.address, value?.city, value?.state, value?.postalCode, value?.country, reset])

  const watched = watch()
  useEffect(() => {
    if (!onChange) return
    onChange({
      name: watched.name ?? '',
      email: watched.email ?? '',
      address: watched.address,
      city: watched.city,
      state: watched.state,
      postalCode: watched.postalCode,
      country: watched.country,
    })
  }, [onChange, watched.name, watched.email, watched.address, watched.city, watched.state, watched.postalCode, watched.country])

  useEffect(() => {
    onValidationChange?.(isValid)
  }, [isValid, onValidationChange])

  useImperativeHandle(ref, () => ({
    async validateAndGetValues() {
      const ok = await trigger()
      if (!ok) return null
      const d = getValues()
      return {
        name: d.name ?? '',
        email: d.email ?? '',
        address: d.address,
        city: d.city,
        state: d.state,
        postalCode: d.postalCode,
        country: d.country,
      }
    },
  }), [trigger, getValues])

  return (
    <form
      id="billing-form"
      onSubmit={onSubmit ? handleSubmit((d) =>
        onSubmit({
          name: d.name ?? '',
          email: d.email ?? '',
          address: d.address,
          city: d.city,
          state: d.state,
          postalCode: d.postalCode,
          country: d.country,
        })
      ) : () => {}}
      className={cn('space-y-4', className)}
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="billing-name">Full name *</Label>
          <Input
            id="billing-name"
            placeholder="Jane Doe"
            {...register('name')}
            disabled={disabled}
            className={cn(
              'rounded-xl',
              errors.name && 'border-destructive focus-visible:ring-destructive'
            )}
            aria-invalid={!!errors.name}
            aria-describedby={errors.name ? 'name-error' : undefined}
          />
          {errors.name && (
            <p id="name-error" className="text-sm text-destructive" role="alert">
              {errors.name.message}
            </p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="billing-email">Email *</Label>
          <Input
            id="billing-email"
            type="email"
            placeholder="jane@example.com"
            {...register('email')}
            disabled={disabled}
            className={cn(
              'rounded-xl',
              errors.email && 'border-destructive focus-visible:ring-destructive'
            )}
            aria-invalid={!!errors.email}
            aria-describedby={errors.email ? 'email-error' : undefined}
          />
          {errors.email && (
            <p id="email-error" className="text-sm text-destructive" role="alert">
              {errors.email.message}
            </p>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="billing-address">Billing address (optional)</Label>
        <Input
          id="billing-address"
          placeholder="123 Main St"
          {...register('address')}
          disabled={disabled}
          className="rounded-xl"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="space-y-2">
          <Label htmlFor="billing-city">City</Label>
          <Input
            id="billing-city"
            placeholder="San Francisco"
            {...register('city')}
            disabled={disabled}
            className="rounded-xl"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="billing-state">State</Label>
          <Input
            id="billing-state"
            placeholder="CA"
            {...register('state')}
            disabled={disabled}
            className="rounded-xl"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="billing-postal">Postal code</Label>
          <Input
            id="billing-postal"
            placeholder="94102"
            {...register('postalCode')}
            disabled={disabled}
            className="rounded-xl"
          />
        </div>
      </div>
    </form>
  )
})
