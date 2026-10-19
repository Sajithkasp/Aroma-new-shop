import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://yucrijohsscyfnarhkml.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_b6dCq5MgaIrOaXxjz_i_zA_6GzkiQxC'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
