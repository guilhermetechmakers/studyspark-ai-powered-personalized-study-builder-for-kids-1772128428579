import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Search, FolderOpen, Plus, Play, Sparkles, BookOpen, FlaskConical, Globe, Music, Calculator, Palette, Star, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

const SUBJECT_CONFIG: Record<string, { emoji: string; color: string; bg: string; icon: React.ElementType }> = {
  Math:    { emoji: '🔢', color: 'text-blue-700',   bg: 'from-blue-100 to-sky-50',      icon: Calculator },
  Science: { emoji: '🔬', color: 'text-green-700',  bg: 'from-green-100 to-emerald-50', icon: FlaskConical },
  History: { emoji: '🏛️', color: 'text-amber-700',  bg: 'from-amber-100 to-yellow-50',  icon: Globe },
  Spanish: { emoji: '🌍', color: 'text-rose-700',   bg: 'from-rose-100 to-pink-50',     icon: Globe },
  Music:   { emoji: '🎵', color: 'text-purple-700', bg: 'from-purple-100 to-violet-50', icon: Music },
  Art:     { emoji: '🎨', color: 'text-pink-700',   bg: 'from-pink-100 to-fuchsia-50',  icon: Palette },
  Reading: { emoji: '📖', color: 'text-indigo-700', bg: 'from-indigo-100 to-blue-50',   icon: BookOpen },
  Civics:  { emoji: '⚖️', color: 'text-orange-700', bg: 'from-orange-100 to-amber-50',  icon: Globe },
}

function getSubjectConfig(subject: string) {
  return SUBJECT_CONFIG[subject] ?? { emoji: '📚', color: 'text-violet-700', bg: 'from-violet-100 to-purple-50', icon: BookOpen }
}

const mockStudies = [
  { id: '1', title: 'Fractions & Decimals', subject: 'Math',    updated: '2h ago',  child: 'Emma', progress: 65, stars: 4 },
  { id: '2', title: 'World War II',         subject: 'History', updated: '1d ago',  child: 'Liam', progress: 30, stars: 2 },
  { id: '3', title: 'Photosynthesis',       subject: 'Science', updated: '2d ago',  child: 'Emma', progress: 90, stars: 5 },
  { id: '4', title: 'Spanish Verbs',        subject: 'Spanish', updated: '3d ago',  child: 'Liam', progress: 10, stars: 1 },
  { id: '5', title: 'US Constitution',      subject: 'Civics',  updated: '1wk ago', child: 'Emma', progress: 0,  stars: 0 },
]

const CHILD_COLORS: Record<string, { bg: string; text: string; ring: string }> = {
  Emma: { bg: 'bg-pink-100',   text: 'text-pink-700',   ring: 'ring-pink-300' },
  Liam: { bg: 'bg-sky-100',    text: 'text-sky-700',    ring: 'ring-sky-300' },
}

function getChildColor(name: string) {
  return CHILD_COLORS[name] ?? { bg: 'bg-violet-100', text: 'text-violet-700', ring: 'ring-violet-300' }
}

function getProgressLabel(pct: number) {
  if (pct === 0) return { label: 'New',          cls: 'bg-slate-100 text-slate-600' }
  if (pct < 50)  return { label: 'In progress',  cls: 'bg-amber-100 text-amber-700' }
  if (pct < 100) return { label: 'Almost done!', cls: 'bg-blue-100 text-blue-700' }
  return                  { label: 'Completed ✓', cls: 'bg-green-100 text-green-700' }
}

interface StudyEntry {
  id: string
  title: string
  subject: string
  updated: string
  child: string
  progress: number
  stars: number
}

