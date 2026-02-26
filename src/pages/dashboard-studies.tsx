import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Search, FolderOpen, Grid3X3, List, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'

const mockStudies = [
  { id: '1', title: 'Fractions & Decimals', subject: 'Math', updated: '2 hours ago', child: 'Emma' },
  { id: '2', title: 'World War II', subject: 'History', updated: '1 day ago', child: 'Liam' },
  { id: '3', title: 'Photosynthesis', subject: 'Science', updated: '2 days ago', child: 'Emma' },
  { id: '4', title: 'Spanish Verbs', subject: 'Spanish', updated: '3 days ago', child: 'Liam' },
  { id: '5', title: 'US Constitution', subject: 'Civics', updated: '1 week ago', child: 'Emma' },
]

export function DashboardStudies() {
  const [view, setView] = useState<'grid' | 'list'>('grid')
  const [search, setSearch] = useState('')

  const filtered = mockStudies.filter(
    (s) =>
      s.title.toLowerCase().includes(search.toLowerCase()) ||
      s.subject.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Study Library</h1>
          <p className="text-muted-foreground">
            Organize and manage your study sets
          </p>
        </div>
        <Button asChild>
          <Link to="/dashboard/create">
            <Plus className="mr-2 h-4 w-4" />
            Create Study
          </Link>
        </Button>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search studies..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex gap-2">
          <Button
            variant={view === 'grid' ? 'secondary' : 'ghost'}
            size="icon"
            onClick={() => setView('grid')}
          >
            <Grid3X3 className="h-4 w-4" />
          </Button>
          <Button
            variant={view === 'list' ? 'secondary' : 'ghost'}
            size="icon"
            onClick={() => setView('list')}
          >
            <List className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {filtered.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-muted">
              <FolderOpen className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold text-foreground">No studies yet</h3>
            <p className="mt-2 max-w-sm text-center text-sm text-muted-foreground">
              Create your first study set to get started. Upload teacher materials and let AI generate personalized content.
            </p>
            <Button className="mt-6" asChild>
              <Link to="/dashboard/create">Create Study</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div
          className={cn(
            view === 'grid'
              ? 'grid gap-4 sm:grid-cols-2 lg:grid-cols-3'
              : 'flex flex-col gap-2'
          )}
        >
          {filtered.map((study) => (
            <Card key={study.id} className="transition-all hover:shadow-card-hover">
              <Link to={`/dashboard/studies/${study.id}`}>
                <CardContent className="p-6">
                  {view === 'grid' ? (
                    <>
                      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                        <FolderOpen className="h-6 w-6 text-primary" />
                      </div>
                      <h3 className="font-semibold text-foreground">{study.title}</h3>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {study.subject} · {study.child}
                      </p>
                      <p className="mt-2 text-xs text-muted-foreground">{study.updated}</p>
                    </>
                  ) : (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                          <FolderOpen className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-foreground">{study.title}</h3>
                          <p className="text-sm text-muted-foreground">
                            {study.subject} · {study.child} · {study.updated}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Link>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
