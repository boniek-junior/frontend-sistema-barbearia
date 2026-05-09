import { cn } from '@/lib/utils'
import { AppointmentStatus } from '@/lib/types'

interface StatusBadgeProps {
  status: AppointmentStatus
  className?: string
}

const statusConfig: Record<AppointmentStatus, { label: string; bg: string; text: string }> = {
  confirmado: { label: 'Confirmado', bg: 'bg-[#EFF6FF]', text: 'text-[#2563EB]' },
  concluido: { label: 'Concluído', bg: 'bg-[#F0FDF4]', text: 'text-[#16A34A]' },
  cancelado: { label: 'Cancelado', bg: 'bg-[#FEF2F2]', text: 'text-[#DC2626]' },
  pendente: { label: 'Pendente', bg: 'bg-[#FFFBEB]', text: 'text-[#D97706]' },
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status]

  return (
    <span 
      className={cn(
        "inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium transition-all duration-200",
        config.bg,
        config.text,
        "animate-in fade-in zoom-in-95",
        className
      )}
    >
      {config.label}
    </span>
  )
}
