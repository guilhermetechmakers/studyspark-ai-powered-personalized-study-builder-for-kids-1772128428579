import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  FileText,
  Upload,
  User,
  Settings,
  Sparkles,
  Check,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

const steps = [
  { id: 1, title: 'Topic & Context', icon: FileText },
  { id: 2, title: 'Upload Materials', icon: Upload },
  { id: 3, title: 'Child & Style', icon: User },
  { id: 4, title: 'Generation Options', icon: Settings },
  { id: 5, title: 'Generate & Review', icon: Sparkles },
]

const learningStyles = [
  { id: 'playful', label: 'Playful', desc: 'Games, stories, and fun activities' },
  { id: 'exam-like', label: 'Exam-like', desc: 'Practice tests and structured Q&A' },
  { id: 'research', label: 'Research-based', desc: 'Deep dives and critical thinking' },
  { id: 'printable', label: 'Printable', desc: 'Clean PDFs for printing' },
  { id: 'interactive', label: 'Interactive', desc: 'In-app activities and quizzes' },
]

export function CreateStudyWizard() {
  const navigate = useNavigate()
  const [currentStep, setCurrentStep] = useState(1)
  const [topic, setTopic] = useState('')
  const [subject, setSubject] = useState('')
  const [notes, setNotes] = useState('')
  const [learningStyle, setLearningStyle] = useState<string | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [generationProgress, setGenerationProgress] = useState(0)

  const progress = (currentStep / steps.length) * 100

  const handleNext = () => {
    if (currentStep < steps.length) {
      setCurrentStep((s) => s + 1)
    } else {
      handleGenerate()
    }
  }

  const handleBack = () => {
    if (currentStep > 1) setCurrentStep((s) => s - 1)
  }

  const handleGenerate = async () => {
    setIsGenerating(true)
    setGenerationProgress(0)
    const interval = setInterval(() => {
      setGenerationProgress((p) => {
        if (p >= 100) {
          clearInterval(interval)
          setIsGenerating(false)
          toast.success('Study created!')
          navigate('/dashboard/studies')
          return 100
        }
        return p + 10
      })
    }, 400)
  }

  return (
    <div className="flex h-[calc(100vh-4rem)] flex-col">
      {/* Step indicator */}
      <div className="border-b border-border bg-card px-6 py-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 overflow-x-auto">
            {steps.map((step) => {
              const Icon = step.icon
              const isActive = step.id === currentStep
              const isComplete = step.id < currentStep
              return (
                <button
                  key={step.id}
                  onClick={() => step.id < currentStep && setCurrentStep(step.id)}
                  className={cn(
                    'flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-colors',
                    isActive && 'bg-primary text-primary-foreground',
                    isComplete && 'bg-primary/10 text-primary',
                    !isActive && !isComplete && 'text-muted-foreground hover:text-foreground'
                  )}
                >
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-current/20">
                    {isComplete ? <Check className="h-3 w-3" /> : <Icon className="h-3 w-3" />}
                  </span>
                  <span className="hidden sm:inline">{step.title}</span>
                </button>
              )
            })}
          </div>
          <Progress value={progress} className="w-24 hidden md:block" />
        </div>
      </div>

      {/* Step content */}
      <div className="flex-1 overflow-auto">
        <div className="container max-w-2xl py-8">
          {currentStep === 1 && (
            <Card>
              <CardHeader>
                <CardTitle>Topic & Context</CardTitle>
                <CardDescription>
                  What is the exam or topic? Add any context from the teacher.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="topic">Topic / Exam name</Label>
                  <Input
                    id="topic"
                    placeholder="e.g. Fractions & Decimals, World War II"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="subject">Subject</Label>
                  <Input
                    id="subject"
                    placeholder="e.g. Math, History, Science"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="notes">Additional notes (optional)</Label>
                  <Input
                    id="notes"
                    placeholder="Exam date, key concepts, teacher instructions..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {currentStep === 2 && (
            <Card>
              <CardHeader>
                <CardTitle>Upload Materials</CardTitle>
                <CardDescription>
                  Upload photos, PDFs, or documents from the teacher. We'll extract text with OCR.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-border bg-muted/50 py-16">
                  <Upload className="mb-4 h-12 w-12 text-muted-foreground" />
                  <p className="mb-2 font-medium text-foreground">Drag and drop files here</p>
                  <p className="text-sm text-muted-foreground">
                    or click to browse. Supports PDF, JPG, PNG.
                  </p>
                  <Button variant="outline" className="mt-4">
                    Choose files
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {currentStep === 3 && (
            <Card>
              <CardHeader>
                <CardTitle>Child & Learning Style</CardTitle>
                <CardDescription>
                  Select the child profile and how they learn best.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Child profile</Label>
                  <Tabs defaultValue="emma" className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="emma">Emma (Age 8)</TabsTrigger>
                      <TabsTrigger value="liam">Liam (Age 11)</TabsTrigger>
                    </TabsList>
                  </Tabs>
                </div>
                <div className="space-y-2">
                  <Label>Learning style</Label>
                  <div className="grid gap-2 sm:grid-cols-2">
                    {learningStyles.map((style) => (
                      <button
                        key={style.id}
                        onClick={() => setLearningStyle(style.id)}
                        className={cn(
                          'rounded-xl border-2 p-4 text-left transition-colors',
                          learningStyle === style.id
                            ? 'border-primary bg-primary/5'
                            : 'border-border hover:border-primary/50'
                        )}
                      >
                        <p className="font-medium">{style.label}</p>
                        <p className="text-sm text-muted-foreground">{style.desc}</p>
                      </button>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {currentStep === 4 && (
            <Card>
              <CardHeader>
                <CardTitle>Generation Options</CardTitle>
                <CardDescription>
                  Choose what outputs you want from the AI.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between rounded-xl border border-border p-4">
                  <div>
                    <p className="font-medium">Flashcards</p>
                    <p className="text-sm text-muted-foreground">Key terms and definitions</p>
                  </div>
                  <input type="checkbox" defaultChecked className="h-4 w-4 rounded" />
                </div>
                <div className="flex items-center justify-between rounded-xl border border-border p-4">
                  <div>
                    <p className="font-medium">Quizzes</p>
                    <p className="text-sm text-muted-foreground">Multiple choice and short answer</p>
                  </div>
                  <input type="checkbox" defaultChecked className="h-4 w-4 rounded" />
                </div>
                <div className="flex items-center justify-between rounded-xl border border-border p-4">
                  <div>
                    <p className="font-medium">Printable PDF</p>
                    <p className="text-sm text-muted-foreground">Summary and study guide</p>
                  </div>
                  <input type="checkbox" defaultChecked className="h-4 w-4 rounded" />
                </div>
              </CardContent>
            </Card>
          )}

          {currentStep === 5 && (
            <Card>
              <CardHeader>
                <CardTitle>Generate & Review</CardTitle>
                <CardDescription>
                  {isGenerating
                    ? 'AI is creating your study materials...'
                    : 'Ready to generate. You can review and edit after.'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isGenerating ? (
                  <div className="space-y-4">
                    <Progress value={generationProgress} className="h-2" />
                    <p className="text-center text-sm text-muted-foreground">
                      Analyzing materials... Generating content... Almost done!
                    </p>
                  </div>
                ) : (
                  <div className="rounded-xl border border-border bg-muted/30 p-6 text-center">
                    <Sparkles className="mx-auto mb-4 h-12 w-12 text-primary" />
                    <p className="font-medium text-foreground">All set!</p>
                    <p className="mt-2 text-sm text-muted-foreground">
                      Click Generate to create your personalized study set. You can review and edit each block before sharing with your child.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-border bg-card px-6 py-4">
        <div className="container flex max-w-2xl justify-between">
          <Button variant="outline" onClick={handleBack} disabled={currentStep === 1}>
            <ChevronLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <Button
            onClick={handleNext}
            disabled={
              (currentStep === 1 && !topic) ||
              (currentStep === 3 && !learningStyle) ||
              isGenerating
            }
          >
            {currentStep === steps.length ? 'Generate' : 'Next'}
            <ChevronRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
