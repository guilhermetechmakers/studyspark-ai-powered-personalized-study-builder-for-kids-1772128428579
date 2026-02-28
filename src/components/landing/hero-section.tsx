import { Link } from 'react-router-dom'
import { ChevronRight, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export interface HeroSectionProps {
  headline?: string
  headlineAccent?: string
  subheadline?: string
  primaryCTALabel?: string
  secondaryCTALabel?: string
  heroIllustration?: React.ReactNode
  howItWorks?: React.ReactNode
  className?: string
}

const DEFAULT_HEADLINE = 'Personalized study materials'
const DEFAULT_HEADLINE_ACCENT = 'in minutes'
const DEFAULT_SUBHEADLINE =
  "Upload teacher materials, pick your child's learning style, and let AI create flashcards, quizzes, and printable PDFs—tailored to their age and needs."
const DEFAULT_PRIMARY_CTA = 'Sign Up Free'
const DEFAULT_SECONDARY_CTA = 'How It Works'

export function HeroSection({
  headline = DEFAULT_HEADLINE,
  headlineAccent = DEFAULT_HEADLINE_ACCENT,
  subheadline = DEFAULT_SUBHEADLINE,
  primaryCTALabel = DEFAULT_PRIMARY_CTA,
  secondaryCTALabel = DEFAULT_SECONDARY_CTA,
  heroIllustration,
  howItWorks,
  className,
}: HeroSectionProps) {
  return (
    <section className={cn('relative overflow-hidden', className)} aria-label="Hero">
      {/* Animated gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-[rgb(var(--peach-light))]/30 via-transparent to-[rgb(var(--lavender))]/20" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgb(var(--lavender))/15,_transparent_50%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_rgb(var(--tangerine))/10,_transparent_50%)]" />

      <div className="container relative py-20 md:py-28 lg:py-36">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-16 lg:items-center">
          <div className="mx-auto max-w-2xl text-center lg:max-w-none lg:text-left animate-fade-in-up">
            <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl md:text-6xl lg:text-7xl">
              {headline}{' '}
              <span className="bg-gradient-to-r from-[rgb(var(--violet))] to-[rgb(var(--tangerine))] bg-clip-text text-transparent">
                {headlineAccent}
              </span>
            </h1>
            <p className="mt-6 text-lg text-muted-foreground md:text-xl">
              {subheadline}
            </p>
            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row lg:justify-start">
              <Button size="lg" className="min-w-[200px]" asChild>
                <Link to="/signup">
                  {primaryCTALabel}
                  <ChevronRight className="ml-1 h-5 w-5" />
                </Link>
              </Button>
              <Button variant="outline" size="lg" asChild>
                <Link to="/#how-it-works">{secondaryCTALabel}</Link>
              </Button>
            </div>
          </div>

          {/* Hero illustration - InteractiveDemoPreview */}
          <div className="relative flex items-center justify-center animate-fade-in-up" style={{ animationDelay: '100ms' }}>
            {heroIllustration ?? (
              <div
                className="relative flex h-64 w-full max-w-md items-center justify-center rounded-3xl bg-gradient-to-br from-[rgb(var(--lavender))]/20 to-[rgb(var(--tangerine))]/20 border border-border/50"
                aria-hidden
              >
                <div className="flex flex-col items-center gap-4">
                  <div className="flex h-24 w-24 items-center justify-center rounded-2xl bg-gradient-to-br from-[rgb(var(--lavender))] to-[rgb(var(--violet))] text-white shadow-lg">
                    <Sparkles className="h-12 w-12" />
                  </div>
                  <span className="text-sm font-medium text-muted-foreground">
                    AI-powered study materials
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* How it works - inside hero */}
        {howItWorks && (
          <div className="mt-12 lg:mt-16">
            {howItWorks}
          </div>
        )}
      </div>
    </section>
  )
}
