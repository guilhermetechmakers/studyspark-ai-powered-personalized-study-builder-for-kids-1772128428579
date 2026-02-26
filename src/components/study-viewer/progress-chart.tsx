'use client'

import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Cell } from 'recharts'
import { cn } from '@/lib/utils'
import type { ProgressData } from '@/types/study-viewer'

interface ProgressChartProps {
  data: ProgressData
  className?: string
}

const PASTEL_COLORS = [
  'rgb(var(--peach))',
  'rgb(var(--lavender))',
  'rgb(var(--tangerine))',
  'rgb(var(--primary))',
]

export function ProgressChart({ data, className }: ProgressChartProps) {
  const total = data?.total ?? 0
  const completed = data?.completed ?? 0
  const percent = total > 0 ? Math.round((completed / total) * 100) : 0

  const chartData = [
    { name: 'Done', value: completed, fill: PASTEL_COLORS[0] },
    { name: 'Left', value: Math.max(0, total - completed), fill: 'rgb(var(--muted))' },
  ].filter((d) => d.value > 0)

  if (chartData.length === 0) {
    return (
      <div className={cn('rounded-2xl border border-border bg-card p-4', className)}>
        <p className="text-sm font-medium text-muted-foreground">No progress yet</p>
        <p className="mt-1 text-xs text-muted-foreground">Complete activities to see your progress</p>
      </div>
    )
  }

  return (
    <div className={cn('rounded-2xl border border-border bg-card p-4', className)}>
      <div className="mb-3 flex items-center justify-between">
        <span className="text-sm font-medium text-foreground">Progress</span>
        <span className="text-lg font-bold text-primary">{percent}%</span>
      </div>
      <div className="h-8">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} layout="vertical" margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
            <XAxis type="number" hide domain={[0, total]} />
            <YAxis type="category" dataKey="name" hide width={0} />
            <Bar dataKey="value" radius={[0, 8, 8, 0]} barSize={24}>
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.fill} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      <p className="mt-2 text-xs text-muted-foreground">
        {completed} of {total} activities completed
      </p>
    </div>
  )
}
