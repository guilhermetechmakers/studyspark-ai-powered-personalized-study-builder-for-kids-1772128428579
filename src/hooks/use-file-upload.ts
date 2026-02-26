/**
 * useFileUpload - Handles file upload flow: init, upload to storage, complete.
 */

import { useCallback, useState } from 'react'
import { toast } from 'sonner'
import {
  initUpload,
  uploadToStorage,
  completeUpload,
} from '@/api/files'
import type { FileMeta } from '@/types/files'

export interface UploadingFile {
  file: File
  progress: number
  status: 'uploading' | 'completing' | 'done' | 'error'
  result?: FileMeta
  error?: string
}

export function useFileUpload(relatedStudyId?: string) {
  const [uploading, setUploading] = useState<UploadingFile[]>([])
  const [uploadedIds, setUploadedIds] = useState<string[]>([])

  const uploadFile = useCallback(
    async (file: File): Promise<string | null> => {
      setUploading((prev) => [
        ...prev,
        { file, progress: 0, status: 'uploading' },
      ])

      try {
        const init = await initUpload({
          filename: file.name,
          mimeType: file.type,
          size: file.size,
          relatedStudyId: relatedStudyId ?? undefined,
        })

        if (!init?.fileId || !init?.storagePath) {
          throw new Error('Failed to initialize upload')
        }

        setUploading((prev) =>
          prev.map((u) =>
            u.file === file ? { ...u, progress: 50, status: 'uploading' as const } : u
          )
        )

        await uploadToStorage(init.storagePath, file, (pct) => {
          setUploading((prev) =>
            prev.map((u) =>
              u.file === file ? { ...u, progress: Math.min(90, 50 + pct * 0.4) } : u
            )
          )
        })

        setUploading((prev) =>
          prev.map((u) =>
            u.file === file ? { ...u, progress: 90, status: 'completing' as const } : u
          )
        )

        const complete = await completeUpload(init.fileId)
        if (!complete?.fileId) {
          throw new Error('Failed to complete upload')
        }

        setUploading((prev) =>
          prev.map((u) =>
            u.file === file
              ? { ...u, progress: 100, status: 'done' as const }
              : u
          )
        )
        setUploadedIds((p) => [...p, complete.fileId])
        return complete.fileId
      } catch (err) {
        const msg = (err as Error).message
        setUploading((prev) =>
          prev.map((u) =>
            u.file === file ? { ...u, status: 'error' as const, error: msg } : u
          )
        )
        toast.error(msg)
        return null
      }
    },
    [relatedStudyId]
  )

  const uploadFiles = useCallback(
    async (files: File[]): Promise<string[]> => {
      const ids: string[] = []
      for (const f of files ?? []) {
        const id = await uploadFile(f)
        if (id) ids.push(id)
      }
      return ids
    },
    [uploadFile]
  )

  const clearUploading = useCallback(() => {
    setUploading([])
  }, [])

  const removeUploading = useCallback((file: File) => {
    setUploading((prev) => prev.filter((u) => u.file !== file))
  }, [])

  return {
    uploading,
    uploadedIds,
    uploadFile,
    uploadFiles,
    clearUploading,
    removeUploading,
  }
}
