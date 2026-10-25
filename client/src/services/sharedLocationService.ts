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

/**
 * Escuta atualizações no Supabase Realtime
 */
export function subscribeToLocationsChanges(onChange: () => void): () => void {
  const channel = supabase
    .channel('realtime-locations-changes')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'locations' },
      () => {
        onChange()
      }
    )
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'user_locations' },
      () => {
        onChange()
      }
    )
    .subscribe()

  return () => {
    void supabase.removeChannel(channel)
  }
}
