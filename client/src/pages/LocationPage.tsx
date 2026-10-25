import { useEffect, useState } from 'react'
import {
  getCurrentPosition,
  saveMyLocation,
  type Coordinates,
} from '../services/locationService'
import { LocationMap } from '../components/map/LocationMap'
import {
  getVisibleLocations,
  type SharedLocation,
} from '../services/sharedLocationService'

export function LocationPage() {
  const [coordinates, setCoordinates] =
    useState<Coordinates | null>(null)
  const [sharedLocations, setSharedLocations] =
    useState<SharedLocation[]>([])

  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

  async function loadSharedLocations() {
    try {
      const locations = await getVisibleLocations()
      setSharedLocations(locations)
    } catch (error) {
      console.error('Erro ao carregar localizações compartilhadas:', error)
    }
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadSharedLocations()
  }, [])

  async function handleGetLocation() {
    setLoading(true)
    setMessage('')
    setCoordinates(null)

    try {
      const position = await getCurrentPosition()

      setCoordinates(position)
      setMessage('Localização obtida. Salvando no servidor...')

      await saveMyLocation(position)

      setMessage('Localização obtida e salva com sucesso.')
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : 'Não foi possível obter ou salvar a localização.'
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="mx-auto max-w-2xl">
      <h1 className="text-3xl font-bold">
        Minha localização
      </h1>

      <p className="mt-2 text-slate-400">
        Teste o acesso à localização do seu dispositivo.
      </p>

      <button
        type="button"
        onClick={handleGetLocation}
        disabled={loading}
        className="mt-6 rounded-lg bg-blue-600 px-5 py-3 font-medium hover:bg-blue-500 disabled:opacity-50"
      >
        {loading ? 'Obtendo localização...' : 'Obter minha localização'}
      </button>

      {message && (
        <p role="status" className="mt-4 text-sm text-slate-300">
          {message}
        </p>
      )}

      {(coordinates || sharedLocations.length > 0) && (
        <section className="mt-6 space-y-3 rounded-xl border border-slate-800 bg-slate-900 p-5">
          <h2 className="text-lg font-semibold">
            {coordinates ? 'Coordenadas obtidas' : 'Localizações ativas no mapa'}
          </h2>

          {coordinates && (
            <>
              <p>
                <span className="text-slate-400">Latitude: </span>
                {coordinates.latitude}
              </p>

              <p>
                <span className="text-slate-400">Longitude: </span>
                {coordinates.longitude}
              </p>
            </>
          )}

          <div className="mt-6">
            <LocationMap
              latitude={coordinates?.latitude}
              longitude={coordinates?.longitude}
              sharedLocations={sharedLocations}
            />
          </div>
        </section>
      )}
    </main>
  )
}
