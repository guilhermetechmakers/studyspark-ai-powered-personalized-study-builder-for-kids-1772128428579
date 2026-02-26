import { useState } from 'react'
import { Chrome, Apple, Facebook } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { signInWithOAuth } from '@/api/auth'
import { cn } from '@/lib/utils'

const PROVIDERS = [
  { id: 'google' as const, label: 'Google', icon: Chrome },
  { id: 'apple' as const, label: 'Apple', icon: Apple },
  { id: 'facebook' as const, label: 'Facebook', icon: Facebook },
] as const

export interface SocialAuthButtonsProps {
  onError?: (message: string) => void
  disabled?: boolean
  className?: string
}

export function SocialAuthButtons({ onError, disabled = false, className }: SocialAuthButtonsProps) {
  const [loadingProvider, setLoadingProvider] = useState<string | null>(null)

  const handleOAuth = async (provider: 'google' | 'apple' | 'facebook') => {
    setLoadingProvider(provider)
    try {
      await signInWithOAuth(provider)
    } catch (err) {
      const msg = err instanceof Error ? err.message : `${provider} sign-in failed`
      onError?.(msg)
    } finally {
      setLoadingProvider(null)
    }
  }

  return (
    <div className={cn('space-y-4', className)}>
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <Separator className="w-full" />
        </div>
        <p className="relative flex justify-center text-xs uppercase text-muted-foreground">
          <span className="bg-card px-2">Or continue with</span>
        </p>
      </div>
      <div className="grid grid-cols-3 gap-2">
        {(PROVIDERS ?? []).map(({ id, label, icon: Icon }) => (
          <Button
            key={id}
            type="button"
            variant="outline"
            size="default"
            disabled={disabled || loadingProvider !== null}
            onClick={() => handleOAuth(id)}
            className="h-11 transition-all duration-200 hover:scale-[1.02] hover:shadow-md active:scale-[0.98]"
            aria-label={`Sign in with ${label}`}
          >
            {loadingProvider === id ? (
              <span className="h-4 w-4 animate-pulse rounded-full bg-muted-foreground/30" aria-hidden />
            ) : (
              <Icon className="h-5 w-5" aria-hidden />
            )}
          </Button>
        ))}
      </div>
    </div>
  )
}
