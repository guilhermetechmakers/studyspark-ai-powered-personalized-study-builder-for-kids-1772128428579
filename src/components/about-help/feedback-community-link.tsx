import { MessageCircle, ExternalLink } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const FEEDBACK_URL = 'https://feedback.studyspark.com'
const COMMUNITY_URL = 'https://community.studyspark.com'

export function FeedbackCommunityLink() {
  return (
    <section aria-labelledby="feedback-heading" className="space-y-6">
      <h2 id="feedback-heading" className="text-xl font-bold text-foreground">
        Feedback & Community
      </h2>
      <p className="text-sm text-muted-foreground">
        Your feedback helps us improve. Share ideas, report issues, or connect with other parents.
      </p>

      <Card
        className={cn(
          'rounded-2xl overflow-hidden transition-all duration-200',
          'hover:shadow-card-hover hover:-translate-y-0.5',
          'bg-gradient-to-br from-[rgb(var(--peach-light))]/50 to-[rgb(var(--lavender))]/30'
        )}
      >
        <CardContent className="p-6">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary/10">
                <MessageCircle className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">
                  Share your feedback
                </h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  We value your input. By submitting feedback, you consent to us using it to improve StudySpark. We do not share your data with third parties.
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button
                asChild
                variant="default"
                className="rounded-full"
              >
                <a
                  href={FEEDBACK_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2"
                >
                  Feedback Form
                  <ExternalLink className="h-4 w-4" />
                </a>
              </Button>
              <Button
                asChild
                variant="outline"
                className="rounded-full"
              >
                <a
                  href={COMMUNITY_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2"
                >
                  Community Forum
                  <ExternalLink className="h-4 w-4" />
                </a>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </section>
  )
}
