import { useAuth } from '../context/AuthContext'

export default function Dashboard() {
    const { user, profile } = useAuth()

    return (
        <div className="rounded-lg bg-white p-6 shadow">
            <h1 className="text-2xl font-bold">Dashboard</h1>
            {profile ? (
                <dl className="mt-4 space-y-1 text-gray-700">
                    <div><dt className="inline font-medium">Name: </dt><dd className="inline">{profile.full_name}</dd></div>
                    <div><dt className="inline font-medium">Email: </dt><dd className="inline">{profile.email}</dd></div>
                    <div><dt className="inline font-medium">Role: </dt><dd className="inline">{profile.role}</dd></div>
                </dl>
            ) : (
                <p className="mt-4 text-gray-500">Loading profile for {user.email}...</p>
            )}
        </div>
    )
}