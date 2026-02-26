/**
 * Status UI Components
 *
 * Lightweight, reusable status UI for asynchronous operations:
 * - LoadingPanel: spinner, skeletons, optional cancel
 * - SuccessModal: confirmation dialog with primary/secondary actions
 * - ToastContainer / ToastItem: non-blocking toast notifications
 * - StatusPageWrapper: unified page-level loading/success/idle container
 * - ToastProvider / useStatusToast: context for adding toasts from anywhere
 *
 * @example Loading while saving study materials
 * ```tsx
 * <LoadingPanel
 *   isLoading={isSaving}
 *   message="Saving..."
 *   description="Please wait while we save your study set."
 *   onCancel={() => abortController.abort()}
 *   actionLabel="Cancel"
 * />
 * ```
 *
 * @example Success modal after export
 * ```tsx
 * <SuccessModal
 *   open={exportComplete}
 *   title="Export complete!"
 *   description="Your study materials have been exported."
 *   primaryAction={{ label: "View Downloads", onClick: () => navigate("/downloads") }}
 *   secondaryAction={{ label: "Close", onClick: () => setExportComplete(false) }}
 *   onClose={() => setExportComplete(false)}
 * />
 * ```
 *
 * @example Toast after retry succeeds
 * ```tsx
 * const toast = useStatusToast()
 * toast?.addToast({
 *   type: "success",
 *   title: "Retry succeeded",
 *   description: "Your data has been synced.",
 * })
 * ```
 *
 * @example Error toast with retry action
 * ```tsx
 * toast?.addToast({
 *   type: "error",
 *   title: "Upload failed",
 *   description: "Please check your connection and try again.",
 *   action: { label: "Retry", onClick: () => retryUpload() },
 * })
 * ```
 */

export { LoadingPanel } from './loading-panel'
export type { LoadingPanelProps } from './loading-panel'

export { SuccessModal } from './success-modal'
export type { SuccessModalProps, SuccessModalAction } from './success-modal'

export { ToastContainer } from './toast-container'
export type { ToastContainerProps } from './toast-container'

export { ToastItem } from './toast-item'
export type {
  Toast,
  ToastItemProps,
  ToastType,
  ToastAction,
} from './toast-item'

export { StatusPageWrapper } from './status-page-wrapper'
export type { StatusPageWrapperProps, PageStatus } from './status-page-wrapper'

export { ToastProvider, useStatusToast } from './toast-provider'
export type { AddToastOptions, ToastContextValue } from './toast-provider'
