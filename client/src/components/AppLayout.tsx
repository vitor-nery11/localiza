
import { Outlet } from 'react-router-dom'
import { MapPin, Users, Settings } from 'lucide-react'

export function AppLayout() {
  return (
    <div className="min-h-screen bg-slate-950 text-white md:flex">
      <aside className="border-b border-slate-800 p-5 md:min-h-screen md:w-64 md:border-b-0 md:border-r">
        <div className="flex items-center gap-2 text-xl font-bold">
          <MapPin className="text-blue-400" />
          Localiza
        </div>

        <nav className="mt-8 flex gap-4 md:flex-col">
          <a href="/" className="flex items-center gap-2 text-slate-300 hover:text-white">
            <MapPin size={18} />
            Mapa
          </a>

          <a href="/login" className="flex items-center gap-2 text-slate-300 hover:text-white">
            <Users size={18} />
            Entrar
          </a>

          <a href="/configuracoes" className="flex items-center gap-2 text-slate-300 hover:text-white">
            <Settings size={18} />
            Configurações
          </a>
        </nav>
      </aside>

      <main className="min-w-0 flex-1 p-6 md:p-10">
        <Outlet />
      </main>
    </div>
  )
}
