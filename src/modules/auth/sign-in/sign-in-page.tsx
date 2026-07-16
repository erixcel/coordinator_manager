import {
  ArrowRight,
  BadgeCheck,
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  ShieldCheck,
  GraduationCap,
} from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import type { FormEvent, ReactNode } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../../store/use-auth-store'
import { cn, shell } from '../../admin/shared/styles'

type AuthMode = 'admin' | 'student'

export function SignInPage() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const accessToken = useAuthStore((state) => state.accessToken)
  const signIn = useAuthStore((state) => state.signIn)
  const user = useAuthStore((state) => state.user)
  const navigate = useNavigate()
  const [mode, setMode] = useState<AuthMode>('admin')
  const [identifier, setIdentifier] = useState('')
  const [password, setPassword] = useState('')
  const [showLoginPassword, setShowLoginPassword] = useState(false)
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const identifierRef = useRef<HTMLInputElement | null>(null)
  const passwordRef = useRef<HTMLInputElement | null>(null)

  useEffect(() => {
    setIdentifier('')
    setPassword('')

    if (identifierRef.current) {
      identifierRef.current.value = ''
    }
    if (passwordRef.current) {
      passwordRef.current.value = ''
    }
  }, [])

  async function handleSignIn(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!identifier.trim() || !password.trim()) {
      setError(
        mode === 'student'
          ? 'Escribe tu codigo de estudiante y tu contrasena.'
          : 'Escribe tu correo o usuario y tu contrasena.',
      )
      return
    }

    if (mode === 'student' && !/^U\d{8}$/i.test(identifier.trim())) {
      setError('El codigo de estudiante debe empezar con U y tener 8 digitos.')
      return
    }

    setError('')
    setIsSubmitting(true)

    try {
      const authenticatedUser = await signIn(identifier.trim(), password)

      if (mode === 'admin' && authenticatedUser.role === 'admin') {
        navigate('/admin/resumen', { replace: true })
        return
      }

      if (mode === 'student' && authenticatedUser.role === 'student') {
        navigate('/student/inicio', { replace: true })
        return
      }

      throw new Error(
        mode === 'admin'
          ? 'Esta cuenta no tiene permisos administrativos.'
          : 'Esta cuenta no esta habilitada como estudiante.',
      )
    } catch (signInError) {
      setError(signInError instanceof Error ? signInError.message : 'No se pudo iniciar sesion.')
    } finally {
      setIsSubmitting(false)
    }
  }

  function switchMode(nextMode: AuthMode) {
    setMode(nextMode)
    setIdentifier('')
    setPassword('')
    setError('')
  }

  if (isAuthenticated && accessToken) {
    if (user?.role === 'admin') {
      return <Navigate replace to="/admin/resumen" />
    }
    if (user?.role === 'student') {
      return <Navigate replace to="/student/inicio" />
    }
  }

  return (
    <main className={cn(shell, 'min-h-screen bg-[#f5f3ee] px-4 py-6 sm:px-6 lg:px-8')}>
      <div className="mx-auto grid min-h-[calc(100vh-3rem)] w-full max-w-6xl overflow-hidden rounded-[32px] border border-[#dfd8cc] bg-[#fffdfa] shadow-[0_30px_100px_rgba(63,41,26,0.12)] lg:grid-cols-[1.05fr_0.95fr]">
        <section className="relative overflow-hidden bg-[linear-gradient(160deg,#1f2937_0%,#3b2f2f_48%,#8b2332_100%)] px-6 py-8 text-white sm:px-8 sm:py-10 lg:px-10 lg:py-12">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.14),transparent_34%),radial-gradient(circle_at_bottom_right,rgba(255,214,120,0.12),transparent_28%)]" />
          <div className="relative flex h-full flex-col justify-between gap-8">
            <div className="space-y-5">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-2 text-sm font-medium text-white/92 backdrop-blur">
                <ShieldCheck size={16} strokeWidth={1.9} />
                Acceso seguro del sistema
              </div>
              <div className="max-w-xl space-y-4">
                <h1 className="text-3xl font-semibold leading-tight text-white sm:text-[2.55rem]">
                  Administra el acceso con una experiencia mas limpia y real.
                </h1>
                <p className="max-w-lg text-sm leading-7 text-white/76 sm:text-[15px]">
                  Los administradores gestionan el panel y los estudiantes matriculados ingresan con su codigo
                  institucional. Todo queda organizado desde una sola pantalla.
                </p>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <InfoTile
                icon={LockKeyhole}
                text="Cada persona entra solo al espacio que le corresponde."
                title="Acceso claro"
              />
              <InfoTile
                icon={GraduationCap}
                text="Los estudiantes matriculados usan su codigo U seguido de 8 digitos."
                title="Codigo U"
              />
              <InfoTile
                icon={BadgeCheck}
                text="Las cuentas se gestionan internamente y no se crean desde esta pantalla."
                title="Gestion interna"
              />
            </div>
          </div>
        </section>

        <section className="flex items-center bg-[#fffdfa] px-4 py-6 sm:px-8 sm:py-8 lg:px-10">
          <div className="mx-auto w-full max-w-[440px]">
            <div className="mb-6 grid gap-4">
              <div className="inline-flex w-fit items-center gap-2 rounded-full border border-[#eadfce] bg-[#fbf6ef] px-3 py-2 text-sm font-medium text-[#6f2d38]">
                {mode === 'admin' ? <ShieldCheck size={16} strokeWidth={1.8} /> : <GraduationCap size={16} strokeWidth={1.8} />}
                {mode === 'admin' ? 'Acceso administrativo' : 'Acceso de estudiantes'}
              </div>

              <div className="space-y-2">
                <h2 className="text-[28px] font-semibold leading-tight text-[#1f2937]">
                  {mode === 'admin' ? 'Inicia sesion para entrar al panel.' : 'Inicia sesion con tu codigo de estudiante.'}
                </h2>
                <p className="text-sm leading-6 text-[#6b7280]">
                  {mode === 'admin'
                    ? 'Usa tu correo o usuario administrativo. Si la cuenta no tiene permisos, el panel no te dejara entrar.'
                    : 'Usa tu codigo institucional con formato U######## y la contrasena asignada por la universidad.'}
                </p>
              </div>
            </div>

            <div className="mb-6 grid grid-cols-2 rounded-2xl border border-[#eadfce] bg-[#f8f1e8] p-1">
              <ModeButton
                active={mode === 'admin'}
                icon={ShieldCheck}
                label="Administrador"
                onClick={() => switchMode('admin')}
              />
              <ModeButton
                active={mode === 'student'}
                icon={GraduationCap}
                label="Estudiantes"
                onClick={() => switchMode('student')}
              />
            </div>

            {error ? (
              <div className="mb-5 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">
                {error}
              </div>
            ) : null}

            <form autoComplete="off" className="grid gap-4" onSubmit={handleSignIn}>
              <input
                aria-hidden="true"
                autoComplete="username"
                className="hidden"
                name="fake-username"
                tabIndex={-1}
                type="text"
              />
              <input
                aria-hidden="true"
                autoComplete="current-password"
                className="hidden"
                name="fake-password"
                tabIndex={-1}
                type="password"
              />
              <FieldShell icon={mode === 'student' ? GraduationCap : Mail} label={mode === 'student' ? 'Codigo de estudiante' : 'Correo o usuario'}>
                <input
                  ref={identifierRef}
                  autoComplete="off"
                  className="h-14 w-full bg-transparent text-[15px] text-[#111827] outline-none placeholder:text-[#9ca3af]"
                  onChange={(event) => setIdentifier(mode === 'student' ? event.target.value.toUpperCase() : event.target.value)}
                  name={mode === 'student' ? 'student-code' : 'admin-access-key'}
                  placeholder={mode === 'student' ? 'U12345678' : 'Escribe tu correo o usuario'}
                  type="text"
                  value={identifier}
                />
              </FieldShell>

              <FieldShell icon={LockKeyhole} label="Contrasena">
                <div className="flex w-full min-w-0 items-center gap-2">
                  <input
                    ref={passwordRef}
                    autoComplete="new-password"
                    className="h-14 min-w-0 flex-1 bg-transparent text-[15px] text-[#111827] outline-none placeholder:text-[#9ca3af]"
                    name={mode === 'student' ? 'student-access-secret' : 'admin-access-secret'}
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder={mode === 'student' ? 'Contrasena asignada' : 'Escribe tu contrasena'}
                    type={showLoginPassword ? 'text' : 'password'}
                    value={password}
                  />
                  <VisibilityButton
                    isVisible={showLoginPassword}
                    onClick={() => setShowLoginPassword((current) => !current)}
                  />
                </div>
              </FieldShell>

              <button
                className="mt-2 inline-flex h-14 items-center justify-center gap-2 rounded-2xl bg-[#ff355d] px-6 text-[15px] font-semibold text-white transition hover:bg-[#e8294f] disabled:cursor-not-allowed disabled:bg-[#d6d3d1]"
                disabled={isSubmitting}
                type="submit"
              >
                {mode === 'student' ? <GraduationCap size={18} strokeWidth={1.8} /> : <ShieldCheck size={18} strokeWidth={1.8} />}
                {isSubmitting ? 'Validando acceso...' : mode === 'student' ? 'Entrar como estudiante' : 'Entrar al panel'}
              </button>
            </form>

            <div className="mt-6 flex items-center gap-2 text-sm text-[#6b7280]">
              <ArrowRight size={15} strokeWidth={1.8} />
              <span>
                {mode === 'student'
                  ? 'Las cuentas estudiantiles son creadas internamente por la universidad.'
                  : 'Sin credenciales visibles ni valores precargados.'}
              </span>
            </div>
          </div>
        </section>
      </div>
    </main>
  )
}

