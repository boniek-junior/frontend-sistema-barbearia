'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { Search, Plus, Users, ArrowUpDown, Loader2 } from 'lucide-react'
import { useStore } from '@/lib/store'
import { ClientAvatar } from '@/components/client-avatar'
import { EmptyState } from '@/components/empty-state'
import { Modal } from '@/components/modal'
import { useToast } from '@/components/toast'
import { cn } from '@/lib/utils'

export default function ClientesPage() {
  const { clientes, addCliente, loading } = useStore()
  const { showToast } = useToast()
  const [search, setSearch] = useState('')
  const [sortBy, setSortBy] = useState<'nome' | 'id'>('nome')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  const [formData, setFormData] = useState({
    nome: '',
    telefone: '',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  const filteredClients = useMemo(() => {
    let filtered = clientes.filter(cliente => 
      cliente.nome.toLowerCase().includes(search.toLowerCase()) ||
      cliente.telefone.includes(search)
    )
    
    filtered.sort((a, b) => {
      if (sortBy === 'nome') {
        return a.nome.localeCompare(b.nome)
      }
      return b.id - a.id // mais recentes primeiro
    })
    
    return filtered
  }, [clientes, search, sortBy])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const newErrors: Record<string, string> = {}
    if (!formData.nome.trim()) newErrors.nome = 'Nome é obrigatório'
    else {
      // API exige pelo menos nome e sobrenome
      const partes = formData.nome.trim().split(/\s+/)
      if (partes.length < 2) newErrors.nome = 'Nome deve conter pelo menos nome e sobrenome'
    }
    if (!formData.telefone.trim()) newErrors.telefone = 'Telefone é obrigatório'
    else {
      // API exige apenas dígitos, min 8 chars
      const digitsOnly = formData.telefone.replace(/\D/g, '')
      if (digitsOnly.length < 8) newErrors.telefone = 'Telefone deve ter pelo menos 8 dígitos'
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    setIsSubmitting(true)
    try {
      await addCliente({
        nome: formData.nome.trim(),
        telefone: formData.telefone.replace(/\D/g, ''), // enviar apenas dígitos
      })
      
      setFormData({ nome: '', telefone: '' })
      setErrors({})
      setIsModalOpen(false)
      showToast('success', 'Cliente cadastrado com sucesso!')
    } catch (err: unknown) {
      showToast('error', err instanceof Error ? err.message : 'Erro ao cadastrar cliente')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-[var(--accent)] animate-spin" />
      </div>
    )
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
          onClick={() => setSortBy(sortBy === 'nome' ? 'id' : 'nome')}
          className="flex items-center gap-2 px-4 py-2.5 bg-[var(--bg-card)] border border-[var(--border)] rounded-lg text-sm font-medium text-[var(--text-secondary)] hover:border-[var(--accent)] transition-colors"
        >
          <ArrowUpDown className="w-4 h-4" />
          {sortBy === 'nome' ? 'Nome' : 'Recentes'}
        </button>
      </div>

      {/* Client List */}
      {filteredClients.length > 0 ? (
        <div className="space-y-3">
          {filteredClients.map((cliente) => (
            <Link
              key={cliente.id}
              href={`/clientes/${cliente.id}`}
              className="flex items-center gap-4 p-4 bg-[var(--bg-card)] rounded-xl border border-[var(--border)] hover:shadow-[var(--shadow-md)] hover:border-[var(--accent)] transition-all duration-200 active:scale-[0.99]"
            >
              <ClientAvatar name={cliente.nome} size="md" />
              
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-[var(--text-primary)] truncate">
                  {cliente.nome}
                </p>
                <p className="text-xs text-[var(--text-muted)] truncate">
                  {cliente.telefone}
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
              value={formData.nome}
              onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
              className={cn(
                "w-full px-4 py-2.5 bg-[var(--bg-primary)] border rounded-lg text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all",
                errors.nome 
                  ? "border-[var(--danger)] focus:ring-[var(--danger)]" 
                  : "border-[var(--border)] focus:ring-[var(--accent)]"
              )}
              placeholder="Ex: João Pedro Santos"
            />
            {errors.nome && (
              <p className="text-xs text-[var(--danger)] mt-1">{errors.nome}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--text-primary)] mb-1.5">
              Telefone/WhatsApp *
            </label>
            <input
              type="tel"
              value={formData.telefone}
              onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
              className={cn(
                "w-full px-4 py-2.5 bg-[var(--bg-primary)] border rounded-lg text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all",
                errors.telefone 
                  ? "border-[var(--danger)] focus:ring-[var(--danger)]" 
                  : "border-[var(--border)] focus:ring-[var(--accent)]"
              )}
              placeholder="11999999999"
            />
            {errors.telefone && (
              <p className="text-xs text-[var(--danger)] mt-1">{errors.telefone}</p>
            )}
            <p className="text-xs text-[var(--text-muted)] mt-1">Apenas números, mínimo 8 dígitos</p>
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
              disabled={isSubmitting}
              className={cn(
                "flex-1 px-4 py-2.5 bg-[var(--accent)] text-white font-medium text-sm rounded-lg hover:bg-[var(--accent-hover)] active:scale-[0.97] transition-all duration-200",
                isSubmitting && "opacity-70 cursor-not-allowed"
              )}
            >
              {isSubmitting ? 'Salvando...' : 'Salvar Cliente'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
