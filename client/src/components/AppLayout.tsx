import { useState } from 'react'
import { Link, NavLink, Outlet } from 'react-router-dom'
import { LogOut, MapPin, Navigation, Settings, Users, UserCheck } from 'lucide-react'
import { useAuth } from '../contexts/useAuth'
import { useTracking } from '../contexts/useTracking'
import { signOut } from '../services/authService'

export function AppLayout() {
  const { user } = useAuth()
  const { isTracking } = useTracking()
  const [logoutError, setLogoutError] = useState('')
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  async function handleLogout() {
    setLogoutError('')
    setIsLoggingOut(true)

    try {
      const { error } = await signOut()

      if (error) {
        throw error
      }
    } catch (error) {
      setLogoutError(
        error instanceof Error
          ? error.message
          : 'Não foi possível sair da conta.'
      )
    } finally {
      setIsLoggingOut(false)
    }
  }

  const userInitial = (
    user?.user_metadata?.full_name ||
    user?.user_metadata?.displayName ||
    user?.email ||
    '?'
  )
    .charAt(0)
    .toUpperCase()

  return (
    <div className="min-h-screen bg-slate-950 text-white md:flex">
      {/* Top Header Mobile (Apenas telas pequenas) */}
      <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-slate-800 bg-slate-950/95 px-4 backdrop-blur-md md:hidden">
        <Link to="/" className="flex items-center gap-2 text-lg font-bold text-white">
          <MapPin className="text-blue-500" size={20} />
          <span>Localiza</span>
        </Link>

        {isTracking && (
          <Link
            to="/localizacao"
            className="flex items-center gap-1.5 rounded-full border border-red-500/40 bg-red-950/60 px-2.5 py-1 text-xs font-semibold text-red-200 shadow-sm shadow-red-950"
            title="GPS transmitindo ao vivo"
          >
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex h-2 w-2 rounded-full bg-red-500"></span>
            </span>
            <span>Ao Vivo</span>
          </Link>
        )}

        {user && (
          <div className="flex items-center gap-2.5">
            <Link
              to="/configuracoes"
              className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600/20 text-xs font-bold text-blue-300"
              title="Minha Conta"
            >
              {userInitial}
            </Link>

            <button
              type="button"
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white"
              title="Sair"
              aria-label="Sair da conta"
            >
              <LogOut size={17} />
            </button>
          </div>
        )}
      </header>

      {/* Sidebar Desktop (Oculto em telas menores que md) */}
      <aside className="hidden border-r border-slate-800 p-6 md:flex md:w-64 md:flex-col md:min-h-screen md:justify-between">
        <div>
          <div className="flex items-center gap-2 text-xl font-bold">
            <MapPin className="text-blue-500" size={24} />
            Localiza
          </div>

          {isTracking && (
            <Link
              to="/localizacao"
              className="mt-4 flex items-center justify-between rounded-lg border border-red-500/40 bg-red-950/40 p-2.5 text-xs text-red-200 transition hover:bg-red-900/40"
            >
              <div className="flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-red-500"></span>
                </span>
                <span className="font-semibold text-white">GPS Ao Vivo</span>
              </div>
              <span className="text-[11px] text-red-300">Transmitindo</span>
            </Link>
          )}

          <nav className="mt-8 flex flex-col gap-1.5">
            <NavLink
              to="/"
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-lg px-3.5 py-2.5 text-sm font-medium transition ${
                  isActive
                    ? 'bg-blue-600/15 text-blue-400'
                    : 'text-slate-300 hover:bg-slate-900 hover:text-white'
                }`
              }
            >
              <MapPin size={18} />
              Mapa
            </NavLink>

            {user && (
              <NavLink
                to="/connections"
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-lg px-3.5 py-2.5 text-sm font-medium transition ${
                    isActive
                      ? 'bg-blue-600/15 text-blue-400'
                      : 'text-slate-300 hover:bg-slate-900 hover:text-white'
                  }`
                }
              >
                <Users size={18} />
                Conexões
              </NavLink>
            )}

            {user && (
              <NavLink
                to="/localizacao"
                className={({ isActive }) =>
                  `flex items-center justify-between rounded-lg px-3.5 py-2.5 text-sm font-medium transition ${
                    isActive
                      ? 'bg-blue-600/15 text-blue-400'
                      : 'text-slate-300 hover:bg-slate-900 hover:text-white'
                  }`
                }
              >
                <div className="flex items-center gap-3">
                  <Navigation size={18} />
                  <span>Minha localização</span>
                </div>
                {isTracking && (
                  <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse" title="Transmitindo"></span>
                )}
              </NavLink>
            )}

            {user && (
              <NavLink
                to="/configuracoes"
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-lg px-3.5 py-2.5 text-sm font-medium transition ${
                    isActive
                      ? 'bg-blue-600/15 text-blue-400'
                      : 'text-slate-300 hover:bg-slate-900 hover:text-white'
                  }`
                }
              >
                <Settings size={18} />
                Configurações
              </NavLink>
            )}

            {!user && (
              <NavLink
                to="/login"
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-lg px-3.5 py-2.5 text-sm font-medium transition ${
                    isActive
                      ? 'bg-blue-600/15 text-blue-400'
                      : 'text-slate-300 hover:bg-slate-900 hover:text-white'
                  }`
                }
              >
                <UserCheck size={18} />
                Entrar
              </NavLink>
            )}
          </nav>
        </div>

        {/* Rodapé da Sidebar Desktop */}
        {user && (
          <div className="border-t border-slate-800/80 pt-4">
            <div className="mb-3 flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-600/20 text-sm font-bold text-blue-300">
                {userInitial}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-medium text-white">
                  {user.user_metadata?.full_name || user.email}
                </p>
                <p className="text-[11px] text-slate-500">Conectado</p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium text-slate-400 transition hover:bg-red-500/10 hover:text-red-400 disabled:opacity-50"
            >
              <LogOut size={16} />
              {isLoggingOut ? 'Saindo...' : 'Encerrar sessão'}
            </button>
          </div>
        )}

        {logoutError && (
          <p role="alert" className="mt-4 text-xs text-red-400">
            {logoutError}
          </p>
        )}
      </aside>

      {/* Conteúdo Principal com compensação de padding para a barra inferior mobile */}
      <main className="min-w-0 flex-1 p-4 pb-24 sm:p-6 md:p-8 md:pb-8 lg:p-10">
        <Outlet />
      </main>

      {/* Bottom Navigation Bar Mobile (Apenas em telas pequenas) */}
      {user && (
        <nav
          aria-label="Navegação móvel"
          className="fixed bottom-0 left-0 right-0 z-40 flex h-16 items-center justify-around border-t border-slate-800/90 bg-slate-950/95 px-2 pb-safe backdrop-blur-lg md:hidden"
        >
          <NavLink
            to="/"
            end
            className={({ isActive }) =>
              `flex flex-col items-center justify-center py-1 text-center transition ${
                isActive ? 'text-blue-400' : 'text-slate-400 hover:text-slate-200'
              }`
            }
          >
            <MapPin size={20} />
            <span className="mt-1 text-[11px] font-medium">Mapa</span>
          </NavLink>

          <NavLink
            to="/connections"
            className={({ isActive }) =>
              `flex flex-col items-center justify-center py-1 text-center transition ${
                isActive ? 'text-blue-400' : 'text-slate-400 hover:text-slate-200'
              }`
            }
          >
            <Users size={20} />
            <span className="mt-1 text-[11px] font-medium">Conexões</span>
          </NavLink>

          <NavLink
            to="/localizacao"
            className={({ isActive }) =>
              `flex flex-col items-center justify-center py-1 text-center transition ${
                isActive ? 'text-blue-400' : 'text-slate-400 hover:text-slate-200'
              }`
            }
          >
            <div className="relative">
              <Navigation size={20} />
              {isTracking && (
                <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-red-500"></span>
                </span>
              )}
            </div>
            <span className="mt-1 text-[11px] font-medium">GPS</span>
          </NavLink>

          <NavLink
            to="/configuracoes"
            className={({ isActive }) =>
              `flex flex-col items-center justify-center py-1 text-center transition ${
                isActive ? 'text-blue-400' : 'text-slate-400 hover:text-slate-200'
              }`
            }
          >
            <Settings size={20} />
            <span className="mt-1 text-[11px] font-medium">Ajustes</span>
          </NavLink>
        </nav>
      )}
    </div>
  )
}
