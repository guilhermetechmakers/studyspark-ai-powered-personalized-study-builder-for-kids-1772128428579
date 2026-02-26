import { useState } from 'react'
import { Download, Share2, FileText, Mail, Link2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { cn } from '@/lib/utils'
import type { SectionBlock } from '@/types/study-review'

export interface ExportSharePanelProps {
  studyData: SectionBlock[]
  studyTitle?: string
  onExport?: (format: 'pdf' | 'zip') => void | Promise<void>
  onExportPdf?: () => void | Promise<void>
  onExportZip?: () => void | Promise<void>
  onShare?: (method: 'link' | 'email', email?: string) => void | Promise<void>
  onShareLink?: () => void | Promise<void>
  onShareEmail?: (email: string) => void | Promise<void>
  isExporting?: boolean
  isSharing?: boolean
  shareLink?: string
  className?: string
}

export function ExportSharePanel({
  studyData,
  studyTitle: _studyTitle,
  onExport,
  onExportPdf,
  onExportZip,
  onShare,
  onShareLink,
  onShareEmail,
  isExporting = false,
  isSharing = false,
  shareLink = '',
  className,
}: ExportSharePanelProps) {
  const [shareEmail, setShareEmail] = useState('')
  const [shareMethod, setShareMethod] = useState<'link' | 'email'>('link')

  const handleExportPdf = async () => {
    if (onExport) await onExport('pdf')
    else await onExportPdf?.()
  }

  const handleExportZip = async () => {
    if (onExport) await onExport('zip')
    else await onExportZip?.()
  }

  const handleShare = async () => {
    if (onShare) {
      await onShare(shareMethod, shareMethod === 'email' ? shareEmail : undefined)
    } else if (shareMethod === 'link') {
      await onShareLink?.()
    } else if (shareEmail.trim()) {
      await onShareEmail?.(shareEmail.trim())
    }
  }

  return (
    <Card
      className={cn(
        'overflow-hidden border-2 border-border/60 bg-gradient-to-br from-[rgb(var(--lavender))]/10 to-white transition-all duration-300',
        className
      )}
      aria-label="Export and Share"
    >
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-lg font-bold">
          <Share2 className="h-5 w-5 text-primary" />
          Export & Share
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Download or share this study set
        </p>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="export" className="w-full">
          <TabsList className="grid w-full grid-cols-2 rounded-xl">
            <TabsTrigger value="export" className="rounded-lg">
              <Download className="mr-2 h-4 w-4" />
              Export
            </TabsTrigger>
            <TabsTrigger value="share" className="rounded-lg">
              <Share2 className="mr-2 h-4 w-4" />
              Share
            </TabsTrigger>
          </TabsList>
          <TabsContent value="export" className="mt-4 space-y-3">
            <p className="text-sm text-muted-foreground">
              Download your study as a PDF or ZIP file.
            </p>
            <div className="flex flex-wrap gap-2">
              <Button
                variant="default"
                onClick={handleExportPdf}
                disabled={isExporting || (studyData ?? []).length === 0 || (!onExport && !onExportPdf)}
                className="rounded-full"
              >
                <FileText className="mr-2 h-4 w-4" />
                {isExporting ? 'Exporting...' : 'Export PDF'}
              </Button>
              <Button
                variant="outline"
                onClick={handleExportZip}
                disabled={isExporting || (studyData ?? []).length === 0 || (!onExport && !onExportZip)}
                className="rounded-full"
              >
                <Download className="mr-2 h-4 w-4" />
                Export ZIP
              </Button>
            </div>
          </TabsContent>
          <TabsContent value="share" className="mt-4 space-y-4">
            <div className="space-y-2">
              <Label>Share via</Label>
              <div className="flex gap-2">
                <Button
                  variant={shareMethod === 'link' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setShareMethod('link')}
                  className="rounded-full"
                >
                  <Link2 className="mr-2 h-4 w-4" />
                  Link
                </Button>
                <Button
                  variant={shareMethod === 'email' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setShareMethod('email')}
                  className="rounded-full"
                >
                  <Mail className="mr-2 h-4 w-4" />
                  Email
                </Button>
              </div>
            </div>
            {shareMethod === 'email' && (
              <div className="space-y-2">
                <Label htmlFor="share-email">Email address</Label>
                <Input
                  id="share-email"
                  type="email"
                  placeholder="parent@example.com"
                  value={shareEmail}
                  onChange={(e) => setShareEmail(e.target.value)}
                  className="rounded-xl"
                />
              </div>
            )}
            <Button
              onClick={handleShare}
              disabled={isSharing || (shareMethod === 'email' && !shareEmail.trim())}
              className="w-full rounded-full"
            >
              <Share2 className="mr-2 h-4 w-4" />
              {isSharing ? 'Sharing...' : shareMethod === 'link' ? 'Generate share link' : 'Send via email'}
            </Button>
            {shareLink && (
              <div className="rounded-lg border border-border bg-muted/30 p-3">
                <p className="text-xs font-medium text-muted-foreground">Shareable link</p>
                <p className="mt-1 truncate text-sm font-mono">{shareLink}</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
