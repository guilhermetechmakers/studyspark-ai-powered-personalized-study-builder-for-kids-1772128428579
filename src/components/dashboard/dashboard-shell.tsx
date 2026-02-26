import { cn } from '@/lib/utils'

export interface DashboardShellProps {
  children: React.ReactNode
  className?: string
}

export function DashboardShell({ children, className }: DashboardShellProps) {
  return (
    <div
      className={cn(
        'flex min-h-full flex-col',
        className
      )}
    >
      {children}
    </div>
  )
}
