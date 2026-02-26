import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, Edit, Share2, Download, Play } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
export function StudyDetailPage() {
  const { id } = useParams()

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link to="/dashboard/studies">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Fractions & Decimals</h1>
            <p className="text-muted-foreground">Math · Emma · Updated 2 hours ago</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Edit className="mr-2 h-4 w-4" />
            Edit
          </Button>
          <Button variant="outline" size="sm">
            <Share2 className="mr-2 h-4 w-4" />
            Share
          </Button>
          <Button variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
          <Button size="sm" asChild>
            <Link to={`/study/${id}/play`}>
              <Play className="mr-2 h-4 w-4" />
              Open for child
            </Link>
          </Button>
        </div>
      </div>

      <Tabs defaultValue="content" className="w-full">
        <TabsList>
          <TabsTrigger value="content">Content</TabsTrigger>
          <TabsTrigger value="sources">Source Materials</TabsTrigger>
          <TabsTrigger value="history">Version History</TabsTrigger>
        </TabsList>
        <TabsContent value="content" className="mt-6">
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Flashcards</CardTitle>
              </CardHeader>
              <CardContent className="prose prose-sm max-w-none">
                <p>Sample flashcard content would appear here. Each block can be edited or sent for AI revision.</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Quiz</CardTitle>
              </CardHeader>
              <CardContent className="prose prose-sm max-w-none">
                <p>Quiz questions and answers would appear here.</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        <TabsContent value="sources" className="mt-6">
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              Uploaded materials and OCR results would appear here.
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="history" className="mt-6">
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              Version history and revision diffs would appear here.
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
