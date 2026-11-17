import type { Cliente, Pedido } from '../types'

export const pedidoTotal = (pedido: Pedido) =>
  (pedido.itens ?? []).reduce((total, item) => total + Number(item.preco) * Number(item.quantidade), 0)

export const totalComprado = (pedidos: Pedido[]) =>
  pedidos.filter(p => p.status !== 'cancelado').reduce((total, p) => total + pedidoTotal(p), 0)

export const seloCliente = (pedidos: Pedido[]) => {
  const validos = pedidos.filter(p => p.status !== 'cancelado')
  if (validos.length === 0) return 'Sem compras'
  return totalComprado(pedidos) >= 2000 ? 'VIP' : 'Regular'
}

export const topClientes = (clientes: Cliente[], pedidos: Pedido[]) =>
  clientes.map(cliente => ({
    cliente,
    total: totalComprado(pedidos.filter(p => String(p.clienteId) === String(cliente.id))),
  })).sort((a, b) => b.total - a.total).slice(0, 3)

export const formatMoney = (value: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)

export const formatDate = (value?: string) => {
  if (!value) return '-'
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    const [year, month, day] = value.split('-').map(Number)
    return new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short' }).format(new Date(year, month - 1, day))
  }
  return new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'short' }).format(new Date(value))
}
