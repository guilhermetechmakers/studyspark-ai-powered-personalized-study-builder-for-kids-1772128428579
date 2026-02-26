import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import {
  LayoutDashboard,
  PlusCircle,
  FolderOpen,
  Settings,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Upload,
  ShoppingCart,
  HelpCircle,
  Shield,
  User,
  Users,
  BarChart3,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'

const navItems = [
  { to: '/dashboard', label: 'Overview', icon: LayoutDashboard },
  { to: '/dashboard/profile', label: 'Profile', icon: User },
  { to: '/dashboard/children', label: 'Children', icon: Users },
  { to: '/dashboard/studies', label: 'Study Library', icon: FolderOpen },
  { to: '/dashboard/analytics', label: 'Analytics', icon: BarChart3 },
  { to: '/dashboard/analytics', label: 'Progress & Analytics', icon: BarChart3 },
  { to: '/dashboard/create', label: 'Create Study', icon: PlusCircle },
  { to: '/dashboard/upload-materials', label: 'Upload Materials', icon: Upload },
  { to: '/dashboard/checkout', label: 'Checkout', icon: ShoppingCart },
]

const bottomItems = [
  { to: '/about-help', label: 'Help', icon: HelpCircle },
  { to: '/dashboard/settings', label: 'Settings', icon: Settings },
  { to: '/admin', label: 'Admin', icon: Shield },
]

export function DashboardSidebar() {
  const [collapsed, setCollapsed] = useState(false)
  const location = useLocation()

  return (
    <aside
      className={cn(
        'flex flex-col border-r border-border bg-card transition-all duration-300',
        collapsed ? 'w-[72px]' : 'w-64'
      )}
    >
      <div className="flex h-16 items-center justify-between border-b border-border px-4">
        {!collapsed && (
          <Link to="/dashboard" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-[rgb(var(--lavender))] to-[rgb(var(--violet))] text-white">
              <Sparkles className="h-5 w-5" />
            </div>
            <span className="font-bold text-foreground">StudySpark</span>
          </Link>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setCollapsed(!collapsed)}
          className="shrink-0"
        >
          {collapsed ? (
            <ChevronRight className="h-5 w-5" />
          ) : (
            <ChevronLeft className="h-5 w-5" />
          )}
        </Button>
      </div>
      <ScrollArea className="flex-1 py-4">
        <nav className="space-y-1 px-2">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = location.pathname === item.to || location.pathname.startsWith(item.to + '/')
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
                  <Icon className="h-5 w-5 shrink-0" />
                  {!collapsed && (
                    <span>{item.label}</span>
                  )}
                </span>
              </Link>
            )
          })}
        </nav>
        <Separator className="my-4" />
        <nav className="space-y-1 px-2">
          {bottomItems.map((item) => {
            const Icon = item.icon
            const isActive = location.pathname === item.to
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
                  <Icon className="h-5 w-5 shrink-0" />
                  {!collapsed && (
                    <span>{item.label}</span>
                  )}
                </span>
              </Link>
            )
          })}
        </nav>
      </ScrollArea>
    </aside>
  )
}
