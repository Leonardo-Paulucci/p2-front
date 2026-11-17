import axios, { type AxiosError } from 'axios'

const api = axios.create({ baseURL: import.meta.env.VITE_API_URL })

api.interceptors.request.use(config => {
  const token = localStorage.getItem('crm_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      localStorage.removeItem('crm_token')
      window.dispatchEvent(new Event('crm:unauthorized'))
    }
    return Promise.reject(error)
  },
)

export const getErrorMessage = (error: unknown, fallback = 'Não foi possível concluir a operação.') => {
  const err = error as AxiosError<{ message?: string }>
  const status = err.response?.status
  if (status === 400) return err.response?.data?.message || 'Dados inválidos. Confira os campos.'
  if (status === 401) return 'Sessão expirada. Entre novamente.'
  if (status === 404) return err.response?.data?.message || 'Registro não encontrado.'
  if (status === 409) return err.response?.data?.message || 'Este e-mail já está cadastrado.'
  if (status === 500) return err.response?.data?.message || 'Erro no servidor. Tente novamente.'
  if (!err.response) return 'Sem conexão com o servidor.'
  return err.response?.data?.message || fallback
}

export default api
