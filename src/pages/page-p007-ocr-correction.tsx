/**
 * page_p007: OCR Correction & Review
 * Manual transcription editor with per-paragraph corrections.
 */

import { useEffect, useState, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { CorrectionEditor } from '@/components/files/correction-editor'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { ChevronLeft } from 'lucide-react'
import { getFile, getOcr, saveCorrections } from '@/api/files'
import type { FileMeta, OcrResult } from '@/types/files'

export function PageP007OcrCorrection() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [file, setFile] = useState<FileMeta | null>(null)
  const [ocr, setOcr] = useState<OcrResult | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchData = useCallback(async () => {
    if (!id) return
    setLoading(true)
    try {
      const [fileRes, ocrRes] = await Promise.all([
        getFile(id),
        getOcr(id),
      ])
      setFile(fileRes?.file ?? null)
      setOcr(ocrRes ?? null)
    } catch {
      setFile(null)
      setOcr(null)
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const handleSave = useCallback(
    async (correctedText: string): Promise<{ ok: boolean; error?: string }> => {
      if (!id || !file) return { ok: false, error: 'No file' }
      try {
        await saveCorrections(id, correctedText)
        toast.success('Corrections saved')
        fetchData()
        return { ok: true }
      } catch (err) {
        const msg = (err as Error)?.message ?? 'Save failed'
        toast.error(msg)
        return { ok: false, error: msg }
      }
    },
    [id, file, fetchData]
  )

  if (loading) {
    return (
      <div className="container max-w-3xl py-8">
        <Skeleton className="mb-6 h-10 w-48" />
        <Skeleton className="h-64 w-full rounded-2xl" />
      </div>
    )
  }

  if (!file) {
    return (
      <div className="container max-w-3xl py-8">
        <p className="text-muted-foreground">File not found.</p>
        <Button variant="outline" className="mt-4 rounded-full" onClick={() => navigate(-1)}>
          Go back
        </Button>
      </div>
    )
  }

  const displayText = ocr?.fullText ?? ocr?.full_text ?? file.ocrText ?? ''

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-3xl py-8">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate(-1)}
          className="mb-6 rounded-full"
        >
          <ChevronLeft className="mr-1 h-4 w-4" />
          Back
        </Button>

        <div className="mb-8 space-y-2">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            OCR Correction — {file.filename}
          </h1>
          <p className="text-muted-foreground">
            Edit the extracted text below. Corrections are saved as a new version.
          </p>
        </div>

        <Card className="overflow-hidden border-2 border-border/60">
          <CardHeader>
            <CardTitle>Extracted text</CardTitle>
            <CardDescription>
              Review and correct any OCR errors. Your changes will be used for search and AI context.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <CorrectionEditor
              originalText={displayText}
              currentText={file.ocrText ?? displayText}
              onSave={handleSave}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
