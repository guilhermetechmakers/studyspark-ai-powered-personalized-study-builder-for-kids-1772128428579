/**
 * CorrectionEditor - Per-paragraph OCR text editing with diff view.
 */

import { useState, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Loader2, Save, Check } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface CorrectionEditorProps {
  originalText: string
  currentText: string
  onSave: (correctedText: string) => Promise<{ ok: boolean; error?: string }>
  disabled?: boolean
  className?: string
}

export function CorrectionEditor({
  originalText,
  currentText,
  onSave,
  disabled = false,
  className,
}: CorrectionEditorProps) {
  const [editedText, setEditedText] = useState(currentText || originalText || '')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const handleSave = useCallback(async () => {
    if (saving || disabled) return
    setSaving(true)
    setSaved(false)
    try {
      const res = await onSave(editedText)
      if (res?.ok) {
        setSaved(true)
        setTimeout(() => setSaved(false), 2000)
      }
    } finally {
      setSaving(false)
    }
  }, [editedText, onSave, saving, disabled])

  const hasChanges = editedText !== (currentText || originalText || '')

  return (
    <div className={cn('space-y-4', className)}>
      <div className="rounded-xl border border-border bg-muted/30 p-4">
        <label className="mb-2 block text-sm font-medium text-foreground">
          Edit extracted text
        </label>
        <Textarea
          value={editedText}
          onChange={(e) => setEditedText(e.target.value)}
          placeholder="Edit the OCR-extracted text here..."
          className="min-h-[200px] resize-y font-mono text-sm"
          disabled={disabled}
        />
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Button
          onClick={handleSave}
          disabled={saving || disabled || !hasChanges}
          className="rounded-full"
        >
          {saving ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : saved ? (
            <Check className="mr-2 h-4 w-4 text-success" />
          ) : (
            <Save className="mr-2 h-4 w-4" />
          )}
          {saving ? 'Saving...' : saved ? 'Saved' : 'Save corrections'}
        </Button>
        {hasChanges && !saving && (
          <span className="text-sm text-muted-foreground">Unsaved changes</span>
        )}
      </div>
    </div>
  )
}
