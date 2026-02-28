'use client'

import { FileText, Sparkles } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'

interface GamifiedSummaryTabProps {
  summaryText: string
  themeRgb?: { primary: string; secondary: string; background: string }
  className?: string
}

export function GamifiedSummaryTab({
  summaryText,
  themeRgb,
  className,
}: GamifiedSummaryTabProps) {
  const primary = themeRgb?.primary ?? '91 87 165'
  const secondary = themeRgb?.secondary ?? '169 166 249'

  return (
    <div className={cn('space-y-6', className)}>
      <Card
        className={cn(
          'overflow-hidden rounded-3xl border-2 transition-all duration-300',
          'hover:shadow-card-hover hover:scale-[1.01]',
          'animate-fade-in'
        )}
        style={{
          borderColor: `rgb(${primary} / 0.3)`,
          boxShadow: `0 4px 20px rgb(${primary} / 0.1)`,
        }}
      >
        <CardContent className="p-6 sm:p-8">
          <div
            className="mb-4 flex items-center gap-3 rounded-2xl p-3"
            style={{ backgroundColor: `rgb(${primary} / 0.1)` }}
          >
            <div
              className="flex h-12 w-12 items-center justify-center rounded-xl"
              style={{ backgroundColor: `rgb(${primary} / 0.2)` }}
            >
              <FileText
                className="h-6 w-6"
                style={{ color: `rgb(${primary})` }}
                aria-hidden
              />
            </div>
            <div>
              <h3 className="font-bold text-foreground">Summary</h3>
              <p className="text-sm text-muted-foreground">
                What you&apos;ll learn in this study
              </p>
            </div>
          </div>

          <div
            className="rounded-2xl p-6"
            style={{
              background: `linear-gradient(135deg, rgb(${secondary} / 0.15), rgb(${primary} / 0.08))`,
            }}
          >
            <p className="prose prose-sm max-w-none text-foreground whitespace-pre-wrap leading-relaxed">
              {summaryText || 'No summary available yet.'}
            </p>
          </div>

          <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
            <Sparkles className="h-4 w-4 text-primary" aria-hidden />
            <span>AI-tailored for your learning style</span>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
