import { useCallback, useRef } from 'react'

/**
 * Returns a debounced version of the callback.
 * The callback will only be invoked after the specified delay has passed
 * since the last call.
 */
export function useDebouncedCallback<A extends unknown[], R>(
  callback: (...args: A) => R,
  delay: number
): (...args: A) => void {
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const callbackRef = useRef(callback)

  callbackRef.current = callback

  return useCallback(
    (...args: A) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
      timeoutRef.current = setTimeout(() => {
        callbackRef.current(...args)
        timeoutRef.current = null
      }, delay)
    },
    [delay]
  )
}
