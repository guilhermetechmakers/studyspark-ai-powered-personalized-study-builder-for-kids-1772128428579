'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import { Volume2, VolumeX } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface ReadAloudControllerProps {
  text: string
  rate?: number
  disabled?: boolean
  className?: string
}

const DEFAULT_RATE = 0.9

export function ReadAloudController({
  text,
  rate = DEFAULT_RATE,
  disabled = false,
  className,
}: ReadAloudControllerProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const synthRef = useRef<SpeechSynthesis | null>(null)
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null)

  const speak = useCallback(() => {
    if (!text?.trim() || typeof window === 'undefined' || !window.speechSynthesis) return
    const synth = window.speechSynthesis
    synthRef.current = synth
    synth.cancel()
    const utterance = new SpeechSynthesisUtterance(text.trim())
    utterance.rate = Math.max(0.5, Math.min(2, rate ?? DEFAULT_RATE))
    utterance.lang = 'en-US'
    utterance.onend = () => setIsPlaying(false)
    utterance.onerror = () => setIsPlaying(false)
    utteranceRef.current = utterance
    synth.speak(utterance)
    setIsPlaying(true)
  }, [text, rate])

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
    <div className={cn('flex items-center gap-2', className)} role="group" aria-label="Read aloud controls">
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
    </div>
  )
}
