import { useState } from 'react'
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom'
import {
  Users,
  ShieldCheck,
  CreditCard,
  BarChart3,
  Activity,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Bell,
  LogOut,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { ScrollArea } from '@/components/ui/scroll-area'

const adminNavItems = [
  { to: '/admin/users', label: 'Users', icon: Users },
  { to: '/admin/moderation', label: 'Moderation', icon: ShieldCheck },
  { to: '/admin/plans', label: 'Plans', icon: CreditCard },
  { to: '/admin/analytics', label: 'Analytics', icon: BarChart3 },
  { to: '/admin/health', label: 'System Health', icon: Activity },
]

export function AdminLayout() {
  const [collapsed, setCollapsed] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <aside
        className={cn(
          'flex flex-col border-r border-border bg-card transition-all duration-300',
          collapsed ? 'w-[72px]' : 'w-64'
        )}
      >
        <div className="flex h-16 items-center justify-between border-b border-border px-4">
          {!collapsed && (
            <Link to="/admin/users" className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-[rgb(var(--lavender))] to-[rgb(var(--violet))] text-white">
                <Sparkles className="h-5 w-5" />
              </div>
              <span className="font-bold text-foreground">Admin</span>
            </Link>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setCollapsed(!collapsed)}
            className="shrink-0 rounded-full"
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? (
              <ChevronRight className="h-5 w-5" />
            ) : (
              <ChevronLeft className="h-5 w-5" />
            )}
          </Button>
        </div>
        <ScrollArea className="flex-1 py-4">
          <nav className="space-y-1 px-2" aria-label="Admin navigation">
            {adminNavItems.map((item) => {
              const Icon = item.icon
              const isActive =
                location.pathname === item.to ||
                location.pathname.startsWith(item.to + '/')
              return (
                <Link key={item.to} to={item.to}>
                  <span
                    className={cn(
                      'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors',
                      isActive
                        ? 'bg-primary/10 text-primary'
                        : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                      collapsed && 'justify-center px-2'
                    )}
                  >
                    <Icon className="h-5 w-5 shrink-0" aria-hidden />
                    {!collapsed && <span>{item.label}</span>}
                  </span>
                </Link>
              )
            })}
          </nav>
        </ScrollArea>
      </aside>
      <div className="flex flex-1 flex-col overflow-hidden">
        <header
          className="sticky top-0 z-40 flex h-16 items-center gap-4 border-b border-border bg-background px-6"
          role="banner"
        >
          <div className="flex flex-1 items-center gap-4">
            <div className="hidden md:flex items-center gap-4">
              <div className="flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2">
                <span className="text-sm font-medium text-primary">MAU</span>
                <span className="text-sm font-bold text-foreground">12.4k</span>
              </div>
              <div className="flex items-center gap-2 rounded-full bg-accent/20 px-4 py-2">
                <span className="text-sm font-medium text-accent-foreground">MRR</span>
                <span className="text-sm font-bold text-foreground">$45.2k</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="rounded-full" aria-label="Notifications">
              <Bell className="h-5 w-5" />
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-full"
                  aria-label="Admin profile menu"
                >
                  <Avatar className="h-9 w-9">
                    <AvatarFallback className="bg-primary/10 text-primary text-sm font-semibold">
                      A
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 rounded-xl">
                <DropdownMenuLabel>Admin Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/dashboard" className="flex items-center gap-2">
                    Dashboard
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-destructive focus:text-destructive"
                  onClick={() => navigate('/login')}
                >
                  <LogOut className="h-4 w-4" />
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>
        <main className="flex-1 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
