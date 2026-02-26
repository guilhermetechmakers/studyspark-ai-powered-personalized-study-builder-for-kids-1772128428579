import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { cn } from '@/lib/utils'
import type { FAQItem } from '@/types/landing'

export interface FAQPreviewProps {
  faqs?: FAQItem[]
  className?: string
}

export function FAQPreview({ faqs = [], className }: FAQPreviewProps) {
  const faqList = Array.isArray(faqs) ? faqs : []

  return (
    <section
      id="faq"
      className={cn('bg-muted/50 py-20 md:py-28', className)}
      aria-labelledby="faq-heading"
    >
      <div className="container">
        <div className="mx-auto max-w-2xl text-center">
          <h2 id="faq-heading" className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Frequently asked questions
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Everything you need to know about StudySpark.
          </p>
        </div>
        <div className="mx-auto mt-16 max-w-2xl">
          <Accordion type="single" collapsible className="w-full">
            {(faqList ?? []).map((faq) => (
              <AccordionItem key={faq.id} value={faq.id}>
                <AccordionTrigger className="text-left">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  )
}
