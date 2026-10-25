
import { supabase } from './supabase'

export interface UserSearchResult {
  user_id: string
  display_name: string
}

export async function findUserByEmail(email: string) {
  const normalizedEmail = email.trim().toLowerCase()

  if (!normalizedEmail) {
    throw new Error('Informe um e-mail.')
  }

  const { data, error } = await supabase.rpc('find_user_by_email', {
    p_email: normalizedEmail,
  })

  if (error) throw error

  return (data ?? []) as UserSearchResult[]
}

export async function sendConnectionRequest(recipientId: string) {
  const { data: { user }, error: authError } =
    await supabase.auth.getUser()

  if (authError) throw authError
  if (!user) throw new Error('Você precisa estar autenticado.')

  const { error } = await supabase
    .from('connections')
    .insert({
      requester_id: user.id,
      recipient_id: recipientId,
    })

  if (error) throw error
}

export async function getMyConnections() {
  const { data: { user }, error: authError } =
    await supabase.auth.getUser()

  if (authError) throw authError
  if (!user) throw new Error('Você precisa estar autenticado.')

  const { data, error } = await supabase
    .from('connections')
    .select('*')
    .or(`requester_id.eq.${user.id},recipient_id.eq.${user.id}`)
    .order('created_at', { ascending: false })

  if (error) throw error

  return data
}

export async function getReceivedRequests() {
  const { data, error } = await supabase.rpc(
    'get_connection_requesters'
  )

  if (error) throw error

  return data ?? []
}

export async function getAcceptedConnections() {
  const { data, error } = await supabase.rpc(
    'get_accepted_connections'
  )

  if (error) throw error

  return data ?? []
}

export async function respondToConnectionRequest(
  connectionId: string,
  status: 'accepted' | 'declined'
) {
  const { data: { user }, error: authError } =
    await supabase.auth.getUser()

  if (authError) throw authError

  if (!user) {
    throw new Error('Você precisa estar autenticado.')
  }

  const { data, error } = await supabase
    .from('connections')
    .update({ status })
    .eq('id', connectionId)
    .eq('recipient_id', user.id)
    .eq('status', 'pending')
    .select('id')
    .maybeSingle()

  if (error) throw error

  if (!data) {
    throw new Error(
      'Solicitação não encontrada ou já respondida.'
    )
  }
}

export async function setConnectionLocationSharing(
  connectionId: string,
  enabled: boolean
) {
  const { error } = await supabase.rpc(
    'set_connection_location_sharing',
    {
      p_connection_id: connectionId,
      p_enabled: enabled,
    }
  )

  if (error) throw error
}
