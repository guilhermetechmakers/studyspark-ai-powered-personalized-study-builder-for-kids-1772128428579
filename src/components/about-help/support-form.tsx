import { useState, useCallback } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Paperclip, X, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { submitSupportTicket } from '@/api/help'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB
const ALLOWED_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/webp',
  'text/plain',
]

const supportSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Valid email is required'),
  subject: z.string().min(1, 'Subject is required'),
  priority: z.enum(['low', 'medium', 'high']),
  description: z.string().min(10, 'Please provide at least 10 characters'),
})

type SupportFormValues = z.infer<typeof supportSchema>

export function SupportForm() {
  const [attachments, setAttachments] = useState<File[]>([])
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [ticketId, setTicketId] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    watch,
    reset,
  } = useForm<SupportFormValues>({
    resolver: zodResolver(supportSchema),
    defaultValues: {
      name: '',
      email: '',
      subject: '',
      priority: 'medium',
      description: '',
    },
  })

  const priority = watch('priority')

  const validateFile = useCallback((file: File): string | null => {
    if (file.size > MAX_FILE_SIZE) {
      return `File ${file.name} exceeds 5MB limit`
    }
    const type = file.type?.toLowerCase()
    if (type && !ALLOWED_TYPES.includes(type)) {
      return `File type ${file.type} is not allowed (PDF, images, or text only)`
    }
    return null
  }, [])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? [])
    const valid: File[] = []
    for (const file of files) {
      const err = validateFile(file)
      if (err) {
        toast.error(err)
      } else {
        valid.push(file)
      }
    }
    setAttachments((prev) => {
      const combined = [...prev, ...valid]
      return combined.slice(0, 5)
    })
    e.target.value = ''
  }

  const removeAttachment = (index: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index))
  }

  const onSubmit = async (data: SupportFormValues) => {
    setSubmitStatus('idle')
    setTicketId(null)
    try {
      const payload = {
        name: data.name,
        email: data.email,
        subject: data.subject,
        priority: data.priority,
        description: data.description,
        attachments: attachments.map((f) => ({
          name: f.name,
          url: '', // In real implementation, upload first and get URL
        })),
      }
      const res = await submitSupportTicket(payload)
      if (res.success) {
        setSubmitStatus('success')
        setTicketId(res.ticketId ?? null)
        reset()
        setAttachments([])
        toast.success(
          res.ticketId
            ? `Ticket #${res.ticketId} submitted successfully`
            : 'Support request submitted successfully'
        )
      } else {
        setSubmitStatus('error')
        toast.error(res.message ?? 'Failed to submit ticket')
      }
    } catch {
      setSubmitStatus('error')
      toast.error('Failed to submit support request')
    }
  }

  if (submitStatus === 'success') {
    return (
      <Card className="rounded-2xl border-success/30 bg-success/10">
        <CardContent className="flex flex-col items-center gap-4 p-8 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-success/20">
            <span className="text-2xl font-bold text-success-foreground" aria-hidden>
              ✓
            </span>
          </div>
          <div>
            <h3 className="font-semibold text-foreground">Thank you!</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              {ticketId
                ? `Your support ticket has been submitted. Reference: #${ticketId}`
                : 'Your support request has been submitted successfully.'}
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              We&apos;ll get back to you as soon as possible.
            </p>
          </div>
          <Button
            variant="outline"
            onClick={() => {
              setSubmitStatus('idle')
              setTicketId(null)
            }}
            className="rounded-full"
          >
            Submit another request
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <section aria-labelledby="support-heading" className="space-y-6">
      <h2 id="support-heading" className="text-xl font-bold text-foreground">
        Contact Support
      </h2>
      <p className="text-sm text-muted-foreground">
        Need help? Fill out the form below and we&apos;ll get back to you.
      </p>

      <Card className="rounded-2xl">
        <CardHeader>
          <h3 className="text-lg font-semibold text-foreground">
            Support Request
          </h3>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="support-name">Name</Label>
                <Input
                  id="support-name"
                  placeholder="Your name"
                  className="rounded-xl"
                  {...register('name')}
                />
                {errors.name && (
                  <p className="text-sm text-destructive">{errors.name.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="support-email">Email</Label>
                <Input
                  id="support-email"
                  type="email"
                  placeholder="you@example.com"
                  className="rounded-xl"
                  {...register('email')}
                />
                {errors.email && (
                  <p className="text-sm text-destructive">{errors.email.message}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="support-subject">Subject</Label>
              <Input
                id="support-subject"
                placeholder="Brief subject"
                className="rounded-xl"
                {...register('subject')}
              />
              {errors.subject && (
                <p className="text-sm text-destructive">{errors.subject.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="support-priority">Priority</Label>
              <Select
                value={priority}
                onValueChange={(v) => setValue('priority', v as 'low' | 'medium' | 'high')}
              >
                <SelectTrigger id="support-priority" className="rounded-xl">
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="support-description">Description</Label>
              <Textarea
                id="support-description"
                placeholder="Describe your issue or question..."
                rows={4}
                className="rounded-xl resize-none"
                {...register('description')}
              />
              {errors.description && (
                <p className="text-sm text-destructive">
                  {errors.description.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Attachments (optional)</Label>
              <div className="flex flex-wrap gap-2">
                <label className="cursor-pointer">
                  <input
                    type="file"
                    multiple
                    accept=".pdf,.jpg,.jpeg,.png,.webp,.txt"
                    className="sr-only"
                    onChange={handleFileChange}
                  />
                  <span
                    className={cn(
                      'inline-flex items-center gap-2 rounded-full border border-dashed border-input px-4 py-2 text-sm transition-colors',
                      'hover:bg-muted hover:border-primary/50'
                    )}
                  >
                    <Paperclip className="h-4 w-4 shrink-0" aria-hidden />
                    Add files (max 5MB each)
                  </span>
                </label>
              </div>
              {(attachments ?? []).length > 0 && (
                <ul className="mt-2 space-y-1">
                  {attachments.map((f, i) => (
                    <li
                      key={`${f.name}-${i}`}
                      className="flex items-center gap-2 text-sm text-muted-foreground"
                    >
                      <span className="truncate">{f.name}</span>
                      <button
                        type="button"
                        onClick={() => removeAttachment(i)}
                        className="shrink-0 rounded p-1 hover:bg-muted"
                        aria-label={`Remove ${f.name}`}
                      >
                        <X className="h-4 w-4 shrink-0" aria-hidden />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full rounded-full sm:w-auto"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 shrink-0 animate-spin" aria-hidden />
                  Submitting...
                </>
              ) : (
                'Submit'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </section>
  )
}
