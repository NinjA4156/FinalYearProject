import { useEffect, useState } from 'react'
import { fetchOffices, fetchServices } from '../lib/queueApi'
import {
    fetchQueueOverview,
    callNext,
    completeTicket,
    skipTicket,
} from '../lib/staffApi'

export default function StaffDashboard() {
    const [offices, setOffices] = useState([])
    const [services, setServices] = useState([])
    const [officeId, setOfficeId] = useState('')
    const [serviceId, setServiceId] = useState('')
    const [overview, setOverview] = useState(null)
    const [busy, setBusy] = useState(false)
    const [error, setError] = useState('')

    useEffect(() => {
        fetchOffices()
            .then(setOffices)
            .catch((e) => setError(e.message))
    }, [])

    async function loadOverview(id) {
        try {
            setOverview(await fetchQueueOverview(id))
        } catch (e) {
            setError(e.message)
        }
    }

    async function handleOfficeChange(id) {
        setOfficeId(id)
        setServiceId('')
        setServices([])
        setOverview(null)
        setError('')
        if (!id) return
        try {
            setServices(await fetchServices(id))
        } catch (e) {
            setError(e.message)
        }
    }

    async function handleServiceChange(id) {
        setServiceId(id)
        setOverview(null)
        setError('')
        if (id) await loadOverview(id)
    }

    // Runs a staff action, then always reloads the queue so the screen
    // shows what the database actually contains.
    async function runAction(action) {
        setBusy(true)
        setError('')
        try {
            await action()
        } catch (e) {
            setError(e.message)
        }
        await loadOverview(serviceId)
        setBusy(false)
    }

    const serving = overview?.serving ?? null
    const waiting = overview?.waiting ?? []

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold">Staff Dashboard</h1>

            {error && <p className="rounded bg-red-50 p-3 text-sm text-red-700">{error}</p>}

            {/* Pick the queue to manage */}
            <section className="grid gap-4 rounded-lg bg-white p-6 shadow sm:grid-cols-2">
                <div>
                    <label className="block text-sm font-medium">Office</label>
                    <select
                        value={officeId}
                        onChange={(e) => handleOfficeChange(e.target.value)}
                        className="mt-1 w-full rounded border border-gray-300 px-3 py-2"
                    >
                        <option value="">Select an office...</option>
                        {offices.map((o) => (
                            <option key={o.id} value={o.id}>{o.name}</option>
                        ))}
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium">Service</label>
                    <select
                        value={serviceId}
                        onChange={(e) => handleServiceChange(e.target.value)}
                        disabled={!officeId}
                        className="mt-1 w-full rounded border border-gray-300 px-3 py-2 disabled:bg-gray-100"
                    >
                        <option value="">Select a service...</option>
                        {services.map((s) => (
                            <option key={s.id} value={s.id}>{s.name}</option>
                        ))}
                    </select>
                </div>
            </section>

            {serviceId && !overview && <p className="text-gray-500">Loading queue...</p>}

            {overview && (
                <>
                    {/* Counters */}
                    <section className="grid grid-cols-3 gap-4 text-center">
                        <div className="rounded-lg bg-white p-4 shadow">
                            <p className="text-3xl font-bold">{waiting.length}</p>
                            <p className="text-sm text-gray-500">Waiting</p>
                        </div>
                        <div className="rounded-lg bg-white p-4 shadow">
                            <p className="text-3xl font-bold">{serving ? 1 : 0}</p>
                            <p className="text-sm text-gray-500">Serving</p>
                        </div>
                        <div className="rounded-lg bg-white p-4 shadow">
                            <p className="text-3xl font-bold">{overview.completed_today}</p>
                            <p className="text-sm text-gray-500">Completed Today</p>
                        </div>
                    </section>

                    {/* Currently serving + actions */}
                    <section className="rounded-lg bg-white p-6 shadow">
                        <h2 className="font-semibold">Currently Serving</h2>
                        <p className="mt-2 text-5xl font-bold tracking-wide">
                            {serving ? serving.ticket_number : '—'}
                        </p>

                        <div className="mt-5 flex flex-wrap gap-3">
                            <button
                                onClick={() => runAction(() => callNext(serviceId))}
                                disabled={busy || Boolean(serving) || waiting.length === 0}
                                className="rounded bg-blue-700 px-5 py-2 font-semibold text-white hover:bg-blue-800 disabled:opacity-50"
                            >
                                CALL NEXT
                            </button>
                            <button
                                onClick={() => runAction(() => completeTicket(serving.id))}
                                disabled={busy || !serving}
                                className="rounded bg-green-600 px-5 py-2 font-semibold text-white hover:bg-green-700 disabled:opacity-50"
                            >
                                COMPLETE
                            </button>
                            <button
                                onClick={() => {
                                    if (window.confirm(`Skip ${serving.ticket_number}?`)) {
                                        runAction(() => skipTicket(serving.id))
                                    }
                                }}
                                disabled={busy || !serving}
                                className="rounded bg-orange-500 px-5 py-2 font-semibold text-white hover:bg-orange-600 disabled:opacity-50"
                            >
                                SKIP
                            </button>
                            <button
                                onClick={() => runAction(async () => { })}
                                disabled={busy}
                                className="rounded border border-gray-300 px-4 py-2 text-sm hover:bg-gray-50 disabled:opacity-50"
                            >
                                Refresh
                            </button>
                        </div>
                    </section>

                    {/* Waiting list */}
                    <section className="rounded-lg bg-white p-6 shadow">
                        <h2 className="font-semibold">Waiting</h2>
                        {waiting.length === 0 ? (
                            <p className="mt-2 text-gray-500">Nobody is waiting.</p>
                        ) : (
                            <ul className="mt-3 divide-y">
                                {waiting.map((t, index) => (
                                    <li key={t.id} className="flex items-center justify-between py-2">
                                        <span className="font-medium">
                                            {t.ticket_number}
                                            {index === 0 && (
                                                <span className="ml-2 rounded bg-blue-100 px-2 py-0.5 text-xs text-blue-800">
                                                    next
                                                </span>
                                            )}
                                        </span>
                                        <span className="text-sm text-gray-500">
                                            {new Date(t.created_at).toLocaleTimeString()}
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </section>
                </>
            )}
        </div>
    )
}