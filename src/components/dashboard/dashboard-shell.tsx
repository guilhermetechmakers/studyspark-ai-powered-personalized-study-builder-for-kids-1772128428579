import { cn } from '@/lib/utils'

interface DashboardShellProps {
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
      <main className="flex-1" role="main">
        {children}
      </main>
    </div>
  )
}
