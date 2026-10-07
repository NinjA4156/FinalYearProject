import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing Supabase env vars. Check your .env file.')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Day 1 only: pings Supabase to confirm the URL and key are reachable.
export async function checkSupabaseConnection() {
    try {
        const res = await fetch(`${supabaseUrl}/auth/v1/health`, {
            headers: { apikey: supabaseAnonKey },
        })
        return res.ok
    } catch {
        return false
    }
}