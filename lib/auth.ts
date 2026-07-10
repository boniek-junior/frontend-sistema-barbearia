const TOKEN_KEY = 'barberpro_token'
const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'

// ─── Armazenamento do token ──────────────────────────────────────────────────

export function getToken(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem(TOKEN_KEY)
}

export function setToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token)
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY)
}

export function isAuthenticated(): boolean {
  return !!getToken()
}

// ─── Login ────────────────────────────────────────────────────────────────────

export async function login(email: string, senha: string): Promise<void> {
  const body = new URLSearchParams()
  body.set('username', email)
  body.set('password', senha)

  const res = await fetch(`${API_BASE}/usuarios/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  })

  if (!res.ok) {
    const data = await res.json().catch(() => ({}))
    throw new Error(data.detail || 'E-mail ou senha incorretos')
  }

  const data = await res.json()
  setToken(data.access_token)
}

// ─── Registro ─────────────────────────────────────────────────────────────────

export async function registrar(nome: string, email: string, senha: string): Promise<void> {
  const res = await fetch(`${API_BASE}/usuarios/registrar`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ nome, email, senha }),
  })

  if (!res.ok) {
    const data = await res.json().catch(() => ({}))
    throw new Error(data.detail || 'Não foi possível criar a conta')
  }
}

// ─── Logout ───────────────────────────────────────────────────────────────────

export function logout() {
  clearToken()
  if (typeof window !== 'undefined') {
    window.location.href = '/'
  }
}
