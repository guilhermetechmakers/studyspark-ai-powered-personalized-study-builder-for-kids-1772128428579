import { Link, useNavigate } from 'react-router-dom'
import { Search, Bell, User, Settings, LogOut, Plus, Shield } from 'lucide-react'
import { useAuthContext } from '@/contexts/auth-context'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

export function DashboardHeader() {
  const navigate = useNavigate()
  const { user, signOut } = useAuthContext()

  const handleLogout = async () => {
    try {
      await signOut()
      toast.success('Signed out successfully')
      navigate('/login', { replace: true })
    } catch {
      toast.error('Failed to sign out')
    }
  }

  const initials = user?.name
    ?.split(/\s+/)
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase() ?? 'P'

  return (
    <header
      className="sticky top-0 z-40 flex h-16 items-center gap-4 border-b border-border bg-background px-6"
      role="banner"
    >
      <div className="flex flex-1 items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search
            className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden
          />
          <Input
            placeholder="Search studies..."
            className="pl-9"
            aria-label="Search studies"
          />
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Button
          variant="accent"
          size="default"
          className="gap-2"
          onClick={() => navigate('/dashboard/create')}
          aria-label="Create new study"
        >
          <Plus className="h-5 w-5" />
          Create Study
        </Button>
        <Button variant="ghost" size="icon" aria-label="Notifications" asChild>
          <Link to="/dashboard/notifications">
            <Bell className="h-5 w-5" />
          </Link>
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="rounded-full" aria-label="Profile menu">
              <Avatar className="h-9 w-9">
                <AvatarFallback className="bg-primary/10 text-primary text-sm font-semibold">
                  {initials}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link to="/dashboard/settings" className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                Settings
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link to="/help" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                Help
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link to="/admin" className="flex items-center gap-2">
                <Shield className="h-4 w-4" />
                Admin
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-destructive focus:text-destructive"
              onClick={handleLogout}
            >
              <LogOut className="h-4 w-4" />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
