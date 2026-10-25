import { useEffect, useState } from 'react'
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMap,
} from 'react-leaflet'
import L from 'leaflet'
import type { LatLngExpression } from 'leaflet'
import { Maximize2, Minimize2, Users, LocateFixed, Navigation } from 'lucide-react'
import type { SharedLocation } from '../../services/sharedLocationService'

import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png'
import markerIcon from 'leaflet/dist/images/marker-icon.png'
import markerShadow from 'leaflet/dist/images/marker-shadow.png'

// Corrige o caminho dos ícones de marcador do Leaflet no empacotador Vite
delete (L.Icon.Default.prototype as unknown as { _getIconUrl?: unknown })._getIconUrl
L.Icon.Default.mergeOptions({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
})

interface LocationMapProps {
  latitude?: number | null
  longitude?: number | null
  sharedLocations?: SharedLocation[]
}

function MapCenter({ latitude, longitude }: {
  latitude: number
  longitude: number
}) {
  const map = useMap()

  map.setView([latitude, longitude], map.getZoom())

  return null
}

// Invalida e recalcula o tamanho dos blocos de mapa quando alternar para tela cheia
function MapResizeWatcher({ isFullscreen }: { isFullscreen: boolean }) {
  const map = useMap()

  useEffect(() => {
    const timer = setTimeout(() => {
      map.invalidateSize()
    }, 150)
    return () => clearTimeout(timer)
  }, [isFullscreen, map])

  return null
}

// Executa animação suave (flyTo) para as coordenadas alvo quando solicitado
function MapFlyController({
  flyTarget,
}: {
  flyTarget: { coords: [number, number]; id: number } | null
}) {
  const map = useMap()

  useEffect(() => {
    if (flyTarget) {
      map.flyTo(flyTarget.coords, 16, {
        animate: true,
        duration: 1.2,
      })
    }
  }, [flyTarget, map])

  return null
}

