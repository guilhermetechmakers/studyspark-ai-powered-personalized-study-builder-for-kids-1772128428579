import { ToastItem, type Toast } from './toast-item'
import { cn } from '@/lib/utils'

const MAX_VISIBLE_TOASTS = 5

export interface ToastContainerProps {
  /** Array of toast objects to display */
  toasts: Toast[]
  /** Callback when a toast should be dismissed */
  onDismiss: (id: string) => void
  /** Position of the toast stack */
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center'
  /** Additional class names */
  className?: string
}

const POSITION_CLASSES: Record<NonNullable<ToastContainerProps['position']>, string> = {
  'top-right': 'top-4 right-4',
  'top-left': 'top-4 left-4',
  'bottom-right': 'bottom-4 right-4',
  'bottom-left': 'bottom-4 left-4',
  'top-center': 'top-4 left-1/2 -translate-x-1/2',
  'bottom-center': 'bottom-4 left-1/2 -translate-x-1/2',
}

export function ToastContainer({
  toasts = [],
  onDismiss,
  position = 'top-right',
  className,
}: ToastContainerProps) {
  const safeToasts = Array.isArray(toasts) ? toasts : []
  const visibleToasts = safeToasts.slice(0, MAX_VISIBLE_TOASTS)

  if (visibleToasts.length === 0) {
    return null
  }

  return (
    <div
      role="region"
      aria-label="Notifications"
      className={cn(
        'fixed z-[100] flex flex-col gap-3',
        POSITION_CLASSES[position],
        className
     )}
    >
      {visibleToasts.map((toast) => (
        <div
          key={toast.id}
          className="animate-toast-in"
        >
          <ToastItem
            id={toast.id}
            type={toast.type}
            title={toast.title}
            description={toast.description ?? ''}
            duration={toast.duration}
            action={toast.action}
            onDismiss={onDismiss}
          />
        </div>
      ))}
    </div>
  )
}
