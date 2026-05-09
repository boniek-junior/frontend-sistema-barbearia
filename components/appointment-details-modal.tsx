'use client'

import { useState } from 'react'
import { format, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { 
  Calendar, 
  Clock, 
  User, 
  Scissors, 
  Trash2, 
  CheckCircle2, 
  AlertCircle,
  XCircle,
  Loader2
} from 'lucide-react'
import { Modal } from './modal'
import { useStore } from '@/lib/store'
import { useToast } from './toast'
import { Agendamento, SERVICOS, AppointmentStatus } from '@/lib/types'
import { StatusBadge } from './status-badge'
import { cn } from '@/lib/utils'

interface AppointmentDetailsModalProps {
  appointment: Agendamento | null
  isOpen: boolean
  onClose: () => void
}

export function AppointmentDetailsModal({ appointment, isOpen, onClose }: AppointmentDetailsModalProps) {
  const { updateAgendamentoStatus, deleteAgendamento } = useStore()
  const { showToast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)

  if (!appointment) return null

  const servico = SERVICOS[appointment.servico]
  const dataInicio = parseISO(appointment.inicio)

  const handleUpdateStatus = async (newStatus: AppointmentStatus) => {
    setIsSubmitting(true)
    try {
      await updateAgendamentoStatus(appointment.id, newStatus)
      showToast('success', `Status atualizado para ${newStatus}`)
      onClose()
    } catch (err: unknown) {
      showToast('error', err instanceof Error ? err.message : 'Erro ao atualizar status')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('Tem certeza que deseja excluir este agendamento?')) return
    
    setIsSubmitting(true)
    try {
      await deleteAgendamento(appointment.id)
      showToast('success', 'Agendamento excluído com sucesso')
      onClose()
    } catch (err: unknown) {
      showToast('error', err instanceof Error ? err.message : 'Erro ao excluir agendamento')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Detalhes do Agendamento">
      <div className="space-y-6">
        {/* Info Cards */}
        <div className="grid grid-cols-1 gap-4">
          <div className="flex items-center gap-4 p-4 bg-[var(--bg-secondary)] rounded-xl">
            <div className="w-10 h-10 rounded-full bg-[var(--accent)] flex items-center justify-center text-white">
              <User className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-[var(--text-muted)]">Cliente</p>
              <p className="text-sm font-medium text-[var(--text-primary)]">{appointment.cliente.nome}</p>
              <p className="text-xs text-[var(--text-muted)]">{appointment.cliente.telefone}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-[var(--bg-secondary)] rounded-xl">
              <div className="flex items-center gap-2 mb-2 text-[var(--accent)]">
                <Scissors className="w-4 h-4" />
                <span className="text-xs font-medium">Serviço</span>
              </div>
              <p className="text-sm font-semibold text-[var(--text-primary)]">
                {servico?.label || appointment.servico}
              </p>
              <p className="text-xs text-[var(--text-muted)]">{servico?.duracao} min</p>
            </div>

            <div className="p-4 bg-[var(--bg-secondary)] rounded-xl">
              <div className="flex items-center gap-2 mb-2 text-[var(--accent)]">
                <Calendar className="w-4 h-4" />
                <span className="text-xs font-medium">Data/Hora</span>
              </div>
              <p className="text-sm font-semibold text-[var(--text-primary)]">
                {format(dataInicio, 'dd/MM/yy')}
              </p>
              <p className="text-xs font-bold font-mono text-[var(--text-primary)]">
                {format(dataInicio, 'HH:mm')}
              </p>
            </div>
          </div>
        </div>

        {/* Current Status */}
        <div className="flex items-center justify-between p-4 border border-[var(--border)] rounded-xl">
          <span className="text-sm text-[var(--text-secondary)]">Status Atual</span>
          <StatusBadge status={appointment.status} />
        </div>

        {/* Actions */}
        <div className="space-y-3 pt-2">
          <p className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider">
            Alterar Status
          </p>
          
          <div className="grid grid-cols-2 gap-2">
            {appointment.status === 'pendente' && (
              <button
                onClick={() => handleUpdateStatus('confirmado')}
                disabled={isSubmitting}
                className="flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                Confirmar
              </button>
            )}
            
            {appointment.status !== 'concluido' && appointment.status !== 'cancelado' && (
              <button
                onClick={() => handleUpdateStatus('concluido')}
                disabled={isSubmitting}
                className="flex items-center justify-center gap-2 px-4 py-2.5 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
              >
                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                Concluir
              </button>
            )}

            {appointment.status !== 'cancelado' && appointment.status !== 'concluido' && (
              <button
                onClick={() => handleUpdateStatus('cancelado')}
                disabled={isSubmitting}
                className="flex items-center justify-center gap-2 px-4 py-2.5 bg-red-100 text-red-600 text-sm font-medium rounded-lg hover:bg-red-200 transition-colors disabled:opacity-50"
              >
                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4" />}
                Cancelar
              </button>
            )}
          </div>

          <button
            onClick={handleDelete}
            disabled={isSubmitting}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-red-600 text-sm font-medium border border-red-200 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50"
          >
            <Trash2 className="w-4 h-4" />
            Excluir Agendamento
          </button>
        </div>
      </div>
    </Modal>
  )
}
