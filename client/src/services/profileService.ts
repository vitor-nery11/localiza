
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
    .maybeSingle()

  if (error) throw error

  return {
    id: user.id,
    email: user.email,
    displayName: data?.display_name ?? (user.user_metadata?.display_name as string | undefined) ?? '',
  }
}

export async function updateMyDisplayName(displayName: string) {
  const { data: { user }, error: authError } =
    await supabase.auth.getUser()

  if (authError) throw authError

  if (!user) {
    throw new Error('Usuário não autenticado.')
  }

  const cleanName = displayName.trim()

  // 1. Tenta via RPC se ela tiver sido criada no Supabase
  const rpcResult = await supabase.rpc('update_my_profile', {
    p_display_name: cleanName,
  })

  if (!rpcResult.error) {
    await supabase.auth.updateUser({
      data: { display_name: cleanName },
    }).catch(() => {})
    return
  }

  // 2. Fallback: tenta upsert direto na tabela profiles
  const { error: profileError } = await supabase
    .from('profiles')
    .upsert({ id: user.id, display_name: cleanName })

  if (profileError) {
    // 3. Se upsert falhar, tenta apenas update direto
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ display_name: cleanName })
      .eq('id', user.id)

    if (updateError) {
      throw profileError
    }
  }

  await supabase.auth.updateUser({
    data: { display_name: cleanName },
  }).catch(() => {})
}
