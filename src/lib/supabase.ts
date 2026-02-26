import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL ?? ''
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY ?? ''

const REMEMBER_ME_KEY = 'auth_remember_me_preference'

/** Custom storage: uses sessionStorage when "Remember me" is unchecked, else localStorage. */
const authStorage = {
  getItem: (key: string): string | null => {
    const useSession = localStorage.getItem(REMEMBER_ME_KEY) === 'false'
    return (useSession ? sessionStorage : localStorage).getItem(key)
  },
  setItem: (key: string, value: string): void => {
    const useSession = localStorage.getItem(REMEMBER_ME_KEY) === 'false'
    ;(useSession ? sessionStorage : localStorage).setItem(key, value)
  },
  removeItem: (key: string): void => {
    localStorage.removeItem(key)
    sessionStorage.removeItem(key)
  },
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: { storage: authStorage },
})

/** Set before login to control session persistence. */
export function setRememberMe(remember: boolean): void {
  if (remember) {
    localStorage.removeItem(REMEMBER_ME_KEY)
  } else {
    localStorage.setItem(REMEMBER_ME_KEY, 'false')
  }
}

/** Read current preference for "Remember me" checkbox default. */
export function getRememberMe(): boolean {
  return localStorage.getItem(REMEMBER_ME_KEY) !== 'false'
}
