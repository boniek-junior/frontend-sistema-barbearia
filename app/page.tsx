'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Scissors } from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()

  useEffect(() => {
    // API não tem autenticação — redireciona direto ao dashboard
    router.replace('/dashboard')
  }, [router])

  return (
    <div className="min-h-screen bg-[var(--bg-secondary)] flex flex-col items-center justify-center p-4">
      <div className="flex flex-col items-center">
        <div className="w-16 h-16 bg-[var(--accent)] rounded-2xl flex items-center justify-center mb-4 shadow-lg animate-pulse">
          <Scissors className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-2xl font-bold text-[var(--text-primary)] tracking-tight">
          BarberPro
        </h1>
        <p className="text-sm text-[var(--text-muted)] mt-2">
          Entrando...
        </p>
      </div>
    </div>
  )
}
