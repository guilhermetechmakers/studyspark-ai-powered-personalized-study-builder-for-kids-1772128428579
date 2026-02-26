/**
 * PrivacyDeleteModal - Confirms account deletion; triggers backend; shows progress.
 */

import { useState } from 'react'
import { ConfirmationModal } from '@/components/settings/confirmation-modal'

export interface PrivacyDeleteModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: () => void | Promise<void | boolean>
}

export function PrivacyDeleteModal({
  open,
  onOpenChange,
  onConfirm,
}: PrivacyDeleteModalProps) {
  const [isLoading, setIsLoading] = useState(false)

  const handleConfirm = async () => {
    setIsLoading(true)
    try {
      await onConfirm()
      onOpenChange(false)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <ConfirmationModal
      open={open}
      onOpenChange={onOpenChange}
      title="Delete account"
      description="This will permanently delete your account and all associated data including child profiles and studies. This action cannot be undone."
      confirmLabel="Delete account"
      cancelLabel="Cancel"
      variant="destructive"
      onConfirm={handleConfirm}
      isLoading={isLoading}
    />
  )
}
