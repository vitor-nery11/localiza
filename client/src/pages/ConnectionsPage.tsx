import { useEffect, useState } from 'react'
import {
  findUserByEmail,
  sendConnectionRequest,
  getReceivedRequests,
  respondToConnectionRequest,
  type UserSearchResult,
} from '../services/connectionService'

interface ReceivedRequest {
  connection_id: string
  requester_id: string
  display_name: string
  created_at: string
}

export function ConnectionsPage() {
  const [email, setEmail] = useState('')
  const [results, setResults] = useState<UserSearchResult[]>([])
  const [requests, setRequests] = useState<ReceivedRequest[]>([])
  const [requestMessage, setRequestMessage] = useState('')
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

  useEffect(() => {
    void Promise.resolve().then(loadRequests)
  }, [])

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
      <h1 className="text-3xl font-bold">Conexões</h1>
      <p className="mt-2 text-slate-400">
        Procure uma pessoa pelo e-mail para iniciar uma conexão.
      </p>

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
              {user.display_name || 'Usuário do Localiza'}
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
