'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import { Lightbulb } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const DEFAULT_COOLDOWN_MS = 30_000

interface HintSystemProps {
  hint: string | null | undefined
  onUse?: () => void
  cooldownMs?: number
  disabled?: boolean
  className?: string
}

export function HintSystem({
  hint,
  onUse,
  cooldownMs = DEFAULT_COOLDOWN_MS,
  disabled = false,
  className,
}: HintSystemProps) {
  const [showHint, setShowHint] = useState(false)
  const [cooldownRemaining, setCooldownRemaining] = useState(0)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const handleShowHint = useCallback(() => {
    if (!hint?.trim() || disabled) return
    setShowHint(true)
    onUse?.()
    setCooldownRemaining(cooldownMs)
  }, [hint, disabled, onUse, cooldownMs])

  useEffect(() => {
    if (cooldownRemaining <= 0) return
    const id = setInterval(() => {
      setCooldownRemaining((r) => Math.max(0, r - 1000))
    }, 1000)
    intervalRef.current = id
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [cooldownRemaining])

  if (!hint?.trim()) return null

  const hasHintAvailable = cooldownRemaining === 0
  const cooldownSec = Math.ceil(cooldownRemaining / 1000)

  return (
    <div className={cn('space-y-2', className)}>
      <Button
        variant="ghost"
        size="sm"
        onClick={handleShowHint}
        disabled={disabled || !hasHintAvailable}
        className="gap-2 rounded-xl"
        aria-label={showHint ? 'Hint shown' : hasHintAvailable ? 'Show hint' : `Hint available in ${cooldownSec}s`}
      >
        <Lightbulb className="h-4 w-4" />
        {hasHintAvailable ? 'Hint' : `Hint (${cooldownSec}s)`}
      </Button>
      {showHint && (
        <div
          className="animate-fade-in rounded-xl border border-primary/30 bg-primary/5 p-4"
          role="status"
          aria-live="polite"
        >
          <p className="text-sm text-foreground">{hint}</p>
        </div>
      )}
    </div>
  )
}
