import { Link } from 'react-router-dom'
import { Scale } from 'lucide-react'
import { SectionCard } from './section-card'
import { BulletList } from './bullet-list'
const DEFAULT_RIGHTS_ITEMS = [
  'Access: Request a copy of the personal data we hold about you or your child.',
  'Correction: Update or correct inaccurate information in your account or child profiles.',
  'Deletion: Request deletion of your data or your child\'s data, subject to legal retention requirements.',
  'Objection: Object to certain processing (e.g., marketing communications).',
  'Portability: Receive your data in a structured, machine-readable format where applicable.',
  'Withdraw consent: Withdraw consent for child data processing at any time.',
]

export interface RightsSectionProps {
  items?: string[]
  className?: string
}

export function RightsSection({
  items = DEFAULT_RIGHTS_ITEMS,
  className,
}: RightsSectionProps) {
  const safeItems = Array.isArray(items) ? items : DEFAULT_RIGHTS_ITEMS

  return (
    <SectionCard title="Your Rights & Choices" icon={Scale} className={className}>
      <p className="mb-4 text-base leading-relaxed">
        You and your child have the following rights regarding your personal data:
      </p>
      <BulletList items={safeItems} />
      <p className="mt-4 text-sm text-muted-foreground">
        To exercise these rights, visit{' '}
        <Link
          to="/dashboard/settings"
          className="font-medium text-primary underline-offset-4 hover:underline focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 rounded"
        >
          Settings
        </Link>{' '}
        or contact us at privacy@studyspark.com. We will respond within 30 days.
      </p>
    </SectionCard>
  )
}
