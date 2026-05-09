'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { 
  LayoutDashboard, 
  Calendar, 
  Users, 
  Scissors, 
  Settings,
  ChevronLeft,
  ChevronRight,
  LogOut
} from 'lucide-react'
import { useStore } from '@/lib/store'

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/agenda', label: 'Agenda', icon: Calendar },
  { href: '/clientes', label: 'Clientes', icon: Users },
  { href: '/servicos', label: 'Serviços', icon: Scissors },
  { href: '/configuracoes', label: 'Configurações', icon: Settings },
]

export function Sidebar() {
  const [expanded, setExpanded] = useState(true)
  const pathname = usePathname()
  const { barber } = useStore()

  return (
    <aside 
      className={cn(
        "fixed left-0 top-0 h-screen bg-[var(--bg-primary)] border-r border-[var(--border)] z-40 transition-all duration-200 ease-[cubic-bezier(0.4,0,0.2,1)] hidden lg:flex flex-col",
        expanded ? "w-60" : "w-16"
      )}
    >
      {/* Logo */}
      <div className={cn(
        "h-16 flex items-center border-b border-[var(--border)] px-4",
        expanded ? "justify-between" : "justify-center"
      )}>
        {expanded && (
          <div className="flex items-center gap-2 overflow-hidden">
            <div className="w-8 h-8 bg-[var(--accent)] rounded-lg flex items-center justify-center flex-shrink-0">
              <Scissors className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-lg tracking-tight text-[var(--text-primary)] whitespace-nowrap">
              BarberPro
            </span>
          </div>
        )}
        <button
          onClick={() => setExpanded(!expanded)}
          className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[var(--bg-secondary)] transition-colors"
        >
          {expanded ? (
            <ChevronLeft className="w-4 h-4 text-[var(--text-secondary)]" />
          ) : (
            <ChevronRight className="w-4 h-4 text-[var(--text-secondary)]" />
          )}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 px-3">
        <ul className="space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
            const Icon = item.icon
            
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200",
                    isActive 
                      ? "bg-[var(--accent-light)] text-[var(--accent)]" 
                      : "text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)] hover:text-[var(--text-primary)]",
                    !expanded && "justify-center px-0"
                  )}
                >
                  <Icon className={cn("w-5 h-5 flex-shrink-0", isActive && "stroke-[2.5]")} />
                  {expanded && (
                    <span className={cn(
                      "text-sm font-medium whitespace-nowrap transition-opacity",
                      isActive && "font-semibold"
                    )}>
                      {item.label}
                    </span>
                  )}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      {/* User Profile */}
      <div className={cn(
        "border-t border-[var(--border)] p-3",
        !expanded && "flex justify-center"
      )}>
        <div className={cn(
          "flex items-center gap-3",
          !expanded && "justify-center"
        )}>
          <div className="w-10 h-10 rounded-full bg-[var(--accent)] flex items-center justify-center flex-shrink-0">
            <span className="text-white font-semibold text-sm">
              {barber.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
            </span>
          </div>
          {expanded && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-[var(--text-primary)] truncate">
                {barber.name}
              </p>
              <p className="text-xs text-[var(--text-muted)] truncate">
                {barber.shopName}
              </p>
            </div>
          )}
        </div>
        {expanded && (
          <Link
            href="/"
            className="mt-3 flex items-center gap-2 px-3 py-2 text-sm text-[var(--text-secondary)] hover:text-[var(--danger)] hover:bg-[var(--danger-light)] rounded-lg transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Sair</span>
          </Link>
        )}
      </div>
    </aside>
  )
}
