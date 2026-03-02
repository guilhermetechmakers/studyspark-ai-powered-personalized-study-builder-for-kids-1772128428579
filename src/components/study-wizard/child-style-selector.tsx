import { LEARNING_STYLES, type ChildProfile, type LearningStyle } from '@/types/study-wizard'
import { dataGuard } from '@/lib/data-guard'
import { cn } from '@/lib/utils'

const STYLE_META: Record<string, { emoji: string; color: string; border: string; bg: string }> = {
  playful:        { emoji: '🎮', color: 'text-pink-600',   border: 'border-pink-400',   bg: 'bg-pink-50 dark:bg-pink-900/20' },
  'exam-like':    { emoji: '📝', color: 'text-blue-600',   border: 'border-blue-400',   bg: 'bg-blue-50 dark:bg-blue-900/20' },
  'research-based': { emoji: '🔍', color: 'text-violet-600', border: 'border-violet-400', bg: 'bg-violet-50 dark:bg-violet-900/20' },
  printable:      { emoji: '🖨️', color: 'text-amber-600',  border: 'border-amber-400',  bg: 'bg-amber-50 dark:bg-amber-900/20' },
  interactive:    { emoji: '⚡', color: 'text-emerald-600', border: 'border-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
}

const AVATAR_COLORS = [
  'from-violet-400 to-purple-500',
  'from-pink-400 to-rose-500',
  'from-blue-400 to-cyan-500',
  'from-emerald-400 to-teal-500',
  'from-amber-400 to-orange-500',
]

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
      {/* Step header */}
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-pink-500 text-white font-black text-lg shadow-sm">
          3
        </div>
        <div>
          <h2 className="text-xl font-black text-foreground">Child & Learning Style</h2>
          <p className="text-sm text-muted-foreground">Select who is studying and how they learn best.</p>
        </div>
      </div>

      {/* Child picker */}
      <div className="overflow-hidden rounded-3xl border-2 border-pink-200 bg-gradient-to-br from-pink-50 to-rose-50 dark:border-pink-800 dark:from-pink-900/20 dark:to-rose-900/10 p-6">
        <p className="mb-4 text-sm font-bold text-foreground">
          👤 Select child profile <span className="text-destructive">*</span>
        </p>
        {safeChildren.length === 0 ? (
          <div className="rounded-2xl border-2 border-dashed border-pink-200 bg-white/50 p-8 text-center dark:border-pink-800 dark:bg-black/10">
            <span className="text-4xl select-none">👨‍👩‍👧</span>
            <p className="mt-3 font-bold text-foreground">No child profiles yet</p>
            <p className="mt-1 text-sm text-muted-foreground">Add a child profile in Settings first.</p>
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {safeChildren.map((child, idx) => {
              const isSelected = selectedChildId === child.id
              const grad = AVATAR_COLORS[idx % AVATAR_COLORS.length]
              return (
                <button
                  key={child.id}
                  type="button"
                  onClick={() => onChildSelect(child.id)}
                  className={cn(
                    'flex items-center gap-4 rounded-2xl border-2 p-4 text-left transition-all duration-200',
                    isSelected
                      ? 'border-pink-500 bg-white shadow-md scale-[1.02] dark:bg-pink-900/20'
                      : 'border-border bg-white/60 hover:border-pink-300 hover:scale-[1.01] dark:bg-black/10',
                  )}
                  aria-pressed={isSelected}
                  aria-label={`Select ${child.name}, Age ${child.age}`}
                >
                  <div className={cn('flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br text-2xl font-black text-white shadow-sm', grad)}>
                    {child.avatarUrl ? (
                      <img
                        src={child.avatarUrl}
                        alt=""
                        className="h-full w-full rounded-2xl object-cover"
                      />
                    ) : (
                      child.name.charAt(0).toUpperCase()
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-black text-foreground text-base">{child.name}</p>
                    <p className="text-sm text-muted-foreground">
                      Age {child.age} · {child.grade || 'No grade'}
                    </p>
                  </div>
                  {isSelected && (
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-pink-500 text-white text-sm font-bold">
                      ✓
                    </div>
                  )}
                </button>
              )
            })}
          </div>
        )}
        {errors.childProfileId && (
          <p className="mt-2 text-sm text-destructive flex items-center gap-1">
            <span>⚠️</span> {errors.childProfileId}
          </p>
        )}
      </div>

      {/* Learning style picker */}
      <div className="overflow-hidden rounded-3xl border-2 border-violet-200 bg-gradient-to-br from-violet-50 to-purple-50 dark:border-violet-800 dark:from-violet-900/20 dark:to-purple-900/10 p-6">
        <p className="mb-4 text-sm font-bold text-foreground">
          🧠 Learning style <span className="text-destructive">*</span>
        </p>
        <div className="grid gap-3 sm:grid-cols-2">
          {(LEARNING_STYLES ?? []).map((style) => {
            const meta = STYLE_META[style.id] ?? { emoji: '📚', color: 'text-foreground', border: 'border-border', bg: 'bg-muted' }
            const isSelected = learningStyle === style.id
            return (
              <button
                key={style.id}
                type="button"
                onClick={() => onLearningStyleSelect(style.id)}
                className={cn(
                  'flex items-start gap-3 rounded-2xl border-2 p-4 text-left transition-all duration-200',
                  isSelected
                    ? `${meta.border} ${meta.bg} scale-[1.02] shadow-md`
                    : 'border-border bg-white/60 hover:border-violet-300 hover:scale-[1.01] dark:bg-black/10',
                )}
                aria-pressed={isSelected}
                aria-label={`Select ${style.label} learning style`}
              >
                <span className="text-2xl select-none shrink-0">{meta.emoji}</span>
                <div className="min-w-0">
                  <p className={cn('font-bold text-sm', isSelected ? meta.color : 'text-foreground')}>{style.label}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{style.desc}</p>
                </div>
                {isSelected && (
                  <div className={cn('ml-auto flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-white text-xs font-bold', meta.border.replace('border-', 'bg-'))}>
                    ✓
                  </div>
                )}
              </button>
            )
          })}
        </div>
        {errors.learningStyle && (
          <p className="mt-2 text-sm text-destructive flex items-center gap-1">
            <span>⚠️</span> {errors.learningStyle}
          </p>
        )}
      </div>

      {/* Preview */}
      {selectedChild && learningStyle && (
        <div className="flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4 dark:border-emerald-800 dark:bg-emerald-900/20">
          <span className="text-2xl shrink-0 select-none">🎯</span>
          <p className="text-sm font-semibold text-emerald-800 dark:text-emerald-200">
            <strong>{selectedChild.name}</strong> will get{' '}
            <strong>{STYLE_META[learningStyle]?.emoji} {learningStyle.replace('-', ' ')}</strong> content
            tailored for age {selectedChild.age}. Looks great!
          </p>
        </div>
      )}
    </div>
  )
}
