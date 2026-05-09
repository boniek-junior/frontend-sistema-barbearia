'use client'

import { useState, useMemo } from 'react'
import { format, addDays, startOfWeek, addWeeks, subWeeks, isSameDay, parseISO, addMonths, subMonths } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { ChevronLeft, ChevronRight, Plus, Calendar, Loader2 } from 'lucide-react'
import { useStore } from '@/lib/store'
import { AppointmentCard } from '@/components/appointment-card'
import { EmptyState } from '@/components/empty-state'
import { AppointmentDetailsModal } from '@/components/appointment-details-modal'
import { cn } from '@/lib/utils'
import Link from 'next/link'
import { AppointmentStatus, SERVICOS, Agendamento } from '@/lib/types'

type ViewMode = 'semana' | 'mes'
type StatusFilter = 'todos' | AppointmentStatus

const timeSlots = [
  '08:00', '08:30', '09:00', '09:30', '10:00', '10:30',
  '11:00', '11:30', '12:00', '12:30', '13:00', '13:30',
  '14:00', '14:30', '15:00', '15:30', '16:00', '16:30',
  '17:00', '17:30', '18:00', '18:30', '19:00', '19:30',
]

export default function AgendaPage() {
  const { agendamentos, loading } = useStore()
  const [selectedAppointment, setSelectedAppointment] = useState<Agendamento | null>(null)
  const [viewMode, setViewMode] = useState<ViewMode>('semana')
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('todos')

  const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 })
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i))

  const filteredAppointments = useMemo(() => {
    let filtered = agendamentos
    if (statusFilter !== 'todos') {
      filtered = filtered.filter(a => a.status === statusFilter)
    }
    return filtered
  }, [agendamentos, statusFilter])

  const getAppointmentsForDate = (date: Date) => {
    return filteredAppointments.filter(a => isSameDay(parseISO(a.inicio), date))
  }

  const getAppointmentForSlot = (date: Date, time: string) => {
    return filteredAppointments.find(a => {
      const aDate = parseISO(a.inicio)
      return isSameDay(aDate, date) && format(aDate, 'HH:mm') === time
    })
  }

  const navigateWeek = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      if (viewMode === 'mes') {
        return direction === 'next' ? addMonths(prev, 1) : subMonths(prev, 1)
      }
      return direction === 'next' ? addWeeks(prev, 1) : subWeeks(prev, 1)
    })
  }

  const selectedDateAppointments = selectedDate ? getAppointmentsForDate(selectedDate) : []

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-[var(--accent)] animate-spin" />
      </div>
    )
  }

  return (
    <div className="p-4 lg:p-8">
      {/* Header */}
      <header className="mb-6">
        <h1 className="text-2xl lg:text-3xl font-bold text-[var(--text-primary)] tracking-tight">
          Agenda
        </h1>
      </header>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        {/* View Toggle */}
        <div className="flex bg-[var(--bg-card)] rounded-lg border border-[var(--border)] p-1">
          <button
            onClick={() => setViewMode('semana')}
            className={cn(
              "px-4 py-2 text-sm font-medium rounded-md transition-all duration-200",
              viewMode === 'semana' 
                ? "bg-[var(--accent)] text-white" 
                : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
            )}
          >
            Semana
          </button>
          <button
            onClick={() => setViewMode('mes')}
            className={cn(
              "px-4 py-2 text-sm font-medium rounded-md transition-all duration-200",
              viewMode === 'mes' 
                ? "bg-[var(--accent)] text-white" 
                : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
            )}
          >
            Mês
          </button>
        </div>

        {/* Status Filter */}
        <div className="flex gap-2 flex-wrap">
          {(['todos', 'pendente', 'confirmado', 'concluido', 'cancelado'] as StatusFilter[]).map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={cn(
                "px-3 py-1.5 text-sm font-medium rounded-full transition-all duration-200",
                statusFilter === status
                  ? "bg-[var(--accent)] text-white"
                  : "bg-[var(--bg-card)] text-[var(--text-secondary)] border border-[var(--border)] hover:border-[var(--accent)]"
              )}
            >
              {status === 'todos' ? 'Todos' : status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => navigateWeek('prev')}
          className="w-10 h-10 flex items-center justify-center rounded-lg border border-[var(--border)] hover:bg-[var(--bg-secondary)] transition-colors"
        >
          <ChevronLeft className="w-5 h-5 text-[var(--text-secondary)]" />
        </button>
        <h2 className="text-lg font-semibold text-[var(--text-primary)]">
          {viewMode === 'semana' 
            ? `${format(weekDays[0], "d 'de' MMM", { locale: ptBR })} - ${format(weekDays[6], "d 'de' MMM", { locale: ptBR })}`
            : format(currentDate, "MMMM 'de' yyyy", { locale: ptBR })
          }
        </h2>
        <button
          onClick={() => navigateWeek('next')}
          className="w-10 h-10 flex items-center justify-center rounded-lg border border-[var(--border)] hover:bg-[var(--bg-secondary)] transition-colors"
        >
          <ChevronRight className="w-5 h-5 text-[var(--text-secondary)]" />
        </button>
      </div>

      {/* Week View */}
      {viewMode === 'semana' && (
        <div className="bg-[var(--bg-card)] rounded-xl border border-[var(--border)] overflow-hidden">
          {/* Days Header */}
          <div className="grid grid-cols-8 border-b border-[var(--border)]">
            <div className="p-3 border-r border-[var(--border)]" />
            {weekDays.map((day, i) => {
              const isToday = isSameDay(day, new Date())
              const hasAppointments = getAppointmentsForDate(day).length > 0
              return (
                <button
                  key={i}
                  onClick={() => setSelectedDate(day)}
                  className={cn(
                    "p-3 text-center transition-colors",
                    i < 6 && "border-r border-[var(--border)]",
                    isToday && "bg-[var(--accent-light)]"
                  )}
                >
                  <p className="text-xs text-[var(--text-muted)] uppercase">
                    {format(day, 'EEE', { locale: ptBR })}
                  </p>
                  <p className={cn(
                    "text-lg font-semibold mt-1",
                    isToday ? "text-[var(--accent)]" : "text-[var(--text-primary)]"
                  )}>
                    {format(day, 'd')}
                  </p>
                  {hasAppointments && (
                    <div className="w-1.5 h-1.5 rounded-full bg-[var(--accent)] mx-auto mt-1" />
                  )}
                </button>
              )
            })}
          </div>

          {/* Time Grid - Desktop */}
          <div className="hidden lg:block max-h-[600px] overflow-auto">
            {timeSlots.map((time) => (
              <div key={time} className="grid grid-cols-8 border-b border-[var(--border)] last:border-b-0">
                <div className="p-2 border-r border-[var(--border)] flex items-center justify-center">
                  <span className="text-xs font-mono text-[var(--text-muted)]">{time}</span>
                </div>
                {weekDays.map((day, i) => {
                  const appointment = getAppointmentForSlot(day, time)
                  const servico = appointment ? SERVICOS[appointment.servico] : null
                  return (
                    <div 
                      key={i}
                      className={cn(
                        "p-1 min-h-[48px] relative",
                        i < 6 && "border-r border-[var(--border)]"
                      )}
                    >
                      {appointment ? (
                        <button 
                          onClick={() => setSelectedAppointment(appointment)}
                          className="absolute inset-1 bg-[var(--accent-light)] border border-[var(--accent)] rounded-lg p-2 overflow-hidden text-left"
                        >
                          <p className="text-xs font-medium text-[var(--accent)] truncate">
                            {appointment.cliente.nome}
                          </p>
                          <p className="text-xs text-[var(--text-muted)] truncate">
                            {servico?.label || appointment.servico}
                          </p>
                        </button>
                      ) : (
                        <Link
                          href="/novo-agendamento"
                          className="absolute inset-1 flex items-center justify-center opacity-0 hover:opacity-100 hover:bg-[var(--bg-secondary)] rounded-lg transition-opacity"
                        >
                          <Plus className="w-4 h-4 text-[var(--text-muted)]" />
                        </Link>
                      )}
                    </div>
                  )
                })}
              </div>
            ))}
          </div>

          {/* Mobile Day View */}
          <div className="lg:hidden p-4">
            {selectedDate ? (
              <>
                <h3 className="text-sm font-medium text-[var(--text-secondary)] mb-4">
                  Agendamentos para {format(selectedDate, "EEEE, d 'de' MMMM", { locale: ptBR })}
                </h3>
                {selectedDateAppointments.length > 0 ? (
                  <div className="space-y-3">
                    {selectedDateAppointments
                      .sort((a, b) => a.inicio.localeCompare(b.inicio))
                      .map((appointment) => (
                        <AppointmentCard 
                          key={appointment.id} 
                          appointment={appointment} 
                          onClick={() => setSelectedAppointment(appointment)}
                        />
                      ))}
                  </div>
                ) : (
                  <EmptyState
                    icon={Calendar}
                    title="Nenhum agendamento"
                    description="Não há agendamentos para este dia."
                    action={{
                      label: 'Agendar',
                      onClick: () => window.location.href = '/novo-agendamento'
                    }}
                  />
                )}
              </>
            ) : (
              <p className="text-sm text-[var(--text-muted)] text-center py-8">
                Selecione um dia para ver os agendamentos
              </p>
            )}
          </div>
        </div>
      )}

      {/* Month View */}
      {viewMode === 'mes' && (
        <div className="bg-[var(--bg-card)] rounded-xl border border-[var(--border)] p-4">
          <MonthView 
            currentDate={currentDate}
            appointments={filteredAppointments}
            onSelectDate={setSelectedDate}
            selectedDate={selectedDate}
          />
          
          {selectedDate && (
            <div className="mt-6 pt-6 border-t border-[var(--border)]">
              <h3 className="text-sm font-medium text-[var(--text-secondary)] mb-4">
                {format(selectedDate, "EEEE, d 'de' MMMM", { locale: ptBR })}
              </h3>
              {selectedDateAppointments.length > 0 ? (
                <div className="space-y-3">
                  {selectedDateAppointments
                    .sort((a, b) => a.inicio.localeCompare(b.inicio))
                    .map((appointment) => (
                      <AppointmentCard 
                        key={appointment.id} 
                        appointment={appointment} 
                        onClick={() => setSelectedAppointment(appointment)}
                      />
                    ))}
                </div>
              ) : (
                <p className="text-sm text-[var(--text-muted)] text-center py-4">
                  Nenhum agendamento neste dia
                </p>
              )}
            </div>
          )}
        </div>
      )}

      <AppointmentDetailsModal 
        appointment={selectedAppointment}
        isOpen={!!selectedAppointment}
        onClose={() => setSelectedAppointment(null)}
      />
    </div>
  )
}

