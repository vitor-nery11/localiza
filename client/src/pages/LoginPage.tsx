
import { useEffect, useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { signIn, signUp } from '../services/authService'
import { useAuth } from '../contexts/useAuth'

export function LoginPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [isSignUp, setIsSignUp] = useState(false)
  const [displayName, setDisplayName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    if (user) {
      navigate('/', { replace: true })
    }
  }, [user, navigate])

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    
    setLoading(true)
    setMessage('')
    setError('')

    try {
      if (isSignUp) {
        const { data, error } = await signUp(
          email,
          password,
          displayName.trim()
        )

        if (error) throw error

        if (data.session) {
          navigate('/', { replace: true })
        } else {
          setMessage(
            'Cadastro realizado. Confira seu e-mail para confirmar a conta.'
          )
        }
      } else {
        const { error } = await signIn(email, password)

        if (error) throw error

        navigate('/', { replace: true })
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Não foi possível concluir a operação.'
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-md">
      <Link to="/" className="text-sm text-blue-400 hover:underline">
        Voltar ao início
      </Link>

      <h1 className="mt-8 text-3xl font-bold">
        {isSignUp ? 'Criar sua conta' : 'Entrar no Localiza'}
      </h1>

      <p className="mt-3 text-slate-400">
        {isSignUp
          ? 'Crie sua conta para começar a compartilhar localização.'
          : 'Entre para acessar suas conexões e localizações compartilhadas.'}
      </p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-5">
        {isSignUp && (
          <div>
            <label htmlFor="displayName" className="mb-2 block text-sm font-medium">
              Nome completo
            </label>

            <input
              id="displayName"
              type="text"
              autoComplete="name"
              required={isSignUp}
              value={displayName}
              onChange={(event) => setDisplayName(event.target.value)}
              className="w-full rounded-lg border border-slate-700 bg-slate-900 px-4 py-3 text-white outline-none focus:border-blue-500"
              placeholder="Seu nome completo"
            />
          </div>
        )}

        <div>
          <label htmlFor="email" className="mb-2 block text-sm font-medium">
            E-mail
          </label>

          <input
            id="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="w-full rounded-lg border border-slate-700 bg-slate-900 px-4 py-3 text-white outline-none focus:border-blue-500"
            placeholder="voce@exemplo.com"
          />
        </div>

        <div>
          <label htmlFor="password" className="mb-2 block text-sm font-medium">
            Senha
          </label>

          <input
            id="password"
            type="password"
            autoComplete={isSignUp ? 'new-password' : 'current-password'}
            minLength={6}
            required
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="w-full rounded-lg border border-slate-700 bg-slate-900 px-4 py-3 text-white outline-none focus:border-blue-500"
            placeholder="Mínimo de 6 caracteres"
          />
        </div>

        {message && (
          <p role="status" className="text-sm text-emerald-400">
            {message}
          </p>
        )}

        {error && (
          <p role="alert" className="text-sm text-red-400">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading
            ? 'Aguarde...'
            : isSignUp
              ? 'Criar conta'
              : 'Entrar'}
        </button>
      </form>

      <p className="mt-6 text-sm text-slate-400">
        {isSignUp ? 'Já tem uma conta?' : 'Ainda não tem uma conta?'}{' '}
        <button
          type="button"
          onClick={() => {
            setIsSignUp(!isSignUp)
            setDisplayName('')
            setMessage('')
            setError('')
          }}
          className="font-medium text-blue-400 hover:underline"
        >
          {isSignUp ? 'Entrar' : 'Criar conta'}
        </button>
      </p>
    </div>
  )
}
