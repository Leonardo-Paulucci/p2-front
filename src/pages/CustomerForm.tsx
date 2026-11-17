import { useEffect, useState, type FormEvent } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import api, { getErrorMessage } from '../services/api'
import { Loading, ErrorBox } from '../components/States'

export default function CustomerForm() {
  const { id } = useParams(); const editing = Boolean(id)
  const navigate = useNavigate()
  const [form, setForm] = useState({ nome: '', email: '', telefone: '', empresa: '', cidade: '' })
  const [loading, setLoading] = useState(editing); const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => { if (!editing) return
    api.get(`/clientes/${id}`).then(res => setForm({ nome: res.data.nome ?? '', email: res.data.email ?? '', telefone: res.data.telefone ?? '', empresa: res.data.empresa ?? '', cidade: res.data.cidade ?? '' })).catch(err => setError(getErrorMessage(err))).finally(() => setLoading(false))
  }, [id, editing])

  const submit = async (e: FormEvent) => {
    e.preventDefault(); setError('')
    if (!form.nome.trim()) return setError('Informe o nome.')
    if (!/^\S+@\S+\.\S+$/.test(form.email)) return setError('Informe um e-mail válido.')
    const opcionais = [form.telefone, form.empresa, form.cidade].filter(v => v.trim()).length
    if (opcionais < 2) return setError('Preencha pelo menos 2 entre telefone, empresa e cidade.')
    setSaving(true)
    try {
      if (editing) { await api.patch(`/clientes/${id}`, form); navigate(`/clientes/${id}`) }
      else { const res = await api.post('/clientes', form); navigate(`/clientes/${res.data.id}`) }
    } catch (err) { setError(getErrorMessage(err)) } finally { setSaving(false) }
  }
  if (loading) return <Loading />
  return <><header className="page-header"><div><small>Cadastro</small><h1>{editing ? 'Editar cliente' : 'Novo cliente'}</h1></div></header>
    {error && <ErrorBox message={error} />}
    <form className="card form" onSubmit={submit}>
      <label htmlFor="customer-name">Nome *<input id="customer-name" name="nome" autoComplete="name" value={form.nome} onChange={e => setForm({...form, nome:e.target.value})} /></label>
      <label htmlFor="customer-email">E-mail *<input id="customer-email" name="email" type="email" autoComplete="email" value={form.email} onChange={e => setForm({...form, email:e.target.value})} /></label>
      <div className="form-grid"><label htmlFor="customer-phone">Telefone<input id="customer-phone" name="telefone" autoComplete="tel" value={form.telefone} onChange={e => setForm({...form, telefone:e.target.value})} /></label><label htmlFor="customer-company">Empresa<input id="customer-company" name="empresa" autoComplete="organization" value={form.empresa} onChange={e => setForm({...form, empresa:e.target.value})} /></label><label htmlFor="customer-city">Cidade<input id="customer-city" name="cidade" autoComplete="address-level2" value={form.cidade} onChange={e => setForm({...form, cidade:e.target.value})} /></label></div>
      <small>* Pelo menos telefone, empresa ou cidade: preencha 2 campos.</small>
      <div className="actions"><button type="button" className="button" onClick={() => navigate(-1)}>Cancelar</button><button className="button primary" disabled={saving}>{saving ? 'Salvando...' : 'Salvar cliente'}</button></div>
    </form>
  </>
}
