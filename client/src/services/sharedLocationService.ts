import { supabase } from './supabase'

export interface SharedLocation {
  user_id: string
  display_name: string
  latitude: number
  longitude: number
  updated_at: string
}

export async function getVisibleLocations(): Promise<SharedLocation[]> {
  const { data, error } = await supabase.rpc('get_visible_locations')

  if (error) throw error

  return (data ?? []) as SharedLocation[]
}
