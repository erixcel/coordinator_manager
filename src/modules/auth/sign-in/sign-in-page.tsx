import { ShieldCheck } from 'lucide-react'
import { useState } from 'react'
import type { FormEvent } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { useAdminStore } from '../../../store/use-admin-store'
import { cn, shell } from '../../admin/shared/styles'

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
      setError('Ingresa correo y contraseña para continuar.')
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
    <main className={cn(shell, 'grid place-items-center bg-[#F7F7F7] px-4 py-8')}>
      <section
        aria-labelledby="login-title"
        className="w-full max-w-[440px] rounded-[24px] border border-[#DDDDDD] bg-white px-6 py-10 shadow-[0_24px_80px_rgba(0,0,0,0.12)] sm:px-8 sm:py-12"
      >
        <div className="mx-auto mb-5 grid h-16 w-16 place-items-center rounded-full bg-[#FFF0F3] text-[#FF385C]">
          <ShieldCheck size={30} strokeWidth={1.7} />
        </div>
        <h1 id="login-title" className="text-center text-[26px] font-semibold leading-tight text-[#222222]">
          Iniciar sesión
        </h1>

        <form className="mt-9 grid gap-5" onSubmit={handleSubmit}>
          <label className="grid gap-2 text-sm font-medium text-[#222222]">
            Correo institucional
            <input
              autoComplete="email"
              className="h-14 rounded-[8px] border border-[#DDDDDD] px-4 text-[15px] outline-none transition placeholder:text-[#717171] focus:border-[#222222]"
              onChange={(event) => setEmail(event.target.value)}
              type="email"
              value={email}
            />
          </label>
          <label className="grid gap-2 text-sm font-medium text-[#222222]">
            Contraseña
            <input
              autoComplete="current-password"
              className="h-14 rounded-[8px] border border-[#DDDDDD] px-4 text-[15px] outline-none transition placeholder:text-[#717171] focus:border-[#222222]"
              onChange={(event) => setPassword(event.target.value)}
              type="password"
              value={password}
            />
          </label>
          {error ? <p className="text-sm font-medium text-[#C11331]">{error}</p> : null}
          <button
            className="mt-2 inline-flex h-12 items-center justify-center gap-2 rounded-full bg-[#FF385C] px-6 text-[15px] font-semibold text-white transition hover:bg-[#E61E43] active:bg-[#C11331]"
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
