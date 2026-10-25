import { useEffect, useRef, useState } from 'react'
import {
  getCurrentPosition,
  watchCurrentPosition,
  saveMyLocation,
  type Coordinates,
} from '../services/locationService'
import { LocationMap } from '../components/map/LocationMap'
import {
  getVisibleLocations,
  type SharedLocation,
} from '../services/sharedLocationService'
import { Radio, Square, Navigation, Clock, Activity } from 'lucide-react'

export function LocationPage() {
  const [coordinates, setCoordinates] = useState<Coordinates | null>(null)
  const [sharedLocations, setSharedLocations] = useState<SharedLocation[]>([])

  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

  // Estados de rastreamento em tempo real contínuo
  const [isLiveTracking, setIsLiveTracking] = useState(false)
  const [lastSentAt, setLastSentAt] = useState<string | null>(null)
  const [sendCount, setSendCount] = useState(0)
  const lastSendTimeRef = useRef<number>(0)

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

  // Efeito do monitoramento contínuo em tempo real (watchPosition)
  useEffect(() => {
    if (!isLiveTracking) return

    const clearWatch = watchCurrentPosition(
      async coords => {
        setCoordinates(coords)

        const now = Date.now()
        // Transmite para o servidor no máximo uma vez a cada 4 segundos para eficiência
        if (now - lastSendTimeRef.current >= 4000) {
          lastSendTimeRef.current = now
          try {
            await saveMyLocation(coords)
            setLastSentAt(new Date().toLocaleTimeString('pt-BR'))
            setSendCount(prev => prev + 1)
          } catch (err) {
            console.error('Erro ao transmitir localização em tempo real:', err)
          }
        }
      },
      err => {
        setMessage(err.message)
        setIsLiveTracking(false)
      }
    )

    return () => {
      clearWatch()
    }
  }, [isLiveTracking])

  // Disparo manual único
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

  function handleToggleLiveTracking() {
    setIsLiveTracking(prev => {
      const next = !prev
      if (next) {
        setMessage('Transmissão contínua ativa. Monitorando movimentos do GPS...')
      } else {
        setMessage('Transmissão em tempo real pausada.')
      }
      return next
    })
  }

  return (
    <main className="mx-auto max-w-2xl">
      <header>
        <h1 className="text-3xl font-bold">
          Minha localização
        </h1>
        <p className="mt-2 text-slate-400">
          Transmita sua posição via GPS para suas conexões em tempo real ou sob demanda.
        </p>
      </header>

      {/* Painel de Transmissão Ao Vivo */}
      {isLiveTracking && (
        <section className="mt-6 flex items-center justify-between rounded-xl border border-red-500/40 bg-red-950/30 p-4 text-sm text-red-200">
          <div className="flex items-center gap-3">
            <span className="relative flex h-3 w-3">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex h-3 w-3 rounded-full bg-red-500"></span>
            </span>
            <div>
              <p className="font-semibold text-white">Transmissão em tempo real ATIVA</p>
              <div className="flex flex-wrap items-center gap-3 text-xs text-red-300">
                {lastSentAt && (
                  <span className="flex items-center gap-1">
                    <Clock size={12} /> Último envio: {lastSentAt}
                  </span>
                )}
                <span className="flex items-center gap-1">
                  <Activity size={12} /> {sendCount} atualizações enviadas
                </span>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Botões de Ação */}
      <div className="mt-6 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        {/* Botão de Transmissão Contínua (Tempo Real) */}
        <button
          type="button"
          onClick={handleToggleLiveTracking}
          className={
            isLiveTracking
              ? 'flex items-center justify-center gap-2 rounded-lg bg-red-600 px-5 py-3 text-sm sm:text-base font-semibold text-white shadow-lg shadow-red-950 transition hover:bg-red-500 w-full sm:w-auto'
              : 'flex items-center justify-center gap-2 rounded-lg border border-red-500/40 bg-red-950/60 px-5 py-3 text-sm sm:text-base font-semibold text-red-200 transition hover:bg-red-900/80 hover:text-white w-full sm:w-auto'
          }
        >
          {isLiveTracking ? (
            <>
              <Square size={16} fill="currentColor" />
              Parar transmissão em tempo real
            </>
          ) : (
            <>
              <Radio size={16} className="text-red-400" />
              Iniciar transmissão em tempo real (Ao Vivo)
            </>
          )}
        </button>

        {/* Botão de Disparo Único */}
        <button
          type="button"
          onClick={handleGetLocation}
          disabled={loading || isLiveTracking}
          className="flex items-center justify-center gap-2 rounded-lg border border-slate-700 bg-slate-900 px-4 py-3 text-sm sm:text-base font-medium text-slate-300 transition hover:bg-slate-800 disabled:opacity-50 w-full sm:w-auto"
        >
          <Navigation size={16} className="text-blue-400" />
          {loading ? 'Obtendo...' : 'Enviar localização única'}
        </button>
      </div>

      {message && (
        <p role="status" className="mt-4 text-sm text-slate-300">
          {message}
        </p>
      )}

      {/* Seção do Mapa e Coordenadas */}
      {(coordinates || sharedLocations.length > 0) && (
        <section className="mt-6 space-y-3 rounded-xl border border-slate-800 bg-slate-900 p-5">
          <h2 className="text-lg font-semibold">
            {coordinates ? 'Coordenadas obtidas' : 'Localizações ativas no mapa'}
          </h2>

          {coordinates && (
            <div className="grid grid-cols-2 gap-4 rounded-lg bg-slate-950 p-3 text-sm">
              <p>
                <span className="text-slate-400">Latitude: </span>
                <span className="font-mono text-white">{coordinates.latitude.toFixed(6)}</span>
              </p>
              <p>
                <span className="text-slate-400">Longitude: </span>
                <span className="font-mono text-white">{coordinates.longitude.toFixed(6)}</span>
              </p>
            </div>
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
