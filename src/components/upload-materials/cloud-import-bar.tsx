import { useCallback } from 'react'
import { Cloud, HardDrive, Droplets } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export interface CloudImportBarProps {
  onImportFromDrive?: () => void
  onImportFromDropbox?: () => void
  className?: string
}

export function CloudImportBar({
  onImportFromDrive,
  onImportFromDropbox,
  className,
}: CloudImportBarProps) {
  const handleDrive = useCallback(() => {
    if (onImportFromDrive) {
      onImportFromDrive()
    } else {
      // Placeholder: show toast that integration is not configured
      console.info('Google Drive import not configured')
    }
  }, [onImportFromDrive])

  const handleDropbox = useCallback(() => {
    if (onImportFromDropbox) {
      onImportFromDropbox()
    } else {
      console.info('Dropbox import not configured')
    }
  }, [onImportFromDropbox])

  return (
    <div
      className={cn(
        'flex flex-wrap items-center gap-2 rounded-xl border border-border bg-muted/30 px-4 py-3',
        className
      )}
    >
      <span className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
        <Cloud className="h-4 w-4" />
        Import from cloud:
      </span>
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={handleDrive}
          className="h-9 rounded-full"
          disabled={!onImportFromDrive}
        >
          <HardDrive className="mr-1.5 h-4 w-4" />
          Google Drive
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={handleDropbox}
          className="h-9 rounded-full"
          disabled={!onImportFromDropbox}
        >
          <Droplets className="mr-1.5 h-4 w-4" />
          Dropbox
        </Button>
      </div>
      {!onImportFromDrive && !onImportFromDropbox && (
        <span className="text-xs text-muted-foreground">(Coming soon)</span>
      )}
    </div>
  )
}
