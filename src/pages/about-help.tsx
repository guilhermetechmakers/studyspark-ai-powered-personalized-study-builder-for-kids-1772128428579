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

const ICON_SIZE = 'h-5 w-5'

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
          <h1 className="mb-6 text-center text-2xl font-bold text-foreground md:text-3xl">
            About & Help
          </h1>
          <form onSubmit={handleSearch} className="mx-auto mb-8 max-w-2xl" role="search" aria-label="Search help and studies">
            <div className="flex gap-2 rounded-full border-2 border-border bg-card shadow-sm transition-all focus-within:border-accent focus-within:ring-2 focus-within:ring-accent/20">
              <Search className={`ml-4 ${ICON_SIZE} shrink-0 self-center text-muted-foreground`} aria-hidden />
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
            <section id="about" aria-labelledby="about-heading">
              <AboutHeroSection />
            </section>

            <section id="help-center" aria-labelledby="help-heading">
              <HelpCenter />
            </section>

            <section id="tutorials" aria-labelledby="tutorials-heading">
              <TutorialsGallery />
            </section>

            <section id="onboarding" aria-labelledby="guides-heading">
              <OnboardingGuides />
            </section>

            <section id="support" aria-labelledby="support-heading">
              <SupportForm />
            </section>

            <section id="feedback" aria-labelledby="feedback-heading">
              <FeedbackCommunityLink />
            </section>
          </div>
        </div>
      </main>
      <LandingFooter />
    </div>
  )
}
