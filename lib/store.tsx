'use client'

import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react'
import { Cliente, Agendamento, AppointmentStatus, TipoServico } from './types'
import { clientesApi, agendamentosApi } from './api'

interface StoreContextType {
  // Dados
  clientes: Cliente[]
  agendamentos: Agendamento[]
  loading: boolean
  error: string | null

  // Clientes
  addCliente: (dados: { nome: string; telefone: string }) => Promise<Cliente>
  updateCliente: (id: number, dados: { nome?: string; telefone?: string }) => Promise<void>
  deleteCliente: (id: number) => Promise<void>

  // Agendamentos
  addAgendamento: (dados: { cliente_id: number; inicio: string; servico: TipoServico }) => Promise<Agendamento>
  updateAgendamentoStatus: (id: number, status: AppointmentStatus) => Promise<void>
  deleteAgendamento: (id: number) => Promise<void>

  // Refresh
  refreshClientes: () => Promise<void>
  refreshAgendamentos: () => Promise<void>
}

const StoreContext = createContext<StoreContextType | null>(null)

export function StoreProvider({ children }: { children: ReactNode }) {
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [agendamentos, setAgendamentos] = useState<Agendamento[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // ─── Fetch inicial ─────────────────────────────────────────────────────────

  const refreshClientes = useCallback(async () => {
    try {
      const data = await clientesApi.listar()
      setClientes(data)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar clientes')
    }
  }, [])

  const refreshAgendamentos = useCallback(async () => {
    try {
      const data = await agendamentosApi.listar()
      setAgendamentos(data)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar agendamentos')
    }
  }, [])

  useEffect(() => {
    async function loadAll() {
      setLoading(true)
      setError(null)
      await Promise.all([refreshClientes(), refreshAgendamentos()])
      setLoading(false)
    }
    loadAll()
  }, [refreshClientes, refreshAgendamentos])

  // ─── Clientes ──────────────────────────────────────────────────────────────

  const addCliente = useCallback(async (dados: { nome: string; telefone: string }) => {
    const novoCliente = await clientesApi.criar(dados)
    setClientes(prev => [...prev, novoCliente])
    return novoCliente
  }, [])

  const updateCliente = useCallback(async (id: number, dados: { nome?: string; telefone?: string }) => {
    const atualizado = await clientesApi.atualizar(id, dados)
    setClientes(prev => prev.map(c => c.id === id ? atualizado : c))
  }, [])

  const deleteCliente = useCallback(async (id: number) => {
    await clientesApi.deletar(id)
    setClientes(prev => prev.filter(c => c.id !== id))
  }, [])

  // ─── Agendamentos ──────────────────────────────────────────────────────────

  const addAgendamento = useCallback(async (dados: { cliente_id: number; inicio: string; servico: TipoServico }) => {
    const novo = await agendamentosApi.criar(dados)
    setAgendamentos(prev => [...prev, novo])
    return novo
  }, [])

  const updateAgendamentoStatus = useCallback(async (id: number, status: AppointmentStatus) => {
    const atualizado = await agendamentosApi.atualizarStatus(id, status)
    setAgendamentos(prev => prev.map(a => a.id === id ? atualizado : a))
  }, [])

  const deleteAgendamento = useCallback(async (id: number) => {
    await agendamentosApi.deletar(id)
    setAgendamentos(prev => prev.filter(a => a.id !== id))
  }, [])

  return (
    <StoreContext.Provider value={{
      clientes,
      agendamentos,
      loading,
      error,
      addCliente,
      updateCliente,
      deleteCliente,
      addAgendamento,
      updateAgendamentoStatus,
      deleteAgendamento,
      refreshClientes,
      refreshAgendamentos,
    }}>
      {children}
    </StoreContext.Provider>
  )
}

export function useStore() {
  const context = useContext(StoreContext)
  if (!context) {
    throw new Error('useStore must be used within StoreProvider')
  }
  return context
}
