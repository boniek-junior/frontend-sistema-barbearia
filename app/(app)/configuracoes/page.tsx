'use client'

import { useState } from 'react'
import { User, Store, Clock, Lock, Camera } from 'lucide-react'
import { useStore } from '@/lib/store'
import { useToast } from '@/components/toast'
import { mockWorkingHours } from '@/lib/mock-data'
import { cn } from '@/lib/utils'

const dayNames = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado']

export default function ConfiguracoesPage() {
  const { barber } = useStore()
  const { showToast } = useToast()
  
  const [shopData, setShopData] = useState({
    name: barber.shopName,
    phone: barber.phone,
    address: barber.address || '',
  })
  
  const [workingHours, setWorkingHours] = useState(mockWorkingHours)
  
  const [passwords, setPasswords] = useState({
    current: '',
    new: '',
    confirm: '',
  })

  const handleSaveShop = () => {
    showToast('success', 'Dados da barbearia atualizados!')
  }

  const handleSaveHours = () => {
    showToast('success', 'Horários de funcionamento salvos!')
  }

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault()
    if (passwords.new !== passwords.confirm) {
      showToast('error', 'As senhas não coincidem')
      return
    }
    if (passwords.new.length < 6) {
      showToast('error', 'A senha deve ter pelo menos 6 caracteres')
      return
    }
    showToast('success', 'Senha alterada com sucesso!')
    setPasswords({ current: '', new: '', confirm: '' })
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

      {/* Profile Section */}
      <section className="bg-[var(--bg-card)] rounded-xl border border-[var(--border)] p-6 mb-6">
        <div className="flex items-center gap-4 mb-6">
          <User className="w-5 h-5 text-[var(--accent)]" />
          <h2 className="text-lg font-semibold text-[var(--text-primary)]">Perfil</h2>
        </div>
        
        <div className="flex items-center gap-4 mb-6">
          <div className="relative">
            <div className="w-20 h-20 rounded-full bg-[var(--accent)] flex items-center justify-center">
              <span className="text-2xl font-bold text-white">
                {barber.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
              </span>
            </div>
            <button className="absolute -bottom-1 -right-1 w-8 h-8 bg-[var(--bg-primary)] border border-[var(--border)] rounded-full flex items-center justify-center hover:bg-[var(--bg-secondary)] transition-colors">
              <Camera className="w-4 h-4 text-[var(--text-secondary)]" />
            </button>
          </div>
          <div>
            <p className="text-lg font-semibold text-[var(--text-primary)]">{barber.name}</p>
            <p className="text-sm text-[var(--text-muted)]">{barber.email}</p>
          </div>
        </div>
      </section>

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

      {/* Security Section */}
      <section className="bg-[var(--bg-card)] rounded-xl border border-[var(--border)] p-6">
        <div className="flex items-center gap-4 mb-6">
          <Lock className="w-5 h-5 text-[var(--accent)]" />
          <h2 className="text-lg font-semibold text-[var(--text-primary)]">Segurança</h2>
        </div>
        
        <form onSubmit={handleChangePassword} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[var(--text-primary)] mb-1.5">
              Senha atual
            </label>
            <input
              type="password"
              value={passwords.current}
              onChange={(e) => setPasswords({ ...passwords, current: e.target.value })}
              className="w-full px-4 py-2.5 bg-[var(--bg-primary)] border border-[var(--border)] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent)] transition-all"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-[var(--text-primary)] mb-1.5">
              Nova senha
            </label>
            <input
              type="password"
              value={passwords.new}
              onChange={(e) => setPasswords({ ...passwords, new: e.target.value })}
              className="w-full px-4 py-2.5 bg-[var(--bg-primary)] border border-[var(--border)] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent)] transition-all"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-[var(--text-primary)] mb-1.5">
              Confirmar nova senha
            </label>
            <input
              type="password"
              value={passwords.confirm}
              onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })}
              className="w-full px-4 py-2.5 bg-[var(--bg-primary)] border border-[var(--border)] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent)] transition-all"
            />
          </div>
          
          <button
            type="submit"
            className="px-4 py-2.5 bg-[var(--accent)] text-white font-medium text-sm rounded-lg hover:bg-[var(--accent-hover)] active:scale-[0.97] transition-all duration-200"
          >
            Alterar Senha
          </button>
        </form>
      </section>
    </div>
  )
}
