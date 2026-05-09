'use client'

import { Sidebar } from '@/components/sidebar'
import { BottomNav } from '@/components/bottom-nav'
import { StoreProvider } from '@/lib/store'
import { ToastProvider } from '@/components/toast'

export default function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <StoreProvider>
      <ToastProvider>
        <div className="min-h-screen bg-[var(--bg-secondary)]">
          <Sidebar />
          <main className="lg:ml-60 pb-20 lg:pb-0 min-h-screen">
            <div className="page-transition">
              {children}
            </div>
          </main>
          <BottomNav />
        </div>
      </ToastProvider>
    </StoreProvider>
  )
}
