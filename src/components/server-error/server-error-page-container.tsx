/**
 * ServerErrorPageContainer - 500 Server Error page.
 * Communicates a temporary server issue with retry and contact support actions.
 */

import { ErrorIllustration } from './error-illustration'
import { MessageBlock } from './message-block'
import { ActionPanel } from './action-panel'

export interface ServerErrorPageContainerProps {
  onRetry?: () => Promise<void> | void
}

export function ServerErrorPageContainer({ onRetry }: ServerErrorPageContainerProps) {
  return (
    <main
      className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-[rgb(var(--peach-light))]/30 via-background to-[rgb(var(--lavender))]/15 px-4 py-12 sm:py-16"
      role="main"
      aria-labelledby="server-error-heading"
    >
      <div className="container flex max-w-2xl flex-col items-center text-center animate-stagger">
        <MessageBlock />
        <div className="mt-8 sm:mt-10">
          <ErrorIllustration />
        </div>
        <div className="mt-8 sm:mt-10">
          <ActionPanel onRetry={onRetry} />
        </div>
      </div>
    </main>
  )
}
