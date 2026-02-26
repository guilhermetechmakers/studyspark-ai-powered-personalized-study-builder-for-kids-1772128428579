import { cn } from '@/lib/utils'

export interface LogosShowcaseProps {
  logos?: string[]
  title?: string
  className?: string
}

const PLACEHOLDER_MESSAGE = 'Trusted by schools and educators nationwide.'

export function LogosShowcase({
  logos = [],
  title = 'Trusted by',
  className,
}: LogosShowcaseProps) {
  const logoList = Array.isArray(logos) ? logos : []
  const hasLogos = logoList.length > 0

  if (!hasLogos) {
    return (
      <section
        className={cn('py-12 md:py-16', className)}
        aria-labelledby="logos-heading"
      >
        <div className="container">
          <h2 id="logos-heading" className="sr-only">
            Partner schools and organizations
          </h2>
          <div className="mx-auto max-w-2xl rounded-2xl border border-dashed border-border bg-muted/30 px-8 py-12 text-center">
            <p className="text-muted-foreground">{PLACEHOLDER_MESSAGE}</p>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section
      className={cn('py-12 md:py-16', className)}
      aria-labelledby="logos-heading"
    >
      <div className="container">
        <h2 id="logos-heading" className="text-center text-lg font-semibold text-muted-foreground">
          {title}
        </h2>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-8 md:gap-12">
          {(logoList ?? []).map((src, i) => (
            <img
              key={src ?? i}
              src={src}
              alt=""
              className="h-10 w-auto grayscale opacity-70 hover:grayscale-0 hover:opacity-100 transition-all duration-300"
            />
          ))}
        </div>
      </div>
    </section>
  )
}
