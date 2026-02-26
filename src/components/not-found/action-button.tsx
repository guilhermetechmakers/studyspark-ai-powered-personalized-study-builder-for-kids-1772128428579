/**
 * ActionButton - Reusable pill-shaped button for 404 page actions.
 * Primary (filled) and secondary (outlined) variants with hover/active states.
 */

import { type LucideIcon } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export interface ActionButtonProps {
  label: string
  onClick?: () => void
  variant: 'primary' | 'secondary'
  icon?: LucideIcon
  to?: string
  className?: string
  'aria-label'?: string
}

export function ActionButton({
  label,
  onClick,
  variant,
  icon: Icon,
  to,
  className,
  'aria-label': ariaLabel,
}: ActionButtonProps) {
  const baseClass = cn(
    'rounded-full transition-all duration-200',
    variant === 'primary' &&
      'bg-primary text-primary-foreground shadow-md hover:scale-[1.03] hover:shadow-lg active:scale-[0.98]',
    variant === 'secondary' &&
      'border-2 border-primary bg-transparent text-primary hover:bg-primary/10 hover:scale-[1.03] active:scale-[0.98]',
    className
  )

  const content = (
    <>
      {Icon && <Icon className="h-4 w-4 shrink-0" aria-hidden />}
      {label}
    </>
  )

  if (to) {
    return (
      <Button
        asChild
        variant={variant === 'primary' ? 'default' : 'outline'}
        size="lg"
        className={baseClass}
        aria-label={ariaLabel ?? label}
      >
        <Link to={to}>{content}</Link>
      </Button>
    )
  }

  return (
    <Button
      type="button"
      variant={variant === 'primary' ? 'default' : 'outline'}
      size="lg"
      onClick={onClick}
      className={baseClass}
      aria-label={ariaLabel ?? label}
    >
      {content}
    </Button>
  )
}
