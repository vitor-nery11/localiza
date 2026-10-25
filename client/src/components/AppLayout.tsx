
import { useState } from 'react'
import { Link, Outlet } from 'react-router-dom'
import { LogOut, MapPin, Navigation, Settings, Users } from 'lucide-react'
import { useAuth } from '../contexts/useAuth'
import { signOut } from '../services/authService'

export function AppLayout() {
  const { user } = useAuth()
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
          : 'Não foi possível sair da conta.',
      )
    } finally {
      setIsLoggingOut(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white md:flex">
      <aside className="border-b border-slate-800 p-5 md:min-h-screen md:w-64 md:border-b-0 md:border-r">
        <div className="flex items-center gap-2 text-xl font-bold">
          <MapPin className="text-blue-400" />
          Localiza
        </div>

        <nav className="mt-8 flex gap-4 md:flex-col">
          <Link to="/" className="flex items-center gap-2 text-slate-300 hover:text-white">
            <MapPin size={18} />
            Mapa
          </Link>

          {user && (
            <Link to="/connections" className="flex items-center gap-2 text-slate-300 hover:text-white">
              <Users size={18} />
              Conexões
            </Link>
          )}

          {user && (
            <Link to="/localizacao" className="flex items-center gap-2 text-slate-300 hover:text-white">
              <Navigation size={18} />
              Minha localização
            </Link>
          )}

          {!user && (
            <Link to="/login" className="flex items-center gap-2 text-slate-300 hover:text-white">
              <Users size={18} />
              Entrar
            </Link>
          )}

          {user && (
            <Link to="/configuracoes" className="flex items-center gap-2 text-slate-300 hover:text-white">
              <Settings size={18} />
              Configurações
            </Link>
          )}

          {user && (
            <button
              type="button"
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="flex items-center gap-2 text-slate-300 hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
            >
              <LogOut size={18} />
              {isLoggingOut ? 'Saindo...' : 'Sair'}
            </button>
          )}
        </nav>
        {logoutError && (
          <p role="alert" className="mt-4 text-sm text-red-400">
            {logoutError}
          </p>
        )}
      </aside>

      <main className="min-w-0 flex-1 p-6 md:p-10">
        <Outlet />
      </main>
    </div>
  )
}
