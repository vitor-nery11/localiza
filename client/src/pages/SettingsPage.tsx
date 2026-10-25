import { useEffect, useState, type FormEvent } from 'react'
import { Check, Mail, Save, Shield, User } from 'lucide-react'
import { getMyProfile, updateMyDisplayName } from '../services/profileService'

interface UserProfile {
  id: string
  email: string | undefined
  displayName: string
}

export function SettingsPage() {
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [displayName, setDisplayName] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    async function loadProfile() {
      try {
        const data = await getMyProfile()
        setProfile(data)
        setDisplayName(data.displayName || '')
      } catch (err) {
        setErrorMessage(
          err instanceof Error
            ? err.message
            : 'Não foi possível carregar os dados do perfil.'
        )
      } finally {
        setLoading(false)
      }
    }

    loadProfile()
  }, [])

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSaving(true)
    setSuccessMessage('')
    setErrorMessage('')

    try {
      await updateMyDisplayName(displayName)
      setProfile(current =>
        current ? { ...current, displayName: displayName.trim() } : null
      )
      setSuccessMessage('Dados atualizados com sucesso!')
    } catch (err) {
      setErrorMessage(
        err instanceof Error
          ? err.message
          : 'Erro ao atualizar informações do perfil.'
      )
    } finally {
      setSaving(false)
    }
  }

  const initialLetter =
    (displayName.trim() || profile?.email || '?').charAt(0).toUpperCase()

  return (
    <div className="mx-auto max-w-3xl">
      <header>
        <h1 className="text-3xl font-bold">Configurações</h1>
        <p className="mt-2 text-slate-400">
          Gerencie suas informações pessoais e dados da sua conta.
        </p>
      </header>

      {loading ? (
        <p className="mt-8 text-slate-400">Carregando configurações...</p>
      ) : (
        <div className="mt-8 space-y-8">
          {/* Card de prévia do perfil */}
          <section className="flex items-center gap-4 rounded-xl border border-slate-800 bg-slate-900 p-6">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-600/20 text-2xl font-bold text-blue-300">
              {initialLetter}
            </div>

            <div>
              <h2 className="text-xl font-semibold">
                {profile?.displayName || 'Nome não definido'}
              </h2>
              <p className="text-sm text-slate-400">{profile?.email}</p>
            </div>
          </section>

          {/* Formulário de edição de dados */}
          <section className="rounded-xl border border-slate-800 bg-slate-900 p-6">
            <div className="flex items-center gap-2 border-b border-slate-800 pb-4">
              <User className="text-blue-400" size={20} />
              <h2 className="text-lg font-semibold">Editar Dados Pessoais</h2>
            </div>

            <form onSubmit={handleSubmit} className="mt-6 space-y-5">
              <div>
                <label
                  htmlFor="displayName"
                  className="mb-2 block text-sm font-medium text-slate-200"
                >
                  Nome completo
                </label>

                <div className="relative">
                  <input
                    id="displayName"
                    type="text"
                    value={displayName}
                    onChange={event => setDisplayName(event.target.value)}
                    placeholder="Digite seu nome completo"
                    className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-blue-500"
                    required
                  />
                </div>
                <p className="mt-1.5 text-xs text-slate-400">
                  Este nome será visível para as pessoas que você conectar.
                </p>
              </div>

              <div>
                <label
                  htmlFor="email"
                  className="mb-2 block text-sm font-medium text-slate-200"
                >
                  E-mail da conta
                </label>

                <div className="flex items-center gap-2 rounded-lg border border-slate-800 bg-slate-950 px-4 py-3 text-slate-400">
                  <Mail size={18} className="text-slate-500" />
                  <span className="flex-1 text-sm">{profile?.email}</span>
                  <span className="rounded bg-slate-800 px-2 py-0.5 text-xs text-slate-400">
                    Principal
                  </span>
                </div>
              </div>

              {successMessage && (
                <div
                  role="status"
                  className="flex items-center gap-2 rounded-lg border border-emerald-500/30 bg-emerald-950/40 px-4 py-3 text-sm text-emerald-400"
                >
                  <Check size={18} />
                  <span>{successMessage}</span>
                </div>
              )}

              {errorMessage && (
                <p role="alert" className="text-sm text-red-400">
                  {errorMessage}
                </p>
              )}

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={saving || !displayName.trim()}
                  className="flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-3 font-medium text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <Save size={18} />
                  {saving ? 'Salvando alterações...' : 'Salvar alterações'}
                </button>
              </div>
            </form>
          </section>

          {/* Seção de Segurança / Informações da Conta */}
          <section className="rounded-xl border border-slate-800 bg-slate-900 p-6">
            <div className="flex items-center gap-2 border-b border-slate-800 pb-4">
              <Shield className="text-blue-400" size={20} />
              <h2 className="text-lg font-semibold">Conta & Segurança</h2>
            </div>

            <div className="mt-4 space-y-3 text-sm">
              <div className="flex justify-between py-2 text-slate-400">
                <span>Identificador da Conta</span>
                <span className="font-mono text-xs text-slate-300">
                  {profile?.id}
                </span>
              </div>
              <div className="flex justify-between border-t border-slate-800/60 py-2 text-slate-400">
                <span>Status da Conta</span>
                <span className="font-medium text-emerald-400">Ativa</span>
              </div>
            </div>
          </section>
        </div>
      )}
    </div>
  )
}
