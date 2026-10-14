import { supabase } from './supabaseClient'
import { unwrap } from './queueApi'

export const fetchQueueOverview = (serviceId) =>
    unwrap(supabase.rpc('staff_queue_overview', { p_service_id: serviceId }))

export const callNext = (serviceId) =>
    unwrap(supabase.rpc('staff_call_next', { p_service_id: serviceId }))

export const completeTicket = (ticketId) =>
    unwrap(supabase.rpc('staff_complete_ticket', { p_ticket_id: ticketId }))

export const skipTicket = (ticketId) =>
    unwrap(supabase.rpc('staff_skip_ticket', { p_ticket_id: ticketId }))