import { Link } from 'react-router-dom'
import { AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function ErrorPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-[rgb(var(--peach-light))]/20 via-background to-[rgb(var(--lavender))]/10 p-4">
      <div className="text-center">
        <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-3xl bg-destructive/10">
          <AlertTriangle className="h-12 w-12 text-destructive" />
        </div>
        <h1 className="text-6xl font-bold text-foreground">500</h1>
        <p className="mt-4 text-lg text-muted-foreground">
          Something went wrong. We're working to fix it. Please try again later.
        </p>
        <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
          <Button asChild>
            <Link to="/">Go to home</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link to="/dashboard">Go to dashboard</Link>
          </Button>
        </div>
        <p className="mt-8 text-sm text-muted-foreground">
          <a href="mailto:support@studyspark.com" className="text-primary hover:underline">
            Contact support
          </a>
        </p>
      </div>
    </div>
  )
}