import { Agendamento } from '@/lib/types'

function MonthView({ 
  currentDate, 
  appointments, 
  onSelectDate,
  selectedDate 
}: { 
  currentDate: Date
  appointments: Agendamento[]
  onSelectDate: (date: Date) => void
  selectedDate: Date | null
}) {
  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()
  
  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)
  const startPadding = (firstDay.getDay() + 6) % 7 // Monday = 0
  
  const days: (Date | null)[] = []
  for (let i = 0; i < startPadding; i++) {
    days.push(null)
  }
  for (let d = 1; d <= lastDay.getDate(); d++) {
    days.push(new Date(year, month, d))
  }

  const hasAppointments = (date: Date) => {
    return appointments.some(a => isSameDay(parseISO(a.inicio), date))
  }

  return (
    <div className="grid grid-cols-7 gap-1">
      {['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'].map((day) => (
        <div key={day} className="p-2 text-center">
          <span className="text-xs font-medium text-[var(--text-muted)] uppercase">{day}</span>
        </div>
      ))}
      
      {days.map((day, i) => {
        if (!day) {
          return <div key={i} className="p-2" />
        }
        
        const isToday = isSameDay(day, new Date())
        const isSelected = selectedDate && isSameDay(day, selectedDate)
        const hasAppts = hasAppointments(day)
        
        return (
          <button
            key={i}
            onClick={() => onSelectDate(day)}
            className={cn(
              "p-2 rounded-lg text-center transition-all duration-200 relative",
              isSelected 
                ? "bg-[var(--accent)] text-white" 
                : isToday 
                  ? "bg-[var(--accent-light)] text-[var(--accent)]"
                  : "hover:bg-[var(--bg-secondary)]"
            )}
          >
            <span className={cn(
              "text-sm font-medium",
              !isSelected && !isToday && "text-[var(--text-primary)]"
            )}>
              {format(day, 'd')}
            </span>
            {hasAppts && !isSelected && (
              <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-[var(--accent)]" />
            )}
          </button>
        )
      })}
    </div>
  )
}
