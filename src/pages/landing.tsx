import { Link } from 'react-router-dom'
import {
  Upload,
  Sparkles,
  BookOpen,
  FileText,
  CheckCircle2,
  ChevronRight,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { LandingHeader } from '@/components/layout/landing-header'
import { LandingFooter } from '@/components/layout/landing-footer'
import { cn } from '@/lib/utils'

const features = [
  {
    icon: Upload,
    title: 'Upload Teacher Materials',
    description:
      'Photos, PDFs, handwritten notes—our OCR turns them into editable text. Mark important snippets for the AI to focus on.',
    gradient: 'from-[rgb(var(--lavender))] to-[rgb(var(--violet))]',
  },
  {
    icon: Sparkles,
    title: 'AI-Powered Generation',
    description:
      'Tailored to your child\'s age and learning style. Flashcards, quizzes, lessons, and printable PDFs—all in minutes.',
    gradient: 'from-[rgb(var(--tangerine))] to-[rgb(var(--coral))]',
  },
  {
    icon: BookOpen,
    title: 'Review & Iterate',
    description:
      'Edit any block, request revisions from the AI, and approve when ready. Full control before your child sees it.',
    gradient: 'from-[rgb(var(--violet))] to-[rgb(var(--lavender))]',
  },
  {
    icon: FileText,
    title: 'Multi-Format Export',
    description:
      'Interactive in-app activities, printable PDFs, downloadable flashcards. Share with your child or print for school.',
    gradient: 'from-[rgb(var(--coral))] to-[rgb(var(--tangerine))]',
  },
]

const steps = [
  {
    step: 1,
    title: 'Enter topic & upload materials',
    description: 'Add exam topic, subject, and teacher-provided documents or photos.',
  },
  {
    step: 2,
    title: 'Select child & learning style',
    description: 'Choose age, grade, and style: playful, exam-like, research-based, or printable.',
  },
  {
    step: 3,
    title: 'Review, edit & approve',
    description: 'AI generates content. You review, request changes, and approve when ready.',
  },
]

const plans = [
  {
    name: 'Free',
    price: '$0',
    period: 'forever',
    description: 'Get started with basic study creation',
    features: ['3 studies per month', 'Basic flashcards', 'Email support'],
    cta: 'Start Free',
    highlighted: false,
  },
  {
    name: 'Pro',
    price: '$12',
    period: '/month',
    description: 'For active families',
    features: [
      'Unlimited studies',
      'All formats (PDF, flashcards, quizzes)',
      'Priority generation',
      'Priority support',
    ],
    cta: 'Start Pro Trial',
    highlighted: true,
  },
  {
    name: 'Family',
    price: '$24',
    period: '/month',
    description: 'Up to 4 children',
    features: [
      'Everything in Pro',
      'Up to 4 child profiles',
      'Bulk export',
      'Advanced analytics',
    ],
    cta: 'Start Family Trial',
    highlighted: false,
  },
]

const faqs = [
  {
    q: 'Is my child\'s data safe?',
    a: 'Yes. We follow COPPA and GDPR guidelines. We store minimal child data, use encrypted storage, and never sell personal information. Parents control all data.',
  },
  {
    q: 'How does the AI tailor content?',
    a: 'We use your child\'s age, grade, and chosen learning style (playful, exam-like, research-based, printable) to shape prompts. The AI adapts vocabulary, length, and format accordingly.',
  },
  {
    q: 'Can I edit AI-generated content?',
    a: 'Absolutely. You can edit any block inline or request targeted revisions from the AI. Nothing goes to your child until you approve it.',
  },
  {
    q: 'What file types can I upload?',
    a: 'We support photos (JPG, PNG), PDFs, and common document formats. Our OCR handles handwritten notes and printed text.',
  },
]

export function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <LandingHeader />
      <main className="flex-1">
        {/* Hero */}
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-[rgb(var(--peach-light))]/30 via-transparent to-[rgb(var(--lavender))]/20" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgb(var(--lavender))/15,_transparent_50%)]" />
          <div className="container relative py-20 md:py-28 lg:py-36">
            <div className="mx-auto max-w-3xl text-center animate-fade-in-up">
              <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl md:text-6xl lg:text-7xl">
                Personalized study materials{' '}
                <span className="bg-gradient-to-r from-[rgb(var(--violet))] to-[rgb(var(--tangerine))] bg-clip-text text-transparent">
                  in minutes
                </span>
              </h1>
              <p className="mt-6 text-lg text-muted-foreground md:text-xl">
                Upload teacher materials, pick your child's learning style, and let AI create
                flashcards, quizzes, and printable PDFs—tailored to their age and needs.
              </p>
              <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
                <Button size="lg" className="min-w-[200px]" asChild>
                  <Link to="/signup">
                    Sign Up Free
                    <ChevronRight className="ml-1 h-5 w-5" />
                  </Link>
                </Button>
                <Button variant="outline" size="lg" asChild>
                  <Link to="/#how-it-works">See How It Works</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Features - Bento-style grid */}
        <section id="features" className="py-20 md:py-28">
          <div className="container">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                Everything you need to support learning
              </h2>
              <p className="mt-4 text-lg text-muted-foreground">
                From teacher materials to tailored study sets—one platform, full control.
              </p>
            </div>
            <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {features.map((feature, i) => {
                const Icon = feature.icon
                return (
                  <Card
                    key={feature.title}
                    className={cn(
                      'group overflow-hidden transition-all duration-300',
                      'animate-fade-in-up'
                    )}
                    style={{ animationDelay: `${i * 50}ms` }}
                  >
                    <CardContent className="p-6">
                      <div
                        className={cn(
                          'mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br text-white',
                          feature.gradient
                        )}
                      >
                        <Icon className="h-6 w-6" />
                      </div>
                      <h3 className="text-lg font-semibold text-foreground">
                        {feature.title}
                      </h3>
                      <p className="mt-2 text-sm text-muted-foreground">
                        {feature.description}
                      </p>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section id="how-it-works" className="bg-muted/50 py-20 md:py-28">
          <div className="container">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                How It Works
              </h2>
              <p className="mt-4 text-lg text-muted-foreground">
                Three simple steps from materials to study sets.
              </p>
            </div>
            <div className="mt-16 grid gap-8 md:grid-cols-3">
              {steps.map((s, i) => (
                <div
                  key={s.step}
                  className="relative flex flex-col items-center text-center animate-fade-in-up"
                  style={{ animationDelay: `${i * 100}ms` }}
                >
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground text-xl font-bold">
                    {s.step}
                  </div>
                  <h3 className="mt-4 text-lg font-semibold text-foreground">
                    {s.title}
                  </h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {s.description}
                  </p>
                  {i < steps.length - 1 && (
                    <ChevronRight className="absolute -right-4 top-7 hidden h-8 w-8 text-muted-foreground md:block" />
                  )}
                </div>
              ))}
            </div>
            <div className="mt-12 text-center">
              <Button size="lg" asChild>
                <Link to="/signup">Get Started Free</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Pricing */}
        <section id="pricing" className="py-20 md:py-28">
          <div className="container">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                Simple, transparent pricing
              </h2>
              <p className="mt-4 text-lg text-muted-foreground">
                Start free. Upgrade when you need more.
              </p>
            </div>
            <div className="mt-16 grid gap-6 md:grid-cols-3">
              {plans.map((plan) => (
                <Card
                  key={plan.name}
                  className={cn(
                    plan.highlighted &&
                      'border-primary shadow-lg ring-2 ring-primary/20'
                  )}
                >
                  <CardContent className="p-6">
                    {plan.highlighted && (
                      <span className="inline-block rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                        Most Popular
                      </span>
                    )}
                    <h3 className="mt-4 text-xl font-bold text-foreground">
                      {plan.name}
                    </h3>
                    <div className="mt-2 flex items-baseline gap-1">
                      <span className="text-3xl font-bold">{plan.price}</span>
                      <span className="text-muted-foreground">{plan.period}</span>
                    </div>
                    <p className="mt-2 text-sm text-muted-foreground">
                      {plan.description}
                    </p>
                    <ul className="mt-6 space-y-3">
                      {plan.features.map((f) => (
                        <li key={f} className="flex items-center gap-2 text-sm">
                          <CheckCircle2 className="h-4 w-4 shrink-0 text-primary" />
                          {f}
                        </li>
                      ))}
                    </ul>
                    <Button
                      className="mt-6 w-full"
                      variant={plan.highlighted ? 'default' : 'outline'}
                      asChild
                    >
                      <Link to="/signup">{plan.cta}</Link>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section id="faq" className="bg-muted/50 py-20 md:py-28">
          <div className="container">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                Frequently asked questions
              </h2>
              <p className="mt-4 text-lg text-muted-foreground">
                Everything you need to know about StudySpark.
              </p>
            </div>
            <div className="mx-auto mt-16 max-w-2xl">
              <Accordion type="single" collapsible className="w-full">
                {faqs.map((faq) => (
                  <AccordionItem key={faq.q} value={faq.q}>
                    <AccordionTrigger className="text-left">
                      {faq.q}
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground">
                      {faq.a}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-20 md:py-28">
          <div className="container">
            <div className="mx-auto max-w-3xl rounded-3xl bg-gradient-to-br from-[rgb(var(--lavender))]/20 to-[rgb(var(--tangerine))]/20 p-12 text-center">
              <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                Ready to create personalized study materials?
              </h2>
              <p className="mt-4 text-lg text-muted-foreground">
                Join thousands of parents helping their children learn better.
              </p>
              <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
                <Button size="lg" className="min-w-[200px]" asChild>
                  <Link to="/signup">Sign Up Free</Link>
                </Button>
                <Button variant="outline" size="lg" asChild>
                  <Link to="/login">Log in</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>
      <LandingFooter />
    </div>
  )
}
