export type AppointmentStatus = 'pendente' | 'confirmado' | 'concluido' | 'cancelado'

export type TipoServico = 'corte' | 'barba' | 'corte_e_barba' | 'sobrancelha' | 'pintura' | 'pezinho'

export interface Cliente {
  id: number
  nome: string
  telefone: string
}

export interface Agendamento {
  id: number
  cliente_id: number
  servico: TipoServico
  inicio: string   // ISO datetime string
  fim: string      // ISO datetime string
  status: AppointmentStatus
  cliente: Cliente
}

// Mapa local de serviços — espelha o enum TipoServico do backend
export const SERVICOS: Record<TipoServico, { label: string; duracao: number }> = {
  corte: { label: 'Corte', duracao: 40 },
  barba: { label: 'Barba', duracao: 30 },
  corte_e_barba: { label: 'Corte e Barba', duracao: 70 },
  sobrancelha: { label: 'Sobrancelha', duracao: 20 },
  pintura: { label: 'Pintura', duracao: 60 },
  pezinho: { label: 'Pezinho', duracao: 15 },
}

export const SERVICOS_LIST = Object.entries(SERVICOS).map(([key, val]) => ({
  value: key as TipoServico,
  ...val,
}))
