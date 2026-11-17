export type Cliente = {
  id: number | string
  nome: string
  email: string
  telefone?: string
  empresa?: string
  cidade?: string
  createdAt?: string
}
export type ItemPedido = { titulo: string; preco: number; quantidade: number }
export type StatusPedido = 'aberto' | 'pago' | 'cancelado'
export type Pedido = {
  id: number | string
  clienteId: number | string
  itens: ItemPedido[]
  status: StatusPedido
  createdAt?: string
  data?: string
  cliente?: Cliente
}
export type Canal = 'telefone' | 'email' | 'whatsapp' | 'presencial'
export type Atendimento = {
  id: number | string
  clienteId: number | string
  titulo: string
  texto: string
  canal: Canal
  createdAt?: string
  data?: string
}
export type Usuario = { id?: number | string; username?: string; nome?: string }
