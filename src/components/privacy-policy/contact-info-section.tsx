import { Mail, MessageCircle } from 'lucide-react'
import { SectionCard } from './section-card'

const CONTACT_EMAIL = 'privacy@studyspark.com'
const SUPPORT_EMAIL = 'hello@studyspark.com'

export interface ContactInfoSectionProps {
  privacyEmail?: string
  supportEmail?: string
  className?: string
}

export function ContactInfoSection({
  privacyEmail = CONTACT_EMAIL,
  supportEmail = SUPPORT_EMAIL,
  className,
}: ContactInfoSectionProps) {
  return (
    <SectionCard title="Contact Us" icon={MessageCircle} className={className}>
      <p className="mb-4 text-base leading-relaxed">
        For questions about this Privacy Policy, your data, or to exercise your rights, please contact us:
      </p>
      <ul className="space-y-3" role="list">
        <li className="flex items-center gap-3">
          <Mail className="h-5 w-5 shrink-0 text-primary" aria-hidden />
          <a
            href={`mailto:${privacyEmail}`}
            className="text-base font-medium text-primary underline-offset-4 hover:underline focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:rounded-lg"
          >
            {privacyEmail}
          </a>
          <span className="text-sm text-muted-foreground">— Privacy & data requests</span>
        </li>
        <li className="flex items-center gap-3">
          <Mail className="h-5 w-5 shrink-0 text-primary" aria-hidden />
          <a
            href={`mailto:${supportEmail}`}
            className="text-base font-medium text-primary underline-offset-4 hover:underline focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:rounded-lg"
          >
            {supportEmail}
          </a>
          <span className="text-sm text-muted-foreground">— General support</span>
        </li>
      </ul>
      <p className="mt-4 text-sm text-muted-foreground">
        We aim to respond within 30 days. If you are in the European Economic Area, you may also lodge a complaint with your local data protection authority.
      </p>
    </SectionCard>
  )
}
