/**
 * TableOfContents - Interactive in-page navigation with anchor links.
 * Collapsible on mobile; sticky on desktop. Highlights active section on scroll.
 */
import { useState, useEffect, useCallback } from 'react'
import { ChevronDown, List } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface TocItem {
  id: string
  title: string
}

export interface TableOfContentsProps {
  items: TocItem[]
  className?: string
}

export function TableOfContents({ items, className }: TableOfContentsProps) {
  const [activeId, setActiveId] = useState<string | null>(null)
  const [isOpen, setIsOpen] = useState(false)

  const safeItems = Array.isArray(items) ? items : []

  const handleScroll = useCallback(() => {
    const sections = safeItems
      .map((item) => document.getElementById(item.id))
      .filter((el): el is HTMLElement => el != null)

    if (sections.length === 0) return

    const scrollY = window.scrollY
    let current: string | null = null

    for (let i = sections.length - 1; i >= 0; i--) {
      const rect = sections[i].getBoundingClientRect()
      const top = rect.top + scrollY - 120
      if (scrollY >= top) {
        current = safeItems[i]?.id ?? null
        break
      }
    }

    if (!current && sections[0]) {
      current = safeItems[0]?.id ?? null
    }

    setActiveId(current)
  }, [safeItems])

  useEffect(() => {
    handleScroll()
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [handleScroll])

  const handleClick = (id: string) => {
    const el = document.getElementById(id)
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
    setIsOpen(false)
  }

  if (safeItems.length === 0) return null

  const navContent = (
    <ul className="space-y-1">
      {safeItems.map((item) => (
        <li key={item.id}>
          <a
            href={`#${item.id}`}
            onClick={(e) => {
              e.preventDefault()
              handleClick(item.id)
            }}
            className={cn(
              'block rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200',
              'hover:bg-primary/10 hover:text-primary',
              'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:rounded-lg',
              activeId === item.id
                ? 'bg-primary/10 text-primary'
                : 'text-muted-foreground'
            )}
            aria-current={activeId === item.id ? 'location' : undefined}
          >
            {item.title}
          </a>
        </li>
      ))}
    </ul>
  )

  return (
    <nav
      aria-label="Table of contents"
      className={cn('print:hidden', className)}
    >
      {/* Mobile: collapsible */}
      <div className="lg:hidden">
        <button
          type="button"
          onClick={() => setIsOpen((prev) => !prev)}
          className={cn(
            'flex w-full items-center justify-between rounded-2xl border border-border/60 bg-muted/50 p-4',
            'text-left font-medium text-foreground',
            'transition-colors hover:bg-muted/70',
            'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:rounded-2xl'
          )}
          aria-expanded={isOpen}
          aria-controls="tos-toc-list"
        >
          <span className="flex items-center gap-2">
            <List className="h-5 w-5" aria-hidden />
            On this page
          </span>
          <ChevronDown
            className={cn('h-5 w-5 transition-transform duration-200', isOpen && 'rotate-180')}
            aria-hidden
          />
        </button>
        <div
          id="tos-toc-list"
          className={cn(
            'overflow-hidden transition-all duration-200',
            isOpen ? 'max-h-[500px] opacity-100 mt-2' : 'max-h-0 opacity-0'
          )}
        >
          <div className="rounded-2xl border border-border/60 bg-muted/50 p-4">
            {navContent}
          </div>
        </div>
      </div>

      {/* Desktop: sticky sidebar */}
      <div className="hidden lg:block">
        <div className="sticky top-24 rounded-2xl border border-border/60 bg-muted/50 p-4">
          <p className="mb-3 text-sm font-semibold text-foreground">On this page</p>
          {navContent}
        </div>
      </div>
    </nav>
  )
}
