/**
 * Page P006: File Upload & OCR Ingestion
 * Upload area, status dashboard, OCR progress.
 */

import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ChevronLeft, FileText, ArrowRight } from 'lucide-react'
import { UploadDropzoneWithApi } from '@/components/file-upload/upload-dropzone-with-api'
import { cn } from '@/lib/utils'

export function FileUploadOcrPage() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b border-border bg-card px-4 py-3">
        <div className="container flex max-w-4xl items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(-1)}
            className="rounded-full"
          >
            <ChevronLeft className="mr-1 h-4 w-4" />
            Back
          </Button>
          <h1 className="text-lg font-semibold">Upload & OCR</h1>
        </div>
      </div>

      <div className="container max-w-4xl py-8">
        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-foreground">
              Upload Documents & Photos
            </h2>
            <p className="mt-1 text-muted-foreground">
              Upload teacher-provided documents and photos. We&apos;ll extract text via OCR and let
              you review and correct the results.
            </p>
          </div>

          <Card
            className={cn(
              'overflow-hidden border-2 border-border/60',
              'bg-gradient-to-br from-[rgb(var(--lavender))]/10 to-white'
            )}
          >
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                Add files
              </CardTitle>
              <CardDescription>
                Drag and drop or browse. Supports JPG, PNG, PDF, DOCX up to 25MB. Virus scanning and
                OCR run automatically after upload.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <UploadDropzoneWithApi
                onFileUploaded={(file) => {
                  if (file.ocrStatus === 'completed') {
                    navigate(`/dashboard/files/${file.id}/correct`)
                  }
                }}
              />
            </CardContent>
          </Card>

          <Card className="overflow-hidden border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-white">
            <CardHeader>
              <CardTitle>What happens next?</CardTitle>
              <CardDescription>
                After upload, your files are scanned and processed. You can then review and correct
                the extracted text.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <ol className="space-y-3">
                <li className="flex items-start gap-3">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/20 text-sm font-bold text-primary">
                    1
                  </span>
                  <div>
                    <p className="font-medium text-foreground">Upload</p>
                    <p className="text-sm text-muted-foreground">
                      Files are stored securely and scanned for viruses.
                    </p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/20 text-sm font-bold text-primary">
                    2
                  </span>
                  <div>
                    <p className="font-medium text-foreground">OCR extraction</p>
                    <p className="text-sm text-muted-foreground">
                      Text is automatically extracted from your documents.
                    </p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/20 text-sm font-bold text-primary">
                    3
                  </span>
                  <div>
                    <p className="font-medium text-foreground">Review & correct</p>
                    <p className="text-sm text-muted-foreground">
                      Edit any misrecognized text and use it for AI study generation.
                    </p>
                  </div>
                </li>
              </ol>
              <Button
                variant="outline"
                className="w-full rounded-full"
                onClick={() => navigate('/dashboard/files')}
              >
                View all files
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
