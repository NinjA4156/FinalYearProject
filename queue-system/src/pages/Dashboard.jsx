import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { fetchActiveTicket, cancelTicket } from '../lib/queueApi'

const statusStyles = {
    WAITING: 'bg-yellow-100 text-yellow-800',
    SERVING: 'bg-green-100 text-green-800',
}

export default function Dashboard() {
    const { user, profile } = useAuth()
    const [ticket, setTicket] = useState(null)
    const [loading, setLoading] = useState(true)
    const [busy, setBusy] = useState(false)
    const [error, setError] = useState('')

    useEffect(() => {
        fetchActiveTicket()
            .then(setTicket)
            .catch((e) => setError(e.message))
            .finally(() => setLoading(false))
    }, [])

    async function reload() {
        setBusy(true)
        setError('')
        try {
            setTicket(await fetchActiveTicket())
        } catch (e) {
            setError(e.message)
        } finally {
            setBusy(false)
        }
    }

    async function handleCancel() {
        if (!window.confirm('Cancel this ticket?')) return
        setBusy(true)
        setError('')
        try {
            await cancelTicket(ticket.id)
            setTicket(await fetchActiveTicket()) // now null
        } catch (e) {
            setError(e.message)
        } finally {
            setBusy(false)
        }
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold">Dashboard</h1>
                <p className="text-gray-600">
                    Welcome, {profile?.full_name || user.email}
                    {profile && <span className="text-gray-400"> · {profile.role}</span>}
                </p>
            </div>

            {error && <p className="rounded bg-red-50 p-3 text-sm text-red-700">{error}</p>}

            <section className="rounded-lg bg-white p-6 shadow">
                <h2 className="font-semibold">My active ticket</h2>

                {loading ? (
                    <p className="mt-3 text-gray-500">Loading...</p>
                ) : ticket ? (
                    <div className="mt-4">
                        <p className="text-4xl font-bold tracking-wide">{ticket.ticket_number}</p>
                        <span
                            className={`mt-2 inline-block rounded px-2 py-1 text-xs font-semibold ${statusStyles[ticket.status] ?? 'bg-gray-100 text-gray-700'
                                }`}
                        >
                            {ticket.status}
                        </span>

                        <dl className="mt-4 space-y-1 text-gray-700">
                            <div><dt className="inline font-medium">Service: </dt><dd className="inline">{ticket.service_name}</dd></div>
                            <div><dt className="inline font-medium">Office: </dt><dd className="inline">{ticket.office_name}</dd></div>
                            <div><dt className="inline font-medium">People ahead: </dt><dd className="inline">{ticket.people_ahead}</dd></div>
                            <div><dt className="inline font-medium">Created: </dt><dd className="inline">{new Date(ticket.created_at).toLocaleString()}</dd></div>
                        </dl>

                        <div className="mt-5 flex gap-3">
                            <button
                                onClick={reload}
                                disabled={busy}
                                className="rounded border border-gray-300 px-4 py-2 text-sm hover:bg-gray-50 disabled:opacity-50"
                            >
                                Refresh
                            </button>
                            {ticket.status === 'WAITING' && (
                                <button
                                    onClick={handleCancel}
                                    disabled={busy}
                                    className="rounded bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
                                >
                                    Cancel ticket
                                </button>
                            )}
                        </div>
                    </div>
                ) : (
                    <div className="mt-3">
                        <p className="text-gray-600">You don't have an active ticket.</p>
                        <Link
                            to="/get-ticket"
                            className="mt-3 inline-block rounded bg-blue-700 px-4 py-2 text-sm font-medium text-white hover:bg-blue-800"
                        >
                            Get a ticket
                        </Link>
                    </div>
                )}
            </section>
        </div>
    )
}