type ModeButtonProps = {
  active: boolean
  icon: typeof ShieldCheck
  label: string
  onClick: () => void
}

function ModeButton({ active, icon: Icon, label, onClick }: ModeButtonProps) {
  return (
    <button
      className={cn(
        'inline-flex h-12 items-center justify-center gap-2 rounded-[18px] text-sm font-semibold transition',
        active ? 'bg-white text-[#111827] shadow-[0_8px_24px_rgba(31,41,55,0.08)]' : 'text-[#6b7280] hover:text-[#111827]',
      )}
      onClick={onClick}
      type="button"
    >
      <Icon size={16} strokeWidth={1.9} />
      {label}
    </button>
  )
}

type FieldShellProps = {
  children: ReactNode
  icon: typeof Mail
  label: string
}

function FieldShell({ children, icon: Icon, label }: FieldShellProps) {
  return (
    <label className="grid gap-2 text-sm font-medium text-[#374151]">
      {label}
      <span className="flex min-h-14 items-center gap-3 rounded-2xl border border-[#e5ded3] bg-white px-4 shadow-[0_1px_2px_rgba(15,23,42,0.04)] transition focus-within:border-[#c2415a] focus-within:ring-4 focus-within:ring-[#ffe4e8]">
        <Icon size={17} strokeWidth={1.9} className="shrink-0 text-[#9a3a4d]" />
        {children}
      </span>
    </label>
  )
}

function VisibilityButton({ isVisible, onClick }: { isVisible: boolean; onClick: () => void }) {
  const Icon = isVisible ? EyeOff : Eye

  return (
    <button
      aria-label={isVisible ? 'Ocultar contrasena' : 'Mostrar contrasena'}
      className="grid h-10 w-10 shrink-0 place-items-center rounded-xl text-[#6b7280] transition hover:bg-[#f8f1e8] hover:text-[#111827]"
      onClick={onClick}
      type="button"
    >
      <Icon size={17} strokeWidth={1.9} />
    </button>
  )
}

function InfoTile({
  icon: Icon,
  text,
  title,
}: {
  icon: typeof ShieldCheck
  text: string
  title: string
}) {
  return (
    <div className="rounded-[22px] border border-white/10 bg-white/8 p-4 backdrop-blur-sm">
      <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-white/12 text-white">
        <Icon size={18} strokeWidth={1.9} />
      </div>
      <p className="text-sm font-semibold text-white">{title}</p>
      <p className="mt-2 text-sm leading-6 text-white/72">{text}</p>
    </div>
  )
}
