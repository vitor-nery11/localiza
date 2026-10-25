import { useEffect, useState } from 'react'
import { X } from 'lucide-react'
import {
  findUserByEmail,
  sendConnectionRequest,
  getReceivedRequests,
  respondToConnectionRequest,
  getAcceptedConnections,
  setConnectionLocationSharing,
  type UserSearchResult,
} from '../services/connectionService'

interface ReceivedRequest {
  connection_id: string
  requester_id: string
  display_name: string
  created_at: string
}

interface AcceptedConnection {
  connection_id: string
  user_id: string
  display_name: string
  created_at: string
  my_shares_location: boolean
}

export function ConnectionsPage() {
  const [email, setEmail] = useState('')
  const [results, setResults] = useState<UserSearchResult[]>([])
  const [requests, setRequests] = useState<ReceivedRequest[]>([])
  const [requestMessage, setRequestMessage] = useState('')
  const [connections, setConnections] =
    useState<AcceptedConnection[]>([])
  const [connectionsMessage, setConnectionsMessage] =
    useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

  async function loadRequests() {
    try {
      const data = await getReceivedRequests()
      setRequests(data as ReceivedRequest[])
    } catch (error) {
      setRequestMessage(
        error instanceof Error
          ? error.message
          : 'Erro ao carregar solicitações.'
      )
    }
  }

  async function loadConnections() {
    try {
      const data = await getAcceptedConnections()
      setConnections(data as AcceptedConnection[])
      setConnectionsMessage('')
    } catch (error) {
      setConnectionsMessage(
        error instanceof Error
          ? error.message
          : 'Erro ao carregar conexões.'
      )
    }
  }

  async function handleToggleSharing(
    connectionId: string,
    enabled: boolean
  ) {
    setConnectionsMessage('')

    try {
      await setConnectionLocationSharing(connectionId, enabled)
      await loadConnections()
      setConnectionsMessage(
        enabled
          ? 'Compartilhamento ativado.'
          : 'Compartilhamento desativado.'
      )
    } catch (error) {
      setConnectionsMessage(
        error instanceof Error
          ? error.message
          : 'Não foi possível alterar o compartilhamento.'
      )
    }
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadRequests()
    void loadConnections()
  }, [])

  useEffect(() => {
    if (!connectionsMessage) return
    const timer = setTimeout(() => {
      setConnectionsMessage('')
    }, 4000)
    return () => clearTimeout(timer)
  }, [connectionsMessage])

  const activeSharesCount = connections.filter(
    connection => connection.my_shares_location
  ).length

  async function handleSearch() {
    setLoading(true)
    setMessage('')
    setResults([])

    try {
      const users = await findUserByEmail(email)
      setResults(users)
      setMessage(
        users.length > 0
          ? 'Usuário encontrado.'
          : 'Nenhum usuário encontrado.'
      )
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : 'Erro ao buscar usuário.'
      )
    } finally {
      setLoading(false)
    }
  }

  async function handleSendRequest(userId: string) {
    setLoading(true)

    try {
      await sendConnectionRequest(userId)
      setMessage('Solicitação de conexão enviada com sucesso.')
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : 'Erro ao enviar solicitação.'
      )
    } finally {
      setLoading(false)
    }
  }

  async function handleRespond(
    connectionId: string,
    status: 'accepted' | 'declined'
  ) {
    setRequestMessage('')

    try {
      await respondToConnectionRequest(connectionId, status)
      setRequests(current =>
        current.filter(
          request => request.connection_id !== connectionId
        )
      )

      setRequestMessage(
        status === 'accepted'
          ? 'Conexão aceita com sucesso.'
          : 'Solicitação recusada.'
      )
    } catch (error) {
      setRequestMessage(
        error instanceof Error
          ? error.message
          : 'Erro ao responder à solicitação.'
      )

      await loadRequests()
    }
  }

  return (
    <div className="mx-auto max-w-2xl">
      {/* Pop-up de aviso no topo da tela */}
      {connectionsMessage && (
        <div
          role="status"
          aria-live="polite"
          className={`fixed top-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 rounded-2xl border px-5 py-3.5 text-sm font-medium shadow-2xl backdrop-blur-md transition-all duration-300 animate-in fade-in slide-in-from-top-4 ${
            connectionsMessage.includes('Erro') || connectionsMessage.includes('Não foi possível')
              ? 'border-red-500/40 bg-slate-900/95 text-red-300 shadow-red-950/40'
              : 'border-emerald-500/40 bg-slate-900/95 text-white shadow-emerald-950/40'
          }`}
        >
          <span className="relative flex h-3 w-3">
            <span
              className={`absolute inline-flex h-full w-full animate-ping rounded-full opacity-75 ${
                connectionsMessage.includes('Erro') || connectionsMessage.includes('Não foi possível')
                  ? 'bg-red-400'
                  : 'bg-emerald-400'
              }`}
            />
            <span
              className={`relative inline-flex h-3 w-3 rounded-full ${
                connectionsMessage.includes('Erro') || connectionsMessage.includes('Não foi possível')
                  ? 'bg-red-500'
                  : 'bg-emerald-500'
              }`}
            />
          </span>

          <p>{connectionsMessage}</p>

          <button
            type="button"
            onClick={() => setConnectionsMessage('')}
            className="ml-2 rounded-lg p-1 text-slate-400 transition hover:bg-slate-800 hover:text-white"
            aria-label="Fechar aviso"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* Banner informativo no topo quando houver compartilhamento ativo */}
      {activeSharesCount > 0 && (
        <div className="mb-6 flex items-center justify-between gap-3 rounded-xl border border-emerald-500/30 bg-emerald-950/30 px-4 py-3 text-sm text-emerald-300">
          <div className="flex items-center gap-2.5">
            <span className="relative flex h-2.5 w-2.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500" />
            </span>
            <span>
              <strong>Compartilhamento ativo:</strong> transmitindo sua localização para {activeSharesCount} {activeSharesCount === 1 ? 'conexão' : 'conexões'}.
            </span>
          </div>
        </div>
      )}

      <h1 className="text-3xl font-bold">Conexões</h1>
      <p className="mt-2 text-slate-400">
        Procure uma pessoa pelo e-mail para iniciar uma conexão.
      </p>

      <section className="mt-8">
        <h2 className="text-xl font-semibold">
          Minhas conexões
        </h2>

        {connections.length === 0 ? (
          <p className="mt-3 text-sm text-slate-400">
            Você ainda não tem conexões aceitas.
          </p>
        ) : (
          <ul className="mt-4 space-y-3">
            {connections.map(connection => (
              <li
                key={connection.connection_id}
                className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-slate-800 bg-slate-900 p-4 transition-all hover:border-slate-700/80 hover:bg-slate-900/90"
              >
                <div className="flex items-center gap-3.5">
                  <div
                    className={`relative flex h-11 w-11 items-center justify-center rounded-full text-base font-semibold transition-all ${
                      connection.my_shares_location
                        ? 'bg-blue-600/20 text-blue-300 ring-2 ring-blue-500/30'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {connection.display_name?.charAt(0).toUpperCase() || '?'}
                    {connection.my_shares_location && (
                      <span className="absolute bottom-0 right-0 flex h-3 w-3">
                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                        <span className="relative inline-flex h-3 w-3 rounded-full border-2 border-slate-900 bg-emerald-500" />
                      </span>
                    )}
                  </div>

                  <div>
                    <p className="font-medium text-white">
                      {connection.display_name || 'Usuário do Localiza'}
                    </p>
                    <div className="mt-0.5 flex items-center gap-1.5 text-xs text-slate-400">
                      <span
                        className={`inline-block h-1.5 w-1.5 rounded-full ${
                          connection.my_shares_location
                            ? 'bg-emerald-400'
                            : 'bg-slate-500'
                        }`}
                      />
                      <span>
                        {connection.my_shares_location
                          ? 'Transmissão de localização ativa'
                          : 'Conexão estabelecida'}
                      </span>
                    </div>
                  </div>
                </div>

                <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-slate-800/80 bg-slate-950/50 px-3.5 py-2 transition hover:border-slate-700">
                  <div className="flex flex-col text-right">
                    <span
                      className={`text-xs font-medium transition-colors ${
                        connection.my_shares_location
                          ? 'text-blue-400'
                          : 'text-slate-400'
                      }`}
                    >
                      {connection.my_shares_location
                        ? 'Compartilhando'
                        : 'Compartilhar'}
                    </span>
                    <span className="text-[11px] text-slate-500">
                      {connection.my_shares_location ? 'Visível' : 'Oculto'}
                    </span>
                  </div>

                  {/* Switch animado moderno */}
                  <div className="relative inline-flex items-center">
                    <input
                      type="checkbox"
                      checked={connection.my_shares_location}
                      onChange={event =>
                        handleToggleSharing(
                          connection.connection_id,
                          event.target.checked
                        )
                      }
                      className="peer sr-only"
                      aria-label={`Compartilhar localização com ${connection.display_name || 'esta conexão'}`}
                    />
                    <div className="h-6 w-11 rounded-full bg-slate-800 transition-colors peer-checked:bg-blue-600 peer-focus-visible:ring-2 peer-focus-visible:ring-blue-500" />
                    <div className="absolute left-1 top-1 h-4 w-4 rounded-full bg-white transition-transform peer-checked:translate-x-5" />
                  </div>
                </label>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="mt-8">
        <h2 className="text-xl font-semibold">
          Solicitações recebidas
        </h2>

        {requestMessage && (
          <p role="status" className="mt-3 text-sm text-slate-300">
            {requestMessage}
          </p>
        )}

        {requests.length === 0 ? (
          <p className="mt-3 text-sm text-slate-400">
            Você não tem solicitações pendentes.
          </p>
        ) : (
          <ul className="mt-4 space-y-3">
            {requests.map(request => (
              <li
                key={request.connection_id}
                className="flex flex-wrap items-center justify-between gap-4 rounded-lg border border-slate-800 bg-slate-900 p-4"
              >
                <div>
                  <p className="font-medium">
                    {request.display_name || 'Usuário do Localiza'}
                  </p>
                  <p className="text-sm text-slate-400">
                    Enviou uma solicitação de conexão
                  </p>
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      handleRespond(request.connection_id, 'accepted')
                    }
                    className="rounded-lg bg-emerald-600 px-3 py-2 text-sm font-medium hover:bg-emerald-500"
                  >
                    Aceitar
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      handleRespond(request.connection_id, 'declined')
                    }
                    className="rounded-lg bg-red-600 px-3 py-2 text-sm font-medium hover:bg-red-500"
                  >
                    Recusar
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <div className="mt-6 flex gap-3">
        <input
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="E-mail da pessoa"
          className="min-w-0 flex-1 rounded-lg border border-slate-700 bg-slate-900 px-4 py-3"
        />

        <button
          type="button"
          onClick={handleSearch}
          disabled={loading || !email.trim()}
          className="rounded-lg bg-blue-600 px-4 py-3 font-medium disabled:opacity-50"
        >
          {loading ? 'Buscando...' : 'Buscar'}
        </button>
      </div>

      {message && (
        <p role="status" className="mt-4 text-sm text-slate-300">
          {message}
        </p>
      )}

      <ul className="mt-4 space-y-3">
        {results.map(user => (
          <li
            key={user.user_id}
            className="flex items-center justify-between gap-4 rounded-lg border border-slate-800 bg-slate-900 p-4"
          >
            <span>
              {user.display_name || email || 'Usuário do Localiza'}
            </span>

            <button
              type="button"
              onClick={() => handleSendRequest(user.user_id)}
              disabled={loading}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Enviar solicitação
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}
