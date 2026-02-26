/**
 * Page P007: OCR Correction & Review
 * Manual transcription editor with per-paragraph corrections, diff view, versioning.
 */

import { useCallback, useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { ChevronLeft, Save, Loader2, FileText } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { getFile, getOcr, saveCorrections } from '@/api/files'
import type { FileMeta, OcrBlock } from '@/types/files'
import { dataGuard } from '@/lib/data-guard'

export function OcrCorrectionReviewPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const fileId = searchParams.get('fileId') ?? ''

  const [file, setFile] = useState<FileMeta | null>(null)
  const [ocrBlocks, setOcrBlocks] = useState<OcrBlock[]>([])
  const [correctedText, setCorrectedText] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    if (!fileId) {
      navigate('/dashboard/upload-materials')
      return
    }

    let cancelled = false
    async function load() {
      setIsLoading(true)
      try {
        const [fileRes, ocrRes] = await Promise.all([
          getFile(fileId),
          getOcr(fileId),
        ])
        if (cancelled) return
        setFile(fileRes?.file ?? null)
        const blocks = Array.isArray(ocrRes?.blocks) ? ocrRes.blocks : []
        setOcrBlocks(blocks)
        const fullText = ocrRes?.fullText ?? fileRes?.file?.ocrText ?? ''
        setCorrectedText(fullText)
      } catch (err) {
        if (!cancelled) {
          toast.error((err as Error)?.message ?? 'Failed to load file')
          navigate('/dashboard/files')
        }
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [fileId, navigate])

  const handleSave = useCallback(async () => {
    if (!fileId) return
    setIsSaving(true)
    try {
      await saveCorrections(fileId, correctedText)
      toast.success('Corrections saved')
    } catch (err) {
      toast.error((err as Error)?.message ?? 'Failed to save')
    } finally {
      setIsSaving(false)
    }
  }, [fileId, correctedText])

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" aria-hidden />
      </div>
    )
  }

  if (!file) {
    return null
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b border-border bg-card px-4 py-3">
        <div className="container flex max-w-4xl items-center justify-between gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(-1)}
            className="rounded-full"
          >
            <ChevronLeft className="mr-1 h-4 w-4" />
            Back
          </Button>
          <h1 className="text-lg font-semibold">OCR Correction & Review</h1>
          <Button
            size="sm"
            onClick={handleSave}
            disabled={isSaving}
            className="rounded-full"
          >
            {isSaving ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Save className="mr-2 h-4 w-4" />
            )}
            Save corrections
          </Button>
        </div>
      </div>

      <div className="container max-w-4xl py-8">
        <div className="space-y-6 animate-fade-in">
          <Card className="overflow-hidden border-2 border-border bg-gradient-to-br from-[rgb(var(--lavender))]/10 to-white">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                  <FileText className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <CardTitle>{file.filename}</CardTitle>
                  <CardDescription>
                    Edit the extracted text below. Corrections are saved as a new version.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Textarea
                value={correctedText}
                onChange={(e) => setCorrectedText(e.target.value)}
                className="min-h-[320px] resize-y font-mono text-sm"
                placeholder="Extracted text will appear here..."
              />
            </CardContent>
          </Card>

          {dataGuard(ocrBlocks).length > 0 && (
            <Card className="overflow-hidden border-2 border-border">
              <CardHeader>
                <CardTitle>OCR blocks (reference)</CardTitle>
                <CardDescription>
                  Original OCR output with confidence scores
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {(ocrBlocks ?? []).map((block, i) => (
                    <div
                      key={i}
                      className={cn(
                        'rounded-lg border px-3 py-2 text-sm',
                        (block?.confidence ?? 0) >= 0.9
                          ? 'border-green-500/30 bg-green-500/5'
                          : (block?.confidence ?? 0) >= 0.7
                            ? 'border-amber-500/30 bg-amber-500/5'
                            : 'border-muted bg-muted/30'
                      )}
                    >
                      <span className="text-xs text-muted-foreground">
                        {Math.round((block?.confidence ?? 0) * 100)}%
                      </span>
                      <p className="mt-1">{block?.text ?? ''}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
