import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Search, Sparkles, Book, Mail } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'

const helpTopics = [
  {
    title: 'Getting Started',
    items: [
      { q: 'How do I create my first study?', a: 'Click "Create Study" from the dashboard. Enter the topic, upload teacher materials, select your child and learning style, then generate. You can review and edit before sharing.' },
      { q: 'What file types can I upload?', a: 'We support photos (JPG, PNG), PDFs, and common document formats. Our OCR extracts text from handwritten notes and printed documents.' },
    ],
  },
  {
    title: 'Child Profiles',
    items: [
      { q: 'How do I add a child?', a: 'Go to Settings → Children → Add child. Enter name, age/grade, and learning preferences.' },
      { q: 'Can I have multiple children?', a: 'Yes. The Free plan supports 1 child. Pro supports 2, and Family supports up to 4.' },
    ],
  },
  {
    title: 'AI & Content',
    items: [
      { q: 'Can I edit AI-generated content?', a: 'Yes. You can edit any block inline or request targeted revisions from the AI. Nothing goes to your child until you approve.' },
      { q: 'How does the AI tailor content?', a: 'We use your child\'s age, grade, and chosen learning style to shape prompts. The AI adapts vocabulary, length, and format accordingly.' },
    ],
  },
]

export function HelpPage() {
  const [search, setSearch] = useState('')

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-border bg-card">
        <div className="container flex h-16 items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[rgb(var(--lavender))] to-[rgb(var(--violet))] text-white">
              <Sparkles className="h-5 w-5" />
            </div>
            <span className="text-xl font-bold text-foreground">StudySpark</span>
          </Link>
          <div className="flex gap-2">
            <Button variant="outline" asChild>
              <Link to="/login">Log in</Link>
            </Button>
            <Button asChild>
              <Link to="/signup">Sign up</Link>
            </Button>
          </div>
        </div>
      </header>
      <main className="container max-w-3xl py-12">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-foreground">Help Center</h1>
          <p className="mt-2 text-muted-foreground">
            Find answers and get support
          </p>
          <div className="relative mx-auto mt-8 max-w-md">
            <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search help articles..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <div className="mt-12 space-y-8">
          {helpTopics.map((topic) => (
            <div key={topic.title}>
              <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold">
                <Book className="h-5 w-5 text-primary" />
                {topic.title}
              </h2>
              <Accordion type="single" collapsible className="w-full">
                {topic.items.map((item) => (
                  <AccordionItem key={item.q} value={item.q}>
                    <AccordionTrigger className="text-left">{item.q}</AccordionTrigger>
                    <AccordionContent className="text-muted-foreground">
                      {item.a}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          ))}
        </div>

        <Card className="mt-12">
          <CardContent className="flex flex-col items-center gap-4 p-8 md:flex-row md:justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10">
                <Mail className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">Still need help?</h3>
                <p className="text-sm text-muted-foreground">
                  Contact our support team
                </p>
              </div>
            </div>
            <Button asChild>
              <a href="mailto:support@studyspark.com">Contact Support</a>
            </Button>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
