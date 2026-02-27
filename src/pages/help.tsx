import { useState, useEffect, useCallback, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { Search, Sparkles, Book, Mail, AlertCircle, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { Skeleton } from '@/components/ui/skeleton'
import { fetchHelpArticles, fetchHelpCategories } from '@/api/help'
import type { Article, Category } from '@/types/help'

function toArraySafe<T>(data: T[] | null | undefined): T[] {
  return Array.isArray(data) ? data : []
}

interface HelpTopic {
  title: string
  items: { q: string; a: string }[]
}

function groupArticlesByCategory(
  articles: Article[],
  categories: Category[]
): HelpTopic[] {
  const byCategory = new Map<string, Article[]>()
  for (const a of articles ?? []) {
    const catId = a.categoryId ?? 'other'
    const list = byCategory.get(catId) ?? []
    list.push(a)
    byCategory.set(catId, list)
  }
  const result: HelpTopic[] = []
  for (const cat of categories ?? []) {
    const items = byCategory.get(cat.id) ?? []
    if (items.length > 0) {
      result.push({
        title: cat.name ?? 'Help',
        items: items.map((a) => ({
          q: a.title ?? '',
          a: a.excerpt ?? a.content ?? '',
        })),
      })
    }
  }
  const uncategorized = (articles ?? []).filter(
    (a) => !categories?.some((c) => c.id === a.categoryId)
  )
  if (uncategorized.length > 0) {
    result.push({
      title: 'General',
      items: uncategorized.map((a) => ({
        q: a.title ?? '',
        a: a.excerpt ?? a.content ?? '',
      })),
    })
  }
  return result.length > 0 ? result : []
}

export function HelpPage() {
  const [search, setSearch] = useState('')
  const [articles, setArticles] = useState<Article[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)

  const loadData = useCallback(async () => {
    setIsLoading(true)
    setHasError(false)
    try {
      const [artsRes, catsRes] = await Promise.all([
        fetchHelpArticles(),
        fetchHelpCategories(),
      ])
      setArticles(toArraySafe(artsRes))
      setCategories(toArraySafe(catsRes))
    } catch {
      setHasError(true)
      setArticles([])
      setCategories([])
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])

  const helpTopics = useMemo(
    () => groupArticlesByCategory(articles, categories),
    [articles, categories]
  )

  const searchLower = (search ?? '').trim().toLowerCase()
  const filteredTopics = useMemo(() => {
    if (!searchLower) return helpTopics
    return helpTopics
      .map((topic) => ({
        ...topic,
        items: (topic.items ?? []).filter(
          (item) =>
            (item.q ?? '').toLowerCase().includes(searchLower) ||
            (item.a ?? '').toLowerCase().includes(searchLower)
        ),
      }))
      .filter((t) => (t.items ?? []).length > 0)
  }, [helpTopics, searchLower])

  const isEmpty = !isLoading && !hasError && filteredTopics.length === 0

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-border bg-card shadow-sm">
        <div className="container flex h-14 items-center justify-between px-4 sm:h-16 sm:px-6">
          <Link
            to="/"
            className="flex items-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-lg"
            aria-label="Go to StudySpark home"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-lavender to-violet text-primary-foreground sm:h-10 sm:w-10">
              <Sparkles className="h-5 w-5" aria-hidden />
            </div>
            <span className="text-lg font-bold text-foreground sm:text-xl">
              StudySpark
            </span>
          </Link>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" asChild className="sm:size-default">
              <Link to="/login" aria-label="Log in to your account">
                Log in
              </Link>
            </Button>
            <Button size="sm" asChild className="sm:size-default">
              <Link to="/signup" aria-label="Sign up for StudySpark">
                Sign up
              </Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="container max-w-3xl flex-1 px-4 py-8 sm:px-6 sm:py-12">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground sm:text-3xl">
            Help Center
          </h1>
          <p className="mt-2 text-sm text-muted-foreground sm:text-base">
            Find answers and get support
          </p>
          <div
            className="relative mx-auto mt-6 max-w-md sm:mt-8"
            role="search"
            aria-label="Search help articles"
          >
            <Search
              className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden
            />
            <Input
              placeholder="Search help articles..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 rounded-xl"
              aria-label="Search help articles"
              aria-describedby="search-hint"
            />
            <span id="search-hint" className="sr-only">
              Type to filter help articles by keyword
            </span>
          </div>
        </div>

        <div className="mt-10 space-y-8 sm:mt-12">
          {isLoading ? (
            <div className="space-y-8 animate-fade-in">
              {[1, 2, 3].map((i) => (
                <div key={i} className="space-y-4">
                  <Skeleton className="h-6 w-40 rounded-lg" />
                  <div className="space-y-2">
                    <Skeleton className="h-12 w-full rounded-lg" />
                    <Skeleton className="h-12 w-full rounded-lg" />
                    <Skeleton className="h-12 w-full rounded-lg" />
                  </div>
                </div>
              ))}
            </div>
          ) : hasError ? (
            <Card className="rounded-2xl border-destructive/30 bg-destructive/5 shadow-card">
              <CardContent className="flex flex-col items-center gap-4 p-8">
                <div
                  className="flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10"
                  aria-hidden
                >
                  <AlertCircle className="h-6 w-6 text-destructive" />
                </div>
                <div className="text-center space-y-1">
                  <h2 className="font-semibold text-foreground">
                    Could not load help articles
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    Something went wrong. Please check your connection and try
                    again.
                  </p>
                </div>
                <Button
                  variant="outline"
                  onClick={loadData}
                  className="gap-2"
                  aria-label="Retry loading help articles"
                >
                  <RefreshCw className="h-4 w-4" aria-hidden />
                  Retry
                </Button>
              </CardContent>
            </Card>
          ) : isEmpty ? (
            <Card className="rounded-2xl shadow-card">
              <CardContent className="flex flex-col items-center gap-4 p-8">
                <div
                  className="flex h-14 w-14 items-center justify-center rounded-2xl bg-muted"
                  aria-hidden
                >
                  <Book className="h-7 w-7 text-muted-foreground" />
                </div>
                <div className="text-center space-y-1">
                  <h2 className="font-semibold text-foreground">
                    No articles found
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    {searchLower
                      ? 'Try a different search term or clear the search.'
                      : 'Help articles will appear here once available.'}
                  </p>
                </div>
                {searchLower && (
                  <Button
                    variant="outline"
                    onClick={() => setSearch('')}
                    aria-label="Clear search"
                  >
                    Clear search
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-8 animate-fade-in">
              {filteredTopics.map((topic) => (
                <section
                  key={topic.title}
                  aria-labelledby={`topic-${topic.title.replace(/\s+/g, '-')}`}
                >
                  <h2
                    id={`topic-${topic.title.replace(/\s+/g, '-')}`}
                    className="mb-4 flex items-center gap-2 text-lg font-semibold text-foreground"
                  >
                    <Book
                      className="h-5 w-5 shrink-0 text-primary"
                      aria-hidden
                    />
                    {topic.title}
                  </h2>
                  <Accordion
                    type="single"
                    collapsible
                    className="w-full"
                    aria-label={`${topic.title} FAQ`}
                  >
                    {(topic.items ?? []).map((item) => (
                      <AccordionItem key={item.q} value={item.q}>
                        <AccordionTrigger
                          className="text-left hover:no-underline"
                          aria-label={`Expand: ${item.q}`}
                        >
                          {item.q}
                        </AccordionTrigger>
                        <AccordionContent className="text-muted-foreground">
                          {item.a}
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </section>
              ))}
            </div>
          )}
        </div>

        <Card className="mt-10 rounded-2xl shadow-card sm:mt-12">
          <CardContent className="flex flex-col items-center gap-4 p-6 md:flex-row md:justify-between md:p-8">
            <div className="flex items-center gap-4">
              <div
                className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary/10"
                aria-hidden
              >
                <Mail className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">
                  Still need help?
                </h3>
                <p className="text-sm text-muted-foreground">
                  Contact our support team
                </p>
              </div>
            </div>
            <Button asChild className="w-full md:w-auto">
              <a
                href="mailto:support@studyspark.com"
                aria-label="Contact support via email"
              >
                Contact Support
              </a>
            </Button>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
