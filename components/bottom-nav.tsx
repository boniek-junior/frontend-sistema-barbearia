'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { LayoutDashboard, Calendar, Users, Plus, User } from 'lucide-react'

const navItems = [
  { href: '/dashboard', label: 'Início', icon: LayoutDashboard },
  { href: '/agenda', label: 'Agenda', icon: Calendar },
  { href: '/novo-agendamento', label: 'Novo', icon: Plus, isCenter: true },
  { href: '/clientes', label: 'Clientes', icon: Users },
  { href: '/configuracoes', label: 'Perfil', icon: User },
]

export function BottomNav() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-[var(--bg-primary)] border-t border-[var(--border)] lg:hidden z-50 safe-area-bottom">
      <ul className="flex items-center justify-around h-16 px-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
          const Icon = item.icon
          
          if (item.isCenter) {
            return (
              <li key={item.href} className="relative -mt-6">
                <Link
                  href={item.href}
                  className="flex items-center justify-center w-14 h-14 bg-[var(--accent)] rounded-full shadow-md active:scale-95 transition-transform"
                >
                  <Icon className="w-6 h-6 text-white" />
                </Link>
              </li>
            )
          }

          return (
            <li key={item.href}>
              <Link
                href={item.href}
                className={cn(
                  "flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-colors",
                  isActive 
                    ? "text-[var(--accent)]" 
                    : "text-[var(--text-muted)]"
                )}
              >
                <Icon className={cn("w-5 h-5", isActive && "stroke-[2.5]")} />
                <span className={cn(
                  "text-xs",
                  isActive ? "font-medium" : "font-normal"
                )}>
                  {item.label}
                </span>
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
