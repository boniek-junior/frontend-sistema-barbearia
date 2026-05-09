'use client'

import { format, parseISO } from 'date-fns'
import { Agendamento, SERVICOS } from '@/lib/types'
import { ClientAvatar } from './client-avatar'
import { StatusBadge } from './status-badge'
import { cn } from '@/lib/utils'

interface AppointmentCardProps {
  appointment: Agendamento
  onClick?: () => void
  className?: string
}

export function AppointmentCard({ appointment, onClick, className }: AppointmentCardProps) {
  const hora = format(parseISO(appointment.inicio), 'HH:mm')
  const servico = SERVICOS[appointment.servico]

  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full flex items-center gap-4 p-4 bg-[var(--bg-card)] rounded-xl border border-[var(--border)]",
        "hover:shadow-[var(--shadow-md)] hover:border-[var(--accent)] transition-all duration-200",
        "active:scale-[0.98] text-left",
        className
      )}
    >
      <div className="flex-shrink-0">
        <span className="font-mono text-lg font-medium text-[var(--text-primary)]">
          {hora}
        </span>
      </div>
      
      <div className="w-px h-10 bg-[var(--border)]" />
      
      <ClientAvatar name={appointment.cliente.nome} size="md" />
      
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-[var(--text-primary)] truncate">
          {appointment.cliente.nome}
        </p>
        <p className="text-xs text-[var(--text-secondary)] truncate">
          {servico?.label || appointment.servico}
        </p>
      </div>
      
      <StatusBadge status={appointment.status} />
    </button>
  )
}
