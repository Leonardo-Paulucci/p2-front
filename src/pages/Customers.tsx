import { useEffect, useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import api, { getErrorMessage } from '../services/api'
import type { Cliente, Pedido } from '../types'
import { seloCliente } from '../utils/calculations'
import { Loading, ErrorBox, Empty } from '../components/States'

export default function Customers() {
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [pedidos, setPedidos] = useState<Pedido[]>([])
  const [q, setQ] = useState(''); const [skip, setSkip] = useState(0)
  const [total, setTotal] = useState(0); const [loading, setLoading] = useState(true); const [error, setError] = useState('')
  const limit = 5
  const load = async () => {
    setLoading(true); setError('')
    try {
      const [cr, pr] = await Promise.all([api.get('/clientes', { params: { q, limit, skip } }), api.get('/pedidos')])
      setClientes(cr.data.clientes ?? []); setTotal(cr.data.total ?? 0)
      setPedidos(pr.data.pedidos ?? pr.data ?? [])
    } catch (err) { setError(getErrorMessage(err)) } finally { setLoading(false) }
  }
  useEffect(() => { void load() }, [skip])
  const search = (e: FormEvent) => { e.preventDefault(); setSkip(0); if (skip === 0) void load() }

  return <>
    <header className="page-header"><div><small>Gestão</small><h1>Clientes</h1></div><Link className="button primary" to="/clientes/novo">+ Novo cliente</Link></header>
    <form className="search" onSubmit={search}><label htmlFor="customer-search" className="sr-only">Buscar clientes</label><input id="customer-search" name="q" autoComplete="off" placeholder="Buscar por nome ou e-mail" value={q} onChange={e => setQ(e.target.value)} /><button className="button">Buscar</button></form>
    {loading ? <Loading /> : error ? <ErrorBox message={error} onRetry={load} /> : clientes.length === 0 ? <Empty text="Nenhum cliente corresponde à busca." /> : <>
      <div className="customer-list">{clientes.map(c => {
        const cp = pedidos.filter(p => String(p.clienteId) === String(c.id))
        return <Link className="customer-row" to={`/clientes/${c.id}`} key={c.id}><span className="avatar">{c.nome.charAt(0).toUpperCase()}</span><div><strong>{c.nome}</strong><small>{c.email}</small></div><span className="badge seal">{seloCliente(cp)}</span><span>›</span></Link>
      })}</div>
      <div className="pagination"><button className="button" disabled={skip === 0} onClick={() => setSkip(Math.max(0, skip - limit))}>Anterior</button><span>{Math.floor(skip / limit) + 1} de {Math.max(1, Math.ceil(total / limit))}</span><button className="button" disabled={skip + limit >= total} onClick={() => setSkip(skip + limit)}>Próxima</button></div>
    </>}
  </>
}
