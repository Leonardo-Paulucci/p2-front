import { Link } from 'react-router-dom'
export default function NotFound() {
  return <main className="not-found"><span>404</span><h1>Página não encontrada</h1><p>A página que você tentou acessar não existe.</p><Link className="button primary" to="/">Voltar ao Painel</Link></main>
}
