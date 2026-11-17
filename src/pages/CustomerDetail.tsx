import { useEffect, useState, type FormEvent } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import api, { getErrorMessage } from '../services/api'
import type { Atendimento, Canal, Cliente, ItemPedido, Pedido, StatusPedido } from '../types'
import { formatDate, formatMoney, pedidoTotal, seloCliente } from '../utils/calculations'
import { Empty, ErrorBox, Loading } from '../components/States'

export default function CustomerDetail() {
  const { id } = useParams(); const navigate = useNavigate()
  const [cliente, setCliente] = useState<Cliente | null>(null)
  const [pedidos, setPedidos] = useState<Pedido[]>([])
  const [atendimentos, setAtendimentos] = useState<Atendimento[]>([])
  const [loading, setLoading] = useState(true); const [error, setError] = useState('')
  const [notFound, setNotFound] = useState(false)
  const [pedidoForm, setPedidoForm] = useState(false)
  const [itens, setItens] = useState<ItemPedido[]>([{ titulo: '', preco: 0, quantidade: 1 }])
  const [editPedidoId, setEditPedidoId] = useState<string | number | null>(null)
  const [editItens, setEditItens] = useState<ItemPedido[]>([])
  const [atendForm, setAtendForm] = useState(false)
  const [atend, setAtend] = useState({ titulo: '', texto: '', canal: 'telefone' as Canal })
  const [editAtend, setEditAtend] = useState<string | number | null>(null)
  const [canalFilter, setCanalFilter] = useState<'todos' | Canal>('todos')

  const load = async () => {
    setLoading(true); setError(''); setNotFound(false)
    try {
      const [cr, pr, ar] = await Promise.all([api.get(`/clientes/${id}`), api.get(`/clientes/${id}/pedidos`), api.get(`/clientes/${id}/atendimentos`)])
      setCliente(cr.data); setPedidos(pr.data.pedidos ?? pr.data ?? []); setAtendimentos((ar.data.atendimentos ?? ar.data ?? []).sort((a: Atendimento,b: Atendimento) => new Date(b.createdAt || b.data || 0).getTime() - new Date(a.createdAt || a.data || 0).getTime()))
    } catch (err) {
      if ((err as { response?: { status?: number } }).response?.status === 404) setNotFound(true)
      setError(getErrorMessage(err))
    } finally { setLoading(false) }
  }
  useEffect(() => { void load() }, [id])

  const excluirCliente = async () => {
    if (!window.confirm(`Excluir este cliente apagará ${pedidos.length} pedido(s) e ${atendimentos.length} atendimento(s). Confirmar?`)) return
    try { await api.delete(`/clientes/${id}`); navigate('/clientes') } catch (err) { setError(getErrorMessage(err)) }
  }

  const criarPedido = async (e: FormEvent) => {
    e.preventDefault()
    if (itens.some(i => !i.titulo.trim() || i.preco < 0 || !Number.isInteger(i.quantidade) || i.quantidade < 1)) { setError('Confira título, preço e quantidade dos itens.'); return }
    try { await api.post(`/clientes/${id}/pedidos`, { itens }); setPedidoForm(false); setItens([{titulo:'',preco:0,quantidade:1}]); await load() } catch (err) { setError(getErrorMessage(err)) }
  }
  const abrirEdicaoItens = (pedido: Pedido) => {
    setEditPedidoId(pedido.id)
    setEditItens(pedido.itens.map(item => ({ titulo: item.titulo, preco: item.preco, quantidade: item.quantidade })))
  }

  const salvarItens = async (e: FormEvent) => {
    e.preventDefault()
    if (!editPedidoId) return
    if (editItens.length === 0 || editItens.some(i => !i.titulo.trim() || i.preco < 0 || !Number.isInteger(i.quantidade) || i.quantidade < 1)) {
      setError('Confira os itens: título preenchido, preço válido e quantidade inteira maior que zero.')
      return
    }
    try {
      await api.patch(`/pedidos/${editPedidoId}`, { itens: editItens })
      setEditPedidoId(null); setEditItens([]); await load()
    } catch (err) { setError(getErrorMessage(err)) }
  }
  const mudarStatus = async (pedido: Pedido, status: StatusPedido) => {
    try { await api.patch(`/pedidos/${pedido.id}`, { status }); await load() } catch (err) { setError(getErrorMessage(err)) }
  }
  const excluirPedido = async (pedido: Pedido) => {
    if (!window.confirm('Excluir este pedido?')) return
    try { await api.delete(`/pedidos/${pedido.id}`); await load() } catch (err) { setError(getErrorMessage(err)) }
  }
  const salvarAtendimento = async (e: FormEvent) => {
    e.preventDefault()
    if (!atend.titulo.trim() || !atend.texto.trim()) { setError('Preencha título e texto.'); return }
    try {
      if (editAtend) await api.patch(`/atendimentos/${editAtend}`, atend)
      else await api.post(`/clientes/${id}/atendimentos`, atend)
      setAtendForm(false); setEditAtend(null); setAtend({titulo:'',texto:'',canal:'telefone'}); await load()
    } catch (err) { setError(getErrorMessage(err)) }
  }
  const editarAtendimento = (a: Atendimento) => { setEditAtend(a.id); setAtend({titulo:a.titulo,texto:a.texto,canal:a.canal}); setAtendForm(true) }
  const excluirAtendimento = async (a: Atendimento) => {
    if (!window.confirm('Excluir este atendimento?')) return
    try { await api.delete(`/atendimentos/${a.id}`); await load() } catch (err) { setError(getErrorMessage(err)) }
  }

  if (loading) return <Loading />
  if (notFound) return <><h1>Cliente não encontrado</h1><Link className="button" to="/clientes">Voltar aos clientes</Link></>
  if (error && !cliente) return <ErrorBox message={error} />
  if (!cliente) return <><h1>Cliente não encontrado</h1><Link className="button" to="/clientes">Voltar aos clientes</Link></>
  const filtered = atendimentos.filter(a => canalFilter === 'todos' || a.canal === canalFilter)

  return <>
    <header className="page-header"><div><small>Detalhe do cliente</small><h1>{cliente.nome}</h1></div><div className="actions"><Link className="button" to={`/clientes/${id}/editar`}>Editar</Link><button className="button danger" onClick={excluirCliente}>Excluir</button></div></header>
    {error && <ErrorBox message={error} />}
    <article className="card profile"><span className="avatar large">{cliente.nome.charAt(0).toUpperCase()}</span><div><strong>{cliente.email}</strong><p>{[cliente.telefone, cliente.empresa, cliente.cidade].filter(Boolean).join(' · ') || 'Sem dados adicionais'}</p></div><span className="badge seal">{seloCliente(pedidos)}</span></article>

    <section className="detail-section"><div className="section-title"><h2>Pedidos</h2><button className="button primary" onClick={() => setPedidoForm(v => !v)}>+ Novo pedido</button></div>
      {pedidoForm && <form className="card form compact" onSubmit={criarPedido}><h3>Novo pedido</h3>{itens.map((item,i) => <div className="form-grid item-grid" key={i}><input placeholder="Título" value={item.titulo} onChange={e => setItens(itens.map((x,j) => j===i ? {...x,titulo:e.target.value}:x))}/><input type="number" min="0" step="0.01" placeholder="Preço" value={item.preco} onChange={e => setItens(itens.map((x,j) => j===i ? {...x,preco:Number(e.target.value)}:x))}/><input type="number" min="1" placeholder="Qtd." value={item.quantidade} onChange={e => setItens(itens.map((x,j) => j===i ? {...x,quantidade:Number(e.target.value)}:x))}/></div>)}<button type="button" className="button" onClick={() => setItens([...itens,{titulo:'',preco:0,quantidade:1}])}>Adicionar item</button><div className="actions"><button type="button" className="button" onClick={() => setPedidoForm(false)}>Cancelar</button><button className="button primary">Criar pedido</button></div></form>}
      {editPedidoId && <form className="card form compact" onSubmit={salvarItens}><h3>Editar itens do pedido</h3>{editItens.map((item,i) => <div className="form-grid item-grid" key={i}><input placeholder="Título" value={item.titulo} onChange={e => setEditItens(editItens.map((x,j) => j===i ? {...x,titulo:e.target.value}:x))}/><input type="number" min="0" step="0.01" placeholder="Preço" value={item.preco} onChange={e => setEditItens(editItens.map((x,j) => j===i ? {...x,preco:Number(e.target.value)}:x))}/><input type="number" min="1" placeholder="Qtd." value={item.quantidade} onChange={e => setEditItens(editItens.map((x,j) => j===i ? {...x,quantidade:Number(e.target.value)}:x))}/></div>)}<button type="button" className="button" onClick={() => setEditItens([...editItens,{titulo:'',preco:0,quantidade:1}])}>Adicionar item</button><div className="actions"><button type="button" className="button" onClick={() => {setEditPedidoId(null);setEditItens([])}}>Cancelar</button><button className="button primary">Salvar itens</button></div></form>}
      {pedidos.length === 0 ? <Empty text="Este cliente ainda não tem pedidos." /> : <div className="table-wrap"><table><thead><tr><th>Data</th><th>Status</th><th>Total</th><th>Ações</th></tr></thead><tbody>{pedidos.map(p => <tr key={p.id}><td>{formatDate(p.createdAt || p.data)}</td><td><span className={`badge ${p.status}`}>{p.status}</span></td><td>{formatMoney(pedidoTotal(p))}</td><td className="row-actions">{p.status === 'aberto' && <><button className="button small" onClick={() => abrirEdicaoItens(p)}>Editar itens</button><button className="button small success-soft" onClick={() => mudarStatus(p,'pago')}>Pago</button><button className="button small danger-soft" onClick={() => mudarStatus(p,'cancelado')}>Cancelar</button></>}{p.status === 'pago' && <button className="button small danger-soft" onClick={() => mudarStatus(p,'cancelado')}>Cancelar</button>}<button className="button small danger" onClick={() => excluirPedido(p)}>Excluir</button></td></tr>)}</tbody></table></div>}
    </section>

    <section className="detail-section"><div className="section-title"><h2>Histórico de atendimento</h2><button className="button primary" onClick={() => { setEditAtend(null); setAtend({titulo:'',texto:'',canal:'telefone'}); setAtendForm(v=>!v) }}>+ Novo atendimento</button></div>
      <div className="filter-row"><label htmlFor="channel-filter">Filtrar por canal<select id="channel-filter" name="channelFilter" value={canalFilter} onChange={e => setCanalFilter(e.target.value as 'todos' | Canal)}><option value="todos">Todos</option><option value="telefone">Telefone</option><option value="email">E-mail</option><option value="whatsapp">WhatsApp</option><option value="presencial">Presencial</option></select></label><strong>{filtered.length} atendimento(s)</strong></div>
      {atendForm && <form className="card form compact" onSubmit={salvarAtendimento}><div className="form-grid"><label htmlFor="attendance-title">Título<input id="attendance-title" name="titulo" value={atend.titulo} onChange={e=>setAtend({...atend,titulo:e.target.value})}/></label><label htmlFor="attendance-channel">Canal<select id="attendance-channel" name="canal" value={atend.canal} onChange={e=>setAtend({...atend,canal:e.target.value as Canal})}><option value="telefone">Telefone</option><option value="email">E-mail</option><option value="whatsapp">WhatsApp</option><option value="presencial">Presencial</option></select></label></div><label htmlFor="attendance-text">Texto<textarea id="attendance-text" name="texto" value={atend.texto} onChange={e=>setAtend({...atend,texto:e.target.value})}/></label><div className="actions"><button type="button" className="button" onClick={()=>setAtendForm(false)}>Cancelar</button><button className="button primary">Salvar</button></div></form>}
      {filtered.length === 0 ? <Empty text="Nenhum atendimento neste canal." /> : <div className="timeline">{filtered.map(a => <article key={a.id}><div><span className="badge seal">{a.canal}</span><small>{formatDate(a.createdAt || a.data)}</small></div><h3>{a.titulo}</h3><p>{a.texto}</p><div className="actions"><button className="button small" onClick={()=>editarAtendimento(a)}>Editar</button><button className="button small danger" onClick={()=>excluirAtendimento(a)}>Excluir</button></div></article>)}</div>}
    </section>
  </>
}
