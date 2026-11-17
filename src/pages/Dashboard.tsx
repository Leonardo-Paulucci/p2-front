import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api, { getErrorMessage } from '../services/api'
import type { Cliente, Pedido } from '../types'
import { formatMoney, pedidoTotal, topClientes } from '../utils/calculations'
import { ErrorBox, Loading } from '../components/States'

export default function Dashboard() {
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [pedidos, setPedidos] = useState<Pedido[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const load = async () => {
    setLoading(true); setError('')
    try {
      const [cr, pr] = await Promise.all([api.get('/clientes?limit=100'), api.get('/pedidos')])
      setClientes(cr.data.clientes ?? cr.data)
      setPedidos(pr.data.pedidos ?? pr.data)
    } catch (err) { setError(getErrorMessage(err)) }
    finally { setLoading(false) }
  }
  useEffect(() => { void load() }, [])
  if (loading) return <Loading text="Carregando painel..." />
  if (error) return <ErrorBox message={error} onRetry={load} />

  const validos = pedidos.filter(p => p.status !== 'cancelado')
  const vendido = validos.reduce((sum, p) => sum + pedidoTotal(p), 0)
  const ticket = validos.length ? vendido / validos.length : 0
  const statusRows = (['aberto', 'pago', 'cancelado'] as const).map(status => {
    const itens = pedidos.filter(p => p.status === status)
    return { status, count: itens.length, total: itens.reduce((sum, p) => sum + pedidoTotal(p), 0) }
  })

  return <>
    <header className="page-header"><div><small>Visão geral</small><h1>Painel</h1></div><Link className="button primary" to="/clientes/novo">+ Novo cliente</Link></header>
    <section className="dashboard-banner">
      <div className="dashboard-banner-copy"><span>Central de relacionamento</span><h2>Bem-vindo ao seu CRM</h2><p>Acompanhe vendas, clientes e oportunidades em tempo real.</p></div>
      <div className="dashboard-mini-chart" aria-label="Representação gráfica de desempenho"><i /><i /><i /><i /><i /><i /></div>
    </section>
    <section className="metrics">
      <article><small>Clientes</small><strong>{clientes.length}</strong></article>
      <article><small>Total vendido</small><strong>{formatMoney(vendido)}</strong></article>
      <article><small>Ticket médio</small><strong>{formatMoney(ticket)}</strong></article>
    </section>
    <section className="grid-two">
      <article className="card"><h2>Pedidos por status</h2>
        <div className="status-list">{statusRows.map(row => <div className="status-row" key={row.status}><span className={`badge ${row.status}`}>{row.status}</span><strong>{row.count} pedido(s)</strong><span>{formatMoney(row.total)}</span></div>)}</div>
      </article>
      <article className="card"><h2>Top 3 clientes</h2>
        <div className="ranking">{topClientes(clientes, pedidos).map((row, i) => <Link to={`/clientes/${row.cliente.id}`} key={row.cliente.id}><span className="rank">{i + 1}</span><strong>{row.cliente.nome}</strong><b>{formatMoney(row.total)}</b></Link>)}</div>
      </article>
    </section>
  </>
}
