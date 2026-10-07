import { useState } from 'react'
import { Link, Navigate, useLocation } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from '../context/AuthContext'

export default function Login() {
    const { user } = useAuth()
    const location = useLocation()
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const [submitting, setSubmitting] = useState(false)

    // Already logged in (or just logged in): go where they were headed.
    if (user) {
        const destination = location.state?.from?.pathname || '/dashboard'
        return <Navigate to={destination} replace />
    }

    async function handleSubmit(e) {
        e.preventDefault()
        setError('')
        setSubmitting(true)

        const { error } = await supabase.auth.signInWithPassword({ email, password })

        setSubmitting(false)
        if (error) setError(error.message)
        // On success, onAuthStateChange updates `user` and the redirect above runs.
    }

    return (
        <div className="mx-auto max-w-md rounded-lg bg-white p-6 shadow">
            <h1 className="text-2xl font-bold">Log in</h1>

            <form onSubmit={handleSubmit} className="mt-4 space-y-4">
                <div>
                    <label className="block text-sm font-medium">Email</label>
                    <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="mt-1 w-full rounded border border-gray-300 px-3 py-2"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium">Password</label>
                    <input
                        type="password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="mt-1 w-full rounded border border-gray-300 px-3 py-2"
                    />
                </div>

                {error && <p className="text-sm text-red-600">{error}</p>}

                <button
                    type="submit"
                    disabled={submitting}
                    className="w-full rounded bg-blue-700 py-2 font-medium text-white hover:bg-blue-800 disabled:opacity-50"
                >
                    {submitting ? 'Logging in...' : 'Log in'}
                </button>
            </form>

            <p className="mt-4 text-sm text-gray-600">
                No account?{' '}
                <Link to="/register" className="text-blue-700 hover:underline">Register</Link>
            </p>
        </div>
    )
}