function StudyCard({ study }: { study: StudyEntry }) {
  const subj   = getSubjectConfig(study.subject)
  const child  = getChildColor(study.child)
  const status = getProgressLabel(study.progress)

  return (
    <div
      className={cn(
        'group relative flex flex-col overflow-hidden rounded-3xl border-2 border-transparent bg-card',
        'shadow-card transition-all duration-300',
        'hover:shadow-card-hover hover:-translate-y-1 hover:border-primary/20',
      )}
    >
      {/* Subject gradient header */}
      <div className={cn('relative h-28 bg-gradient-to-br p-5', subj.bg)}>
        <span className="text-4xl leading-none select-none">{subj.emoji}</span>

        {/* Child badge */}
        <span className={cn(
          'absolute right-4 top-4 rounded-xl px-2.5 py-0.5 text-xs font-bold ring-1',
          child.bg, child.text, child.ring,
        )}>
          {study.child}
        </span>

        {/* Stars */}
        {study.stars > 0 && (
          <div className="absolute bottom-3 right-4 flex gap-0.5" aria-label={`${study.stars} stars`}>
            {[1,2,3,4,5].map(i => (
              <Star
                key={i}
                className={cn(
                  'h-3.5 w-3.5',
                  i <= study.stars ? 'fill-amber-400 text-amber-400' : 'fill-transparent text-amber-200',
                )}
              />
            ))}
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-3 p-5">
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-base font-bold leading-snug text-foreground group-hover:text-primary transition-colors">
            {study.title}
          </h3>
          <span className={cn('shrink-0 rounded-full px-2 py-0.5 text-[11px] font-semibold whitespace-nowrap', status.cls)}>
            {status.label}
          </span>
        </div>

        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <span className={cn('font-medium', subj.color)}>{study.subject}</span>
          <span>·</span>
          <Clock className="h-3 w-3 shrink-0" />
          <span>{study.updated}</span>
        </div>

        {/* Progress bar */}
        <div className="space-y-1">
          <div className="h-2.5 w-full overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-gradient-to-r from-primary to-secondary transition-all duration-700"
              style={{ width: `${study.progress}%` }}
            />
          </div>
          <p className="text-[11px] text-muted-foreground">{study.progress}% complete</p>
        </div>

        {/* CTA buttons */}
        <div className="mt-auto flex gap-2 pt-1">
          <Button
            asChild
            size="sm"
            className={cn(
              'flex-1 gap-1.5 rounded-xl font-bold',
              'bg-gradient-to-r from-primary to-secondary text-white',
              'hover:opacity-90 hover:shadow-glow',
              'transition-all duration-200 active:scale-95',
            )}
          >
            <Link to={`/study/${study.id}/play`}>
              <Play className="h-3.5 w-3.5 fill-current" />
              Play for {study.child}
            </Link>
          </Button>
          <Button
            asChild
            variant="outline"
            size="sm"
            className="rounded-xl px-3 hover:border-primary/40 hover:bg-primary/5"
            title="Customize this study"
          >
            <Link to={`/dashboard/studies/${study.id}`}>
              <Sparkles className="h-3.5 w-3.5 text-primary" />
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}

export function DashboardStudies() {
  const [search, setSearch] = useState('')

  const filtered = mockStudies.filter(
    (s) =>
      s.title.toLowerCase().includes(search.toLowerCase()) ||
      s.subject.toLowerCase().includes(search.toLowerCase()) ||
      s.child.toLowerCase().includes(search.toLowerCase()),
  )

  return (
    <div className="space-y-8 p-4 sm:p-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between animate-fade-in">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-3xl select-none">📚</span>
            <h1 className="text-2xl font-extrabold text-foreground md:text-3xl">Study Library</h1>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            Hit <strong>Play</strong> to launch a study session for your child, or{' '}
            <Sparkles className="inline h-3.5 w-3.5 text-primary" />{' '}
            to customise it first.
          </p>
        </div>
        <Button
          asChild
          className={cn(
            'shrink-0 gap-2 rounded-2xl px-5 font-bold',
            'bg-gradient-to-r from-primary to-secondary text-white',
            'hover:opacity-90 hover:scale-105 hover:shadow-glow transition-all duration-200',
          )}
        >
          <Link to="/dashboard/create">
            <Plus className="h-4 w-4" />
            New Study
          </Link>
        </Button>
      </div>

      {/* Search */}
      <div className="relative max-w-sm animate-fade-in" style={{ animationDelay: '50ms' }}>
        <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search by title, subject or child…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="rounded-2xl pl-10 text-sm"
        />
      </div>

      {/* Cards grid */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-4 rounded-3xl border-2 border-dashed border-border bg-muted/30 py-20 animate-fade-in">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-muted">
            <FolderOpen className="h-8 w-8 text-muted-foreground" />
          </div>
          <div className="text-center">
            <h3 className="text-lg font-bold text-foreground">No studies found</h3>
            <p className="mt-1 max-w-xs text-sm text-muted-foreground">
              {search
                ? `No results for "${search}". Try a different search.`
                : 'Create your first study set to get started!'}
            </p>
          </div>
          {!search && (
            <Button asChild className="mt-2 rounded-2xl gap-2">
              <Link to="/dashboard/create">
                <Plus className="h-4 w-4" />
                Create Study
              </Link>
            </Button>
          )}
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((study, i) => (
            <div
              key={study.id}
              className="animate-fade-in-up"
              style={{ animationDelay: `${i * 60}ms` }}
            >
              <StudyCard study={study} />
            </div>
          ))}
        </div>
      )}

      {/* Quick-tip banner */}
      <div className="flex items-start gap-3 rounded-2xl border border-primary/20 bg-primary/5 p-4 animate-fade-in" style={{ animationDelay: '300ms' }}>
        <span className="text-2xl select-none">💡</span>
        <div>
          <p className="text-sm font-semibold text-foreground">Tip: how to start a study session</p>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Click <strong>Play for [child]</strong> to launch directly in the fun kid-friendly player.
            Use the <Sparkles className="inline h-3.5 w-3.5 text-primary" /> button to preview and
            customise colors, cards and rewards before playing.
          </p>
        </div>
      </div>
    </div>
  )
}
