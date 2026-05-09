'use client'

import { useMemo } from 'react'
import Link from 'next/link'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Calendar, Users, Clock, ArrowRight, Plus } from 'lucide-react'
import { useStore } from '@/lib/store'
import { KpiCard } from '@/components/kpi-card'
import { AppointmentCard } from '@/components/appointment-card'
import { EmptyState } from '@/components/empty-state'

export default function DashboardPage() {
  const { barber, appointments, clients } = useStore()
  
  const today = new Date()
  const todayStr = format(today, 'yyyy-MM-dd')
  
  const todayAppointments = useMemo(() => {
    return appointments
      .filter(a => a.date === todayStr)
      .sort((a, b) => a.time.localeCompare(b.time))
  }, [appointments, todayStr])

  const kpis = useMemo(() => {
    const todayCount = todayAppointments.length
    const completedThisMonth = appointments.filter(a => 
      a.status === 'concluido' && 
      a.date.startsWith(format(today, 'yyyy-MM'))
    ).length
    const freeSlots = 10 - todayCount // Assuming 10 slots per day

    return {
      todayCount,
      completedThisMonth,
      freeSlots: Math.max(0, freeSlots),
    }
  }, [todayAppointments, appointments, today])

  const greeting = useMemo(() => {
    const hour = today.getHours()
    if (hour < 12) return 'Bom dia'
    if (hour < 18) return 'Boa tarde'
    return 'Boa noite'
  }, [today])

  return (
    <div className="p-4 lg:p-8 max-w-5xl mx-auto">
      {/* Header */}
      <header className="mb-8">
        <h1 className="text-2xl lg:text-3xl font-bold text-[var(--text-primary)] tracking-tight">
          {greeting}, {barber.name.split(' ')[0]}
        </h1>
        <p className="text-[var(--text-secondary)] mt-1 capitalize">
          {format(today, "EEEE, d 'de' MMMM", { locale: ptBR })}
        </p>
      </header>

      {/* KPIs */}
      <section className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <KpiCard 
          title="Agendamentos Hoje" 
          value={kpis.todayCount}
          icon={Calendar}
        />
        <KpiCard 
          title="Atendidos no Mês" 
          value={kpis.completedThisMonth}
          icon={Users}
          trend={{ value: 12, positive: true }}
        />
        <KpiCard 
          title="Horários Livres" 
          value={kpis.freeSlots}
          icon={Clock}
        />
      </section>

      {/* Today's Appointments */}
      <section className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-[var(--text-primary)] tracking-tight">
            Agenda de Hoje
          </h2>
          <Link 
            href="/agenda"
            className="flex items-center gap-1 text-sm font-medium text-[var(--accent)] hover:text-[var(--accent-hover)] transition-colors"
          >
            Ver completa
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {todayAppointments.length > 0 ? (
          <div className="space-y-3">
            {todayAppointments.map((appointment) => (
              <AppointmentCard 
                key={appointment.id} 
                appointment={appointment}
              />
            ))}
          </div>
        ) : (
          <EmptyState
            icon={Calendar}
            title="Nenhum agendamento hoje"
            description="Sua agenda está livre. Que tal agendar um cliente?"
            action={{
              label: 'Novo Agendamento',
              onClick: () => window.location.href = '/novo-agendamento'
            }}
          />
        )}
      </section>

      {/* Quick Actions */}
      <section className="grid grid-cols-2 gap-4">
        <Link
          href="/novo-agendamento"
          className="flex items-center gap-3 p-4 bg-[var(--accent)] text-white rounded-xl hover:bg-[var(--accent-hover)] active:scale-[0.98] transition-all duration-200"
        >
          <Plus className="w-5 h-5" />
          <span className="font-medium">Novo Agendamento</span>
        </Link>
        <Link
          href="/clientes"
          className="flex items-center gap-3 p-4 bg-[var(--bg-card)] border border-[var(--border)] text-[var(--text-primary)] rounded-xl hover:border-[var(--accent)] hover:shadow-[var(--shadow-sm)] active:scale-[0.98] transition-all duration-200"
        >
          <Users className="w-5 h-5 text-[var(--accent)]" />
          <span className="font-medium">Ver Clientes</span>
        </Link>
      </section>
    </div>
  )
}
