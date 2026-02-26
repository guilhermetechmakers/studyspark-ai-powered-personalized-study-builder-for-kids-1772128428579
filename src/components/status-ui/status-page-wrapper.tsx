import * as React from 'react'
import { LoadingPanel } from './loading-panel'
import { SuccessModal } from './success-modal'
import { cn } from '@/lib/utils'

export type PageStatus = 'loading' | 'success' | 'idle'

export interface StatusPageWrapperProps {
  /** Current status of the page/operation */
  status: PageStatus
  /** Content to show when status is idle */
  children: React.ReactNode
  /** Loading message (used when status is 'loading') */
  message?: string
  /** Loading description (used when status is 'loading') */
  description?: string
  /** Success modal title (used when status is 'success') */
  successTitle?: string
  /** Success modal description (used when status is 'success') */
  successDescription?: string
  /** Success modal primary action */
  successPrimaryAction?: { label: string; onClick: () => void }
  /** Success modal secondary action */
  successSecondaryAction?: { label: string; onClick: () => void }
  /** Callback when success modal is closed */
  onSuccessClose?: () => void
  /** Optional cancel handler for loading state */
  onCancel?: () => void
  /** Label for cancel button when onCancel is provided */
  actionLabel?: string
  /** Optional skeleton count for loading state */
  skeletonCount?: number
  /** Additional class names */
  className?: string
}

export function StatusPageWrapper({
  status,
  children,
  message = 'Loading…',
  description,
  successTitle = 'Success!',
  successDescription,
  successPrimaryAction,
  successSecondaryAction,
  onSuccessClose,
  onCancel,
  actionLabel = 'Cancel',
  skeletonCount = 0,
  className,
}: StatusPageWrapperProps) {
  const [showSuccessModal, setShowSuccessModal] = React.useState(false)

  React.useEffect(() => {
    if (status === 'success') {
      setShowSuccessModal(true)
    }
  }, [status])

  const handleSuccessClose = () => {
    setShowSuccessModal(false)
    onSuccessClose?.()
  }

  return (
    <div className={cn('min-h-0 flex-1', className)}>
      {status === 'loading' && (
        <LoadingPanel
          isLoading
          message={message}
          description={description}
          actionLabel={actionLabel}
          onCancel={onCancel}
          skeletonCount={skeletonCount}
        />
      )}
      {status === 'idle' && children}
      <SuccessModal
        open={showSuccessModal}
        title={successTitle}
        description={successDescription}
        primaryAction={
          successPrimaryAction ?? {
            label: 'Close',
            onClick: handleSuccessClose,
          }
        }
        secondaryAction={successSecondaryAction}
        onClose={handleSuccessClose}
      />
    </div>
  )
}
