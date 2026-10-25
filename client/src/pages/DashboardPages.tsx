
import { useEffect, useState } from 'react'
import { MapPin, Users, ShieldCheck } from 'lucide-react'
import { getMyProfile } from '../services/profileService'

interface Profile {
  id: string
  email: string | undefined
  displayName: string
}

export function DashboardPage() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
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

    loadProfile()
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

      <section className="mt-8 grid gap-4 md:grid-cols-3">
        <article className="rounded-xl border border-slate-800 bg-slate-900 p-5">
          <MapPin className="text-blue-400" />
          <h2 className="mt-4 font-semibold">Localização</h2>
          <p className="mt-2 text-sm text-slate-400">
            Veja posições compartilhadas no mapa.
          </p>
        </article>

        <article className="rounded-xl border border-slate-800 bg-slate-900 p-5">
          <Users className="text-blue-400" />
          <h2 className="mt-4 font-semibold">Conexões</h2>
          <p className="mt-2 text-sm text-slate-400">
            Gerencie convites e pessoas autorizadas.
          </p>
        </article>

        <article className="rounded-xl border border-slate-800 bg-slate-900 p-5">
          <ShieldCheck className="text-blue-400" />
          <h2 className="mt-4 font-semibold">Privacidade</h2>
          <p className="mt-2 text-sm text-slate-400">
            Você controla quando e com quem compartilha.
          </p>
        </article>
      </section>

      <section className="mt-8 rounded-xl border border-slate-800 bg-slate-900 p-6">
        <h2 className="text-lg font-semibold">Seu mapa</h2>
        <p className="mt-2 text-sm text-slate-400">
          O mapa será integrado na próxima etapa de interface.
        </p>
      </section>
    </div>
  )
}
