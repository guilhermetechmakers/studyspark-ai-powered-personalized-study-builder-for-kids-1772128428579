import { Shield } from 'lucide-react'
import { SectionCard } from './section-card'
import { BulletList } from './bullet-list'
import { PillLabel } from './pill-label'

const DEFAULT_CONSENT_ITEMS = [
  'StudySpark is designed for children under 13. We require verifiable parental consent before collecting any child data.',
  'Parents create and manage child profiles. Children cannot create accounts without a parent\'s approval.',
  'You provide consent when you sign up, add a child profile, and accept this Privacy Policy.',
  'You may withdraw consent at any time by deleting the child profile or your account. We will stop processing and delete data as described in our retention policy.',
  'If you believe we have collected child data without proper consent, contact us immediately at privacy@studyspark.com.',
]

export interface ParentalConsentSectionProps {
  items?: string[]
  className?: string
}

export function ParentalConsentSection({
  items = DEFAULT_CONSENT_ITEMS,
  className,
}: ParentalConsentSectionProps) {
  const safeItems = Array.isArray(items) ? items : DEFAULT_CONSENT_ITEMS

  return (
    <SectionCard title="Parental Consent for Children's Data" icon={Shield} className={className}>
      <div className="mb-4 flex flex-wrap gap-2">
        <PillLabel>COPPA</PillLabel>
        <PillLabel>GDPR</PillLabel>
      </div>
      <p className="mb-4 text-base leading-relaxed">
        We comply with the Children\'s Online Privacy Protection Act (COPPA) and applicable data protection laws. Parents have full control over their children\'s data.
      </p>
      <BulletList items={safeItems} />
    </SectionCard>
  )
}
