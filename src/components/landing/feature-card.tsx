import { Link } from 'react-router-dom'
import type { LucideIcon } from 'lucide-react'
import { ChevronRight } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'

export interface FeatureCardProps {
  icon: LucideIcon
  title: string
  description: string
  gradient: string
  learnMoreHref?: string
  className?: string
  style?: React.CSSProperties
}

export function FeatureCard({
  icon: Icon,
  title,
  description,
  gradient,
  learnMoreHref,
  className,
  style,
}: FeatureCardProps) {
  return (
    <Card
      className={cn(
        'group overflow-hidden transition-all duration-300 hover:-translate-y-1',
        className
      )}
      style={style}
    >
      <CardContent className="p-6">
        <div
          className={cn(
            'mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br text-white',
            gradient
          )}
        >
          <Icon className="h-6 w-6" aria-hidden />
        </div>
        <h3 className="text-lg font-semibold text-foreground">{title}</h3>
        <p className="mt-2 text-sm text-muted-foreground">{description}</p>
        {learnMoreHref && (
          <Link
            to={learnMoreHref}
            className="mt-4 inline-flex items-center text-sm font-medium text-primary hover:underline"
          >
            Learn more
            <ChevronRight className="ml-1 h-4 w-4" />
          </Link>
        )}
      </CardContent>
    </Card>
  )
}