export function LocationMap({
  latitude,
  longitude,
  sharedLocations = [],
}: LocationMapProps) {
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [flyTarget, setFlyTarget] = useState<{
    coords: [number, number]
    id: number
  } | null>(null)

  const hasUserPosition =
    typeof latitude === 'number' && typeof longitude === 'number'

  // Centraliza no usuário se houver, ou no primeiro amigo compartilhado, ou em coordenadas padrão
  const centerLat = hasUserPosition
    ? latitude
    : sharedLocations.length > 0
      ? sharedLocations[0].latitude
      : -15.793889

  const centerLng = hasUserPosition
    ? longitude
    : sharedLocations.length > 0
      ? sharedLocations[0].longitude
      : -47.882778

  const initialZoom = hasUserPosition || sharedLocations.length > 0 ? 14 : 4
  const position: LatLngExpression = [centerLat, centerLng]

  function handleFocusOn(coords: [number, number]) {
    setFlyTarget({ coords, id: Date.now() })
  }

  // Bloqueia scroll do body e trata tecla Esc ao entrar em tela cheia
  useEffect(() => {
    if (isFullscreen) {
      document.body.style.overflow = 'hidden'
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          setIsFullscreen(false)
        }
      }
      window.addEventListener('keydown', handleKeyDown)
      return () => {
        document.body.style.overflow = ''
        window.removeEventListener('keydown', handleKeyDown)
      }
    } else {
      document.body.style.overflow = ''
    }
  }, [isFullscreen])

  // A pessoa principal sendo localizada (primeira da lista de compartilhados)
  const primaryPerson = sharedLocations.length > 0 ? sharedLocations[0] : null

  return (
    <div
      className={
        isFullscreen
          ? 'fixed inset-0 z-50 flex h-screen w-screen flex-col bg-slate-950'
          : 'relative h-[450px] w-full overflow-hidden rounded-xl border border-slate-800'
      }
    >
      {/* Botões de Ação do Mapa */}
      {isFullscreen ? (
        <header className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 bg-slate-900/95 px-5 py-3 shadow-md backdrop-blur-md">
          <div className="flex items-center gap-3">
            <span className="font-semibold text-white">
              Localiza — Visão Ampliada do Mapa
            </span>
            {sharedLocations.length > 0 && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-500/20 px-3 py-0.5 text-xs font-medium text-blue-300">
                <Users size={12} />
                {sharedLocations.length} conexões no mapa
              </span>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Botão de Retornar à Pessoa que estamos localizando */}
            {primaryPerson && (
              <button
                type="button"
                onClick={() =>
                  handleFocusOn([primaryPerson.latitude, primaryPerson.longitude])
                }
                className="flex items-center gap-1.5 rounded-lg border border-blue-500/50 bg-blue-600/20 px-3.5 py-1.5 text-xs font-medium text-blue-200 transition hover:bg-blue-600 hover:text-white"
                title={`Retornar à localização de ${primaryPerson.display_name || 'Amigo'}`}
              >
                <LocateFixed size={15} className="text-blue-400" />
                <span>
                  Retornar a {primaryPerson.display_name || 'pessoa'}
                </span>
              </button>
            )}

            {/* Botão de Focar em Minha Posição (se disponível) */}
            {hasUserPosition && (
              <button
                type="button"
                onClick={() => handleFocusOn([latitude, longitude])}
                className="flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs font-medium text-slate-200 transition hover:bg-slate-700 hover:text-white"
                title="Centralizar na minha localização"
              >
                <Navigation size={14} className="text-emerald-400" />
                Minha posição
              </button>
            )}

            <button
              type="button"
              onClick={() => setIsFullscreen(false)}
              className="flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-800 px-3.5 py-1.5 text-sm font-medium text-white transition hover:bg-slate-700"
              title="Sair da tela cheia (Esc)"
            >
              <Minimize2 size={16} />
              Sair da tela cheia
            </button>
          </div>
        </header>
      ) : (
        <div className="absolute top-3 right-3 z-[1000] flex flex-wrap items-center gap-2">
          {/* Botão de Retornar à Pessoa (Modo Normal) */}
          {primaryPerson && (
            <button
              type="button"
              onClick={() =>
                handleFocusOn([primaryPerson.latitude, primaryPerson.longitude])
              }
              className="flex items-center gap-1.5 rounded-lg border border-blue-500/40 bg-slate-900/90 px-3 py-2 text-xs font-medium text-blue-300 shadow-lg backdrop-blur-sm transition hover:bg-blue-600 hover:text-white focus:outline-none"
              title={`Retornar à localização de ${primaryPerson.display_name || 'Amigo'}`}
            >
              <LocateFixed size={14} className="text-blue-400" />
              <span>
                Retornar a {primaryPerson.display_name || 'pessoa'}
              </span>
            </button>
          )}

          {/* Botão de Minha Posição (Modo Normal) */}
          {hasUserPosition && (
            <button
              type="button"
              onClick={() => handleFocusOn([latitude, longitude])}
              className="flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-900/90 px-2.5 py-2 text-xs font-medium text-slate-300 shadow-lg backdrop-blur-sm transition hover:bg-slate-800 hover:text-white focus:outline-none"
              title="Centralizar na minha posição"
            >
              <Navigation size={13} className="text-emerald-400" />
              <span>Eu</span>
            </button>
          )}

          {/* Botão de Tela Cheia */}
          <button
            type="button"
            onClick={() => setIsFullscreen(true)}
            className="flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-900/90 px-3 py-2 text-xs font-medium text-white shadow-lg backdrop-blur-sm transition hover:bg-slate-800 focus:outline-none"
            title="Ver mapa em tela cheia"
          >
            <Maximize2 size={14} />
            Tela cheia
          </button>
        </div>
      )}

      {/* Conteúdo do Mapa */}
      <div className="relative h-full w-full flex-1">
        <MapContainer
          center={position}
          zoom={initialZoom}
          scrollWheelZoom
          className="h-full w-full"
        >
          <MapCenter latitude={centerLat} longitude={centerLng} />
          <MapResizeWatcher isFullscreen={isFullscreen} />
          <MapFlyController flyTarget={flyTarget} />

          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {hasUserPosition && (
            <Marker position={[latitude, longitude]}>
              <Popup>
                <strong>Você está aqui</strong>
                <br />
                Sua localização atual
              </Popup>
            </Marker>
          )}

          {sharedLocations.map(location => (
            <Marker
              key={location.user_id}
              position={[location.latitude, location.longitude]}
            >
              <Popup>
                <p className="font-semibold text-slate-900">
                  {location.display_name || 'Usuário do Localiza'}
                </p>
                <p className="text-xs text-slate-600">
                  Localização compartilhada
                </p>
                {location.updated_at && (
                  <p className="mt-1 text-[11px] text-slate-500">
                    Atualizado em:{' '}
                    {new Date(location.updated_at).toLocaleTimeString('pt-BR', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                )}
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
    </div>
  )
}
