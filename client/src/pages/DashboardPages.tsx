import { useEffect, useState } from 'react'
import { MapPin, Users, ShieldCheck, RefreshCw, Navigation } from 'lucide-react'
import { Link } from 'react-router-dom'
import { getMyProfile } from '../services/profileService'
import { LocationMap } from '../components/map/LocationMap'
import {
  getVisibleLocations,
  type SharedLocation,
} from '../services/sharedLocationService'
import {
  getCurrentPosition,
  type Coordinates,
} from '../services/locationService'

interface Profile {
  id: string
  email: string | undefined
  displayName: string
}

export function DashboardPage() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [sharedLocations, setSharedLocations] = useState<SharedLocation[]>([])
  const [myCoordinates, setMyCoordinates] = useState<Coordinates | null>(null)
  const [loadingLocations, setLoadingLocations] = useState(false)
  const [locationMessage, setLocationMessage] = useState('')

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

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadProfile()
    void loadLocations()
    void tryGetMyPosition()
  }, [])

  return (
    <div className="mx-auto max-w-5xl">
      <header>
        <p className="text-sm font-medium text-blue-400">
          SEU ESPAÇO DE LOCALIZAÇÃO
        </p>

        <h1 className="mt-2 text-3xl font-bold">
          {loading
            ? 'Carregando seu perfil...'
            : profile?.displayName
              ? `Olá, ${profile.displayName}!`
              : 'Compartilhe sua localização'}
        </h1>

        <p className="mt-3 max-w-2xl text-slate-400">
          Acompanhe pessoas que autorizaram o compartilhamento
          e gerencie suas conexões em um só lugar.
        </p>

        {profile?.email && (
          <p className="mt-2 text-sm text-slate-500">
            {profile.email}
          </p>
        )}

        {error && (
          <p role="alert" className="mt-3 text-sm text-red-400">
            Erro ao carregar perfil: {error}
          </p>
        )}
      </header>

      {/* Cards de atalho */}
      <section className="mt-8 grid gap-4 md:grid-cols-3">
        <Link
          to="/localizacao"
          className="group rounded-xl border border-slate-800 bg-slate-900 p-5 transition hover:border-blue-500/50"
        >
          <div className="flex items-center justify-between">
            <MapPin className="text-blue-400" />
            <span className="text-xs text-blue-400 opacity-0 transition group-hover:opacity-100">
              Ir para teste →
            </span>
          </div>
          <h2 className="mt-4 font-semibold text-white">Minha Localização</h2>
          <p className="mt-2 text-sm text-slate-400">
            Transmita suas coordenadas GPS para suas conexões.
          </p>
        </Link>

        <Link
          to="/connections"
          className="group rounded-xl border border-slate-800 bg-slate-900 p-5 transition hover:border-blue-500/50"
        >
          <div className="flex items-center justify-between">
            <Users className="text-blue-400" />
            <span className="text-xs text-blue-400 opacity-0 transition group-hover:opacity-100">
              Gerenciar →
            </span>
          </div>
          <h2 className="mt-4 font-semibold text-white">Conexões</h2>
          <p className="mt-2 text-sm text-slate-400">
            Gerencie convites e controle quem vê sua posição.
          </p>
        </Link>

        <article className="rounded-xl border border-slate-800 bg-slate-900 p-5">
          <ShieldCheck className="text-emerald-400" />
          <h2 className="mt-4 font-semibold text-white">Privacidade</h2>
          <p className="mt-2 text-sm text-slate-400">
            Localizações só são visíveis com autorização mútua.
          </p>
        </article>
      </section>

      {/* Seção Principal do Mapa */}
      <section className="mt-8 rounded-xl border border-slate-800 bg-slate-900 p-6">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <MapPin className="text-blue-400" size={22} />
              Mapa de Localizações
            </h2>
            <p className="text-sm text-slate-400 mt-1">
              Visualização das posições compartilhadas em tempo real.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={loadLocations}
              disabled={loadingLocations}
              className="flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-800 px-3.5 py-2 text-sm font-medium text-slate-200 transition hover:bg-slate-700 hover:text-white disabled:opacity-50"
              title="Atualizar posições do mapa"
            >
              <RefreshCw
                size={16}
                className={loadingLocations ? 'animate-spin text-blue-400' : ''}
              />
              {loadingLocations ? 'Atualizando...' : 'Atualizar mapa'}
            </button>
          </div>
        </div>

        {locationMessage && (
          <p role="alert" className="mt-4 text-sm text-amber-400">
            {locationMessage}
          </p>
        )}

        {/* Componente do Mapa */}
        <div className="mt-6">
          <LocationMap
            latitude={myCoordinates?.latitude}
            longitude={myCoordinates?.longitude}
            sharedLocations={sharedLocations}
          />
        </div>

        {/* Lista de Conexões Visíveis */}
        <div className="mt-6">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-400">
            Amigos com localização ativa ({sharedLocations.length})
          </h3>

          {sharedLocations.length === 0 ? (
            <div className="mt-3 rounded-lg border border-dashed border-slate-800 bg-slate-950/60 p-5 text-center">
              <p className="text-slate-300 font-medium">
                Nenhum amigo compartilhando localização no momento.
              </p>
              <div className="mt-3 text-xs text-slate-400 space-y-1 max-w-md mx-auto text-left">
                <p>Para ver o mapa do seu amigo:</p>
                <p>1. Ambos devem ter conexão aceita na aba <Link to="/connections" className="text-blue-400 underline">Conexões</Link>.</p>
                <p>2. Seu amigo deve ativar a chave <span className="text-blue-300 font-medium">"Compartilhando localização"</span>.</p>
                <p>3. Seu amigo deve acessar <Link to="/localizacao" className="text-blue-400 underline">Minha localização</Link> e clicar em <span className="text-blue-300 font-medium">"Obter minha localização"</span> para enviar o GPS ao servidor.</p>
              </div>
            </div>
          ) : (
            <ul className="mt-3 grid gap-3 sm:grid-cols-2">
              {sharedLocations.map(loc => (
                <li
                  key={loc.user_id}
                  className="flex items-center gap-3 rounded-lg border border-slate-800 bg-slate-950/80 p-3.5"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600/20 text-sm font-bold text-blue-300">
                    {loc.display_name?.charAt(0).toUpperCase() || '?'}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium text-white">
                      {loc.display_name || 'Usuário do Localiza'}
                    </p>
                    <p className="flex items-center gap-1 text-xs text-emerald-400">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400"></span>
                      Localização transmitida
                    </p>
                    {loc.updated_at && (
                      <p className="text-[11px] text-slate-500">
                        {new Date(loc.updated_at).toLocaleTimeString('pt-BR', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    )}
                  </div>
                </li>
              ))}
            </ul>
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
              Capturar minha localização →
            </Link>
          </div>
        )}
      </section>
    </div>
  )
}
