
import { supabase } from './supabase'

export async function getMyProfile() {
  const { data: { user }, error: authError } =
    await supabase.auth.getUser()

  if (authError) throw authError

  if (!user) {
    throw new Error('Usuário não autenticado.')
  }

  const { data, error } = await supabase
    .from('profiles')
    .select('display_name')
    .eq('id', user.id)
    .single()

  if (error) throw error

  return {
    id: user.id,
    email: user.email,
    displayName: data.display_name,
  }
}
