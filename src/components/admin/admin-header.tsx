import { Link } from 'react-router-dom'
import { Bell, ArrowLeft } from 'lucide-react'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'

export function AdminHeader() {
  return (
    <header
      className="sticky top-0 z-40 flex h-16 items-center gap-4 border-b border-border bg-background px-6"
      role="banner"
    >
      <div className="flex flex-1 items-center gap-4">
        <Button variant="ghost" size="icon" asChild aria-label="Back to dashboard">
          <Link to="/dashboard">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
      </div>
      <div className="flex items-center gap-4">
        <div className="hidden sm:block">
          <p className="text-xs font-medium text-muted-foreground">System load</p>
          <Progress value={65} className="h-1.5 w-24" />
        </div>
        <Button variant="ghost" size="icon" aria-label="Notifications">
          <Bell className="h-5 w-5" />
        </Button>
        <Avatar className="h-9 w-9">
          <AvatarFallback className="bg-primary/10 text-primary text-sm font-semibold">
            A
          </AvatarFallback>
        </Avatar>
      </div>
    </header>
  )
}
