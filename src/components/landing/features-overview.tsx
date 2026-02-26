import {
  Upload,
  Sparkles,
  BookOpen,
  FileText,
} from 'lucide-react'
import { FeatureCard } from './feature-card'
import { cn } from '@/lib/utils'

export interface Feature {
  id: string
  title: string
  description: string
  iconName: string
  gradient: string
  learnMoreHref?: string
}

const ICON_MAP = {
  Upload,
  Sparkles,
  BookOpen,
  FileText,
} as const

const DEFAULT_FEATURES: Feature[] = [
  {
    id: '1',
    title: 'AI-Powered Generation',
    description:
      "Tailored to your child's age and learning style. Flashcards, quizzes, lessons, and printable PDFs—all in minutes.",
    iconName: 'Sparkles',
    gradient: 'from-[rgb(var(--tangerine))] to-[rgb(var(--coral))]',
  },
  {
    id: '2',
    title: 'Multi-Format Outputs',
    description:
      'Interactive in-app activities, printable PDFs, downloadable flashcards. Share with your child or print for school.',
    iconName: 'FileText',
    gradient: 'from-[rgb(var(--coral))] to-[rgb(var(--tangerine))]',
  },
  {
    id: '3',
    title: 'Age & Learning-Style Tailoring',
    description:
      'Upload teacher materials—photos, PDFs, handwritten notes. Our AI adapts vocabulary, length, and format to your child.',
    iconName: 'BookOpen',
    gradient: 'from-[rgb(var(--violet))] to-[rgb(var(--lavender))]',
  },
  {
    id: '4',
    title: 'Review & Refinement Workflow',
    description:
      'Edit any block, request revisions from the AI, and approve when ready. Full control before your child sees it.',
    iconName: 'Upload',
    gradient: 'from-[rgb(var(--lavender))] to-[rgb(var(--violet))]',
  },
]

export interface FeaturesOverviewProps {
  features?: Feature[]
  className?: string
}

export function FeaturesOverview({
  features = DEFAULT_FEATURES,
  className,
}: FeaturesOverviewProps) {
  const featureList = Array.isArray(features) ? features : DEFAULT_FEATURES

  return (
    <section id="features" className={cn('py-20 md:py-28', className)} aria-labelledby="features-heading">
      <div className="container">
        <div className="mx-auto max-w-2xl text-center">
          <h2 id="features-heading" className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Everything you need to support learning
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            From teacher materials to tailored study sets—one platform, full control.
          </p>
        </div>
        <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {(featureList ?? []).map((feature, i) => {
            const Icon = ICON_MAP[feature.iconName as keyof typeof ICON_MAP] ?? Sparkles
            return (
              <FeatureCard
                key={feature.id ?? feature.title}
                icon={Icon}
                title={feature.title}
                description={feature.description}
                gradient={feature.gradient}
                learnMoreHref={feature.learnMoreHref}
                className="animate-fade-in-up"
                style={{ animationDelay: `${i * 50}ms` }}
              />
            )
          })}
        </div>
      </div>
    </section>
  )
}
