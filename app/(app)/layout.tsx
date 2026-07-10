'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Sidebar } from '@/components/sidebar'
import { BottomNav } from '@/components/bottom-nav'
import { StoreProvider } from '@/lib/store'
import { ToastProvider } from '@/components/toast'
import { isAuthenticated } from '@/lib/auth'
import { Loader2 } from 'lucide-react'

export default function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const [verificando, setVerificando] = useState(true)

  useEffect(() => {
    if (!isAuthenticated()) {
      router.replace('/')
    } else {
      setVerificando(false)
    }
  }, [router])

  if (verificando) {
    return (
      <div className="min-h-screen bg-[var(--bg-secondary)] flex items-center justify-center">
        <Loader2 className="w-6 h-6 text-[var(--accent)] animate-spin" />
      </div>
    )
  }

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
