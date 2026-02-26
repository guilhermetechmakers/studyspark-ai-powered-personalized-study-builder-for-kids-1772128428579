import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { LEARNING_STYLES, type ChildProfile, type LearningStyle } from '@/types/study-wizard'
import { dataGuard } from '@/lib/data-guard'
import { cn } from '@/lib/utils'

export interface ChildStyleSelectorProps {
  children: ChildProfile[]
  selectedChildId: string | null
  learningStyle: LearningStyle | null
  onChildSelect: (id: string) => void
  onLearningStyleSelect: (style: LearningStyle) => void
  errors?: Record<string, string>
  className?: string
}

export function ChildStyleSelector({
  children,
  selectedChildId,
  learningStyle,
  onChildSelect,
  onLearningStyleSelect,
  errors = {},
  className,
}: ChildStyleSelectorProps) {
  const safeChildren = dataGuard(children)
  const selectedChild = safeChildren.find((c) => c.id === selectedChildId)

  return (
    <div className={cn('space-y-6', className)}>
      <Card className="overflow-hidden border-2 border-border/60 bg-gradient-to-br from-[rgb(var(--lavender))]/10 to-white">
        <CardHeader>
          <CardTitle>Child & Learning Style</CardTitle>
          <CardDescription>
            Select the child profile and how they learn best.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <h4 className="text-sm font-medium">
              Child profile <span className="text-destructive">*</span>
            </h4>
            {safeChildren.length === 0 ? (
              <p className="rounded-xl border border-dashed border-border bg-muted/30 p-6 text-center text-sm text-muted-foreground">
                No child profiles yet. Add one in Settings.
              </p>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2">
                {safeChildren.map((child) => {
                  const isSelected = selectedChildId === child.id
                  return (
                    <button
                      key={child.id}
                      type="button"
                      onClick={() => onChildSelect(child.id)}
                      className={cn(
                        'flex items-center gap-4 rounded-xl border-2 p-4 text-left transition-all duration-200',
                        isSelected
                          ? 'border-primary bg-primary/5 shadow-sm'
                          : 'border-border hover:border-primary/50 hover:bg-muted/30'
                      )}
                      aria-pressed={isSelected}
                      aria-label={`Select ${child.name}, Age ${child.age}`}
                    >
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[rgb(var(--lavender))] to-[rgb(var(--violet))] text-lg font-bold text-white">
                        {child.avatarUrl ? (
                          <img
                            src={child.avatarUrl}
                            alt=""
                            className="h-full w-full rounded-full object-cover"
                          />
                        ) : (
                          child.name.charAt(0).toUpperCase()
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-medium">{child.name}</p>
                        <p className="text-sm text-muted-foreground">
                          Age {child.age} • {child.grade || 'No grade'}
                        </p>
                      </div>
                    </button>
                  )
                })}
              </div>
            )}
            {errors.childProfileId && (
              <p className="text-sm text-destructive">{errors.childProfileId}</p>
            )}
          </div>

          <div className="space-y-2">
            <h4 className="text-sm font-medium">
              Learning style <span className="text-destructive">*</span>
            </h4>
            <div className="grid gap-2 sm:grid-cols-2">
              {(LEARNING_STYLES ?? []).map((style) => {
                const isSelected = learningStyle === style.id
                return (
                  <button
                    key={style.id}
                    type="button"
                    onClick={() => onLearningStyleSelect(style.id)}
                    className={cn(
                      'rounded-xl border-2 p-4 text-left transition-all duration-200',
                      isSelected
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary/50'
                    )}
                    aria-pressed={isSelected}
                    aria-label={`Select ${style.label} learning style`}
                  >
                    <p className="font-medium">{style.label}</p>
                    <p className="text-sm text-muted-foreground">{style.desc}</p>
                  </button>
                )
              })}
            </div>
            {errors.learningStyle && (
              <p className="text-sm text-destructive">{errors.learningStyle}</p>
            )}
          </div>

          {selectedChild && learningStyle && (
            <div className="rounded-xl border border-border bg-[rgb(var(--peach-light))]/20 p-4">
              <p className="text-sm font-medium text-foreground">
                Preview: {selectedChild.name} will get {learningStyle.replace('-', ' ')} content
                tailored for age {selectedChild.age}.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
