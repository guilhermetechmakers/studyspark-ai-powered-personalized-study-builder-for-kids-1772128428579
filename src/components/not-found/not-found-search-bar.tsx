/**
 * NotFoundSearchBar - Lightweight search input for the 404 page.
 * Submits to /search?q=... or /about-help?q=... for content discovery.
 */

import { useCallback } from 'react'
import type { FormEvent } from 'react'
import { Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export interface NotFoundSearchBarProps {
  value: string
  onChange: (value: string) => void
  onSubmit: (query: string) => void
  className?: string
}

export function NotFoundSearchBar({
  value,
  onChange,
  onSubmit,
  className,
}: NotFoundSearchBarProps) {
  const handleSubmit = useCallback(
    (e: FormEvent<HTMLFormElement>) => {
      e.preventDefault()
      const trimmed = (value ?? '').trim()
      if (trimmed.length > 0) {
        onSubmit(trimmed)
      }
    },
    [value, onSubmit]
  )

  return (
    <form
      onSubmit={handleSubmit}
      className={cn('flex w-full max-w-md flex-col gap-2 sm:flex-row sm:items-center', className)}
      role="search"
      aria-label="Search for content"
    >
      <div className="relative flex flex-1">
        <Search
          className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
          aria-hidden
        />
        <Input
          type="search"
          role="searchbox"
          aria-label="Search for content"
          placeholder="Search studies, help articles..."
          value={value}
          onChange={(e) => onChange(e.target.value ?? '')}
          className="h-11 rounded-xl pl-10 pr-4"
        />
      </div>
      <Button
        type="submit"
        variant="secondary"
        size="default"
        className="rounded-xl sm:shrink-0"
        aria-label="Submit search"
      >
        Search
      </Button>
    </form>
  )
}
