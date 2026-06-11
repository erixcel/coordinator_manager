import { GraduationCap, ShieldCheck } from 'lucide-react'
import { useState } from 'react'
import type { FormEvent } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { useAdminStore } from '../../../store/use-admin-store'

export function SignInPage() {
  const isAuthenticated = useAdminStore((state) => state.isAuthenticated)
  const signIn = useAdminStore((state) => state.signIn)
  const navigate = useNavigate()
  const [email, setEmail] = useState('admin@utp.edu.pe')
  const [password, setPassword] = useState('admin123')
  const [error, setError] = useState('')

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!email.trim() || !password.trim()) {
      setError('Ingresa correo y contrasena para continuar.')
      return
    }

    setError('')
    signIn()
    navigate('/admin/resumen', { replace: true })
  }

  if (isAuthenticated) {
    return <Navigate replace to="/admin/resumen" />
  }

  return (
    <main className="grid min-h-screen place-items-center bg-gradient-to-br from-[#0F172A] via-[#1E293B] to-[#0F172A] px-4 py-8 font-['Inter',-apple-system,BlinkMacSystemFont,'Segoe_UI',Roboto,Helvetica,Arial,sans-serif]">
      {/* Decorative background elements */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 h-96 w-96 rounded-full bg-[#FF385C]/8 blur-[120px]" />
        <div className="absolute -bottom-40 -left-40 h-96 w-96 rounded-full bg-[#0EA5E9]/8 blur-[120px]" />
      </div>

      <section
        aria-labelledby="login-title"
        className="relative w-full max-w-[420px] animate-fade-in-up rounded-2xl border border-white/10 bg-white/[0.06] px-6 py-10 shadow-[0_32px_80px_rgba(0,0,0,0.3)] backdrop-blur-2xl sm:px-8 sm:py-12"
      >
        {/* Logo */}
        <div className="mx-auto mb-6 grid h-16 w-16 place-items-center rounded-2xl bg-gradient-to-br from-[#FF385C] to-[#FF6B81] text-white shadow-[0_8px_32px_rgba(255,56,92,0.35)]">
          <GraduationCap size={32} strokeWidth={1.7} />
        </div>

        <h1 id="login-title" className="text-center text-2xl font-extrabold leading-tight text-white">
          Iniciar sesion
        </h1>
        <p className="mt-2 text-center text-sm font-medium text-slate-400">
          Accede al panel de coordinacion academica
        </p>

        <form className="mt-8 grid gap-5" onSubmit={handleSubmit}>
          <label className="grid gap-2 text-sm font-semibold text-slate-300">
            Correo institucional
            <input
              autoComplete="email"
              className="h-12 rounded-xl border border-white/10 bg-white/[0.06] px-4 text-sm font-medium text-white outline-none transition-all duration-200 placeholder:text-slate-500 focus:border-[#FF385C]/50 focus:bg-white/[0.08] focus:shadow-[0_0_0_3px_rgba(255,56,92,0.12)]"
              onChange={(event) => setEmail(event.target.value)}
              type="email"
              value={email}
            />
          </label>
          <label className="grid gap-2 text-sm font-semibold text-slate-300">
            Contrasena
            <input
              autoComplete="current-password"
              className="h-12 rounded-xl border border-white/10 bg-white/[0.06] px-4 text-sm font-medium text-white outline-none transition-all duration-200 placeholder:text-slate-500 focus:border-[#FF385C]/50 focus:bg-white/[0.08] focus:shadow-[0_0_0_3px_rgba(255,56,92,0.12)]"
              onChange={(event) => setPassword(event.target.value)}
              type="password"
              value={password}
            />
          </label>
          {error ? <p className="text-sm font-medium text-rose-400">{error}</p> : null}
          <button
            className="mt-2 inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#FF385C] to-[#FF5A79] px-6 text-sm font-bold text-white shadow-[0_8px_24px_rgba(255,56,92,0.30)] transition-all duration-200 hover:shadow-[0_12px_32px_rgba(255,56,92,0.40)] hover:scale-[1.02] active:scale-[0.98]"
            type="submit"
          >
            <ShieldCheck size={18} strokeWidth={1.8} />
            Continuar
          </button>
        </form>
      </section>
    </main>
  )
}
