import { useEffect, useRef, useState } from 'react'
import {
  MapPin,
  Users,
  ShieldCheck,
  RefreshCw,
  Navigation,
  Eye,
  EyeOff,
  Filter,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { getMyProfile } from '../services/profileService'
import { LocationMap } from '../components/map/LocationMap'
import {
  getVisibleLocations,
  subscribeToLocationsChanges,
  type SharedLocation,
} from '../services/sharedLocationService'
import {
  getCurrentPosition,
  type Coordinates,
} from '../services/locationService'
import { useTracking } from '../contexts/useTracking'

interface Profile {
  id: string
  email: string | undefined
  displayName: string
}

export function DashboardPage() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const { currentCoords } = useTracking()
  const [sharedLocations, setSharedLocations] = useState<SharedLocation[]>([])
  const [myCoordinates, setMyCoordinates] = useState<Coordinates | null>(null)
  const activeCoordinates = currentCoords || myCoordinates
  const [loadingLocations, setLoadingLocations] = useState(false)
  const [locationMessage, setLocationMessage] = useState('')

  // Rastreamento automático em tempo real no mapa
  const [isAutoLive, setIsAutoLive] = useState(true)

  // Seleção de pessoas para visualização no mapa
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([])
  const hasInitializedSelectionRef = useRef(false)

  // O próprio usuário só aparece no mapa se for selecionado para estar (desativado por padrão)
  const [showMyPosition, setShowMyPosition] = useState(false)

  async function loadProfile() {
    try {
      const data = await getMyProfile()
      setProfile(data)
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Não foi possível carregar o perfil.'
      )
    } finally {
      setLoading(false)
    }
  }

  async function loadLocations() {
    setLoadingLocations(true)
    setLocationMessage('')
    try {
      const locations = await getVisibleLocations()
      setSharedLocations(locations)

      // Na primeira vez em que localizações chegam, seleciona os amigos por padrão
      if (!hasInitializedSelectionRef.current && locations.length > 0) {
        setSelectedUserIds(locations.map(l => l.user_id))
        hasInitializedSelectionRef.current = true
      }
    } catch (err) {
      console.error('Erro ao carregar localizações compartilhadas:', err)
      setLocationMessage(
        err instanceof Error
          ? err.message
          : 'Não foi possível carregar localizações de conexões.'
      )
    } finally {
      setLoadingLocations(false)
    }
  }

  async function tryGetMyPosition() {
    try {
      const pos = await getCurrentPosition()
      setMyCoordinates(pos)
    } catch {
      // Ignora erro silencioso se o usuário ainda não permitiu ou não clicou
    }
  }

  // Alterna a exibição de um amigo específico no mapa
  function toggleUserSelection(userId: string) {
    setSelectedUserIds(prev =>
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    )
  }

  // Seleciona todas as pessoas e também você
  function selectAllUsers() {
    setSelectedUserIds(sharedLocations.map(l => l.user_id))
    if (activeCoordinates) {
      setShowMyPosition(true)
    }
  }

  // Oculta todas as pessoas e você do mapa
  function deselectAllUsers() {
    setSelectedUserIds([])
    setShowMyPosition(false)
  }

  // Amigos filtrados apenas para quem está selecionado
  const visibleLocationsOnMap = sharedLocations.filter(loc =>
    selectedUserIds.includes(loc.user_id)
  )

  // Totais para contagem do filtro
  const totalVisible =
    visibleLocationsOnMap.length + (showMyPosition && activeCoordinates ? 1 : 0)
  const totalAvailable =
    sharedLocations.length + (activeCoordinates ? 1 : 0)

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadProfile()
    void loadLocations()
    void tryGetMyPosition()
  }, [])

  // Atualização em tempo real: WebSockets via Supabase Realtime + Polling a cada 5 segundos
  useEffect(() => {
    if (!isAutoLive) return

    // 1. Escuta alterações no banco de dados via WebSockets
    const unsubscribe = subscribeToLocationsChanges(() => {
      void loadLocations()
    })

    // 2. Polling periódico de 5s para garantia total de sincronização
    const interval = setInterval(() => {
      void loadLocations()
    }, 5000)

    return () => {
      unsubscribe()
      clearInterval(interval)
    }
  }, [isAutoLive])

  return (
    <div className="mx-auto max-w-5xl">
      <header>
        <p className="text-xs sm:text-sm font-medium text-blue-400">
          SEU ESPAÇO DE LOCALIZAÇÃO
        </p>

        <h1 className="mt-1.5 text-2xl sm:text-3xl font-bold">
          {loading
            ? 'Carregando seu perfil...'
            : profile?.displayName
              ? `Olá, ${profile.displayName}!`
              : 'Compartilhe sua localização'}
        </h1>

        <p className="mt-2 sm:mt-3 max-w-2xl text-xs sm:text-sm text-slate-400">
          Acompanhe pessoas que autorizaram o compartilhamento
          e gerencie suas conexões em um só lugar.
        </p>

        {profile?.email && (
          <p className="mt-1.5 text-xs sm:text-sm text-slate-500">
            {profile.email}
          </p>
        )}

        {error && (
          <p role="alert" className="mt-3 text-xs sm:text-sm text-red-400">
            Erro ao carregar perfil: {error}
          </p>
        )}
      </header>

      {/* Cards de atalho */}
      <section className="mt-6 sm:mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        <Link
          to="/localizacao"
          className="group rounded-xl border border-slate-800 bg-slate-900 p-4 sm:p-5 transition hover:border-blue-500/50"
        >
          <div className="flex items-center justify-between">
            <MapPin className="text-blue-400" size={20} />
            <span className="text-xs text-blue-400 opacity-0 transition group-hover:opacity-100">
              Ir para teste →
            </span>
          </div>
          <h2 className="mt-3 sm:mt-4 font-semibold text-white text-sm sm:text-base">Minha Localização</h2>
          <p className="mt-1.5 text-xs sm:text-sm text-slate-400">
            Transmita suas coordenadas GPS para suas conexões.
          </p>
        </Link>

        <Link
          to="/connections"
          className="group rounded-xl border border-slate-800 bg-slate-900 p-4 sm:p-5 transition hover:border-blue-500/50"
        >
          <div className="flex items-center justify-between">
            <Users className="text-blue-400" size={20} />
            <span className="text-xs text-blue-400 opacity-0 transition group-hover:opacity-100">
              Gerenciar →
            </span>
          </div>
          <h2 className="mt-3 sm:mt-4 font-semibold text-white text-sm sm:text-base">Conexões</h2>
          <p className="mt-1.5 text-xs sm:text-sm text-slate-400">
            Gerencie convites e controle quem vê sua posição.
          </p>
        </Link>

        <article className="rounded-xl border border-slate-800 bg-slate-900 p-4 sm:p-5">
          <ShieldCheck className="text-emerald-400" size={20} />
          <h2 className="mt-3 sm:mt-4 font-semibold text-white text-sm sm:text-base">Privacidade</h2>
          <p className="mt-1.5 text-xs sm:text-sm text-slate-400">
            Localizações só são visíveis com autorização mútua.
          </p>
        </article>
      </section>

      {/* Seção Principal do Mapa */}
      <section className="mt-6 sm:mt-8 rounded-xl border border-slate-800 bg-slate-900 p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
              <MapPin className="text-blue-400" size={20} />
              Mapa de Localizações
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Visualização das pessoas selecionadas em tempo real.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* Status Ao Vivo */}
            <button
              type="button"
              onClick={() => setIsAutoLive(prev => !prev)}
              className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition ${
                isAutoLive
                  ? 'border-emerald-500/40 bg-emerald-950/40 text-emerald-300 hover:bg-emerald-900/40'
                  : 'border-slate-700 bg-slate-800 text-slate-400 hover:bg-slate-700'
              }`}
              title="Alternar atualização automática em tempo real"
            >
              <span
                className={`h-2 w-2 rounded-full ${
                  isAutoLive ? 'animate-pulse bg-emerald-400' : 'bg-slate-500'
                }`}
              />
              {isAutoLive ? 'Ao vivo (5s)' : 'Ao vivo pausado'}
            </button>

            <button
              type="button"
              onClick={loadLocations}
              disabled={loadingLocations}
              className="flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs font-medium text-slate-200 transition hover:bg-slate-700 hover:text-white disabled:opacity-50"
              title="Atualizar posições do mapa agora"
            >
              <RefreshCw
                size={14}
                className={loadingLocations ? 'animate-spin text-blue-400' : ''}
              />
              {loadingLocations ? 'Atualizando...' : 'Atualizar'}
            </button>
          </div>
        </div>

        {locationMessage && (
          <p role="alert" className="mt-4 text-sm text-amber-400">
            {locationMessage}
          </p>
        )}

        {/* Barra de Filtro de Seleção de Pessoas */}
        {(sharedLocations.length > 0 || myCoordinates !== null) && (
          <div className="mt-4 rounded-xl border border-slate-800 bg-slate-950/60 p-3">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800/80 pb-2.5">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-300">
                <Filter size={13} className="text-blue-400" />
                <span>
                  Filtrar no mapa ({totalVisible} de {totalAvailable} visíveis)
                </span>
              </div>

              <div className="flex items-center gap-2 text-xs">
                <button
                  type="button"
                  onClick={selectAllUsers}
                  className="font-medium text-blue-400 hover:text-blue-300 transition"
                >
                  Ver todos
                </button>
                <span className="text-slate-600">•</span>
                <button
                  type="button"
                  onClick={deselectAllUsers}
                  className="text-slate-400 hover:text-slate-300 transition"
                >
                  Ocultar todos
                </button>
              </div>
            </div>

            {/* Chips clicáveis rápidos para você e cada amigo */}
            <div className="mt-2.5 flex flex-wrap gap-2">
              {/* Chip de Você (só aparece se selecionado) */}
              <button
                type="button"
                onClick={async () => {
                  if (!activeCoordinates) {
                    await tryGetMyPosition()
                  }
                  setShowMyPosition(prev => !prev)
                }}
                className={`flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium transition ${
                  showMyPosition && activeCoordinates
                    ? 'border-sky-500/70 bg-sky-600/25 text-white shadow-sm'
                    : 'border-slate-800 bg-slate-900/60 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                }`}
                title={
                  showMyPosition && activeCoordinates
                    ? 'Clique para ocultar sua posição do mapa'
                    : 'Clique para exibir sua posição no mapa'
                }
              >
                <span
                  className={`flex h-4 w-4 items-center justify-center rounded-full text-[10px] font-bold ${
                    showMyPosition && activeCoordinates
                      ? 'bg-sky-500 text-white'
                      : 'bg-slate-700 text-slate-300'
                  }`}
                >
                  Eu
                </span>
                <span>Você (Minha posição)</span>
                {showMyPosition && activeCoordinates ? (
                  <Eye size={12} className="text-sky-400" />
                ) : (
                  <EyeOff size={12} className="text-slate-500" />
                )}
              </button>

              {/* Chips dos amigos */}
              {sharedLocations.map(loc => {
                const isSelected = selectedUserIds.includes(loc.user_id)
                return (
                  <button
                    key={loc.user_id}
                    type="button"
                    onClick={() => toggleUserSelection(loc.user_id)}
                    className={`flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium transition ${
                      isSelected
                        ? 'border-blue-500/70 bg-blue-600/25 text-white shadow-sm'
                        : 'border-slate-800 bg-slate-900/60 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                    }`}
                    title={isSelected ? 'Clique para ocultar do mapa' : 'Clique para exibir no mapa'}
                  >
                    <span
                      className={`flex h-4 w-4 items-center justify-center rounded-full text-[10px] font-bold ${
                        isSelected ? 'bg-blue-500 text-white' : 'bg-slate-700 text-slate-300'
                      }`}
                    >
                      {loc.display_name?.charAt(0).toUpperCase() || '?'}
                    </span>
                    <span>{loc.display_name || 'Usuário'}</span>
                    {isSelected ? (
                      <Eye size={12} className="text-blue-400" />
                    ) : (
                      <EyeOff size={12} className="text-slate-500" />
                    )}
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {/* Componente do Mapa - Mostra você APENAS se showMyPosition for true */}
        <div className="mt-4">
          <LocationMap
            latitude={showMyPosition ? activeCoordinates?.latitude : null}
            longitude={showMyPosition ? activeCoordinates?.longitude : null}
            sharedLocations={visibleLocationsOnMap}
          />
        </div>

        {/* Aviso se nada estiver selecionado no mapa */}
        {(sharedLocations.length > 0 || activeCoordinates !== null) && totalVisible === 0 && (
          <p className="mt-3 text-center text-xs text-amber-400/90 bg-amber-950/30 border border-amber-500/30 rounded-lg p-2.5">
            ⚠️ Nenhuma pessoa está selecionada para exibição. Clique em "Você" ou no nome de uma conexão acima para mostrar no mapa.
          </p>
        )}

        {/* Lista Detalhada de Conexões e Você */}
        <div className="mt-6">
          <h3 className="text-xs sm:text-sm font-semibold uppercase tracking-wider text-slate-400">
            Pessoas disponíveis para o mapa ({totalAvailable})
          </h3>

          <ul className="mt-3 grid gap-3 sm:grid-cols-2">
            {/* Card de Você mesmo */}
            <li
              className={`flex items-center justify-between gap-3 rounded-xl border p-3.5 transition-all ${
                showMyPosition && activeCoordinates
                  ? 'border-sky-500/40 bg-slate-950/90 shadow-sm'
                  : 'border-slate-800/80 bg-slate-950/40 opacity-75'
              }`}
            >
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <div
                  className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full text-sm font-bold ${
                    showMyPosition && activeCoordinates
                      ? 'bg-sky-600/25 text-sky-300 ring-2 ring-sky-500/30'
                      : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  Eu
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium text-white text-sm">
                    Você (Seu dispositivo)
                  </p>
                  <p className="flex items-center gap-1 text-[11px] text-sky-400">
                    <span className="h-1.5 w-1.5 rounded-full bg-sky-400"></span>
                    {showMyPosition && activeCoordinates
                      ? 'Visível no mapa'
                      : 'Oculto do mapa'}
                  </p>
                  {activeCoordinates ? (
                    <p className="text-[11px] text-slate-500 font-mono">
                      {activeCoordinates.latitude.toFixed(4)}, {activeCoordinates.longitude.toFixed(4)}
                    </p>
                  ) : (
                    <p className="text-[11px] text-slate-500">
                      GPS não capturado nesta sessão
                    </p>
                  )}
                </div>
              </div>

              <button
                type="button"
                onClick={async () => {
                  if (!myCoordinates) {
                    await tryGetMyPosition()
                  }
                  setShowMyPosition(prev => !prev)
                }}
                className={`flex items-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-medium transition ${
                  showMyPosition && myCoordinates
                    ? 'border-sky-500/50 bg-sky-600/20 text-sky-300 hover:bg-sky-600/30'
                    : 'border-slate-700 bg-slate-800/80 text-slate-400 hover:bg-slate-700 hover:text-slate-200'
                }`}
                title={
                  showMyPosition && myCoordinates
                    ? 'Ocultar minha posição do mapa'
                    : 'Exibir minha posição no mapa'
                }
              >
                {showMyPosition && myCoordinates ? (
                  <>
                    <Eye size={14} className="text-sky-400" />
                    <span className="hidden xs:inline">No mapa</span>
                  </>
                ) : (
                  <>
                    <EyeOff size={14} className="text-slate-500" />
                    <span className="hidden xs:inline">Oculto</span>
                  </>
                )}
              </button>
            </li>

            {/* Cards dos Amigos */}
            {sharedLocations.map(loc => {
              const isSelected = selectedUserIds.includes(loc.user_id)
              return (
                <li
                  key={loc.user_id}
                  className={`flex items-center justify-between gap-3 rounded-xl border p-3.5 transition-all ${
                    isSelected
                      ? 'border-blue-500/40 bg-slate-950/90 shadow-sm'
                      : 'border-slate-800/80 bg-slate-950/40 opacity-75'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div
                      className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full text-sm font-bold ${
                        isSelected
                          ? 'bg-blue-600/25 text-blue-300 ring-2 ring-blue-500/30'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {loc.display_name?.charAt(0).toUpperCase() || '?'}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium text-white text-sm">
                        {loc.display_name || 'Usuário do Localiza'}
                      </p>
                      <p className="flex items-center gap-1 text-[11px] text-emerald-400">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400"></span>
                        {isSelected ? 'Visível no mapa' : 'Oculto do mapa'}
                      </p>
                      {loc.updated_at && (
                        <p className="text-[11px] text-slate-500">
                          Atualizado às:{' '}
                          {new Date(loc.updated_at).toLocaleTimeString('pt-BR', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Botão de Alternância de Visibilidade */}
                  <button
                    type="button"
                    onClick={() => toggleUserSelection(loc.user_id)}
                    className={`flex items-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-medium transition ${
                      isSelected
                        ? 'border-blue-500/50 bg-blue-600/20 text-blue-300 hover:bg-blue-600/30'
                        : 'border-slate-700 bg-slate-800/80 text-slate-400 hover:bg-slate-700 hover:text-slate-200'
                    }`}
                    title={isSelected ? 'Clique para ocultar esta pessoa do mapa' : 'Clique para mostrar esta pessoa no mapa'}
                  >
                    {isSelected ? (
                      <>
                        <Eye size={14} className="text-blue-400" />
                        <span className="hidden xs:inline">No mapa</span>
                      </>
                    ) : (
                      <>
                        <EyeOff size={14} className="text-slate-500" />
                        <span className="hidden xs:inline">Oculto</span>
                      </>
                    )}
                  </button>
                </li>
              )
            })}
          </ul>

          {sharedLocations.length === 0 && !myCoordinates && (
            <div className="mt-3 rounded-lg border border-dashed border-slate-800 bg-slate-950/60 p-5 text-center">
              <p className="text-slate-300 font-medium text-sm">
                Nenhum amigo compartilhando localização no momento.
              </p>
              <div className="mt-3 text-xs text-slate-400 space-y-1 max-w-md mx-auto text-left">
                <p>Para ver o mapa do seu amigo em tempo real:</p>
                <p>1. Ambos devem ter conexão aceita na aba <Link to="/connections" className="text-blue-400 underline">Conexões</Link>.</p>
                <p>2. Seu amigo deve ativar a chave <span className="text-blue-300 font-medium">"Compartilhando localização"</span>.</p>
                <p>3. Seu amigo deve acessar <Link to="/localizacao" className="text-blue-400 underline">Minha localização</Link> e ativar <span className="text-red-400 font-medium">"Iniciar transmissão em tempo real (Ao Vivo)"</span>.</p>
              </div>
            </div>
          )}
        </div>

        {/* Dica para o usuário ativar seu próprio GPS */}
        {!myCoordinates && (
          <div className="mt-5 flex items-center justify-between rounded-lg border border-slate-800 bg-slate-950/40 p-3 text-xs text-slate-400">
            <span className="flex items-center gap-2">
              <Navigation size={14} className="text-blue-400" />
              Sua posição ainda não foi capturada nesta sessão.
            </span>
            <Link
              to="/localizacao"
              className="font-medium text-blue-400 hover:underline"
            >
              Transmitir minha localização →
            </Link>
          </div>
        )}
      </section>
    </div>
  )
}
