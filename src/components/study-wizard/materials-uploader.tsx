import { useCallback, useMemo } from 'react'
import { UploadMaterialsContent } from '@/components/upload-materials'
import {
  fileItemToMaterial,
  materialToFileItem,
} from '@/lib/upload-materials-adapter'
import type { Material, OCRStatus } from '@/types/study-wizard'
import type { FileItem } from '@/types/upload-materials'

export interface MaterialsUploaderProps {
  materials: Material[]
  onChange: (materials: Material[]) => void
  onOcrStatusChange?: (materialId: string, status: OCRStatus) => void
  errors?: Record<string, string>
  className?: string
}

export function MaterialsUploader({
  materials,
  onChange,
  onOcrStatusChange: _onOcrStatusChange,
  errors = {},
  className,
}: MaterialsUploaderProps) {
  const fileItems = useMemo(
    () => (materials ?? []).map((m) => materialToFileItem(m)),
    [materials]
  )

  const handleFilesChange = useCallback(
    (files: FileItem[]) => {
      const next = (files ?? []).map((f) => fileItemToMaterial(f))
      onChange(next)
    },
    [onChange]
  )

  const handleSave = useCallback(
    (payload: { files: FileItem[]; importantSnippets: unknown[] }) => {
      const next = (payload.files ?? []).map((f) => fileItemToMaterial(f))
      onChange(next)
    },
    [onChange]
  )

  return (
    <div className={className}>
      <UploadMaterialsContent
        files={fileItems}
        onFilesChange={handleFilesChange}
        onSave={handleSave}
      />
      {errors?.materials && (
        <p className="mt-2 text-sm text-destructive">{errors.materials}</p>
      )}
    </div>
  )
}
