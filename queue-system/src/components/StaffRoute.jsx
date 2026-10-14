import { Link, Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function StaffRoute({ children }) {
    const { user, loading, profileLoading, isStaff } = useAuth()
    const location = useLocation()

    if (loading || profileLoading) return <p className="text-gray-500">Loading...</p>

    if (!user) {
        return <Navigate to="/login" state={{ from: location }} replace />
    }

    if (!isStaff) {
        return (
            <div className="rounded-lg bg-white p-6 shadow">
                <h1 className="text-2xl font-bold">Access denied</h1>
                <p className="mt-2 text-gray-600">This page is for staff only.</p>
                <Link to="/dashboard" className="mt-4 inline-block text-blue-700 hover:underline">
                    Back to my dashboard
                </Link>
            </div>
        )
    }

    return children
}