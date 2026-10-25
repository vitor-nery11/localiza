
import { Link } from 'react-router-dom'

export function NotFoundPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold">Página não encontrada</h1>
      <Link to="/" className="mt-4 inline-block text-blue-400 hover:underline">
        Voltar ao início
      </Link>
    </div>
  )
}
