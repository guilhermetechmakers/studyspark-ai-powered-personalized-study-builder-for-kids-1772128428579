import { useState, useCallback, useEffect } from 'react'
import { Search, BookOpen } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Skeleton } from '@/components/ui/skeleton'
import { useDebouncedCallback } from '@/hooks/use-debounce'
import { fetchHelpArticles, fetchHelpCategories } from '@/api/help'
import type { Article, Category } from '@/types/help'
function toArraySafe<T>(data: T[] | null | undefined): T[] {
  return Array.isArray(data) ? data : []
}

function ArticleCard({
  article,
  onClick,
}: {
  article: Article
  onClick: () => void
}) {
  return (
    <Card
      className="cursor-pointer transition-all duration-200 hover:scale-[1.01] hover:shadow-card-hover"
      onClick={onClick}
    >
      <CardContent className="p-5">
        <h3 className="font-semibold text-foreground">{article.title}</h3>
        <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
          {article.excerpt}
        </p>
        <p className="mt-2 text-xs text-muted-foreground">
          Updated {article.lastUpdated}
        </p>
      </CardContent>
    </Card>
  )
}

function ArticleDetailPanel({
  article,
  open,
  onClose,
}: {
  article: Article | null
  open: boolean
  onClose: () => void
}) {
  if (!article) return null
  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-h-[85vh] max-w-2xl overflow-y-auto" showCloseButton>
        <DialogHeader>
          <DialogTitle>{article.title}</DialogTitle>
        </DialogHeader>
        <div className="prose prose-sm max-w-none dark:prose-invert">
          <div dangerouslySetInnerHTML={{ __html: article.content }} />
        </div>
        <p className="text-xs text-muted-foreground">Last updated: {article.lastUpdated}</p>
      </DialogContent>
    </Dialog>
  )
}

export function HelpCenter() {
  const [articles, setArticles] = useState<Article[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [debouncedQuery, setDebouncedQuery] = useState('')
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null)
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null)
  const [detailOpen, setDetailOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)

  const debouncedSetQuery = useDebouncedCallback((q: string) => {
    setDebouncedQuery(q)
  }, 300)

  useEffect(() => {
    debouncedSetQuery(searchQuery)
  }, [searchQuery, debouncedSetQuery])

  const loadCategories = useCallback(async () => {
    try {
      const catsRes = await fetchHelpCategories()
      setCategories(toArraySafe(catsRes))
    } catch {
      setCategories([])
    }
  }, [])

  const loadArticles = useCallback(async () => {
    setIsLoading(true)
    setHasError(false)
    try {
      const artsRes = await fetchHelpArticles({
        category: selectedCategoryId ?? undefined,
        q: debouncedQuery.trim() || undefined,
      })
      setArticles(toArraySafe(artsRes))
    } catch {
      setHasError(true)
      setArticles([])
    } finally {
      setIsLoading(false)
    }
  }, [selectedCategoryId, debouncedQuery])

  useEffect(() => {
    loadCategories()
  }, [loadCategories])

  useEffect(() => {
    loadArticles()
  }, [loadArticles])

  const filteredArticles = articles ?? []

  const openArticle = (article: Article) => {
    setSelectedArticle(article)
    setDetailOpen(true)
  }

  return (
    <section className="space-y-6" aria-labelledby="help-heading">
      <div>
        <h2 id="help-heading" className="flex items-center gap-2 text-xl font-bold text-foreground">
          <BookOpen className="h-6 w-6 text-primary" />
          Help Center
        </h2>
        <p className="mt-1 text-muted-foreground">
          Search articles and find step-by-step guides
        </p>
      </div>

      {/* Search bar */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search help articles..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="rounded-xl pl-10"
          aria-label="Search help articles"
        />
      </div>

      {/* Category chips */}
      <div className="flex flex-wrap gap-2">
        <Button
          variant={selectedCategoryId === null ? 'default' : 'outline'}
          size="sm"
          className="rounded-full"
          onClick={() => setSelectedCategoryId(null)}
        >
          All
        </Button>
        {(categories ?? []).map((cat) => (
          <Button
            key={cat.id}
            variant={selectedCategoryId === cat.id ? 'default' : 'outline'}
            size="sm"
            className="rounded-full"
            onClick={() => setSelectedCategoryId(cat.id)}
          >
            {cat.name}
          </Button>
        ))}
      </div>

      {/* Article grid */}
      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-32 rounded-2xl" />
          ))}
        </div>
      ) : hasError ? (
        <Card className="rounded-2xl border-destructive/30 bg-destructive/5">
          <CardContent className="flex flex-col items-center gap-4 p-8">
            <p className="text-muted-foreground">Could not load articles. Please try again.</p>
            <Button variant="outline" onClick={loadArticles}>
              Retry
            </Button>
          </CardContent>
        </Card>
      ) : (filteredArticles ?? []).length === 0 ? (
        <Card className="rounded-2xl">
          <CardContent className="flex flex-col items-center gap-4 p-8">
            <BookOpen className="h-12 w-12 text-muted-foreground" />
            <p className="text-center text-muted-foreground">
              No articles found. Try a different search or category.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div
          className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 animate-stagger"
          role="list"
        >
          {(filteredArticles ?? []).map((article) => (
            <div key={article.id} role="listitem">
              <ArticleCard article={article} onClick={() => openArticle(article)} />
            </div>
          ))}
        </div>
      )}

      <ArticleDetailPanel
        article={selectedArticle}
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
      />
    </section>
  )
}
