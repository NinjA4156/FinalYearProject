import { useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from '../context/AuthContext'

export default function Register() {
    const { user } = useAuth()
    const [fullName, setFullName] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const [message, setMessage] = useState('')
    const [submitting, setSubmitting] = useState(false)

    if (user) return <Navigate to="/dashboard" replace />

    async function handleSubmit(e) {
        e.preventDefault()
        setError('')
        setMessage('')
        setSubmitting(true)

        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: { data: { full_name: fullName.trim() } }, // read by the DB trigger
        })

        setSubmitting(false)

        if (error) {
            setError(error.message)
        } else if (!data.session) {
            // Email confirmation is ON: no session until they click the email link.
            setMessage('Account created! Check your email to confirm, then log in.')
        }
        // If a session exists, onAuthStateChange logs them in and we redirect above.
    }

    return (
        <div className="mx-auto max-w-md rounded-lg bg-white p-6 shadow">
            <h1 className="text-2xl font-bold">Create an account</h1>

            <form onSubmit={handleSubmit} className="mt-4 space-y-4">
                <div>
                    <label className="block text-sm font-medium">Full name</label>
                    <input
                        type="text"
                        required
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="mt-1 w-full rounded border border-gray-300 px-3 py-2"
                    />
                </div>
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
                        minLength={8}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="mt-1 w-full rounded border border-gray-300 px-3 py-2"
                    />
                    <p className="mt-1 text-xs text-gray-500">At least 8 characters.</p>
                </div>

                {error && <p className="text-sm text-red-600">{error}</p>}
                {message && <p className="text-sm text-green-600">{message}</p>}

                <button
                    type="submit"
                    disabled={submitting}
                    className="w-full rounded bg-blue-700 py-2 font-medium text-white hover:bg-blue-800 disabled:opacity-50"
                >
                    {submitting ? 'Creating account...' : 'Register'}
                </button>
            </form>

            <p className="mt-4 text-sm text-gray-600">
                Already registered?{' '}
                <Link to="/login" className="text-blue-700 hover:underline">Log in</Link>
            </p>
        </div>
    )
}