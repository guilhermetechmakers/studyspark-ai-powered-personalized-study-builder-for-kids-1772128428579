import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ChevronLeft, ChevronRight, Volume2, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
const mockActivities = [
  { id: 1, type: 'flashcard', question: 'What is 1/2 + 1/4?', answer: '3/4' },
  { id: 2, type: 'flashcard', question: 'Convert 0.5 to a fraction', answer: '1/2' },
  { id: 3, type: 'quiz', question: 'Which is larger: 2/3 or 3/4?', options: ['2/3', '3/4', 'Equal'], correct: 1 },
]

export function StudyViewerPage() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [showAnswer, setShowAnswer] = useState(false)

  const activity = mockActivities[currentIndex]
  const progress = ((currentIndex + 1) / mockActivities.length) * 100

  const handleNext = () => {
    if (currentIndex < mockActivities.length - 1) {
      setCurrentIndex((i) => i + 1)
      setShowAnswer(false)
    }
  }

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex((i) => i - 1)
      setShowAnswer(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[rgb(var(--peach-light))]/20 via-background to-[rgb(var(--lavender))]/10">
      {/* Child-friendly header */}
      <header className="border-b border-border bg-card/80 backdrop-blur">
        <div className="container flex h-14 items-center justify-between px-4">
          <Link
            to="/dashboard"
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
          >
            <ChevronLeft className="h-5 w-5" />
            Back to parent
          </Link>
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            <span className="font-bold text-foreground">StudySpark</span>
          </div>
          <div className="w-20" />
        </div>
        <div className="px-4 pb-2">
          <Progress value={progress} className="h-2" />
          <p className="mt-1 text-center text-xs text-muted-foreground">
            {currentIndex + 1} of {mockActivities.length}
          </p>
        </div>
      </header>

      <main className="container max-w-2xl px-4 py-8">
        <Card className="overflow-hidden">
          <CardContent className="p-8">
            {activity?.type === 'flashcard' && (
              <div className="space-y-6">
                <div className="rounded-2xl bg-muted/50 p-6">
                  <p className="text-lg font-medium text-foreground">
                    {activity.question}
                  </p>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="mt-4"
                    onClick={() => {}}
                    title="Listen (TTS)"
                  >
                    <Volume2 className="mr-2 h-4 w-4" />
                    Listen
                  </Button>
                </div>
                {!showAnswer ? (
                  <Button
                    className="w-full"
                    onClick={() => setShowAnswer(true)}
                  >
                    Show Answer
                  </Button>
                ) : (
                  <div className="rounded-2xl border-2 border-primary/30 bg-primary/5 p-6">
                    <p className="text-lg font-medium text-foreground">
                      {activity.answer}
                    </p>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="mt-4"
                      title="Listen (TTS)"
                    >
                      <Volume2 className="mr-2 h-4 w-4" />
                      Listen
                    </Button>
                  </div>
                )}
              </div>
            )}
            {activity?.type === 'quiz' && (
              <div className="space-y-6">
                <p className="text-lg font-medium text-foreground">
                  {activity.question}
                </p>
                <div className="space-y-2">
                  {activity.options?.map((opt: string, i: number) => (
                    <Button
                      key={i}
                      variant="outline"
                      className="w-full justify-start"
                      onClick={() => handleNext()}
                    >
                      {opt}
                    </Button>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="mt-8 flex justify-between">
          <Button
            variant="outline"
            onClick={handlePrev}
            disabled={currentIndex === 0}
          >
            <ChevronLeft className="mr-2 h-4 w-4" />
            Previous
          </Button>
          <Button
            onClick={handleNext}
            disabled={currentIndex === mockActivities.length - 1}
          >
            Next
            <ChevronRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </main>
    </div>
  )
}
