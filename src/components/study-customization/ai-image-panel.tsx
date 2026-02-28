'use client'

import { useState, useCallback } from 'react'
import { Sparkles, ImagePlus, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'
import type { StudyCard } from '@/types/study-customization'
import { toast } from 'sonner'

interface AIImagePanelProps {
  cards: StudyCard[]
  onCardsChange: (cards: StudyCard[]) => void
  onAttachImage?: (cardId: string, imageUrl: string) => void
  disabled?: boolean
  className?: string
}

/** Placeholder image URL - in production, use Edge Function to generate via AI */
const FALLBACK_PLACEHOLDER =
  'https://placehold.co/400x300/5b57a5/ffffff?text=Study+Image'

export function AIImagePanel({
  cards,
  onCardsChange,
  disabled = false,
  className,
}: AIImagePanelProps) {
  const [prompt, setPrompt] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedImages, setGeneratedImages] = useState<string[]>([])
  const [attachTargetId, setAttachTargetId] = useState<string | null>(null)

  const handleGenerate = useCallback(async () => {
    if (!prompt.trim() || disabled) return
    setIsGenerating(true)
    setGeneratedImages([])
    try {
      // In production: call Supabase Edge Function for AI image generation
      // For now: use placeholder with fallback
      await new Promise((r) => setTimeout(r, 1500))
      setIsGenerating(false)
      setGeneratedImages([FALLBACK_PLACEHOLDER])
      setPrompt('')
      toast.success('Image generated (demo mode). Connect AI to generate real images.')
    } catch {
      setIsGenerating(false)
      setGeneratedImages([FALLBACK_PLACEHOLDER])
      toast.info('Using placeholder. AI image generation requires an API key.')
    }
  }, [prompt, disabled])

  const handleAttach = useCallback(
    (cardId: string, imageUrl: string) => {
      const updated = cards.map((c) =>
        c.id === cardId ? { ...c, imageUrl } : c
      )
      onCardsChange(updated)
      setAttachTargetId(null)
      toast.success('Image attached to card')
    },
    [cards, onCardsChange]
  )

  return (
    <div className={cn('space-y-4', className)}>
      <div className="flex items-center gap-2">
        <Sparkles className="h-5 w-5 text-primary" aria-hidden />
        <h3 className="font-semibold text-foreground">AI Image Generator</h3>
      </div>

      <div className="space-y-2">
        <Label htmlFor="ai-prompt" className="text-sm text-muted-foreground">
          Describe the image you want
        </Label>
        <Textarea
          id="ai-prompt"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="e.g. A colorful fraction pie chart showing 1/2 and 1/4"
          rows={2}
          disabled={disabled}
          className="resize-none"
        />
        <Button
          onClick={handleGenerate}
          disabled={disabled || !prompt.trim() || isGenerating}
          className="w-full gap-2"
          aria-label="Generate image"
        >
          {isGenerating ? (
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
          ) : (
            <Sparkles className="h-4 w-4" aria-hidden />
          )}
          {isGenerating ? 'Generating...' : 'Generate Image'}
        </Button>
      </div>

      {generatedImages.length > 0 && (
        <div className="space-y-2">
          <Label className="text-sm text-muted-foreground">
            Generated images
          </Label>
          <div className="grid grid-cols-2 gap-2">
            {generatedImages.map((url, i) => (
              <div
                key={i}
                className="group relative overflow-hidden rounded-xl border border-border bg-muted"
              >
                <img
                  src={url}
                  alt="Generated"
                  className="h-24 w-full object-cover"
                />
                <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
                  {cards.length > 0 ? (
                    <>
                      {attachTargetId ? (
                        cards
                          .filter((c) => c.id === attachTargetId)
                          .map((c) => (
                            <Button
                              key={c.id}
                              size="sm"
                              onClick={() => handleAttach(c.id, url)}
                              className="gap-1"
                            >
                              <ImagePlus className="h-4 w-4" />
                              Attach to {c.question.slice(0, 15)}...
                            </Button>
                          ))
                      ) : (
                        <span className="text-xs text-white">
                          Select a card to attach
                        </span>
                      )}
                    </>
                  ) : (
                    <span className="text-xs text-white">
                      Add cards first to attach
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {cards.length > 0 && (
        <div className="space-y-2">
          <Label className="text-sm text-muted-foreground">
            Attach to card
          </Label>
          <div className="flex flex-wrap gap-2">
            {cards.map((c) => (
              <Button
                key={c.id}
                variant={attachTargetId === c.id ? 'default' : 'outline'}
                size="sm"
                onClick={() =>
                  setAttachTargetId(attachTargetId === c.id ? null : c.id)
                }
                disabled={disabled}
                className="text-xs"
              >
                {c.question.slice(0, 20)}
                {c.question.length > 20 ? '...' : ''}
              </Button>
            ))}
          </div>
        </div>
      )}

      <p className="text-xs text-muted-foreground">
        AI image generation requires an API key. If unavailable, a placeholder
        is used.
      </p>
    </div>
  )
}
