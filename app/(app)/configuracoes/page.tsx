'use client'

import { useState } from 'react'
import { Store, Clock, Info } from 'lucide-react'
import { useToast } from '@/components/toast'
import { cn } from '@/lib/utils'

interface WorkingHours {
  day: number
  active: boolean
  start: string
  end: string
}

const dayNames = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado']

const defaultWorkingHours: WorkingHours[] = [
  { day: 0, active: false, start: '09:00', end: '18:00' },
  { day: 1, active: true, start: '08:00', end: '18:00' },
  { day: 2, active: true, start: '08:00', end: '18:00' },
  { day: 3, active: true, start: '08:00', end: '18:00' },
  { day: 4, active: true, start: '08:00', end: '18:00' },
  { day: 5, active: true, start: '08:00', end: '18:00' },
  { day: 6, active: true, start: '08:00', end: '17:00' },
]

export default function ConfiguracoesPage() {
  const { showToast } = useToast()
  
  const [shopData, setShopData] = useState({
    name: 'Barbearia',
    phone: '',
    address: '',
  })
  
  const [workingHours, setWorkingHours] = useState(defaultWorkingHours)

  const handleSaveShop = () => {
    showToast('success', 'Dados da barbearia atualizados!')
  }

  const handleSaveHours = () => {
    showToast('success', 'Horários de funcionamento salvos!')
  }

  const toggleDayActive = (dayIndex: number) => {
    setWorkingHours(prev => prev.map((h, i) => 
      i === dayIndex ? { ...h, active: !h.active } : h
    ))
  }

  const updateDayHours = (dayIndex: number, field: 'start' | 'end', value: string) => {
    setWorkingHours(prev => prev.map((h, i) => 
      i === dayIndex ? { ...h, [field]: value } : h
    ))
  }

  return (
    <div className="p-4 lg:p-8 max-w-3xl mx-auto">
      {/* Header */}
      <header className="mb-8">
        <h1 className="text-2xl lg:text-3xl font-bold text-[var(--text-primary)] tracking-tight">
          Configurações
        </h1>
      </header>

      {/* Shop Data Section */}
      <section className="bg-[var(--bg-card)] rounded-xl border border-[var(--border)] p-6 mb-6">
        <div className="flex items-center gap-4 mb-6">
          <Store className="w-5 h-5 text-[var(--accent)]" />
          <h2 className="text-lg font-semibold text-[var(--text-primary)]">Dados da Barbearia</h2>
        </div>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[var(--text-primary)] mb-1.5">
              Nome da barbearia
            </label>
            <input
              type="text"
              value={shopData.name}
              onChange={(e) => setShopData({ ...shopData, name: e.target.value })}
              className="w-full px-4 py-2.5 bg-[var(--bg-primary)] border border-[var(--border)] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent)] transition-all"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-[var(--text-primary)] mb-1.5">
              Telefone
            </label>
            <input
              type="tel"
              value={shopData.phone}
              onChange={(e) => setShopData({ ...shopData, phone: e.target.value })}
              className="w-full px-4 py-2.5 bg-[var(--bg-primary)] border border-[var(--border)] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent)] transition-all"
              placeholder="(00) 00000-0000"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-[var(--text-primary)] mb-1.5">
              Endereço
            </label>
            <input
              type="text"
              value={shopData.address}
              onChange={(e) => setShopData({ ...shopData, address: e.target.value })}
              className="w-full px-4 py-2.5 bg-[var(--bg-primary)] border border-[var(--border)] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent)] transition-all"
              placeholder="Rua, número - Bairro"
            />
          </div>
          
          <button
            onClick={handleSaveShop}
            className="px-4 py-2.5 bg-[var(--accent)] text-white font-medium text-sm rounded-lg hover:bg-[var(--accent-hover)] active:scale-[0.97] transition-all duration-200"
          >
            Salvar Dados
          </button>
        </div>
      </section>

      {/* Working Hours Section */}
      <section className="bg-[var(--bg-card)] rounded-xl border border-[var(--border)] p-6 mb-6">
        <div className="flex items-center gap-4 mb-6">
          <Clock className="w-5 h-5 text-[var(--accent)]" />
          <h2 className="text-lg font-semibold text-[var(--text-primary)]">Horário de Funcionamento</h2>
        </div>
        
        <div className="space-y-3">
          {workingHours.map((day, index) => (
            <div
              key={index}
              className={cn(
                "flex items-center gap-4 p-3 rounded-xl border border-[var(--border)] transition-all duration-200",
                !day.active && "opacity-60 bg-[var(--bg-secondary)]"
              )}
            >
              <button
                onClick={() => toggleDayActive(index)}
                className={cn(
                  "relative w-10 h-6 rounded-full transition-colors duration-200 flex-shrink-0",
                  day.active ? "bg-[var(--accent)]" : "bg-[var(--border)]"
                )}
              >
                <span
                  className={cn(
                    "absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-all duration-200",
                    day.active ? "left-4" : "left-0.5"
                  )}
                />
              </button>
              
              <span className="text-sm font-medium text-[var(--text-primary)] w-20">
                {dayNames[index]}
              </span>
              
              {day.active && (
                <div className="flex items-center gap-2 flex-1">
                  <input
                    type="time"
                    value={day.start}
                    onChange={(e) => updateDayHours(index, 'start', e.target.value)}
                    className="px-3 py-1.5 bg-[var(--bg-primary)] border border-[var(--border)] rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[var(--accent)] transition-all"
                  />
                  <span className="text-[var(--text-muted)]">até</span>
                  <input
                    type="time"
                    value={day.end}
                    onChange={(e) => updateDayHours(index, 'end', e.target.value)}
                    className="px-3 py-1.5 bg-[var(--bg-primary)] border border-[var(--border)] rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[var(--accent)] transition-all"
                  />
                </div>
              )}
              
              {!day.active && (
                <span className="text-sm text-[var(--text-muted)]">Fechado</span>
              )}
            </div>
          ))}
        </div>
        
        <button
          onClick={handleSaveHours}
          className="mt-4 px-4 py-2.5 bg-[var(--accent)] text-white font-medium text-sm rounded-lg hover:bg-[var(--accent-hover)] active:scale-[0.97] transition-all duration-200"
        >
          Salvar Horários
        </button>
      </section>

      {/* Info */}
      <section className="bg-[var(--bg-card)] rounded-xl border border-[var(--border)] p-6">
        <div className="flex items-center gap-4 mb-4">
          <Info className="w-5 h-5 text-[var(--accent)]" />
          <h2 className="text-lg font-semibold text-[var(--text-primary)]">Sobre o Sistema</h2>
        </div>
        <p className="text-sm text-[var(--text-muted)]">
          BarberPro — Sistema de gestão para barbearias. Os horários de funcionamento configurados aqui são usados como referência visual. 
          O backend controla os horários permitidos via configuração do servidor (HORARIO_ABERTURA e HORARIO_FECHAMENTO).
        </p>
      </section>
    </div>
  )
}
