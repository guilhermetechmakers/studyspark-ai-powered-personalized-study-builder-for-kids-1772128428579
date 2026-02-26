import { useState, useCallback } from 'react'
import { ChevronLeft, ChevronRight, Quote } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { Testimonial } from '@/types/landing'

export interface TestimonialsCarouselProps {
  testimonials?: Testimonial[]
  className?: string
}

const PLACEHOLDER_MESSAGE = 'Trusted by parents and educators. Testimonials coming soon.'

function getInitials(name: string): string {
  const parts = (name ?? '').trim().split(/\s+/)
  if (parts.length >= 2) {
    return `${parts[0][0] ?? ''}${parts[parts.length - 1][0] ?? ''}`.toUpperCase()
  }
  return (name ?? '?')[0]?.toUpperCase() ?? '?'
}

export function TestimonialsCarousel({
  testimonials = [],
  className,
}: TestimonialsCarouselProps) {
  const items = Array.isArray(testimonials) ? testimonials : []
  const [activeIndex, setActiveIndex] = useState(0)
  const hasItems = items.length > 0

  const goPrev = useCallback(() => {
    setActiveIndex((i) => (i <= 0 ? items.length - 1 : i - 1))
  }, [items.length])

  const goNext = useCallback(() => {
    setActiveIndex((i) => (i >= items.length - 1 ? 0 : i + 1))
  }, [items.length])

  if (!hasItems) {
    return (
      <section
        className={cn('bg-muted/50 py-20 md:py-28', className)}
        aria-labelledby="testimonials-heading"
      >
        <div className="container">
          <h2 id="testimonials-heading" className="text-center text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            What parents say
          </h2>
          <div className="mx-auto mt-12 max-w-2xl rounded-2xl border border-border bg-card p-12 text-center">
            <Quote className="mx-auto h-12 w-12 text-muted-foreground/50" aria-hidden />
            <p className="mt-4 text-lg text-muted-foreground">{PLACEHOLDER_MESSAGE}</p>
          </div>
        </div>
      </section>
    )
  }

  const current = items[activeIndex]
  if (!current) return null

  return (
    <section
      className={cn('bg-muted/50 py-20 md:py-28', className)}
      aria-labelledby="testimonials-heading"
      aria-roledescription="carousel"
    >
      <div className="container">
        <h2 id="testimonials-heading" className="text-center text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          What parents say
        </h2>
        <div className="mx-auto mt-16 max-w-3xl">
          <div
            className="rounded-2xl border border-border bg-card p-8 md:p-12 shadow-card transition-all duration-300"
            role="group"
            aria-roledescription="slide"
            aria-label={`Testimonial ${activeIndex + 1} of ${items.length}`}
          >
            <Quote className="h-10 w-10 text-primary/30" aria-hidden />
            <blockquote className="mt-4 text-lg text-foreground md:text-xl">
              &ldquo;{current.quote}&rdquo;
            </blockquote>
            <div className="mt-6 flex items-center gap-4">
              <div
                className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-[rgb(var(--lavender))] to-[rgb(var(--violet))] text-sm font-semibold text-white"
                aria-hidden
              >
                {current.avatarUrl ? (
                  <img
                    src={current.avatarUrl}
                    alt=""
                    className="h-full w-full rounded-full object-cover"
                  />
                ) : (
                  getInitials(current.author)
                )}
              </div>
              <div>
                <cite className="not-italic font-semibold text-foreground">
                  {current.author}
                </cite>
                {current.role && (
                  <p className="text-sm text-muted-foreground">{current.role}</p>
                )}
              </div>
            </div>
          </div>
          {items.length > 1 && (
            <div className="mt-8 flex items-center justify-center gap-4">
              <Button
                variant="outline"
                size="icon"
                onClick={goPrev}
                aria-label="Previous testimonial"
              >
                <ChevronLeft className="h-5 w-5" />
              </Button>
              <span className="text-sm text-muted-foreground">
                {activeIndex + 1} / {items.length}
              </span>
              <Button
                variant="outline"
                size="icon"
                onClick={goNext}
                aria-label="Next testimonial"
              >
                <ChevronRight className="h-5 w-5" />
              </Button>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
