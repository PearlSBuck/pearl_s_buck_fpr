import { createClient } from '@supabase/supabase-js'

// Get URL from environment variables with fallback to hardcoded value
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 
                    (typeof process !== 'undefined' ? process.env.SUPABASE_URL : '') || 
                    'https://euwhpolzjpfuqncfjczc.supabase.co'

// Get key from environment variables
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_KEY || 
                        (typeof process !== 'undefined' ? process.env.SUPABASE_KEY : '') || 
                        ''

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
