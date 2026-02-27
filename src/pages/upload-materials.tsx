import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { UploadMaterialsContent } from '@/components/upload-materials'
import { Button } from '@/components/ui/button'
import { ChevronLeft } from 'lucide-react'
import { useState } from 'react'
import type { FileItem, Snippet } from '@/types/upload-materials'
import { fileItemToMaterial } from '@/lib/upload-materials-adapter'

export function UploadMaterialsPage() {
  const navigate = useNavigate()
  const [files, setFiles] = useState<FileItem[]>([])

  const handleSave = (payload: { files: FileItem[]; importantSnippets: Snippet[] }) => {
    const materials = (payload.files ?? []).map((f) => fileItemToMaterial(f))
    // In a full implementation, persist to backend and navigate to study wizard
    console.info('Saved materials:', { materials, importantSnippets: payload.importantSnippets })
    toast.success('Materials saved! Redirecting to study builder…')
    navigate('/dashboard/create')
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b border-border bg-card px-4 py-3">
        <div className="container flex max-w-4xl items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(-1)}
            className="rounded-full"
            aria-label="Go back to previous page"
          >
            <ChevronLeft className="mr-1 h-4 w-4" aria-hidden />
            Back
          </Button>
          <h1 className="text-lg font-semibold">Upload Materials</h1>
        </div>
      </div>

      <div className="container max-w-4xl py-8">
        <UploadMaterialsContent
          files={files}
          onFilesChange={setFiles}
          onSave={handleSave}
        />
      </div>
    </div>
  )
}
