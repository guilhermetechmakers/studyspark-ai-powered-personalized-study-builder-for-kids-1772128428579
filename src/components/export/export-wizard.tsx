/**
 * ExportWizard - Step-by-step UI for configuring exports
 */

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { PaperSizeSelector } from '@/components/export/paper-size-selector'
import { WatermarkToggle } from '@/components/export/watermark-toggle'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type {
  PaperSize,
  Orientation,
  ExportType,
  ExportIncludeSections,
  ExportTemplate,
} from '@/types/exports'
import { FileText, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface ExportWizardProps {
  studyId: string
  studyTitle?: string
  templates?: ExportTemplate[]
  onExport: (opts: {
    exportType: ExportType
    paperSize: PaperSize
    orientation: Orientation
    include: ExportIncludeSections
    watermark: boolean
  }) => Promise<void>
  isExporting?: boolean
  className?: string
}

const DEFAULT_INCLUDE: ExportIncludeSections = {
  studySheet: true,
  flashcards: true,
  answers: true,
  notes: true,
}

export function ExportWizard({
  studyId,
  studyTitle = 'Study',
  templates = [],
  onExport,
  isExporting = false,
  className,
}: ExportWizardProps) {
  const [exportType, setExportType] = useState<ExportType>('pdf')
  const [paperSize, setPaperSize] = useState<PaperSize>('A4')
  const [orientation, setOrientation] = useState<Orientation>('portrait')
  const [include, setInclude] = useState<ExportIncludeSections>({ ...DEFAULT_INCLUDE })
  const [watermark, setWatermark] = useState(false)
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('')

  const templateList = Array.isArray(templates) ? templates : []
  const pdfTemplates = templateList.filter((t) => t.type === 'pdf')
  const bundleTemplates = templateList.filter((t) => t.type === 'bundle')

  const handleIncludeChange = (key: keyof ExportIncludeSections, checked: boolean) => {
    setInclude((prev) => ({ ...prev, [key]: checked }))
  }

  const handleTemplateSelect = (templateId: string) => {
    if (templateId === '_none') {
      setSelectedTemplateId('')
      return
    }
    setSelectedTemplateId(templateId)
    const t = templateList.find((x) => x.id === templateId)
    if (t) {
      setPaperSize(t.paperSize)
      setOrientation(t.orientation)
      setExportType(t.type)
    }
  }

  const handleGenerate = async () => {
    await onExport({
      exportType,
      paperSize,
      orientation,
      include,
      watermark,
    })
  }

  return (
    <Card className={cn('overflow-hidden', className)}>
      <CardHeader className="bg-gradient-to-br from-[rgb(var(--peach-light))]/50 to-[rgb(var(--lavender))]/20">
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Export & Print
        </CardTitle>
        <CardDescription>
          Generate a printable PDF or asset bundle for &quot;{studyTitle}&quot;
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6 pt-6">
        {templateList.length > 0 && (
          <div className="space-y-2">
            <Label>Template (optional)</Label>
            <Select value={selectedTemplateId || '_none'} onValueChange={handleTemplateSelect}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a template" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="_none">No template</SelectItem>
                {pdfTemplates.map((t) => (
                  <SelectItem key={t.id} value={t.id}>
                    {t.name} ({t.paperSize}, {t.orientation})
                  </SelectItem>
                ))}
                {bundleTemplates.map((t) => (
                  <SelectItem key={t.id} value={t.id}>
                    {t.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        <div className="space-y-2">
          <Label>Export type</Label>
          <Select value={exportType} onValueChange={(v) => setExportType(v as ExportType)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="pdf">PDF (printable)</SelectItem>
              <SelectItem value="bundle">Asset bundle (flashcards, answers)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <PaperSizeSelector
          paperSize={paperSize}
          orientation={orientation}
          onPaperSizeChange={setPaperSize}
          onOrientationChange={setOrientation}
        />

        <div className="space-y-3">
          <Label>Sections to include</Label>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="include-study"
                checked={include.studySheet !== false}
                onCheckedChange={(c) => handleIncludeChange('studySheet', Boolean(c))}
              />
              <Label htmlFor="include-study" className="font-normal">
                Study sheet
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="include-flashcards"
                checked={include.flashcards !== false}
                onCheckedChange={(c) => handleIncludeChange('flashcards', Boolean(c))}
              />
              <Label htmlFor="include-flashcards" className="font-normal">
                Flashcards
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="include-answers"
                checked={include.answers !== false}
                onCheckedChange={(c) => handleIncludeChange('answers', Boolean(c))}
              />
              <Label htmlFor="include-answers" className="font-normal">
                Answer key
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="include-notes"
                checked={include.notes !== false}
                onCheckedChange={(c) => handleIncludeChange('notes', Boolean(c))}
              />
              <Label htmlFor="include-notes" className="font-normal">
                Teacher notes
              </Label>
            </div>
          </div>
        </div>

        <WatermarkToggle checked={watermark} onCheckedChange={setWatermark} />

        <Button
          className="w-full"
          size="lg"
          onClick={handleGenerate}
          disabled={isExporting || !studyId}
        >
          {isExporting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Generating...
            </>
          ) : (
            'Generate Export'
          )}
        </Button>
      </CardContent>
    </Card>
  )
}
