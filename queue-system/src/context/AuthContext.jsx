import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
    const [session, setSession] = useState(null)
    const [profile, setProfile] = useState(null)
    const [profileUserId, setProfileUserId] = useState(null) // whose profile we've loaded
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((_event, newSession) => {
            setSession(newSession)
            setLoading(false)
        })
        return () => subscription.unsubscribe()
    }, [])

    const userId = session?.user?.id
    useEffect(() => {
        if (!userId) {
            setProfile(null)
            setProfileUserId(null)
            return
        }
        let cancelled = false
        supabase
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .maybeSingle()
            .then(({ data, error }) => {
                if (cancelled) return
                setProfile(error ? null : data)
                setProfileUserId(userId)
            })
        return () => {
            cancelled = true
        }
    }, [userId])

    const value = {
        user: session?.user ?? null,
        profile,
        loading,
        // true while a logged-in user's profile is still being fetched
        profileLoading: Boolean(userId) && profileUserId !== userId,
        isStaff: profile?.role === 'staff' || profile?.role === 'admin',
    }

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
    const ctx = useContext(AuthContext)
    if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>')
    return ctx
}