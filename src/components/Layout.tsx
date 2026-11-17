import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Layout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const sair = () => { logout(); navigate('/login', { replace: true }) }
  const name = user?.nome || user?.username || 'Usuário'

  return <div className="app-shell">
    <aside className="sidebar">
      <div className="brand"><span className="brand-mark">C</span><strong>CRM Pro</strong></div>
      <nav>
        <NavLink to="/">Painel</NavLink>
        <NavLink to="/clientes">Clientes</NavLink>
        <NavLink to="/pedidos">Pedidos</NavLink>
        <NavLink to="/clientes/novo">Novo cliente</NavLink>
      </nav>
      <div className="user-box">
        <div><small>Conectado como</small><strong>{name}</strong></div>
        <button className="button danger-soft" onClick={sair}>Sair</button>
      </div>
    </aside>
    <main className="content"><Outlet /></main>
  </div>
}
