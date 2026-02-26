import { Database } from 'lucide-react'
import { SectionCard } from './section-card'
import { PillLabel } from './pill-label'

export interface DataCategory {
  id: string
  name: string
  description: string
}

const DEFAULT_DATA_CATEGORIES: DataCategory[] = [
  {
    id: 'account',
    name: 'Account Information',
    description: 'Email address, name, and password you provide when creating an account.',
  },
  {
    id: 'child-profiles',
    name: 'Child Profiles',
    description: 'Your child\'s name, grade level, learning preferences, and interests you choose to share.',
  },
  {
    id: 'uploaded-materials',
    name: 'Uploaded Materials',
    description: 'Documents, images, or text you upload to generate study content.',
  },
  {
    id: 'usage-data',
    name: 'Usage Data',
    description: 'How you and your child interact with the app (e.g., study sessions, progress, quiz results).',
  },
  {
    id: 'device-data',
    name: 'Device Data',
    description: 'Device type, browser, and general location (country/region) for service optimization.',
  },
]

export interface DataTypesSectionProps {
  categories?: DataCategory[]
  className?: string
}

export function DataTypesSection({
  categories = DEFAULT_DATA_CATEGORIES,
  className,
}: DataTypesSectionProps) {
  const safeCategories = Array.isArray(categories) ? categories : DEFAULT_DATA_CATEGORIES

  return (
    <SectionCard title="Data We Collect" icon={Database} className={className}>
      <p className="mb-4 text-base leading-relaxed">
        We collect the following categories of data to provide and improve our services:
      </p>
      <ul className="space-y-4" role="list">
        {(safeCategories ?? []).map((cat) => (
          <li key={cat.id} className="flex flex-col gap-1">
            <span className="flex items-center gap-2">
              <PillLabel>{cat.name}</PillLabel>
            </span>
            <span className="text-base text-foreground/90">{cat.description}</span>
          </li>
        ))}
      </ul>
    </SectionCard>
  )
}
