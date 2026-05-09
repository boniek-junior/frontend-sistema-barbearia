'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Search, Plus, Users, ArrowUpDown } from 'lucide-react'
import { useStore } from '@/lib/store'
import { ClientAvatar } from '@/components/client-avatar'
import { EmptyState } from '@/components/empty-state'
import { Modal } from '@/components/modal'
import { useToast } from '@/components/toast'
import { cn } from '@/lib/utils'

type SortBy = 'name' | 'lastVisit'

export default function ClientesPage() {
  const { clients, addClient } = useStore()
  const { showToast } = useToast()
  const [search, setSearch] = useState('')
  const [sortBy, setSortBy] = useState<SortBy>('name')
  const [isModalOpen, setIsModalOpen] = useState(false)
  
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    birthDate: '',
    notes: '',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  const filteredClients = useMemo(() => {
    let filtered = clients.filter(client => 
      client.name.toLowerCase().includes(search.toLowerCase()) ||
      client.phone.includes(search)
    )
    
    filtered.sort((a, b) => {
      if (sortBy === 'name') {
        return a.name.localeCompare(b.name)
      }
      return (b.lastVisit || '').localeCompare(a.lastVisit || '')
    })
    
    return filtered
  }, [clients, search, sortBy])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    const newErrors: Record<string, string> = {}
    if (!formData.name.trim()) newErrors.name = 'Nome é obrigatório'
    if (!formData.phone.trim()) newErrors.phone = 'Telefone é obrigatório'
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }
    
    addClient({
      name: formData.name,
      phone: formData.phone,
      email: formData.email || undefined,
      birthDate: formData.birthDate || undefined,
      notes: formData.notes || undefined,
    })
    
    setFormData({ name: '', phone: '', email: '', birthDate: '', notes: '' })
    setErrors({})
    setIsModalOpen(false)
    showToast('success', 'Cliente cadastrado com sucesso!')
  }

  return (
    <div className="p-4 lg:p-8 max-w-4xl mx-auto">
      {/* Header */}
      <header className="mb-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl lg:text-3xl font-bold text-[var(--text-primary)] tracking-tight">
            Clientes
          </h1>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-[var(--accent)] text-white font-medium text-sm rounded-lg hover:bg-[var(--accent-hover)] active:scale-[0.97] transition-all duration-200"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Novo Cliente</span>
          </button>
        </div>
      </header>

      {/* Search and Sort */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-muted)]" />
          <input
            type="text"
            placeholder="Buscar por nome ou telefone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-[var(--bg-card)] border border-[var(--border)] rounded-lg text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:ring-offset-2 transition-all"
          />
        </div>
        
        <button
          onClick={() => setSortBy(sortBy === 'name' ? 'lastVisit' : 'name')}
          className="flex items-center gap-2 px-4 py-2.5 bg-[var(--bg-card)] border border-[var(--border)] rounded-lg text-sm font-medium text-[var(--text-secondary)] hover:border-[var(--accent)] transition-colors"
        >
          <ArrowUpDown className="w-4 h-4" />
          {sortBy === 'name' ? 'Nome' : 'Última visita'}
        </button>
      </div>

      {/* Client List */}
      {filteredClients.length > 0 ? (
        <div className="space-y-3">
          {filteredClients.map((client) => (
            <Link
              key={client.id}
              href={`/clientes/${client.id}`}
              className="flex items-center gap-4 p-4 bg-[var(--bg-card)] rounded-xl border border-[var(--border)] hover:shadow-[var(--shadow-md)] hover:border-[var(--accent)] transition-all duration-200 active:scale-[0.99]"
            >
              <ClientAvatar name={client.name} size="md" />
              
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-[var(--text-primary)] truncate">
                  {client.name}
                </p>
                <p className="text-xs text-[var(--text-muted)] truncate">
                  {client.phone}
                  {client.lastVisit && ` • Última visita: ${format(new Date(client.lastVisit), "d 'de' MMM", { locale: ptBR })}`}
                </p>
              </div>
              
              <div className="text-right">
                <p className="text-lg font-semibold text-[var(--text-primary)]">
                  {client.totalVisits}
                </p>
                <p className="text-xs text-[var(--text-muted)]">
                  {client.totalVisits === 1 ? 'visita' : 'visitas'}
                </p>
              </div>
            </Link>
          ))}
        </div>
      ) : search ? (
        <EmptyState
          icon={Search}
          title="Nenhum resultado"
          description={`Não encontramos clientes para "${search}"`}
        />
      ) : (
        <EmptyState
          icon={Users}
          title="Nenhum cliente ainda"
          description="Cadastre seu primeiro cliente para começar."
          action={{
            label: 'Cadastrar Cliente',
            onClick: () => setIsModalOpen(true)
          }}
        />
      )}

      {/* New Client Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          setErrors({})
        }}
        title="Novo Cliente"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[var(--text-primary)] mb-1.5">
              Nome completo *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className={cn(
                "w-full px-4 py-2.5 bg-[var(--bg-primary)] border rounded-lg text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all",
                errors.name 
                  ? "border-[var(--danger)] focus:ring-[var(--danger)]" 
                  : "border-[var(--border)] focus:ring-[var(--accent)]"
              )}
              placeholder="Ex: João Pedro Santos"
            />
            {errors.name && (
              <p className="text-xs text-[var(--danger)] mt-1">{errors.name}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--text-primary)] mb-1.5">
              Telefone/WhatsApp *
            </label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className={cn(
                "w-full px-4 py-2.5 bg-[var(--bg-primary)] border rounded-lg text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all",
                errors.phone 
                  ? "border-[var(--danger)] focus:ring-[var(--danger)]" 
                  : "border-[var(--border)] focus:ring-[var(--accent)]"
              )}
              placeholder="(11) 99999-9999"
            />
            {errors.phone && (
              <p className="text-xs text-[var(--danger)] mt-1">{errors.phone}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--text-primary)] mb-1.5">
              Email
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-4 py-2.5 bg-[var(--bg-primary)] border border-[var(--border)] rounded-lg text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:ring-offset-2 transition-all"
              placeholder="email@exemplo.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--text-primary)] mb-1.5">
              Data de nascimento
            </label>
            <input
              type="date"
              value={formData.birthDate}
              onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
              className="w-full px-4 py-2.5 bg-[var(--bg-primary)] border border-[var(--border)] rounded-lg text-sm text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:ring-offset-2 transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--text-primary)] mb-1.5">
              Observações
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={3}
              className="w-full px-4 py-2.5 bg-[var(--bg-primary)] border border-[var(--border)] rounded-lg text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:ring-offset-2 transition-all resize-none"
              placeholder="Preferências, alergias, etc."
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={() => {
                setIsModalOpen(false)
                setErrors({})
              }}
              className="flex-1 px-4 py-2.5 text-sm font-medium text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)] rounded-lg transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2.5 bg-[var(--accent)] text-white font-medium text-sm rounded-lg hover:bg-[var(--accent-hover)] active:scale-[0.97] transition-all duration-200"
            >
              Salvar Cliente
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
