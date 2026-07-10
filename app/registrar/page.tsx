'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Scissors, Loader2 } from 'lucide-react'
import { registrar, login } from '@/lib/auth'

export default function RegistrarPage() {
  const router = useRouter()
  const [nome, setNome] = useState('')
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [erro, setErro] = useState('')
  const [carregando, setCarregando] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setErro('')
    setCarregando(true)

    try {
      await registrar(nome, email, senha)
      // Após criar a conta, já faz login automaticamente
      await login(email, senha)
      router.replace('/dashboard')
    } catch (err) {
      setErro(err instanceof Error ? err.message : 'Erro ao criar conta')
    } finally {
      setCarregando(false)
    }
  }

  return (
    <div className="min-h-screen bg-[var(--bg-secondary)] flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-[var(--accent)] rounded-2xl flex items-center justify-center mb-4 shadow-lg">
            <Scissors className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)] tracking-tight">
            Criar conta
          </h1>
          <p className="text-sm text-[var(--text-muted)] mt-1">
            Cadastre-se para usar o BarberPro
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-[var(--bg-primary)] rounded-2xl p-6 shadow-sm border border-[var(--border)] flex flex-col gap-4"
        >
          <div>
            <label className="text-sm font-medium text-[var(--text-secondary)]">
              Nome
            </label>
            <input
              type="text"
              required
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              className="mt-1 w-full rounded-lg border border-[var(--border)] px-3 py-2 text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
              placeholder="Seu nome"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-[var(--text-secondary)]">
              E-mail
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full rounded-lg border border-[var(--border)] px-3 py-2 text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
              placeholder="seuemail@exemplo.com"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-[var(--text-secondary)]">
              Senha
            </label>
            <input
              type="password"
              required
              minLength={6}
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              className="mt-1 w-full rounded-lg border border-[var(--border)] px-3 py-2 text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
              placeholder="Mínimo 6 caracteres"
            />
          </div>

          {erro && (
            <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">
              {erro}
            </p>
          )}

          <button
            type="submit"
            disabled={carregando}
            className="w-full bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white font-medium rounded-lg py-2.5 flex items-center justify-center gap-2 transition-colors disabled:opacity-60"
          >
            {carregando && <Loader2 className="w-4 h-4 animate-spin" />}
            Criar conta
          </button>
        </form>

        <p className="text-center text-sm text-[var(--text-muted)] mt-4">
          Já tem conta?{' '}
          <Link href="/" className="text-[var(--accent)] font-medium hover:underline">
            Entrar
          </Link>
        </p>
      </div>
    </div>
  )
}
