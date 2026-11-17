import { useState, type FormEvent } from 'react'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { getErrorMessage } from '../services/api'

export default function Login() {
  const { user, login } = useAuth()
  const [username, setUsername] = useState('emilys')
  const [password, setPassword] = useState('emilyspass')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()
  if (user) return <Navigate to="/" replace />

  const submit = async (event: FormEvent) => {
    event.preventDefault(); setLoading(true); setError('')
    try {
      await login(username, password)
      navigate(location.state?.from || '/', { replace: true })
    } catch (err) { setError(getErrorMessage(err)) }
    finally { setLoading(false) }
  }

  return <main className="login-page">
    <section className="login-shell">
      <div className="login-showcase">
        <div className="showcase-overlay" />
        <div className="showcase-brand"><span className="brand-mark">C</span><strong>CRM Pro</strong></div>
        <div className="showcase-copy">
          <span className="showcase-eyebrow">Gestão empresarial inteligente</span>
          <h1>Relacione.<br />Venda.<br />Evolua.</h1>
          <p>Clientes, pedidos e atendimentos organizados em uma única plataforma.</p>
        </div>
        <div className="showcase-stats">
          <div><strong>360°</strong><span>Visão do cliente</span></div>
          <div><strong>100%</strong><span>Dados atualizados</span></div>
        </div>
      </div>

      <section className="login-card">
        <div className="login-mobile-brand"><span className="brand-mark">C</span><strong>CRM Pro</strong></div>
        <span className="login-kicker">Área do atendente</span>
        <h1>Bem vindo</h1>
        <p className="login-subtitle">Entre com suas credenciais para continuar.</p>
        {error && <div className="alert error">{error}</div>}
        <form onSubmit={submit}>
          <label htmlFor="login-username">Usuário<input id="login-username" name="username" autoComplete="username" value={username} onChange={e => setUsername(e.target.value)} required /></label>
          <label htmlFor="login-password">Senha<input id="login-password" name="password" type="password" autoComplete="current-password" value={password} onChange={e => setPassword(e.target.value)} required /></label>
          <button className="button primary full" disabled={loading}>{loading ? 'Entrando...' : 'Entrar no sistema'} <span aria-hidden="true">→</span></button>
        </form>
        <small className="hint">Conta de teste: emilys / emilyspass</small>
      </section>
    </section>
  </main>
}
