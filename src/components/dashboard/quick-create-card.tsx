import { Link } from 'react-router-dom'
import { FileUp, LayoutTemplate, PlusCircle, ChevronRight } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export interface QuickCreateCardProps {
  onUseMaterials?: () => void
  onStartFromTemplate?: () => void
  className?: string
}

export function QuickCreateCard({
  onUseMaterials,
  onStartFromTemplate,
  className,
}: QuickCreateCardProps) {
  return (
    <Card
      className={cn(
        'overflow-hidden border-2 border-primary/20 bg-gradient-to-br from-primary/10 via-[rgb(var(--peach-light))]/30 to-[rgb(var(--lavender))]/20 transition-all duration-300 hover:border-primary/40 hover:shadow-card-hover hover:-translate-y-0.5',
        className
      )}
    >
      <CardContent className="flex flex-col gap-6 p-6">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[rgb(var(--lavender))] to-[rgb(var(--violet))] text-white shadow-md">
            <PlusCircle className="h-7 w-7" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-foreground">Quick Create</h3>
            <p className="text-sm text-muted-foreground">
              Start a new study in seconds
            </p>
          </div>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Button
            asChild
            className="flex-1 rounded-full bg-primary text-primary-foreground shadow-md transition-all hover:scale-[1.02] hover:shadow-lg active:scale-[0.98]"
          >
            <Link
              to="/dashboard/create"
              onClick={() => onUseMaterials?.()}
              className="flex items-center justify-center gap-2"
            >
              <FileUp className="h-5 w-5" />
              Use uploaded materials
              <ChevronRight className="h-4 w-4" />
            </Link>
          </Button>
          <Button
            asChild
            variant="outline"
            className="flex-1 rounded-full border-2 transition-all hover:scale-[1.02] hover:bg-primary/5 active:scale-[0.98]"
          >
            <Link
              to="/dashboard/create"
              onClick={() => onStartFromTemplate?.()}
              className="flex items-center justify-center gap-2"
            >
              <LayoutTemplate className="h-5 w-5" />
              Start from template
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
