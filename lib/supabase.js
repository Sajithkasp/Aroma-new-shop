import { createClient } from '@supabase/supabase-js'

let rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://yucrijohsscyfnarhkml.supabase.co'

// Clean and auto-correct common typo (.supabase.com -> .supabase.co)
rawUrl = rawUrl.trim().replace(/\/$/, '')
if (rawUrl.includes('.supabase.com')) {
  rawUrl = rawUrl.replace('.supabase.com', '.supabase.co')
}

const supabaseUrl = rawUrl
const supabaseAnonKey = (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_b6dCq5MgaIrOaXxjz_i_zA_6GzkiQxC').trim()

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
