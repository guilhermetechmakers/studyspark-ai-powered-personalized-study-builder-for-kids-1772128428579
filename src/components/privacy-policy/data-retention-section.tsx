import { Clock } from 'lucide-react'
import { SectionCard } from './section-card'
import { BulletList } from './bullet-list'

const DEFAULT_RETENTION_ITEMS = [
  'Account data: Retained while your account is active. Deleted within 30 days of account deletion.',
  'Child profiles: Retained until you remove them or delete your account.',
  'Uploaded materials: Processed to generate content; originals can be deleted on request.',
  'Usage data: Aggregated analytics retained for up to 24 months; individual records may be deleted sooner.',
  'Support communications: Retained for up to 2 years for quality and legal purposes.',
]

export interface DataRetentionSectionProps {
  items?: string[]
  className?: string
}

export function DataRetentionSection({
  items = DEFAULT_RETENTION_ITEMS,
  className,
}: DataRetentionSectionProps) {
  const safeItems = Array.isArray(items) ? items : DEFAULT_RETENTION_ITEMS

  return (
    <SectionCard title="Data Retention & Deletion" icon={Clock} className={className}>
      <p className="mb-4 text-base leading-relaxed">
        We retain data only as long as necessary to provide our services and comply with legal obligations. You can request deletion at any time.
      </p>
      <BulletList items={safeItems} />
    </SectionCard>
  )
}
