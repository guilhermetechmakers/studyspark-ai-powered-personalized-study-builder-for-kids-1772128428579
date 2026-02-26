import { Sparkles, FileText, Upload, User, Settings } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const STEPS = [
  { id: 1, title: 'Topic & Context', icon: FileText, desc: 'Enter your study topic and context' },
  { id: 2, title: 'Upload Materials', icon: Upload, desc: 'Add documents and images' },
  { id: 3, title: 'Child & Style', icon: User, desc: 'Select child and learning style' },
  { id: 4, title: 'Generation Options', icon: Settings, desc: 'Configure depth and outputs' },
  { id: 5, title: 'AI Generation', icon: Sparkles, desc: 'Watch content generate in real time' },
  { id: 6, title: 'Review & Edit', icon: FileText, desc: 'Edit, approve, and export' },
]

export interface WizardOverviewProps {
  onStart: () => void
  className?: string
}

export function WizardOverview({ onStart, className }: WizardOverviewProps) {
  return (
    <div className={cn('space-y-8', className)}>
      <div className="text-center">
        <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          Create Study Wizard
        </h1>
        <p className="mt-4 max-w-2xl mx-auto text-muted-foreground">
          Build personalized study sets for your child in six steps. Add topic, materials, choose
          learning style, and let AI generate tailored content.
        </p>
      </div>

      <Card className="overflow-hidden border-2 border-primary/20 bg-gradient-to-br from-[rgb(var(--peach-light))]/30 via-white to-[rgb(var(--lavender))]/20">
        <CardHeader>
          <CardTitle>How it works</CardTitle>
          <CardDescription>
            Follow the steps to create a personalized study set. You can go back and edit anytime.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {(STEPS ?? []).map((step) => {
              const Icon = step.icon
              return (
                <div
                  key={step.id}
                  className="flex items-start gap-4 rounded-xl border border-border p-4 transition-colors hover:bg-muted/30"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">Step {step.id}</p>
                    <p className="text-sm text-muted-foreground">{step.desc}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-center">
        <Button size="lg" onClick={onStart} className="rounded-full px-8">
          <Sparkles className="mr-2 h-5 w-5" />
          Start Wizard
        </Button>
      </div>
    </div>
  )
}
