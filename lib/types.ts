export type AppointmentStatus = 'confirmado' | 'concluido' | 'cancelado' | 'pendente'

export interface Client {
  id: string
  name: string
  phone: string
  email?: string
  birthDate?: string
  notes?: string
  createdAt: string
  totalVisits: number
  lastVisit?: string
  favoriteService?: string
}

export interface Service {
  id: string
  name: string
  duration: number // in minutes
  price: number
  active: boolean
}

export interface Appointment {
  id: string
  clientId: string
  client: Client
  serviceId: string
  service: Service
  date: string
  time: string
  status: AppointmentStatus
  createdAt: string
}

export interface Barber {
  id: string
  name: string
  email: string
  phone: string
  shopName: string
  address?: string
  avatar?: string
}

export interface WorkingHours {
  day: number // 0 = Sunday, 1 = Monday, etc.
  active: boolean
  start: string
  end: string
}
