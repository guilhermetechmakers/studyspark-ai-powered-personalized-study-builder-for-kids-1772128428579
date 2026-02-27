import { Link } from 'react-router-dom'
import { Bell, ArrowLeft } from 'lucide-react'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'

export interface AdminHeaderProps {
  /** Optional page title for heading structure. Defaults to "Admin". */
  title?: string
  /** Optional system load value (0–100). Hidden when undefined. */
  systemLoad?: number
  /** Optional user initials for avatar. */
  userInitials?: string
  /** Additional class names for the root element. */
  className?: string
}

export function AdminHeader({
  title = 'Admin',
  systemLoad = 65,
  userInitials = 'A',
  className,
}: AdminHeaderProps) {
  return (
    <Card
      role="banner"
      className={cn(
        'sticky top-0 z-40 flex h-16 flex-row items-center gap-4 rounded-none rounded-b-xl border-x-0 border-t-0 px-4 shadow-card sm:px-6',
        'transition-shadow duration-300 hover:shadow-card hover:translate-y-0',
        className
      )}
    >
      <CardHeader className="flex flex-1 flex-row items-center gap-3 p-0 sm:gap-4">
        <Button
          variant="outline"
          size="sm"
          asChild
          className="h-9 rounded-full shadow-sm transition-all duration-200 hover:scale-[1.02] hover:shadow-md active:scale-[0.98]"
          aria-label="Back to dashboard"
        >
          <Link to="/dashboard" className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5" aria-hidden />
            <span className="hidden sm:inline">Back to dashboard</span>
          </Link>
        </Button>
        <Separator orientation="vertical" className="h-6" decorative />
        <h1 className="text-base font-semibold text-foreground sm:text-lg">
          {title}
        </h1>
      </CardHeader>
      <CardContent className="flex items-center gap-2 p-0 sm:gap-4">
        <div className="hidden sm:block">
          <p
            id="admin-header-system-load-label"
            className="text-xs font-medium text-muted-foreground"
          >
            System load
          </p>
          <Progress
            value={systemLoad}
            className="h-1.5 w-24"
            aria-labelledby="admin-header-system-load-label"
          />
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9 rounded-full"
          aria-label="Notifications"
        >
          <Bell className="h-5 w-5" aria-hidden />
        </Button>
        <Avatar className="h-9 w-9" aria-hidden>
          <AvatarFallback className="bg-primary/10 text-primary text-sm font-semibold">
            {userInitials}
          </AvatarFallback>
        </Avatar>
      </CardContent>
    </Card>
  )
}
