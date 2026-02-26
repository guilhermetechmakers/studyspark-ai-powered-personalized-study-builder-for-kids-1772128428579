/**
 * Page P007: OCR Correction & Review
 * Manual transcription editor with per-paragraph corrections.
 */

import { useCallback, useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { ChevronLeft, Loader2, Save, Check } from 'lucide-react'
import { getFile, getOcr, saveCorrections } from '@/api/files'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

export function OcrCorrectionPage() {
  const { fileId } = useParams<{ fileId: string }>()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [fileName, setFileName] = useState('')
  const [correctedText, setCorrectedText] = useState('')
  const [ocrVersion, setOcrVersion] = useState(1)
  const [hasChanges, setHasChanges] = useState(false)

  const id = fileId ?? ''
  useEffect(() => {
    if (!id) {
      setLoading(false)
      return
    }
    let cancelled = false
    async function load() {
      try {
        const [fileRes, ocrRes] = await Promise.all([
          getFile(id),
          getOcr(id).catch(() => null),
        ])
        if (cancelled) return
        if (!fileRes?.file) {
          toast.error('File not found')
          navigate('/dashboard/files')
          return
        }
        setFileName(fileRes.file.filename ?? 'Document')
        const initialText = fileRes.file.ocrText ?? ocrRes?.fullText ?? ''
        setCorrectedText(initialText)
        setOcrVersion(fileRes.file.ocrVersion ?? 1)
      } catch {
        if (!cancelled) toast.error('Failed to load file')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [id, navigate])

  const handleTextChange = useCallback((value: string) => {
    setCorrectedText(value)
    setHasChanges(true)
  }, [])

  const handleSave = useCallback(async () => {
    if (!id || !hasChanges) return
    const fileIdStr: string = id
    setSaving(true)
    try {
      const res = await saveCorrections(fileIdStr, correctedText, ocrVersion + 1)
      if (res?.error) throw new Error(res.error)
      setOcrVersion((v) => v + 1)
      setHasChanges(false)
      toast.success('Corrections saved')
    } catch (err) {
      toast.error((err as Error).message)
    } finally {
      setSaving(false)
    }
  }, [id, correctedText, ocrVersion, hasChanges])

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    )
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
          <h1 className="text-lg font-semibold">OCR Correction</h1>
          <Button
            size="sm"
            className="rounded-full"
            onClick={handleSave}
            disabled={!hasChanges || saving}
          >
            {saving ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Save className="mr-2 h-4 w-4" />
            )}
            Save corrections
          </Button>
        </div>
      </div>

      <div className="container max-w-4xl py-8">
        <Card className="overflow-hidden border-2 border-border/60">
          <CardHeader>
            <CardTitle>{fileName}</CardTitle>
            <CardDescription>
              Edit the extracted text below. Corrections are saved as a new version and used for
              search and AI study generation.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1 rounded-full bg-green-500/10 px-2.5 py-0.5 text-xs font-medium text-green-700">
                  <Check className="h-3 w-3" />
                  Version {ocrVersion}
                </span>
                {hasChanges && (
                  <span className="text-xs text-muted-foreground">Unsaved changes</span>
                )}
              </div>
              <Textarea
                value={correctedText}
                onChange={(e) => handleTextChange(e.target.value)}
                className={cn(
                  'min-h-[400px] resize-y font-mono text-sm',
                  'rounded-xl border-2 border-border focus-visible:ring-2'
                )}
                placeholder="Extracted text will appear here. Edit any misrecognized characters."
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
