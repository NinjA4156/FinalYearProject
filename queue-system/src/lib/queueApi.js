import { supabase } from './supabaseClient'

// Supabase returns { data, error }. This turns an error into a thrown Error
// so pages can use try/catch.
export async function unwrap(promise) {
    const { data, error } = await promise
    if (error) throw new Error(error.message)
    return data
}

// Plain reads (allowed by the Day 3 RLS policies)
export const fetchOffices = () =>
    unwrap(
        supabase
            .from('government_offices')
            .select('id, name, location, description')
            .order('name')
    )

export const fetchServices = (officeId) =>
    unwrap(
        supabase
            .from('services')
            .select('id, name, description')
            .eq('office_id', officeId)
            .order('name')
    )

// Database functions (RPC = "remote procedure call")
export async function fetchQueueStatus(serviceId) {
    const rows = await unwrap(
        supabase.rpc('get_queue_status', { p_service_id: serviceId })
    )
    return rows[0] // { currently_serving, waiting_count }
}

export const takeTicket = (serviceId) =>
    unwrap(supabase.rpc('get_ticket', { p_service_id: serviceId }))

export async function fetchActiveTicket() {
    const rows = await unwrap(supabase.rpc('get_my_active_ticket'))
    return rows[0] ?? null
}

export const cancelTicket = (ticketId) =>
    unwrap(supabase.rpc('cancel_ticket', { p_ticket_id: ticketId }))
