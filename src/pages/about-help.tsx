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

export function AboutHelpPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <LandingHeader />
      <main className="flex-1">
        <div className="container py-12 md:py-16">
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
