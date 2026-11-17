import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api, { getErrorMessage } from '../services/api'
import type { Cliente, Pedido, StatusPedido } from '../types'
import { formatDate, formatMoney, pedidoTotal } from '../utils/calculations'
import { Empty, ErrorBox, Loading } from '../components/States'

export default function Orders() {
  const [pedidos, setPedidos] = useState<Pedido[]>([])
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [status, setStatus] = useState<'todos' | StatusPedido>('todos')
  const [faixa, setFaixa] = useState('todos')
  const [ordem, setOrdem] = useState('data-desc')
  const [loading, setLoading] = useState(true); const [error, setError] = useState('')

  const load = async () => { setLoading(true); setError(''); try {
    const [pr, cr] = await Promise.all([api.get('/pedidos'), api.get('/clientes?limit=100')])
    setPedidos(pr.data.pedidos ?? pr.data ?? []); setClientes(cr.data.clientes ?? cr.data ?? [])
  } catch (err) { setError(getErrorMessage(err)) } finally { setLoading(false) } }
  useEffect(() => { void load() }, [])

  let filtrados = pedidos.filter(p => status === 'todos' || p.status === status).filter(p => {
    const total = pedidoTotal(p)
    if (faixa === 'baixo') return total < 500
    if (faixa === 'medio') return total >= 500 && total <= 2000
    if (faixa === 'alto') return total > 2000
    return true
  }).sort((a,b) => {
    if (ordem === 'total-desc') return pedidoTotal(b) - pedidoTotal(a)
    if (ordem === 'total-asc') return pedidoTotal(a) - pedidoTotal(b)
    const aDate = new Date(a.createdAt || a.data || 0).getTime(), bDate = new Date(b.createdAt || b.data || 0).getTime()
    return ordem === 'data-asc' ? aDate-bDate : bDate-aDate
  })

  if (loading) return <Loading text="Carregando pedidos..." />
  if (error) return <ErrorBox message={error} onRetry={load} />
  return <><header className="page-header"><div><small>Comercial</small><h1>Todos os pedidos</h1></div></header>
    <div className="filters">
      <label htmlFor="status-filter">Status<select id="status-filter" name="status" value={status} onChange={e=>setStatus(e.target.value as 'todos' | StatusPedido)}><option value="todos">Todos</option><option value="aberto">Aberto</option><option value="pago">Pago</option><option value="cancelado">Cancelado</option></select></label>
      <label htmlFor="value-filter">Faixa de valor<select id="value-filter" name="faixaValor" value={faixa} onChange={e=>setFaixa(e.target.value)}><option value="todos">Todas</option><option value="baixo">Até R$ 500</option><option value="medio">R$ 500 a R$ 2.000</option><option value="alto">Acima de R$ 2.000</option></select></label>
      <label htmlFor="order-filter">Ordenar<select id="order-filter" name="ordenacao" value={ordem} onChange={e=>setOrdem(e.target.value)}><option value="data-desc">Data: mais recente</option><option value="data-asc">Data: mais antiga</option><option value="total-desc">Maior total</option><option value="total-asc">Menor total</option></select></label>
    </div>
    {filtrados.length === 0 ? <Empty text="Nenhum pedido corresponde aos filtros." /> : <div className="table-wrap"><table><thead><tr><th>Cliente</th><th>Data</th><th>Status</th><th>Total</th></tr></thead><tbody>{filtrados.map(p => { const cliente=clientes.find(c=>String(c.id)===String(p.clienteId)); return <tr key={p.id}><td><Link to={`/clientes/${p.clienteId}`}>{cliente?.nome || `Cliente ${p.clienteId}`}</Link></td><td>{formatDate(p.createdAt || p.data)}</td><td><span className={`badge ${p.status}`}>{p.status}</span></td><td>{formatMoney(pedidoTotal(p))}</td></tr>})}</tbody></table></div>}
  </>
}
