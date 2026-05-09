import { cn } from '@/lib/utils'
import { LucideIcon } from 'lucide-react'

interface KpiCardProps {
  title: string
  value: number | string
  icon: LucideIcon
  trend?: {
    value: number
    positive: boolean
  }
  className?: string
}

export function KpiCard({ title, value, icon: Icon, trend, className }: KpiCardProps) {
  return (
    <div 
      className={cn(
        "p-4 bg-[var(--bg-card)] rounded-xl border border-[var(--border)]",
        "hover:shadow-[var(--shadow-sm)] transition-all duration-200",
        className
      )}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="w-10 h-10 rounded-lg bg-[var(--accent-light)] flex items-center justify-center">
          <Icon className="w-5 h-5 text-[var(--accent)]" />
        </div>
        {trend && (
          <span className={cn(
            "text-xs font-medium px-2 py-0.5 rounded-full",
            trend.positive 
              ? "bg-[var(--success-light)] text-[var(--success)]" 
              : "bg-[var(--danger-light)] text-[var(--danger)]"
          )}>
            {trend.positive ? '+' : ''}{trend.value}%
          </span>
        )}
      </div>
      <p className="text-2xl font-bold text-[var(--text-primary)] tracking-tight">
        {value}
      </p>
      <p className="text-sm text-[var(--text-muted)] mt-1">
        {title}
      </p>
    </div>
  )
}
