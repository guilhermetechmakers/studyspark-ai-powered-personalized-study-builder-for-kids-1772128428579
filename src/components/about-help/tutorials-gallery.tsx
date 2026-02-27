import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { Play, Clock, RefreshCw } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Skeleton } from '@/components/ui/skeleton'
import { fetchHelpTutorials } from '@/api/help'
import type { Tutorial } from '@/types/help'

function toArraySafe<T>(data: T[] | null | undefined): T[] {
  return Array.isArray(data) ? data : []
}

function VideoCard({
  tutorial,
  onPlay,
}: {
  tutorial: Tutorial
  onPlay: () => void
}) {
  return (
    <Card
      className="group cursor-pointer overflow-hidden transition-all duration-200 hover:scale-[1.02] hover:shadow-card-hover"
      onClick={onPlay}
    >
      <div className="relative aspect-video bg-muted">
        {tutorial.thumbnailUrl ? (
          <img
            src={tutorial.thumbnailUrl}
            alt=""
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-lavender/20 to-tangerine/20">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-card/90 shadow-card transition-transform group-hover:scale-110">
              <Play className="h-8 w-8 shrink-0 text-primary" aria-hidden />
            </div>
          </div>
        )}
        <div className="absolute bottom-2 right-2 flex items-center gap-1 rounded-full bg-foreground/80 px-2 py-1 text-xs text-primary-foreground">
          <Clock className="h-3.5 w-3.5 shrink-0" aria-hidden />
          {tutorial.duration}
        </div>
      </div>
      <CardContent className="p-4">
        <h3 className="font-semibold text-foreground">{tutorial.title}</h3>
      </CardContent>
    </Card>
  )
}

export function TutorialsGallery() {
  const [tutorials, setTutorials] = useState<Tutorial[]>([])
  const [selectedTutorial, setSelectedTutorial] = useState<Tutorial | null>(null)
  const [playbackOpen, setPlaybackOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)

  const loadTutorials = useCallback(async () => {
    setIsLoading(true)
    setHasError(false)
    try {
      const res = await fetchHelpTutorials()
      setTutorials(toArraySafe(res))
    } catch {
      setHasError(true)
      setTutorials([])
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    loadTutorials()
  }, [loadTutorials])

  const openPlayback = (tutorial: Tutorial) => {
    setSelectedTutorial(tutorial)
    setPlaybackOpen(true)
  }

  return (
    <section className="space-y-6" aria-labelledby="tutorials-heading">
      <div>
        <h2 id="tutorials-heading" className="text-xl font-bold text-foreground">
          Tutorial Videos
        </h2>
        <p className="mt-1 text-muted-foreground">
          Short onboarding clips with transcripts
        </p>
      </div>

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="aspect-video rounded-2xl" />
          ))}
        </div>
      ) : hasError ? (
        <Card className="rounded-2xl border-destructive/30 bg-destructive/5">
          <CardContent className="flex flex-col items-center gap-4 p-8">
            <p className="text-muted-foreground">Could not load tutorials. Please try again.</p>
            <Button variant="outline" onClick={loadTutorials}>
              Retry
            </Button>
          </CardContent>
        </Card>
      ) : (tutorials ?? []).length === 0 ? (
        <Card
          className="rounded-2xl border-2 border-dashed border-border"
          role="status"
          aria-label="No tutorials available"
        >
          <CardContent className="flex flex-col items-center gap-6 p-8 md:p-12">
            <div
              className="flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-peach to-tangerine text-primary-foreground shadow-card"
              role="img"
              aria-label="Video tutorial placeholder"
            >
              <Play className="h-10 w-10 shrink-0" aria-hidden />
            </div>
            <div className="space-y-2 text-center">
              <h3 className="text-lg font-semibold text-foreground">
                No tutorials available yet
              </h3>
              <p className="max-w-sm text-sm text-muted-foreground">
                Check back soon for helpful video guides, or explore our help articles below.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-center">
              <Button
                variant="accent"
                onClick={loadTutorials}
                className="gap-2"
                aria-label="Try loading tutorials again"
              >
                <RefreshCw className="h-4 w-4 shrink-0" aria-hidden />
                Try again
              </Button>
              <Button asChild variant="outline" className="gap-2">
                <Link to="/about-help#help-center" aria-label="Browse help articles">
                  Browse help articles
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 animate-stagger" role="list">
          {(tutorials ?? []).map((tutorial) => (
            <div key={tutorial.id} role="listitem">
              <VideoCard tutorial={tutorial} onPlay={() => openPlayback(tutorial)} />
            </div>
          ))}
        </div>
      )}

      <Dialog open={playbackOpen} onOpenChange={setPlaybackOpen}>
        <DialogContent className="max-w-3xl" showCloseButton>
          <DialogHeader>
            <DialogTitle>{selectedTutorial?.title ?? 'Video'}</DialogTitle>
          </DialogHeader>
          {selectedTutorial?.videoUrl && (
            <div className="aspect-video w-full overflow-hidden rounded-xl bg-black">
              <iframe
                src={selectedTutorial.videoUrl}
                title={selectedTutorial.title}
                className="h-full w-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          )}
          {selectedTutorial?.transcript && (
            <div className="mt-4 rounded-xl border border-border bg-muted/30 p-4">
              <h4 className="mb-2 text-sm font-semibold">Transcript</h4>
              <p className="text-sm text-muted-foreground">{selectedTutorial.transcript}</p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </section>
  )
}
