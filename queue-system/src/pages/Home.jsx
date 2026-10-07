import { useEffect, useState } from 'react'
import { checkSupabaseConnection } from '../lib/supabaseClient'

export default function Home() {
    const [status, setStatus] = useState('checking')

    useEffect(() => {
        checkSupabaseConnection().then((ok) => setStatus(ok ? 'connected' : 'failed'))
    }, [])

    const statusStyles = {
        checking: 'text-gray-500',
        connected: 'text-green-600',
        failed: 'text-red-600',
    }

    return (
        <div className="rounded-lg bg-white p-6 shadow">
            <h1 className="text-2xl font-bold">Government Virtual Queue System</h1>
            <p className="mt-2 text-gray-600">✅ The application is running.</p>
            <p className={`mt-4 font-medium ${statusStyles[status]}`}>
                Supabase: {status}
            </p>
        </div>
    )
}