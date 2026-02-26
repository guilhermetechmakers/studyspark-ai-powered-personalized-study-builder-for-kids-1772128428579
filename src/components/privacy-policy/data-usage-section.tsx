import { Target } from 'lucide-react'
import { SectionCard } from './section-card'
import { BulletList } from './bullet-list'

const DEFAULT_PURPOSES = [
  'Generate personalized study content (flashcards, quizzes, lessons) based on your child\'s needs.',
  'Improve our AI models and features to deliver better learning experiences.',
  'Personalize recommendations and track progress across study sessions.',
  'Provide customer support and respond to your inquiries.',
  'Ensure security, prevent fraud, and comply with legal obligations.',
  'Send important service updates (e.g., account or policy changes).',
]

export interface DataUsageSectionProps {
  purposes?: string[]
  className?: string
}

export function DataUsageSection({
  purposes = DEFAULT_PURPOSES,
  className,
}: DataUsageSectionProps) {
  const safePurposes = Array.isArray(purposes) ? purposes : DEFAULT_PURPOSES

  return (
    <SectionCard title="How We Use Your Data" icon={Target} className={className}>
      <p className="mb-4 text-base leading-relaxed">
        We use your data only for the following purposes. We do not sell your personal information.
      </p>
      <BulletList items={safePurposes} />
    </SectionCard>
  )
}
