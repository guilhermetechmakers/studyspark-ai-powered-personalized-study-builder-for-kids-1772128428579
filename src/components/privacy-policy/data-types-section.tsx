import { Database } from 'lucide-react'
import { SectionCard } from './section-card'
import { PillLabel } from './pill-label'

export interface DataCategory {
  id: string
  name: string
  description: string
}

export interface DataTypesSectionProps {
  categories?: DataCategory[]
}

const defaultCategories: DataCategory[] = [
  {
    id: 'account',
    name: 'Account information',
    description: 'Email address, name, and password. Used to create and manage your parent account.',
  },
  {
    id: 'child-profiles',
    name: 'Child profiles',
    description: 'Child name, grade level, learning preferences, and interests. Used to personalize study content.',
  },
  {
    id: 'uploaded-materials',
    name: 'Uploaded materials',
    description: 'Documents, images, or text you upload. Processed to generate study materials.',
  },
  {
    id: 'usage-data',
    name: 'Usage data',
    description: 'How you and your child use the app: study sessions, progress, and feature usage.',
  },
  {
    id: 'device-data',
    name: 'Device data',
    description: 'Device type, browser, and IP address. Used for security and compatibility.',
  },
]

export function DataTypesSection({ categories = defaultCategories }: DataTypesSectionProps) {
  const safeCategories = Array.isArray(categories) ? categories : defaultCategories

  return (
    <SectionCard title="Data We Collect" icon={Database}>
      <p className="text-base leading-relaxed">
        We collect only the data necessary to provide and improve our service. Here are the main categories:
      </p>
      <ul className="space-y-4" role="list">
        {safeCategories.map((cat) => (
          <li key={cat.id} className="flex flex-col gap-2">
            <div className="flex flex-wrap items-center gap-2">
              <PillLabel>{cat.name}</PillLabel>
            </div>
            <p className="text-sm leading-relaxed text-muted-foreground">{cat.description}</p>
          </li>
        ))}
      </ul>
    </SectionCard>
  )
}
