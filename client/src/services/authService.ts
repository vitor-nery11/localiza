
import { supabase } from './supabase'

export async function signUp(
  email: string,
  password: string,
  displayName?: string
) {
  const result = await supabase.auth.signUp({
    email,
    password,
    options: displayName
      ? {
          data: {
            display_name: displayName,
          },
        }
      : undefined,
  })

  if (result.error) {
    return result
  }

  if (result.data.user && displayName && result.data.session) {
    try {
      await supabase
        .from('profiles')
        .upsert({ id: result.data.user.id, display_name: displayName })
    } catch {
      // Ignora caso seja tratado por trigger no banco
    }
  }

  return result
}

export async function signIn(email: string, password: string) {
  return supabase.auth.signInWithPassword({
    email,
    password,
  })
}

export async function signOut() {
  return supabase.auth.signOut()
}

export async function getCurrentUser() {
  const { data, error } = await supabase.auth.getUser()

  if (error) {
    throw error
  }

  return data.user
}
