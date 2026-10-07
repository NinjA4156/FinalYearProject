import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
    const [session, setSession] = useState(null)
    const [profile, setProfile] = useState(null)
    const [loading, setLoading] = useState(true)

    // Listen for login/logout. This also fires once on startup with the
    // existing session (if any), so we know when the initial check is done.
    useEffect(() => {
        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((_event, newSession) => {
            setSession(newSession)
            setLoading(false)
        })
        return () => subscription.unsubscribe()
    }, [])

    // Load the profile whenever the logged-in user changes.
    const userId = session?.user?.id
    useEffect(() => {
        if (!userId) {
            setProfile(null)
            return
        }
        let cancelled = false
        supabase
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .maybeSingle()
            .then(({ data, error }) => {
                if (!cancelled) setProfile(error ? null : data)
            })
        return () => {
            cancelled = true
        }
    }, [userId])

    const value = { user: session?.user ?? null, profile, loading }

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
    const ctx = useContext(AuthContext)
    if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>')
    return ctx
}