import * as React from 'react'
import { cn } from '@/lib/utils'

export interface BulletListProps extends React.HTMLAttributes<HTMLUListElement> {
  items: string[]
}

export function BulletList({ items, className, ...props }: BulletListProps) {
  const safeItems = Array.isArray(items) ? items : []
  if (safeItems.length === 0) return null

  return (
    <ul
      className={cn('list-disc space-y-2 pl-6 text-base leading-relaxed text-foreground/90', className)}
      role="list"
      {...props}
    >
      {safeItems.map((item, idx) => (
        <li key={idx}>{item}</li>
      ))}
    </ul>
  )
}
