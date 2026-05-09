'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { format, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { ArrowLeft, Calendar, Clock, MoreVertical, Pencil, Trash2, Phone, Loader2 } from 'lucide-react'
import { useStore } from '@/lib/store'
import { ClientAvatar } from '@/components/client-avatar'
import { StatusBadge } from '@/components/status-badge'
import { EmptyState } from '@/components/empty-state'
import { Modal } from '@/components/modal'
import { useToast } from '@/components/toast'
import { SERVICOS } from '@/lib/types'
import { cn } from '@/lib/utils'

export default function ClientProfilePage() {
  const params = useParams()
  const router = useRouter()
  const { clientes, agendamentos, updateCliente, deleteCliente, loading } = useStore()
  const { showToast } = useToast()
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [showMenu, setShowMenu] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const clienteId = Number(params.id)
  const cliente = clientes.find(c => c.id === clienteId)
  
  const clienteAgendamentos = useMemo(() => {
    if (!cliente) return []
    return agendamentos
      .filter(a => a.cliente_id === cliente.id)
      .sort((a, b) => b.inicio.localeCompare(a.inicio))
  }, [agendamentos, cliente])

  const [formData, setFormData] = useState({
    nome: cliente?.nome || '',
    telefone: cliente?.telefone || '',
  })

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-[var(--accent)] animate-spin" />
      </div>
    )
  }

  if (!cliente) {
    return (
      <div className="p-4 lg:p-8">
        <EmptyState
          icon={Calendar}
          title="Cliente não encontrado"
          description="Este cliente não existe ou foi removido."
          action={{
            label: 'Voltar para Clientes',
            onClick: () => router.push('/clientes')
          }}
        />
      </div>
    )
  }

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      const dados: { nome?: string; telefone?: string } = {}
      if (formData.nome.trim() !== cliente.nome) dados.nome = formData.nome.trim()
      if (formData.telefone.replace(/\D/g, '') !== cliente.telefone) dados.telefone = formData.telefone.replace(/\D/g, '')
      
      if (Object.keys(dados).length > 0) {
        await updateCliente(cliente.id, dados)
      }
      setIsEditModalOpen(false)
      showToast('success', 'Cliente atualizado com sucesso!')
    } catch (err: unknown) {
      showToast('error', err instanceof Error ? err.message : 'Erro ao atualizar cliente')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async () => {
    setIsSubmitting(true)
    try {
      await deleteCliente(cliente.id)
      showToast('success', 'Cliente deletado com sucesso!')
      router.push('/clientes')
    } catch (err: unknown) {
      showToast('error', err instanceof Error ? err.message : 'Erro ao deletar cliente')
    } finally {
      setIsSubmitting(false)
      setIsDeleteModalOpen(false)
    }
  }

  return (
    <div className="p-4 lg:p-8 max-w-4xl mx-auto">
      {/* Back Button */}
      <Link
        href="/clientes"
        className="inline-flex items-center gap-2 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Voltar para clientes
      </Link>

      {/* Profile Header */}
      <div className="bg-[var(--bg-card)] rounded-xl border border-[var(--border)] p-6 mb-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <ClientAvatar name={cliente.nome} size="xl" />
            <div>
              <h1 className="text-xl lg:text-2xl font-bold text-[var(--text-primary)] tracking-tight">
                {cliente.nome}
              </h1>
              <div className="flex items-center gap-2 mt-2">
                <a 
                  href={`tel:${cliente.telefone}`}
                  className="flex items-center gap-1.5 text-sm text-[var(--text-secondary)] hover:text-[var(--accent)] transition-colors"
                >
                  <Phone className="w-4 h-4" />
                  {cliente.telefone}
                </a>
              </div>
            </div>
          </div>
          
          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-[var(--bg-secondary)] transition-colors"
            >
              <MoreVertical className="w-5 h-5 text-[var(--text-secondary)]" />
            </button>
            
            {showMenu && (
              <>
                <div 
                  className="fixed inset-0 z-10" 
                  onClick={() => setShowMenu(false)} 
                />
                <div className="absolute right-0 top-full mt-2 w-48 bg-[var(--bg-primary)] rounded-xl border border-[var(--border)] shadow-lg z-20 overflow-hidden">
                  <button
                    onClick={() => {
                      setShowMenu(false)
                      setFormData({ nome: cliente.nome, telefone: cliente.telefone })
                      setIsEditModalOpen(true)
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 text-sm text-[var(--text-primary)] hover:bg-[var(--bg-secondary)] transition-colors"
                  >
                    <Pencil className="w-4 h-4" />
                    Editar cliente
                  </button>
                  <button
                    onClick={() => {
                      setShowMenu(false)
                      setIsDeleteModalOpen(true)
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 text-sm text-[var(--danger)] hover:bg-[var(--bg-secondary)] transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                    Deletar cliente
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 mt-6 pt-6 border-t border-[var(--border)]">
          <div className="text-center">
            <p className="text-2xl font-bold text-[var(--text-primary)]">
              {clienteAgendamentos.length}
            </p>
            <p className="text-xs text-[var(--text-muted)] mt-1">Total de agendamentos</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-[var(--text-primary)]">
              {clienteAgendamentos.filter(a => a.status === 'concluido').length}
            </p>
            <p className="text-xs text-[var(--text-muted)] mt-1">Concluídos</p>
          </div>
        </div>
      </div>

      {/* Appointment History */}
      <div className="mb-6">
        <h2 className="text-lg font-bold text-[var(--text-primary)] tracking-tight mb-4">
          Histórico de Agendamentos
        </h2>

        {clienteAgendamentos.length > 0 ? (
          <div className="space-y-3">
            {clienteAgendamentos.map((appointment) => {
              const servico = SERVICOS[appointment.servico]
              const inicio = parseISO(appointment.inicio)
              return (
                <div
                  key={appointment.id}
                  className="flex items-center gap-4 p-4 bg-[var(--bg-card)] rounded-xl border border-[var(--border)]"
                >
                <div className="w-12 text-center">
                  <p className="text-xs text-[var(--text-muted)]">
                    {format(inicio, 'MMM', { locale: ptBR }).toUpperCase()}
                  </p>
                  <p className="text-xl font-bold text-[var(--text-primary)]">
                    {format(inicio, 'd')}
                  </p>
                </div>
                
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-[var(--text-primary)]">
                    {servico?.label || appointment.servico}
                  </p>
                  <p className="text-xs text-[var(--text-muted)]">
                    <span className="font-mono">{format(inicio, 'HH:mm')}</span>
                    {' • '}
                    {servico?.duracao} min
                  </p>
                </div>
                
                <StatusBadge status={appointment.status} />
              </div>
              )
            })}
          </div>
        ) : (
          <EmptyState
            icon={Clock}
            title="Nenhum histórico"
            description="Este cliente ainda não teve agendamentos."
          />
        )}
      </div>

      {/* Fixed Action Button */}
      <div className="fixed bottom-24 lg:bottom-8 left-4 right-4 lg:left-auto lg:right-8 lg:w-auto">
        <Link
          href={`/novo-agendamento?clienteId=${cliente.id}`}
          className="flex items-center justify-center gap-2 w-full lg:w-auto px-6 py-3 bg-[var(--accent)] text-white font-medium rounded-xl shadow-lg hover:bg-[var(--accent-hover)] active:scale-[0.97] transition-all duration-200"
        >
          <Calendar className="w-5 h-5" />
          Novo agendamento para {cliente.nome.split(' ')[0]}
        </Link>
      </div>

      {/* Edit Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Editar Cliente"
      >
        <form onSubmit={handleUpdate} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[var(--text-primary)] mb-1.5">
              Nome completo
            </label>
            <input
              type="text"
              value={formData.nome}
              onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
              className="w-full px-4 py-2.5 bg-[var(--bg-primary)] border border-[var(--border)] rounded-lg text-sm text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:ring-offset-2 transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--text-primary)] mb-1.5">
              Telefone/WhatsApp
            </label>
            <input
              type="tel"
              value={formData.telefone}
              onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
              className="w-full px-4 py-2.5 bg-[var(--bg-primary)] border border-[var(--border)] rounded-lg text-sm text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:ring-offset-2 transition-all"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={() => setIsEditModalOpen(false)}
              className="flex-1 px-4 py-2.5 text-sm font-medium text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)] rounded-lg transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className={cn(
                "flex-1 px-4 py-2.5 bg-[var(--accent)] text-white font-medium text-sm rounded-lg hover:bg-[var(--accent-hover)] active:scale-[0.97] transition-all duration-200",
                isSubmitting && "opacity-70 cursor-not-allowed"
              )}
            >
              {isSubmitting ? 'Salvando...' : 'Salvar'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Deletar Cliente"
      >
        <div className="space-y-4">
          <p className="text-sm text-[var(--text-secondary)]">
            Tem certeza que deseja deletar <strong>{cliente.nome}</strong>? 
            Esta ação não pode ser desfeita e todos os agendamentos associados serão afetados.
          </p>
          <div className="flex gap-3 pt-2">
            <button
              onClick={() => setIsDeleteModalOpen(false)}
              className="flex-1 px-4 py-2.5 text-sm font-medium text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)] rounded-lg transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleDelete}
              disabled={isSubmitting}
              className={cn(
                "flex-1 px-4 py-2.5 bg-red-600 text-white font-medium text-sm rounded-lg hover:bg-red-700 active:scale-[0.97] transition-all duration-200",
                isSubmitting && "opacity-70 cursor-not-allowed"
              )}
            >
              {isSubmitting ? 'Deletando...' : 'Deletar'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
