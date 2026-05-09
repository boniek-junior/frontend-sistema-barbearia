'use client'

import { useState } from 'react'
import { Plus, Clock, DollarSign, Scissors } from 'lucide-react'
import { useStore } from '@/lib/store'
import { Modal } from '@/components/modal'
import { useToast } from '@/components/toast'
import { cn } from '@/lib/utils'

export default function ServicosPage() {
  const { services, addService, updateService, toggleServiceActive } = useStore()
  const { showToast } = useToast()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  
  const [formData, setFormData] = useState({
    name: '',
    duration: '',
    price: '',
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.name || !formData.duration || !formData.price) {
      showToast('error', 'Preencha todos os campos')
      return
    }

    addService({
      name: formData.name,
      duration: parseInt(formData.duration),
      price: parseFloat(formData.price),
      active: true,
    })
    
    setFormData({ name: '', duration: '', price: '' })
    setIsModalOpen(false)
    showToast('success', 'Serviço adicionado!')
  }

  const handleInlineEdit = (id: string, field: 'price' | 'duration', value: string) => {
    const numValue = field === 'price' ? parseFloat(value) : parseInt(value)
    if (isNaN(numValue)) return
    
    updateService(id, { [field]: numValue })
    setEditingId(null)
    showToast('success', 'Serviço atualizado!')
  }

  return (
    <div className="p-4 lg:p-8 max-w-3xl mx-auto">
      {/* Header */}
      <header className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-[var(--text-primary)] tracking-tight">
              Serviços
            </h1>
            <p className="text-sm text-[var(--text-muted)] mt-1">
              Configure os serviços oferecidos na sua barbearia
            </p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-[var(--accent)] text-white font-medium text-sm rounded-lg hover:bg-[var(--accent-hover)] active:scale-[0.97] transition-all duration-200"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Adicionar</span>
          </button>
        </div>
      </header>

      {/* Services List */}
      <div className="space-y-3">
        {services.map((service) => (
          <div
            key={service.id}
            className={cn(
              "p-4 bg-[var(--bg-card)] rounded-xl border border-[var(--border)] transition-all duration-200",
              !service.active && "opacity-60"
            )}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-[var(--accent-light)] flex items-center justify-center">
                  <Scissors className="w-5 h-5 text-[var(--accent)]" />
                </div>
                <div>
                  <h3 className="text-sm font-medium text-[var(--text-primary)]">
                    {service.name}
                  </h3>
                  <div className="flex items-center gap-4 mt-1">
                    {/* Duration - Editable */}
                    <div className="flex items-center gap-1 text-xs text-[var(--text-muted)]">
                      <Clock className="w-3.5 h-3.5" />
                      {editingId === `${service.id}-duration` ? (
                        <input
                          type="number"
                          defaultValue={service.duration}
                          autoFocus
                          onBlur={(e) => handleInlineEdit(service.id, 'duration', e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              handleInlineEdit(service.id, 'duration', (e.target as HTMLInputElement).value)
                            }
                            if (e.key === 'Escape') setEditingId(null)
                          }}
                          className="w-12 px-1 py-0.5 bg-[var(--bg-primary)] border border-[var(--accent)] rounded text-center"
                        />
                      ) : (
                        <button
                          onClick={() => setEditingId(`${service.id}-duration`)}
                          className="hover:text-[var(--accent)] transition-colors"
                        >
                          {service.duration} min
                        </button>
                      )}
                    </div>
                    {/* Price - Editable */}
                    <div className="flex items-center gap-1 text-xs text-[var(--text-muted)]">
                      <DollarSign className="w-3.5 h-3.5" />
                      {editingId === `${service.id}-price` ? (
                        <input
                          type="number"
                          step="0.01"
                          defaultValue={service.price}
                          autoFocus
                          onBlur={(e) => handleInlineEdit(service.id, 'price', e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              handleInlineEdit(service.id, 'price', (e.target as HTMLInputElement).value)
                            }
                            if (e.key === 'Escape') setEditingId(null)
                          }}
                          className="w-16 px-1 py-0.5 bg-[var(--bg-primary)] border border-[var(--accent)] rounded text-center"
                        />
                      ) : (
                        <button
                          onClick={() => setEditingId(`${service.id}-price`)}
                          className="hover:text-[var(--accent)] transition-colors"
                        >
                          R$ {service.price.toFixed(2)}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Toggle Switch */}
              <button
                onClick={() => {
                  toggleServiceActive(service.id)
                  showToast('info', service.active ? 'Serviço desativado' : 'Serviço ativado')
                }}
                className={cn(
                  "relative w-12 h-7 rounded-full transition-colors duration-200",
                  service.active ? "bg-[var(--accent)]" : "bg-[var(--border)]"
                )}
              >
                <span
                  className={cn(
                    "absolute top-1 w-5 h-5 bg-white rounded-full shadow-sm transition-all duration-200",
                    service.active ? "left-6" : "left-1"
                  )}
                />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add Service Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Novo Serviço"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[var(--text-primary)] mb-1.5">
              Nome do serviço
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-2.5 bg-[var(--bg-primary)] border border-[var(--border)] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent)] transition-all"
              placeholder="Ex: Corte Degradê"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[var(--text-primary)] mb-1.5">
                Duração (minutos)
              </label>
              <input
                type="number"
                value={formData.duration}
                onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                className="w-full px-4 py-2.5 bg-[var(--bg-primary)] border border-[var(--border)] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent)] transition-all"
                placeholder="30"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--text-primary)] mb-1.5">
                Preço (R$)
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                className="w-full px-4 py-2.5 bg-[var(--bg-primary)] border border-[var(--border)] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent)] transition-all"
                placeholder="45.00"
              />
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="flex-1 px-4 py-2.5 text-sm font-medium text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)] rounded-lg transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2.5 bg-[var(--accent)] text-white font-medium text-sm rounded-lg hover:bg-[var(--accent-hover)] active:scale-[0.97] transition-all duration-200"
            >
              Adicionar Serviço
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
