import * as React from 'react'
import { Download } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

export interface DownloadPolicyButtonProps {
  className?: string
}

export function DownloadPolicyButton({ className }: DownloadPolicyButtonProps) {
  const handleDownload = React.useCallback(() => {
    try {
      window.print()
      toast.success('Use "Save as PDF" or "Print to PDF" in the print dialog to save a copy.')
    } catch {
      toast.error('Could not open print dialog. Please try again.')
    }
  }, [])

  return (
    <Button
      variant="default"
      size="lg"
      onClick={handleDownload}
      className={className}
      aria-label="Download or print Privacy Policy as PDF"
    >
      <Download className="h-5 w-5" aria-hidden />
      Download Policy (PDF)
    </Button>
  )
}
