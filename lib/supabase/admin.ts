import { createClient } from "@supabase/supabase-js"

/**
 * Server-only Supabase client using the service role key.
 *
 * This bypasses RLS and must NEVER be imported into client components.
 * Use it only inside server actions / route handlers for trusted operations
 * like uploading palm images and saving lead data.
 */
export function createAdminClient() {
  return createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    },
  )
}
