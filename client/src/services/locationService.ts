import { supabase } from './supabase'

export interface Coordinates {
  latitude: number
  longitude: number
}

export function getCurrentPosition(): Promise<Coordinates> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(
        new Error('Seu navegador não oferece geolocalização.')
      )
      return
    }

    navigator.geolocation.getCurrentPosition(
      position => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        })
      },
      error => {
        switch (error.code) {
          case error.PERMISSION_DENIED:
            reject(new Error('Você não autorizou o acesso à localização.'))
            break
          case error.POSITION_UNAVAILABLE:
            reject(new Error('Não foi possível obter sua posição.'))
            break
          case error.TIMEOUT:
            reject(new Error('A solicitação de localização expirou.'))
            break
          default:
            reject(new Error('Ocorreu um erro ao obter a localização.'))
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 10000,
      }
    )
  })
}

export async function saveMyLocation(
  coordinates: Coordinates
): Promise<void> {
  const { error } = await supabase.rpc('save_my_location', {
    p_latitude: coordinates.latitude,
    p_longitude: coordinates.longitude,
  })

  if (error) throw error
}
