/**
 * ExportButton - Triggers CSV or JSON export for user and child data.
 */

import { useState } from 'react'
import { Download } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

export interface ExportButtonProps {
  onExportJson: () => Promise<void>
  onExportCsv: () => Promise<void>
  disabled?: boolean
}

export function ExportButton({
  onExportJson,
  onExportCsv,
  disabled = false,
}: ExportButtonProps) {
  const [loading, setLoading] = useState<'json' | 'csv' | null>(null)

  const handleJson = async () => {
    setLoading('json')
    try {
      await onExportJson()
    } finally {
      setLoading(null)
    }
  }

  const handleCsv = async () => {
    setLoading('csv')
    try {
      await onExportCsv()
    } finally {
      setLoading(null)
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          disabled={disabled || loading !== null}
          className="rounded-full"
        >
          <Download className="h-4 w-4" />
          {loading ? (loading === 'json' ? 'Exporting JSON…' : 'Exporting CSV…') : 'Export data'}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="rounded-xl">
        <DropdownMenuItem onClick={handleJson} disabled={loading !== null}>
          Download as JSON
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleCsv} disabled={loading !== null}>
          Download as CSV
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
