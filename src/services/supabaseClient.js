// Placeholder wiring for Supabase. Replace with @supabase/supabase-js if you prefer.
// Keep the same env names as your static app so it's familiar.
// Vite exposes env via import.meta.env
export const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || ''
export const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

// Example minimal wrapper (mock until you install supabase-js)
export function createSupabase(){ 
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY){
    console.warn('Supabase env not configured yet.')
    return null
  }
  // TODO: import { createClient } from '@supabase/supabase-js'
  // return createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
  return null
}
