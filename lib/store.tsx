'use client'

import { createContext, useContext, useState, useCallback, ReactNode } from 'react'
import { Client, Service, Appointment, Barber, AppointmentStatus } from './types'
import { mockBarber, mockClients, mockServices, mockAppointments } from './mock-data'

interface StoreContextType {
  barber: Barber
  clients: Client[]
  services: Service[]
  appointments: Appointment[]
  addClient: (client: Omit<Client, 'id' | 'createdAt' | 'totalVisits'>) => Client
  updateClient: (id: string, data: Partial<Client>) => void
  addAppointment: (appointment: Omit<Appointment, 'id' | 'createdAt'>) => Appointment
  updateAppointmentStatus: (id: string, status: AppointmentStatus) => void
  addService: (service: Omit<Service, 'id'>) => Service
  updateService: (id: string, data: Partial<Service>) => void
  toggleServiceActive: (id: string) => void
}

const StoreContext = createContext<StoreContextType | null>(null)

export function StoreProvider({ children }: { children: ReactNode }) {
  const [barber] = useState<Barber>(mockBarber)
  const [clients, setClients] = useState<Client[]>(mockClients)
  const [services, setServices] = useState<Service[]>(mockServices)
  const [appointments, setAppointments] = useState<Appointment[]>(mockAppointments)

  const addClient = useCallback((clientData: Omit<Client, 'id' | 'createdAt' | 'totalVisits'>) => {
    const newClient: Client = {
      ...clientData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString().split('T')[0],
      totalVisits: 0,
    }
    setClients(prev => [...prev, newClient])
    return newClient
  }, [])

  const updateClient = useCallback((id: string, data: Partial<Client>) => {
    setClients(prev => prev.map(c => c.id === id ? { ...c, ...data } : c))
  }, [])

  const addAppointment = useCallback((appointmentData: Omit<Appointment, 'id' | 'createdAt'>) => {
    const newAppointment: Appointment = {
      ...appointmentData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString().split('T')[0],
    }
    setAppointments(prev => [...prev, newAppointment])
    
    // Update client's visit count and last visit
    setClients(prev => prev.map(c => 
      c.id === appointmentData.clientId 
        ? { 
            ...c, 
            totalVisits: c.totalVisits + 1, 
            lastVisit: appointmentData.date,
            favoriteService: appointmentData.service.name 
          } 
        : c
    ))
    
    return newAppointment
  }, [])

  const updateAppointmentStatus = useCallback((id: string, status: AppointmentStatus) => {
    setAppointments(prev => prev.map(a => a.id === id ? { ...a, status } : a))
  }, [])

  const addService = useCallback((serviceData: Omit<Service, 'id'>) => {
    const newService: Service = {
      ...serviceData,
      id: Date.now().toString(),
    }
    setServices(prev => [...prev, newService])
    return newService
  }, [])

  const updateService = useCallback((id: string, data: Partial<Service>) => {
    setServices(prev => prev.map(s => s.id === id ? { ...s, ...data } : s))
  }, [])

  const toggleServiceActive = useCallback((id: string) => {
    setServices(prev => prev.map(s => s.id === id ? { ...s, active: !s.active } : s))
  }, [])

  return (
    <StoreContext.Provider value={{
      barber,
      clients,
      services,
      appointments,
      addClient,
      updateClient,
      addAppointment,
      updateAppointmentStatus,
      addService,
      updateService,
      toggleServiceActive,
    }}>
      {children}
    </StoreContext.Provider>
  )
}

export function useStore() {
  const context = useContext(StoreContext)
  if (!context) {
    throw new Error('useStore must be used within StoreProvider')
  }
  return context
}
