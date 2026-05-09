'use client'

import { useState, useMemo, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { format, addDays, parseISO, isSameDay } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { ArrowLeft, Search, Plus, Check, User, Scissors, Calendar, CheckCircle, Loader2 } from 'lucide-react'
import { useStore } from '@/lib/store'
import { ClientAvatar } from '@/components/client-avatar'
import { Modal } from '@/components/modal'
import { useToast } from '@/components/toast'
import { cn } from '@/lib/utils'
import { Cliente, TipoServico, SERVICOS, SERVICOS_LIST } from '@/lib/types'
import Link from 'next/link'

const steps = [
  { id: 1, label: 'Cliente', icon: User },
  { id: 2, label: 'Serviço', icon: Scissors },
  { id: 3, label: 'Data/Hora', icon: Calendar },
  { id: 4, label: 'Confirmar', icon: CheckCircle },
]

const timeSlots = [
  '08:00', '08:30', '09:00', '09:30', '10:00', '10:30',
  '11:00', '11:30', '12:00', '12:30', '13:00', '13:30',
  '14:00', '14:30', '15:00', '15:30', '16:00', '16:30',
  '17:00', '17:30', '18:00', '18:30', '19:00',
]

function NewAppointmentContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { clientes, agendamentos, addCliente, addAgendamento, loading } = useStore()
  const { showToast } = useToast()

  const preselectedClienteId = searchParams.get('clienteId')
  const preselectedCliente = preselectedClienteId 
    ? clientes.find(c => c.id === Number(preselectedClienteId)) 
    : null

  const [currentStep, setCurrentStep] = useState(preselectedCliente ? 2 : 1)
  const [selectedCliente, setSelectedCliente] = useState<Cliente | null>(preselectedCliente)
  const [selectedServico, setSelectedServico] = useState<TipoServico | null>(null)
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [selectedTime, setSelectedTime] = useState<string | null>(null)
  const [clientSearch, setClientSearch] = useState('')
  const [isNewClientModalOpen, setIsNewClientModalOpen] = useState(false)
  const [newClientData, setNewClientData] = useState({ nome: '', telefone: '' })
  const [isConfirmed, setIsConfirmed] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const filteredClients = useMemo(() => {
    if (!clientSearch) return clientes
    return clientes.filter(c => 
      c.nome.toLowerCase().includes(clientSearch.toLowerCase()) ||
      c.telefone.includes(clientSearch)
    )
  }, [clientes, clientSearch])

  const next14Days = useMemo(() => {
    const days = []
    const today = new Date()
    for (let i = 0; i < 14; i++) {
      days.push(addDays(today, i))
    }
    return days
  }, [])

  const occupiedSlots = useMemo(() => {
    if (!selectedDate) return new Set<string>()
    return new Set(
      agendamentos
        .filter(a => {
          const aDate = parseISO(a.inicio)
          return isSameDay(aDate, selectedDate) && a.status !== 'cancelado'
        })
        .map(a => format(parseISO(a.inicio), 'HH:mm'))
    )
  }, [selectedDate, agendamentos])

  const handleCreateClient = async () => {
    if (!newClientData.nome || !newClientData.telefone) return
    
    setIsSubmitting(true)
    try {
      const novoCliente = await addCliente({
        nome: newClientData.nome.trim(),
        telefone: newClientData.telefone.replace(/\D/g, ''),
      })
      
      setSelectedCliente(novoCliente)
      setIsNewClientModalOpen(false)
      setNewClientData({ nome: '', telefone: '' })
      setCurrentStep(2)
      showToast('success', 'Cliente criado!')
    } catch (err: unknown) {
      showToast('error', err instanceof Error ? err.message : 'Erro ao criar cliente')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleConfirm = async () => {
    if (!selectedCliente || !selectedServico || !selectedDate || !selectedTime) return

    setIsSubmitting(true)
    try {
      // Montar ISO datetime: combinar date + time
      const [hours, minutes] = selectedTime.split(':')
      const inicio = new Date(selectedDate)
      inicio.setHours(parseInt(hours), parseInt(minutes), 0, 0)

      await addAgendamento({
        cliente_id: selectedCliente.id,
        inicio: inicio.toISOString(),
        servico: selectedServico,
      })

      setIsConfirmed(true)
      showToast('success', 'Agendamento confirmado!')
    } catch (err: unknown) {
      showToast('error', err instanceof Error ? err.message : 'Erro ao criar agendamento')
    } finally {
      setIsSubmitting(false)
    }
  }

  const canProceed = () => {
    switch (currentStep) {
      case 1: return !!selectedCliente
      case 2: return !!selectedServico
      case 3: return !!selectedDate && !!selectedTime
      default: return false
    }
  }

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-[var(--accent)] animate-spin" />
      </div>
    )
  }

  if (isConfirmed) {
    const servico = selectedServico ? SERVICOS[selectedServico] : null
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center p-4 text-center">
        <div className="w-20 h-20 rounded-full bg-[var(--success-light)] flex items-center justify-center mb-6">
          <svg className="w-10 h-10 text-[var(--success)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
            <path className="checkmark-animate" d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-2">
          Agendamento Confirmado!
        </h1>
        <p className="text-[var(--text-secondary)] mb-8 max-w-xs">
          {selectedCliente?.nome} está agendado para {servico?.label} em{' '}
          {selectedDate && format(selectedDate, "d 'de' MMMM", { locale: ptBR })} às {selectedTime}.
        </p>
        <div className="flex flex-col sm:flex-row gap-3">
          <Link
            href="/dashboard"
            className="px-6 py-3 bg-[var(--accent)] text-white font-medium rounded-xl hover:bg-[var(--accent-hover)] transition-colors"
          >
            Voltar ao Dashboard
          </Link>
          <button
            onClick={() => {
              setIsConfirmed(false)
              setCurrentStep(1)
              setSelectedCliente(null)
              setSelectedServico(null)
              setSelectedDate(null)
              setSelectedTime(null)
            }}
            className="px-6 py-3 border border-[var(--border)] text-[var(--text-primary)] font-medium rounded-xl hover:bg-[var(--bg-secondary)] transition-colors"
          >
            Novo Agendamento
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 lg:p-8 max-w-2xl mx-auto">
      {/* Header */}
      <header className="mb-6">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] mb-4 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar
        </Link>
        <h1 className="text-2xl lg:text-3xl font-bold text-[var(--text-primary)] tracking-tight">
          Novo Agendamento
        </h1>
      </header>

      {/* Step Indicator */}
      <div className="flex items-center justify-between mb-8">
        {steps.map((step, index) => {
          const isActive = currentStep === step.id
          const isCompleted = currentStep > step.id
          const Icon = step.icon
          
          return (
            <div key={step.id} className="flex items-center">
              <div className="flex flex-col items-center">
                <div 
                  className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200",
                    isActive && "bg-[var(--accent)] text-white scale-110",
                    isCompleted && "bg-[var(--success)] text-white",
                    !isActive && !isCompleted && "bg-[var(--bg-secondary)] text-[var(--text-muted)]"
                  )}
                >
                  {isCompleted ? (
                    <Check className="w-5 h-5" />
                  ) : (
                    <Icon className="w-5 h-5" />
                  )}
                </div>
                <span className={cn(
                  "text-xs mt-2 font-medium hidden sm:block",
                  isActive ? "text-[var(--accent)]" : "text-[var(--text-muted)]"
                )}>
                  {step.label}
                </span>
              </div>
              {index < steps.length - 1 && (
                <div className={cn(
                  "w-8 sm:w-16 h-0.5 mx-2",
                  currentStep > step.id ? "bg-[var(--success)]" : "bg-[var(--border)]"
                )} />
              )}
            </div>
          )
        })}
      </div>

      {/* Step Content */}
      <div className="bg-[var(--bg-card)] rounded-xl border border-[var(--border)] p-6 mb-6">
        {/* Step 1: Client */}
        {currentStep === 1 && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-[var(--text-primary)]">
              Selecionar Cliente
            </h2>
            
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-muted)]" />
              <input
                type="text"
                placeholder="Buscar cliente..."
                value={clientSearch}
                onChange={(e) => setClientSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-[var(--bg-primary)] border border-[var(--border)] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent)] transition-all"
              />
            </div>

            <button
              onClick={() => setIsNewClientModalOpen(true)}
              className="w-full flex items-center gap-3 p-4 border-2 border-dashed border-[var(--border)] rounded-xl text-[var(--text-secondary)] hover:border-[var(--accent)] hover:text-[var(--accent)] transition-colors"
            >
              <Plus className="w-5 h-5" />
              <span className="font-medium">Cadastrar novo cliente</span>
            </button>

            <div className="space-y-2 max-h-64 overflow-auto">
              {filteredClients.map((cliente) => (
                <button
                  key={cliente.id}
                  onClick={() => setSelectedCliente(cliente)}
                  className={cn(
                    "w-full flex items-center gap-3 p-3 rounded-xl border transition-all duration-200",
                    selectedCliente?.id === cliente.id
                      ? "border-[var(--accent)] bg-[var(--accent-light)]"
                      : "border-[var(--border)] hover:border-[var(--accent)]"
                  )}
                >
                  <ClientAvatar name={cliente.nome} size="sm" />
                  <div className="flex-1 text-left">
                    <p className="text-sm font-medium text-[var(--text-primary)]">{cliente.nome}</p>
                    <p className="text-xs text-[var(--text-muted)]">{cliente.telefone}</p>
                  </div>
                  {selectedCliente?.id === cliente.id && (
                    <Check className="w-5 h-5 text-[var(--accent)]" />
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 2: Service */}
        {currentStep === 2 && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-[var(--text-primary)]">
              Escolher Serviço
            </h2>
            
            <div className="grid gap-3">
              {SERVICOS_LIST.map((servico) => (
                <button
                  key={servico.value}
                  onClick={() => setSelectedServico(servico.value)}
                  className={cn(
                    "w-full flex items-center justify-between p-4 rounded-xl border transition-all duration-200",
                    selectedServico === servico.value
                      ? "border-[var(--accent)] bg-[var(--accent-light)]"
                      : "border-[var(--border)] hover:border-[var(--accent)]"
                  )}
                >
                  <div className="text-left">
                    <p className="text-sm font-medium text-[var(--text-primary)]">{servico.label}</p>
                    <p className="text-xs text-[var(--text-muted)]">{servico.duracao} min</p>
                  </div>
                  <div className="flex items-center gap-3">
                    {selectedServico === servico.value && (
                      <Check className="w-5 h-5 text-[var(--accent)]" />
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 3: Date & Time */}
        {currentStep === 3 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-4">
                Selecionar Data
              </h2>
              <div className="flex gap-2 overflow-x-auto pb-2 -mx-2 px-2">
                {next14Days.map((date) => {
                  const isSelected = selectedDate && format(selectedDate, 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd')
                  const isToday = format(date, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd')
                  
                  return (
                    <button
                      key={date.toISOString()}
                      onClick={() => {
                        setSelectedDate(date)
                        setSelectedTime(null)
                      }}
                      className={cn(
                        "flex-shrink-0 flex flex-col items-center p-3 rounded-xl border transition-all duration-200 min-w-[72px]",
                        isSelected
                          ? "border-[var(--accent)] bg-[var(--accent)] text-white"
                          : "border-[var(--border)] hover:border-[var(--accent)]"
                      )}
                    >
                      <span className={cn(
                        "text-xs uppercase",
                        isSelected ? "text-white/80" : "text-[var(--text-muted)]"
                      )}>
                        {format(date, 'EEE', { locale: ptBR })}
                      </span>
                      <span className={cn(
                        "text-xl font-bold",
                        isSelected ? "text-white" : "text-[var(--text-primary)]"
                      )}>
                        {format(date, 'd')}
                      </span>
                      <span className={cn(
                        "text-xs",
                        isSelected ? "text-white/80" : "text-[var(--text-muted)]"
                      )}>
                        {isToday ? 'Hoje' : format(date, 'MMM', { locale: ptBR })}
                      </span>
                    </button>
                  )
                })}
              </div>
            </div>

            {selectedDate && (
              <div>
                <h3 className="text-sm font-medium text-[var(--text-secondary)] mb-3">
                  Horários disponíveis
                </h3>
                <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                  {timeSlots.map((time) => {
                    const isOccupied = occupiedSlots.has(time)
                    const isSelected = selectedTime === time
                    
                    return (
                      <button
                        key={time}
                        onClick={() => !isOccupied && setSelectedTime(time)}
                        disabled={isOccupied}
                        className={cn(
                          "py-2 px-3 rounded-lg font-mono text-sm transition-all duration-200",
                          isSelected 
                            ? "bg-[var(--accent)] text-white" 
                            : isOccupied
                              ? "bg-[var(--bg-secondary)] text-[var(--text-muted)] cursor-not-allowed"
                              : "bg-[var(--bg-primary)] border border-[var(--border)] hover:border-[var(--accent)] text-[var(--text-primary)]"
                        )}
                      >
                        {time}
                      </button>
                    )
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Step 4: Confirmation */}
        {currentStep === 4 && (
          <div className="space-y-6">
            <h2 className="text-lg font-semibold text-[var(--text-primary)]">
              Confirmar Agendamento
            </h2>
            
            <div className="space-y-4">
              <div className="flex items-center gap-4 p-4 bg-[var(--bg-secondary)] rounded-xl">
                <ClientAvatar name={selectedCliente?.nome || ''} />
                <div>
                  <p className="text-sm font-medium text-[var(--text-primary)]">{selectedCliente?.nome}</p>
                  <p className="text-xs text-[var(--text-muted)]">{selectedCliente?.telefone}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-[var(--bg-secondary)] rounded-xl">
                  <p className="text-xs text-[var(--text-muted)] mb-1">Serviço</p>
                  <p className="text-sm font-medium text-[var(--text-primary)]">
                    {selectedServico ? SERVICOS[selectedServico].label : ''}
                  </p>
                  <p className="text-sm text-[var(--text-muted)] mt-1">
                    {selectedServico ? SERVICOS[selectedServico].duracao : 0} min
                  </p>
                </div>
                <div className="p-4 bg-[var(--bg-secondary)] rounded-xl">
                  <p className="text-xs text-[var(--text-muted)] mb-1">Data e Hora</p>
                  <p className="text-sm font-medium text-[var(--text-primary)]">
                    {selectedDate && format(selectedDate, "d 'de' MMMM", { locale: ptBR })}
                  </p>
                  <p className="text-lg font-bold font-mono text-[var(--text-primary)] mt-1">
                    {selectedTime}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Navigation Buttons */}
      <div className="flex gap-3">
        {currentStep > 1 && (
          <button
            onClick={() => setCurrentStep(currentStep - 1)}
            className="flex-1 px-4 py-3 text-sm font-medium text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)] rounded-xl transition-colors"
          >
            Voltar
          </button>
        )}
        {currentStep < 4 ? (
          <button
            onClick={() => canProceed() && setCurrentStep(currentStep + 1)}
            disabled={!canProceed()}
            className={cn(
              "flex-1 px-4 py-3 font-medium text-sm rounded-xl transition-all duration-200",
              canProceed()
                ? "bg-[var(--accent)] text-white hover:bg-[var(--accent-hover)] active:scale-[0.97]"
                : "bg-[var(--bg-secondary)] text-[var(--text-muted)] cursor-not-allowed"
            )}
          >
            Continuar
          </button>
        ) : (
          <button
            onClick={handleConfirm}
            disabled={isSubmitting}
            className={cn(
              "flex-1 px-4 py-3 bg-[var(--accent)] text-white font-medium text-sm rounded-xl hover:bg-[var(--accent-hover)] active:scale-[0.97] transition-all duration-200",
              isSubmitting && "opacity-70 cursor-not-allowed"
            )}
          >
            {isSubmitting ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                Confirmando...
              </span>
            ) : (
              'Confirmar Agendamento'
            )}
          </button>
        )}
      </div>

      {/* New Client Modal */}
      <Modal
        isOpen={isNewClientModalOpen}
        onClose={() => setIsNewClientModalOpen(false)}
        title="Novo Cliente"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[var(--text-primary)] mb-1.5">
              Nome completo *
            </label>
            <input
              type="text"
              value={newClientData.nome}
              onChange={(e) => setNewClientData({ ...newClientData, nome: e.target.value })}
              className="w-full px-4 py-2.5 bg-[var(--bg-primary)] border border-[var(--border)] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent)] transition-all"
              placeholder="Ex: João Pedro Santos"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--text-primary)] mb-1.5">
              Telefone *
            </label>
            <input
              type="tel"
              value={newClientData.telefone}
              onChange={(e) => setNewClientData({ ...newClientData, telefone: e.target.value })}
              className="w-full px-4 py-2.5 bg-[var(--bg-primary)] border border-[var(--border)] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent)] transition-all"
              placeholder="11999999999"
            />
            <p className="text-xs text-[var(--text-muted)] mt-1">Apenas números, mínimo 8 dígitos</p>
          </div>
          <div className="flex gap-3 pt-2">
            <button
              onClick={() => setIsNewClientModalOpen(false)}
              className="flex-1 px-4 py-2.5 text-sm font-medium text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)] rounded-lg transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleCreateClient}
              disabled={!newClientData.nome || !newClientData.telefone || isSubmitting}
              className="flex-1 px-4 py-2.5 bg-[var(--accent)] text-white font-medium text-sm rounded-lg hover:bg-[var(--accent-hover)] disabled:opacity-50 transition-all"
            >
              {isSubmitting ? 'Criando...' : 'Criar e Selecionar'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

export default function NovoAgendamentoPage() {
  return (
    <Suspense fallback={<div className="p-4 lg:p-8">Carregando...</div>}>
      <NewAppointmentContent />
    </Suspense>
  )
}
