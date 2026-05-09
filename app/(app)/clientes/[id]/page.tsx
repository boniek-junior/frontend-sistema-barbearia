'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { ArrowLeft, Calendar, Star, Clock, MoreVertical, Pencil, Archive, Phone, Mail } from 'lucide-react'
import { useStore } from '@/lib/store'
import { ClientAvatar } from '@/components/client-avatar'
import { StatusBadge } from '@/components/status-badge'
import { EmptyState } from '@/components/empty-state'
import { Modal } from '@/components/modal'
import { useToast } from '@/components/toast'
import { cn } from '@/lib/utils'

export default function ClientProfilePage() {
  const params = useParams()
  const router = useRouter()
  const { clients, appointments, updateClient } = useStore()
  const { showToast } = useToast()
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [showMenu, setShowMenu] = useState(false)

  const client = clients.find(c => c.id === params.id)
  
  const clientAppointments = useMemo(() => {
    if (!client) return []
    return appointments
      .filter(a => a.clientId === client.id)
      .sort((a, b) => {
        const dateCompare = b.date.localeCompare(a.date)
        if (dateCompare !== 0) return dateCompare
        return b.time.localeCompare(a.time)
      })
  }, [appointments, client])

  const [formData, setFormData] = useState({
    name: client?.name || '',
    phone: client?.phone || '',
    email: client?.email || '',
    birthDate: client?.birthDate || '',
    notes: client?.notes || '',
  })

  if (!client) {
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

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault()
    updateClient(client.id, {
      name: formData.name,
      phone: formData.phone,
      email: formData.email || undefined,
      birthDate: formData.birthDate || undefined,
      notes: formData.notes || undefined,
    })
    setIsEditModalOpen(false)
    showToast('success', 'Cliente atualizado com sucesso!')
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
            <ClientAvatar name={client.name} size="xl" />
            <div>
              <h1 className="text-xl lg:text-2xl font-bold text-[var(--text-primary)] tracking-tight">
                {client.name}
              </h1>
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mt-2">
                <a 
                  href={`tel:${client.phone}`}
                  className="flex items-center gap-1.5 text-sm text-[var(--text-secondary)] hover:text-[var(--accent)] transition-colors"
                >
                  <Phone className="w-4 h-4" />
                  {client.phone}
                </a>
                {client.email && (
                  <a 
                    href={`mailto:${client.email}`}
                    className="flex items-center gap-1.5 text-sm text-[var(--text-secondary)] hover:text-[var(--accent)] transition-colors"
                  >
                    <Mail className="w-4 h-4" />
                    {client.email}
                  </a>
                )}
              </div>
              <p className="text-xs text-[var(--text-muted)] mt-2">
                Cliente desde {format(new Date(client.createdAt), "MMMM 'de' yyyy", { locale: ptBR })}
              </p>
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
                      showToast('info', 'Cliente arquivado')
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 text-sm text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)] transition-colors"
                  >
                    <Archive className="w-4 h-4" />
                    Arquivar cliente
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-[var(--border)]">
          <div className="text-center">
            <p className="text-2xl font-bold text-[var(--text-primary)]">
              {client.totalVisits}
            </p>
            <p className="text-xs text-[var(--text-muted)] mt-1">Total de visitas</p>
          </div>
          <div className="text-center">
            <p className="text-sm font-medium text-[var(--text-primary)]">
              {client.lastVisit 
                ? format(new Date(client.lastVisit), "d 'de' MMM", { locale: ptBR })
                : '—'
              }
            </p>
            <p className="text-xs text-[var(--text-muted)] mt-1">Último atendimento</p>
          </div>
          <div className="text-center">
            <p className="text-sm font-medium text-[var(--text-primary)]">
              {client.favoriteService || '—'}
            </p>
            <p className="text-xs text-[var(--text-muted)] mt-1">Serviço favorito</p>
          </div>
        </div>

        {client.notes && (
          <div className="mt-6 p-4 bg-[var(--bg-secondary)] rounded-lg">
            <p className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wide mb-1">
              Observações
            </p>
            <p className="text-sm text-[var(--text-secondary)]">{client.notes}</p>
          </div>
        )}
      </div>

      {/* Appointment History */}
      <div className="mb-6">
        <h2 className="text-lg font-bold text-[var(--text-primary)] tracking-tight mb-4">
          Histórico de Agendamentos
        </h2>

        {clientAppointments.length > 0 ? (
          <div className="space-y-3">
            {clientAppointments.map((appointment) => (
              <div
                key={appointment.id}
                className="flex items-center gap-4 p-4 bg-[var(--bg-card)] rounded-xl border border-[var(--border)]"
              >
                <div className="w-12 text-center">
                  <p className="text-xs text-[var(--text-muted)]">
                    {format(new Date(appointment.date), 'MMM', { locale: ptBR }).toUpperCase()}
                  </p>
                  <p className="text-xl font-bold text-[var(--text-primary)]">
                    {format(new Date(appointment.date), 'd')}
                  </p>
                </div>
                
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-[var(--text-primary)]">
                    {appointment.service.name}
                  </p>
                  <p className="text-xs text-[var(--text-muted)]">
                    <span className="font-mono">{appointment.time}</span>
                    {' • '}
                    R$ {appointment.service.price.toFixed(2)}
                  </p>
                </div>
                
                <StatusBadge status={appointment.status} />
              </div>
            ))}
          </div>
        ) : (
          <EmptyState
            icon={Clock}
            title="Nenhum histórico"
            description="Este cliente ainda não teve atendimentos."
          />
        )}
      </div>

      {/* Fixed Action Button */}
      <div className="fixed bottom-24 lg:bottom-8 left-4 right-4 lg:left-auto lg:right-8 lg:w-auto">
        <Link
          href={`/novo-agendamento?clientId=${client.id}`}
          className="flex items-center justify-center gap-2 w-full lg:w-auto px-6 py-3 bg-[var(--accent)] text-white font-medium rounded-xl shadow-lg hover:bg-[var(--accent-hover)] active:scale-[0.97] transition-all duration-200"
        >
          <Calendar className="w-5 h-5" />
          Novo agendamento para {client.name.split(' ')[0]}
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
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-2.5 bg-[var(--bg-primary)] border border-[var(--border)] rounded-lg text-sm text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:ring-offset-2 transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--text-primary)] mb-1.5">
              Telefone/WhatsApp
            </label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full px-4 py-2.5 bg-[var(--bg-primary)] border border-[var(--border)] rounded-lg text-sm text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:ring-offset-2 transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--text-primary)] mb-1.5">
              Email
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-4 py-2.5 bg-[var(--bg-primary)] border border-[var(--border)] rounded-lg text-sm text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:ring-offset-2 transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--text-primary)] mb-1.5">
              Observações
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={3}
              className="w-full px-4 py-2.5 bg-[var(--bg-primary)] border border-[var(--border)] rounded-lg text-sm text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:ring-offset-2 transition-all resize-none"
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
              className="flex-1 px-4 py-2.5 bg-[var(--accent)] text-white font-medium text-sm rounded-lg hover:bg-[var(--accent-hover)] active:scale-[0.97] transition-all duration-200"
            >
              Salvar
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
