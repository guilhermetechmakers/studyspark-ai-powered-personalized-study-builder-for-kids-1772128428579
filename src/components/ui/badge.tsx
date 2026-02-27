import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const badgeVariants = cva(
  'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors shadow-sm',
  {
    variants: {
      variant: {
        default: 'bg-primary/10 text-primary',
        secondary: 'bg-secondary/20 text-secondary-foreground',
        accent: 'bg-accent/20 text-accent-foreground',
        success: 'bg-[rgb(var(--success))]/20 text-[rgb(var(--success-foreground))]',
        warning: 'bg-[rgb(var(--warning))]/20 text-[rgb(var(--warning-foreground))]',
        destructive: 'bg-destructive/20 text-destructive',
        outline: 'border border-border bg-transparent',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  )
}

export { Badge, badgeVariants }
