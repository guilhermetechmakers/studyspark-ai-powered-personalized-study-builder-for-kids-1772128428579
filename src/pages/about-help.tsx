import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search } from 'lucide-react'
import { LandingHeader } from '@/components/layout/landing-header'
import { LandingFooter } from '@/components/layout/landing-footer'
import {
  AboutHeroSection,
  HelpCenter,
  TutorialsGallery,
  OnboardingGuides,
  SupportForm,
  FeedbackCommunityLink,
} from '@/components/about-help'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

export function AboutHelpPage() {
  const [query, setQuery] = useState('')
  const navigate = useNavigate()

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    const q = query.trim()
    if (q) navigate(`/search?q=${encodeURIComponent(q)}`)
  }

  return (
    <div className="min-h-screen flex flex-col">
      <LandingHeader />
      <main className="flex-1">
        <div className="container py-12 md:py-16">
          <form onSubmit={handleSearch} className="mx-auto mb-8 max-w-2xl">
            <div className="flex gap-2 rounded-full border-2 border-border bg-card shadow-sm focus-within:border-[rgb(var(--tangerine))] focus-within:ring-2 focus-within:ring-[rgb(var(--tangerine))]/20">
              <Search className="ml-4 h-5 w-5 shrink-0 self-center text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search help docs, studies..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="flex-1 border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0"
                aria-label="Search"
              />
              <Button type="submit" size="sm" className="m-1.5 rounded-full">
                Search
              </Button>
            </div>
          </form>
          <div className="mx-auto max-w-4xl space-y-16">
            <section id="about" aria-label="About StudySpark">
              <AboutHeroSection />
            </section>

            <section id="help-center" aria-label="Help Center">
              <HelpCenter />
            </section>

            <section id="tutorials" aria-label="Tutorial Videos">
              <TutorialsGallery />
            </section>

            <section id="onboarding" aria-label="Onboarding Guides">
              <OnboardingGuides />
            </section>

            <section id="support" aria-label="Contact Support">
              <SupportForm />
            </section>

            <section id="feedback" aria-label="Feedback and Community">
              <FeedbackCommunityLink />
            </section>
          </div>
        </div>
      </main>
      <LandingFooter />
    </div>
  )
}
