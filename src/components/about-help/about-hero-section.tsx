import { Link } from 'react-router-dom'
import { Sparkles, Mail, Phone, Twitter, Linkedin, Instagram } from 'lucide-react'
import { Button } from '@/components/ui/button'
const CONTACT_EMAIL = 'hello@studyspark.com'
const CONTACT_PHONE = '+1 (555) 123-4567'

const socialLinks = [
  { icon: Twitter, label: 'Twitter', href: 'https://twitter.com/studyspark' },
  { icon: Linkedin, label: 'LinkedIn', href: 'https://linkedin.com/company/studyspark' },
  { icon: Instagram, label: 'Instagram', href: 'https://instagram.com/studyspark' },
]

export function AboutHeroSection() {
  return (
    <section
      className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[rgb(var(--peach-light))] via-[rgb(var(--peach))]/80 to-[rgb(var(--lavender))]/30 p-8 md:p-12"
      aria-labelledby="about-heading"
    >
      <div className="relative z-10">
        <div className="flex flex-col gap-8 md:flex-row md:items-start md:justify-between">
          <div className="flex flex-col gap-6">
            <div className="flex items-center gap-3">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/90 shadow-card">
                <Sparkles className="h-8 w-8 text-primary" />
              </div>
              <div>
                <h1 id="about-heading" className="text-2xl font-bold text-foreground md:text-3xl">
                  About StudySpark
                </h1>
                <p className="text-sm text-muted-foreground">AI-powered learning for every child</p>
              </div>
            </div>
            <div className="max-w-2xl space-y-4">
              <p className="text-base leading-relaxed text-foreground md:text-lg">
                StudySpark helps parents create personalized study materials for their K–12 children.
                We combine AI with your child&apos;s learning preferences to generate flashcards, quizzes,
                and lessons that are trustworthy, fast, and parent-controlled.
              </p>
              <p className="text-sm text-muted-foreground">
                Our mission: make learning delightful and effective for every family.
              </p>
            </div>
            <div className="flex flex-wrap gap-4">
              <a
                href={`mailto:${CONTACT_EMAIL}`}
                className="inline-flex items-center gap-2 rounded-full bg-white/90 px-4 py-2 text-sm font-medium text-foreground shadow-card transition-all hover:scale-[1.02] hover:shadow-card-hover"
              >
                <Mail className="h-4 w-4" />
                {CONTACT_EMAIL}
              </a>
              <a
                href={`tel:${CONTACT_PHONE.replace(/\s/g, '')}`}
                className="inline-flex items-center gap-2 rounded-full bg-white/90 px-4 py-2 text-sm font-medium text-foreground shadow-card transition-all hover:scale-[1.02] hover:shadow-card-hover"
              >
                <Phone className="h-4 w-4" />
                {CONTACT_PHONE}
              </a>
            </div>
            <div className="flex items-center gap-3">
              {(socialLinks ?? []).map(({ icon: Icon, label, href }) => (
                <a
                  key={href}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-white/90 text-muted-foreground transition-all hover:scale-[1.05] hover:border-primary hover:bg-primary/10 hover:text-primary"
                  aria-label={label}
                >
                  <Icon className="h-5 w-5" />
                </a>
              ))}
            </div>
          </div>
          <div className="shrink-0">
            <Button size="lg" asChild className="rounded-full shadow-md">
              <Link to="/signup">Get Started Free</Link>
            </Button>
          </div>
        </div>
      </div>
      {/* Decorative blobs */}
      <div className="absolute -right-20 -top-20 h-40 w-40 rounded-full bg-[rgb(var(--lavender))]/20" aria-hidden />
      <div className="absolute -bottom-10 -left-10 h-32 w-32 rounded-full bg-[rgb(var(--tangerine))]/20" aria-hidden />
    </section>
  )
}
