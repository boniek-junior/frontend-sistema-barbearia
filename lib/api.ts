import { Cliente, Agendamento, AppointmentStatus, TipoServico } from './types'
import { getToken, logout } from './auth'

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'

// ─── Helper ────────────────────────────────────────────────────────────────────

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const token = getToken()

  const res = await fetch(`${API_BASE}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options?.headers,
    },
    ...options,
  })

  // Sessao expirada ou nao autenticado: desloga e volta pro login
  if (res.status === 401) {
    logout()
    throw new Error('Sessao expirada, faca login novamente')
  }

  // DELETE retorna 204 sem body
  if (res.status === 204) return undefined as unknown as T

  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(body.detail || `Erro ${res.status}`)
  }

  return res.json()
}

// ─── Clientes ──────────────────────────────────────────────────────────────────

export const clientesApi = {
  listar: () =>
    request<Cliente[]>('/clientes/'),

  obter: (id: number) =>
    request<Cliente>(`/clientes/${id}`),

  criar: (dados: { nome: string; telefone: string }) =>
    request<Cliente>('/clientes/', {
      method: 'POST',
      body: JSON.stringify(dados),
    }),

  atualizar: (id: number, dados: { nome?: string; telefone?: string }) =>
    request<Cliente>(`/clientes/${id}`, {
      method: 'PUT',
      body: JSON.stringify(dados),
    }),

  deletar: (id: number) =>
    request<void>(`/clientes/${id}`, { method: 'DELETE' }),
}

// ─── Agendamentos ──────────────────────────────────────────────────────────────

export const agendamentosApi = {
  listar: (params?: { data?: string; skip?: number; limit?: number }) => {
    const query = new URLSearchParams()
    if (params?.data) query.set('data', params.data)
    if (params?.skip !== undefined) query.set('skip', String(params.skip))
    if (params?.limit !== undefined) query.set('limit', String(params.limit))
    const qs = query.toString()
    return request<Agendamento[]>(`/agendamentos/${qs ? `?${qs}` : ''}`)
  },

  buscar: (id: number) =>
    request<Agendamento>(`/agendamentos/${id}`),

  criar: (dados: { cliente_id: number; inicio: string; servico: TipoServico }) =>
    request<Agendamento>('/agendamentos/', {
      method: 'POST',
      body: JSON.stringify(dados),
    }),

  atualizarStatus: (id: number, status: AppointmentStatus) =>
    request<Agendamento>(`/agendamentos/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    }),

  deletar: (id: number) =>
    request<void>(`/agendamentos/${id}`, { method: 'DELETE' }),
}
