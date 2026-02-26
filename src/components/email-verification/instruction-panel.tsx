import { Mail } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export function InstructionPanel() {
  return (
    <Card className="rounded-[20px] border border-border bg-gradient-to-br from-[rgb(var(--peach-light))]/30 to-card shadow-card transition-all duration-300 hover:shadow-card-hover">
      <CardHeader className="pb-4">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-[rgb(var(--lavender))]/20 to-[rgb(var(--violet))]/20">
          <Mail className="h-8 w-8 text-primary" aria-hidden />
        </div>
        <CardTitle className="text-center text-2xl font-bold tracking-tight">
          Verify Your Email
        </CardTitle>
        <CardDescription className="text-center text-base leading-relaxed">
          We need to verify your email address to keep your account secure and ensure you receive
          important updates. Check your inbox for a verification link—it usually arrives within a
          few minutes. Click the link to activate your account and get started.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-2 pt-0">
        <p className="text-center text-sm text-muted-foreground">
          If you don&apos;t verify, you may have limited access to some features.
        </p>
      </CardContent>
    </Card>
  )
}
