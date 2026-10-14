import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
    fetchOffices,
    fetchServices,
    fetchQueueStatus,
    fetchActiveTicket,
    takeTicket,
} from '../lib/queueApi'

export default function GetTicket() {
    const navigate = useNavigate()

    const [offices, setOffices] = useState([])
    const [services, setServices] = useState([])
    const [activeTicket, setActiveTicket] = useState(null)

    const [office, setOffice] = useState(null)   // selected office
    const [service, setService] = useState(null) // selected service
    const [queue, setQueue] = useState(null)     // { currently_serving, waiting_count }

    const [loading, setLoading] = useState(true)
    const [submitting, setSubmitting] = useState(false)
    const [error, setError] = useState('')

    // On first load: get offices, and check if the user already has a ticket
    useEffect(() => {
        Promise.all([fetchOffices(), fetchActiveTicket()])
            .then(([officeList, ticket]) => {
                setOffices(officeList)
                setActiveTicket(ticket)
            })
            .catch((e) => setError(e.message))
            .finally(() => setLoading(false))
    }, [])

    async function selectOffice(selected) {
        setOffice(selected)
        setService(null)
        setQueue(null)
        setServices([])
        setError('')
        try {
            setServices(await fetchServices(selected.id))
        } catch (e) {
            setError(e.message)
        }
    }

    async function selectService(selected) {
        setService(selected)
        setQueue(null)
        setError('')
        try {
            setQueue(await fetchQueueStatus(selected.id))
        } catch (e) {
            setError(e.message)
        }
    }

    async function handleGetTicket() {
        setSubmitting(true)
        setError('')
        try {
            await takeTicket(service.id)
            navigate('/dashboard')
        } catch (e) {
            setError(e.message)
            setSubmitting(false)
        }
    }

    if (loading) return <p className="text-gray-500">Loading...</p>

    if (activeTicket) {
        return (
            <div className="rounded-lg bg-white p-6 shadow">
                <h1 className="text-2xl font-bold">Get a Ticket</h1>
                <p className="mt-3 text-gray-700">
                    You already have an active ticket (<strong>{activeTicket.ticket_number}</strong>).
                    Finish or cancel it before taking another.
                </p>
                <Link to="/dashboard" className="mt-4 inline-block text-blue-700 hover:underline">
                    Go to my dashboard
                </Link>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold">Get a Ticket</h1>

            {error && <p className="rounded bg-red-50 p-3 text-sm text-red-700">{error}</p>}

            {/* Stage 1: offices */}
            <section>
                <h2 className="mb-2 font-semibold">1. Choose an office</h2>
                <div className="grid gap-3 sm:grid-cols-2">
                    {offices.map((o) => (
                        <button
                            key={o.id}
                            onClick={() => selectOffice(o)}
                            className={`rounded-lg border p-4 text-left shadow-sm hover:border-blue-500 ${office?.id === o.id ? 'border-blue-600 bg-blue-50' : 'border-gray-200 bg-white'
                                }`}
                        >
                            <p className="font-medium">{o.name}</p>
                            <p className="text-sm text-gray-500">{o.location}</p>
                        </button>
                    ))}
                </div>
            </section>

            {/* Stage 2: services */}
            {office && (
                <section>
                    <h2 className="mb-2 font-semibold">2. Choose a service</h2>
                    <div className="grid gap-3 sm:grid-cols-2">
                        {services.map((s) => (
                            <button
                                key={s.id}
                                onClick={() => selectService(s)}
                                className={`rounded-lg border p-4 text-left shadow-sm hover:border-blue-500 ${service?.id === s.id ? 'border-blue-600 bg-blue-50' : 'border-gray-200 bg-white'
                                    }`}
                            >
                                <p className="font-medium">{s.name}</p>
                                <p className="text-sm text-gray-500">{s.description}</p>
                            </button>
                        ))}
                    </div>
                </section>
            )}

            {/* Stage 3: queue status + button */}
            {service && (
                <section className="rounded-lg bg-white p-6 shadow">
                    <h2 className="font-semibold">{service.name}</h2>
                    <p className="text-sm text-gray-500">{office.name}</p>

                    {queue ? (
                        <dl className="mt-4 space-y-1">
                            <div>
                                <dt className="inline font-medium">Currently serving: </dt>
                                <dd className="inline">{queue.currently_serving ?? 'No one yet'}</dd>
                            </div>
                            <div>
                                <dt className="inline font-medium">People waiting: </dt>
                                <dd className="inline">{queue.waiting_count}</dd>
                            </div>
                        </dl>
                    ) : (
                        <p className="mt-4 text-gray-500">Loading queue...</p>
                    )}

                    <button
                        onClick={handleGetTicket}
                        disabled={submitting || !queue}
                        className="mt-6 w-full rounded bg-blue-700 py-3 font-semibold text-white hover:bg-blue-800 disabled:opacity-50"
                    >
                        {submitting ? 'Getting ticket...' : 'GET TICKET'}
                    </button>
                </section>
            )}
        </div>
    )
}