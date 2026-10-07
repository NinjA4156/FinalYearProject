import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from '../context/AuthContext'

export default function Navbar() {
    const { user, loading } = useAuth()

    async function handleLogout() {
        await supabase.auth.signOut()
        // onAuthStateChange clears the user; ProtectedRoute handles the redirect.
    }

    return (
        <nav className="bg-blue-700 text-white shadow">
            <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
                <Link to="/" className="text-lg font-bold">Gov Queue</Link>

                <div className="flex items-center gap-4 text-sm">
                    <Link to="/" className="hover:underline">Home</Link>
                    {!loading && user ? (
                        <>
                            <Link to="/dashboard" className="hover:underline">Dashboard</Link>
                            <button onClick={handleLogout} className="rounded bg-white/20 px-3 py-1 hover:bg-white/30">
                                Logout
                            </button>
                        </>
                    ) : (
                        !loading && (
                            <>
                                <Link to="/login" className="hover:underline">Login</Link>
                                <Link to="/register" className="hover:underline">Register</Link>
                            </>
                        )
                    )}
                </div>
            </div>
        </nav>
    )
}