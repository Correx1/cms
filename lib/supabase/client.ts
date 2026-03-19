import { createBrowserClient } from '@supabase/ssr'

/**
 * Supabase Browser Client.
 * Automatically utilizes anonymous public keys to interact structurally across client-rendered components flawlessly.
 */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
