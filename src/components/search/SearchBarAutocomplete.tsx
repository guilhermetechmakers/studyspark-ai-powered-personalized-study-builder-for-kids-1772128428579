/**
 * SearchBar with Autocomplete - Real-time suggestions, recent queries, keyboard nav.
 * Pill-shaped input, dropdown with suggestions, ARIA labels.
 */

import { useState, useCallback, useEffect, useRef } from 'react'
import { Search, X, Clock, TrendingUp } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { SuggestionItem } from '@/types/search'

export interface SearchBarAutocompleteProps {
  value: string
  onChange: (value: string) => void
  onSubmit?: (query: string) => void
  onSelectSuggestion?: (suggestion: SuggestionItem) => void
  suggestions?: SuggestionItem[]
  recentlyUsed?: string[]
  isLoading?: boolean
  placeholder?: string
  debounceMs?: number
  onSuggestionsRequest?: (query: string) => void
  className?: string
}

export function SearchBarAutocomplete({
  value,
  onChange,
  onSubmit,
  onSelectSuggestion,
  suggestions = [],
  recentlyUsed = [],
  isLoading = false,
  placeholder = 'Search studies, materials, help...',
  debounceMs = 300,
  onSuggestionsRequest,
  className,
}: SearchBarAutocompleteProps) {
  const [localValue, setLocalValue] = useState(value)
  const [isOpen, setIsOpen] = useState(false)
  const [highlightedIndex, setHighlightedIndex] = useState(-1)
  const containerRef = useRef<HTMLDivElement>(null)
  const listRef = useRef<HTMLUListElement>(null)

  const safeSuggestions = Array.isArray(suggestions) ? suggestions : []
  const safeRecent = Array.isArray(recentlyUsed) ? recentlyUsed : []
  const displayItems = localValue.trim()
    ? safeSuggestions
    : safeRecent.slice(0, 5).map((t) => ({ text: t, type: 'recent' as const }))
  const hasItems = displayItems.length > 0

  useEffect(() => {
    setLocalValue(value)
  }, [value])

  useEffect(() => {
    const timer = setTimeout(() => {
      if (localValue !== value) onChange(localValue)
      if (onSuggestionsRequest && localValue.trim()) {
        onSuggestionsRequest(localValue.trim())
      }
    }, debounceMs)
    return () => clearTimeout(timer)
  }, [localValue, debounceMs, onChange, value, onSuggestionsRequest])

  useEffect(() => {
    if (isOpen && !localValue.trim()) {
      onSuggestionsRequest?.('')
    }
  }, [isOpen, localValue, onSuggestionsRequest])

  const handleClear = useCallback(() => {
    setLocalValue('')
    onChange('')
    setIsOpen(true)
    setHighlightedIndex(-1)
  }, [onChange])

  const handleSelect = useCallback(
    (item: { text: string; type: SuggestionItem['type'] }) => {
      setLocalValue(item.text)
      onChange(item.text)
      setIsOpen(false)
      setHighlightedIndex(-1)
      onSelectSuggestion?.({ text: item.text, type: item.type })
      onSubmit?.(item.text)
    },
    [onChange, onSelectSuggestion, onSubmit]
  )

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault()
      const q = localValue.trim()
      if (q) {
        onSubmit?.(q)
        setIsOpen(false)
      }
    },
    [localValue, onSubmit]
  )

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (!isOpen || !hasItems) {
        if (e.key === 'Escape') setIsOpen(false)
        return
      }
      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault()
          setHighlightedIndex((i) => (i < displayItems.length - 1 ? i + 1 : 0))
          break
        case 'ArrowUp':
          e.preventDefault()
          setHighlightedIndex((i) => (i > 0 ? i - 1 : displayItems.length - 1))
          break
        case 'Enter':
          e.preventDefault()
          if (highlightedIndex >= 0 && highlightedIndex < displayItems.length) {
            const item = displayItems[highlightedIndex]
            handleSelect(typeof item === 'string' ? { text: item, type: 'recent' } : item)
          } else if (localValue.trim()) {
            onSubmit?.(localValue.trim())
            setIsOpen(false)
          }
          break
        case 'Escape':
          e.preventDefault()
          setIsOpen(false)
          setHighlightedIndex(-1)
          break
        default:
          break
      }
    },
    [isOpen, hasItems, displayItems, highlightedIndex, localValue, handleSelect, onSubmit]
  )

  useEffect(() => {
    if (highlightedIndex >= 0 && listRef.current) {
      const el = listRef.current.children[highlightedIndex] as HTMLElement
      el?.scrollIntoView({ block: 'nearest' })
    }
  }, [highlightedIndex])

  useEffect(() => {
    function handleClickOutside(ev: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(ev.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div ref={containerRef} className={cn('relative flex flex-1', className)}>
      <form onSubmit={handleSubmit} className="flex flex-1">
        <div className="relative flex flex-1">
          <Search
            className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden
          />
          <Input
            type="search"
            role="combobox"
            aria-expanded={isOpen}
            aria-autocomplete="list"
            aria-controls="search-suggestions-list"
            aria-activedescendant={
              highlightedIndex >= 0 ? `suggestion-${highlightedIndex}` : undefined
            }
            aria-label="Search studies, materials, and help"
            placeholder={placeholder}
            value={localValue}
            onChange={(e) => {
              setLocalValue(e.target.value)
              setIsOpen(true)
              setHighlightedIndex(-1)
            }}
            onFocus={() => setIsOpen(true)}
            onKeyDown={handleKeyDown}
            className="rounded-full border-2 border-border pl-10 pr-10 py-6 text-base shadow-sm transition-all focus-visible:ring-2 focus-visible:ring-[rgb(var(--tangerine))]/40 focus-visible:border-[rgb(var(--tangerine))]"
          />
          {localValue && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="absolute right-1 top-1/2 h-8 w-8 -translate-y-1/2 rounded-full"
              onClick={handleClear}
              aria-label="Clear search"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </form>

      {isOpen && (hasItems || isLoading) && (
        <div
          id="search-suggestions-list"
          role="listbox"
          className="absolute left-0 right-0 top-full z-50 mt-2 rounded-2xl border border-border bg-card py-2 shadow-card-hover animate-fade-in"
        >
          {isLoading ? (
            <div className="flex items-center gap-2 px-4 py-3 text-sm text-muted-foreground">
              <div className="h-4 w-4 animate-pulse rounded-full bg-muted" />
              Loading suggestions...
            </div>
          ) : (
            <ul ref={listRef} className="max-h-64 overflow-y-auto">
              {displayItems.map((item, idx) => {
                const text = typeof item === 'string' ? item : item.text
                const type = typeof item === 'string' ? 'recent' : item.type
                const isHighlighted = idx === highlightedIndex
                return (
                  <li
                    key={`${type}-${idx}-${text}`}
                    id={`suggestion-${idx}`}
                    role="option"
                    aria-selected={isHighlighted}
                    className={cn(
                      'flex cursor-pointer items-center gap-3 px-4 py-2.5 text-sm transition-colors',
                      isHighlighted ? 'bg-primary/10 text-primary' : 'hover:bg-muted'
                    )}
                    onMouseEnter={() => setHighlightedIndex(idx)}
                    onClick={() => handleSelect(typeof item === 'string' ? { text: item, type: 'recent' } : item)}
                  >
                    {type === 'recent' ? (
                      <Clock className="h-4 w-4 shrink-0 text-muted-foreground" />
                    ) : (
                      <TrendingUp className="h-4 w-4 shrink-0 text-muted-foreground" />
                    )}
                    <span>{text}</span>
                  </li>
                )
              })}
            </ul>
          )}
        </div>
      )}
    </div>
  )
}
