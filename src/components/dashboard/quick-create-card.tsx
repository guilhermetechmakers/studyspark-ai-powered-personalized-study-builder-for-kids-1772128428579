import { useNavigate } from 'react-router-dom'
import { PlusCircle, FileText, LayoutTemplate } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface QuickCreateCardProps {
  onUseMaterials?: () => void
  onStartFromTemplate?: () => void
  className?: string
}

export function QuickCreateCard({
  onUseMaterials,
  onStartFromTemplate,
  className,
}: QuickCreateCardProps) {
  const navigate = useNavigate()

  const handleUseMaterials = () => {
    onUseMaterials?.()
    navigate('/dashboard/create')
  }

  const handleStartFromTemplate = () => {
    onStartFromTemplate?.()
    navigate('/dashboard/create')
  }

  return (
    <Card
      className={cn(
        'border-primary/30 bg-gradient-to-br from-primary/5 to-[rgb(var(--peach-light))]/20',
        className
      )}
    >
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10">
            <PlusCircle className="h-6 w-6 text-primary" />
          </div>
          <div>
            <CardTitle>Quick Create</CardTitle>
            <CardDescription>Start a new study in seconds</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <Button
          className="w-full justify-start gap-3 py-6"
          variant="default"
          onClick={handleUseMaterials}
          aria-label="Create study from uploaded teacher materials"
        >
          <FileText className="h-5 w-5 shrink-0" />
          <span>Use uploaded teacher materials</span>
        </Button>
        <Button
          className="w-full justify-start gap-3 py-6"
          variant="outline"
          onClick={handleStartFromTemplate}
          aria-label="Create study from template"
        >
          <LayoutTemplate className="h-5 w-5 shrink-0" />
          <span>Start from template</span>
        </Button>
      </CardContent>
    </Card>
  )
}
