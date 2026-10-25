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
import { Radio, Square, Navigation, Clock, Activity } from 'lucide-react'
import { useTracking } from '../contexts/useTracking'

export function LocationPage() {
  const [manualCoordinates, setManualCoordinates] = useState<Coordinates | null>(null)
  const [sharedLocations, setSharedLocations] = useState<SharedLocation[]>([])

  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

  // Contexto persistente de transmissão em tempo real (sobrevive a recarregamento da página)
  const {
    isTracking,
    currentCoords,
    lastSentAt,
    sendCount,
    trackingError,
    toggleTracking,
  } = useTracking()

  // Coordenadas ativas (prioriza o rastreador contínuo, ou a leitura manual)
  const coordinates = currentCoords || manualCoordinates

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

  // Disparo manual único (quando a transmissão contínua estiver desligada)
  async function handleGetLocation() {
    setLoading(true)
    setMessage('')
    setManualCoordinates(null)

    try {
      const position = await getCurrentPosition()

      setManualCoordinates(position)
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

  function handleToggleLive() {
    if (!isTracking) {
      setMessage('Transmissão contínua ativada. Suas coordenadas serão enviadas mesmo se você recarregar a página.')
    } else {
      setMessage('Transmissão em tempo real pausada.')
    }
    toggleTracking()
  }

  return (
    <main className="mx-auto max-w-2xl">
      <header>
        <h1 className="text-2xl sm:text-3xl font-bold">
          Minha localização
        </h1>
        <p className="mt-2 text-xs sm:text-sm text-slate-400">
          Transmita sua posição via GPS para suas conexões em tempo real ou sob demanda.
        </p>
      </header>

      {/* Painel de Transmissão Ao Vivo Persistente */}
      {isTracking && (
        <section className="mt-6 flex items-center justify-between rounded-xl border border-red-500/40 bg-red-950/30 p-4 text-sm text-red-200">
          <div className="flex items-center gap-3">
            <span className="relative flex h-3 w-3">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex h-3 w-3 rounded-full bg-red-500"></span>
            </span>
            <div>
              <p className="font-semibold text-white text-sm">
                Transmissão em tempo real ATIVA (Automática)
              </p>
              <p className="text-xs text-red-300/90 mt-0.5">
                Permanecerá transmitindo mesmo se a página for recarregada.
              </p>
              <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-red-300">
                {lastSentAt ? (
                  <span className="flex items-center gap-1">
                    <Clock size={12} /> Último envio: {lastSentAt}
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-amber-300">
                    <Clock size={12} /> Sincronizando sinal GPS...
                  </span>
                )}
                <span className="flex items-center gap-1">
                  <Activity size={12} /> {sendCount} envios realizados
                </span>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Botões de Ação */}
      <div className="mt-6 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        {/* Botão de Transmissão Contínua (Persistente) */}
        <button
          type="button"
          onClick={handleToggleLive}
          className={
            isTracking
              ? 'flex items-center justify-center gap-2 rounded-lg bg-red-600 px-5 py-3 text-sm sm:text-base font-semibold text-white shadow-lg shadow-red-950 transition hover:bg-red-500 w-full sm:w-auto'
              : 'flex items-center justify-center gap-2 rounded-lg border border-red-500/40 bg-red-950/60 px-5 py-3 text-sm sm:text-base font-semibold text-red-200 transition hover:bg-red-900/80 hover:text-white w-full sm:w-auto'
          }
        >
          {isTracking ? (
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
          disabled={loading || isTracking}
          className="flex items-center justify-center gap-2 rounded-lg border border-slate-700 bg-slate-900 px-4 py-3 text-sm sm:text-base font-medium text-slate-300 transition hover:bg-slate-800 disabled:opacity-50 w-full sm:w-auto"
        >
          <Navigation size={16} className="text-blue-400" />
          {loading ? 'Obtendo...' : 'Enviar localização única'}
        </button>
      </div>

      {(message || trackingError) && (
        <p
          role="status"
          className={`mt-4 text-sm ${
            trackingError ? 'text-red-400 font-medium' : 'text-slate-300'
          }`}
        >
          {trackingError || message}
        </p>
      )}

      {/* Seção do Mapa e Coordenadas */}
      {(coordinates || sharedLocations.length > 0) && (
        <section className="mt-6 space-y-3 rounded-xl border border-slate-800 bg-slate-900 p-4 sm:p-5">
          <h2 className="text-base sm:text-lg font-semibold">
            {coordinates ? 'Coordenadas obtidas' : 'Localizações ativas no mapa'}
          </h2>

          {coordinates && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 rounded-lg bg-slate-950 p-3 text-sm">
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
