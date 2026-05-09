'use client'

import { Clock, Scissors } from 'lucide-react'
import { SERVICOS_LIST } from '@/lib/types'

export default function ServicosPage() {
  return (
    <div className="p-4 lg:p-8 max-w-3xl mx-auto">
      {/* Header */}
      <header className="mb-6">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-[var(--text-primary)] tracking-tight">
            Serviços
          </h1>
          <p className="text-sm text-[var(--text-muted)] mt-1">
            Serviços disponíveis na barbearia
          </p>
        </div>
      </header>

      {/* Services List */}
      <div className="space-y-3">
        {SERVICOS_LIST.map((servico) => (
          <div
            key={servico.value}
            className="p-4 bg-[var(--bg-card)] rounded-xl border border-[var(--border)] transition-all duration-200"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-[var(--accent-light)] flex items-center justify-center">
                  <Scissors className="w-5 h-5 text-[var(--accent)]" />
                </div>
                <div>
                  <h3 className="text-sm font-medium text-[var(--text-primary)]">
                    {servico.label}
                  </h3>
                  <div className="flex items-center gap-1 mt-1 text-xs text-[var(--text-muted)]">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{servico.duracao} min</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Info */}
      <div className="mt-8 p-4 bg-[var(--bg-card)] rounded-xl border border-[var(--border)]">
        <p className="text-sm text-[var(--text-muted)]">
          Os serviços e durações são gerenciados pelo sistema. Para alterar os serviços disponíveis, entre em contato com o suporte técnico.
        </p>
      </div>
    </div>
  )
}
