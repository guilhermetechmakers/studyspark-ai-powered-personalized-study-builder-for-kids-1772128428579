'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import { Volume2, VolumeX, Minus, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const MIN_RATE = 0.5
const MAX_RATE = 2
const RATE_STEP = 0.1

interface ReadAloudControllerProps {
  text: string
  rate?: number
  pitch?: number
  disabled?: boolean
  preferredLanguage?: string
  showRateControl?: boolean
  className?: string
}

const DEFAULT_RATE = 0.9
const DEFAULT_PITCH = 1

export function ReadAloudController({
  text,
  rate: rateProp = DEFAULT_RATE,
  pitch = DEFAULT_PITCH,
  disabled = false,
  preferredLanguage = 'en-US',
  showRateControl = false,
  className,
}: ReadAloudControllerProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [rate, setRate] = useState(Math.max(MIN_RATE, Math.min(MAX_RATE, rateProp)))
  const synthRef = useRef<SpeechSynthesis | null>(null)
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null)

  const speak = useCallback(() => {
    if (!text?.trim() || typeof window === 'undefined' || !window.speechSynthesis) return
    const synth = window.speechSynthesis
    synthRef.current = synth
    synth.cancel()
    const utterance = new SpeechSynthesisUtterance(text.trim())
    utterance.rate = Math.max(0.5, Math.min(2, rate ?? DEFAULT_RATE))
    utterance.pitch = Math.max(0.5, Math.min(2, pitch ?? DEFAULT_PITCH))
    utterance.lang = preferredLanguage
    utterance.onend = () => setIsPlaying(false)
    utterance.onerror = () => setIsPlaying(false)
    utteranceRef.current = utterance
    synth.speak(utterance)
    setIsPlaying(true)
  }, [text, rate, pitch, preferredLanguage])

  const stop = useCallback(() => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel()
      setIsPlaying(false)
    }
  }, [])

  useEffect(() => {
    return () => {
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.cancel()
      }
    }
  }, [])

  const hasTTS = typeof window !== 'undefined' && 'speechSynthesis' in window

  if (!hasTTS || !text?.trim()) return null

  return (
    <div className={cn('flex flex-wrap items-center gap-2', className)} role="group" aria-label="Read aloud controls">
      {isPlaying ? (
        <Button
          variant="outline"
          size="sm"
          onClick={stop}
          disabled={disabled}
          aria-label="Stop reading"
          className="min-h-[44px] min-w-[44px] rounded-xl"
        >
          <VolumeX className="h-5 w-5" />
        </Button>
      ) : (
        <Button
          variant="outline"
          size="sm"
          onClick={speak}
          disabled={disabled}
          aria-label="Read aloud"
          className="min-h-[44px] min-w-[44px] rounded-xl transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
        >
          <Volume2 className="h-5 w-5" />
        </Button>
      )}
      {showRateControl && (
        <div className="flex items-center gap-1" aria-label="Speech rate">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setRate((r) => Math.max(MIN_RATE, r - RATE_STEP))}
            disabled={disabled || rate <= MIN_RATE}
            className="h-9 w-9 rounded-lg"
            aria-label="Decrease speed"
          >
            <Minus className="h-4 w-4" />
          </Button>
          <span className="min-w-[3ch] text-center text-sm text-muted-foreground" aria-live="polite">
            {rate.toFixed(1)}x
          </span>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setRate((r) => Math.min(MAX_RATE, r + RATE_STEP))}
            disabled={disabled || rate >= MAX_RATE}
            className="h-9 w-9 rounded-lg"
            aria-label="Increase speed"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  )
}
