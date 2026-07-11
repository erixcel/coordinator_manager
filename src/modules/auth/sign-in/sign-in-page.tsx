import {
  ArrowRight,
  BadgeCheck,
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  ShieldCheck,
  UserPlus,
  UserRound,
} from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import type { FormEvent, ReactNode } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { authApi } from '../../../data'
import { useAdminStore } from '../../../store/use-admin-store'
import { cn, shell } from '../../admin/shared/styles'

type AuthMode = 'sign-in' | 'register'

type RegisterFormState = {
  confirmPassword: string
  email: string
  firstName: string
  lastName: string
  password: string
}

const registerInitialState: RegisterFormState = {
  confirmPassword: '',
  email: '',
  firstName: '',
  lastName: '',
  password: '',
}

export function SignInPage() {
  const isAuthenticated = useAdminStore((state) => state.isAuthenticated)
  const accessToken = useAdminStore((state) => state.accessToken)
  const signIn = useAdminStore((state) => state.signIn)
  const user = useAdminStore((state) => state.user)
  const navigate = useNavigate()
  const [mode, setMode] = useState<AuthMode>('sign-in')
  const [identifier, setIdentifier] = useState('')
  const [password, setPassword] = useState('')
  const [showLoginPassword, setShowLoginPassword] = useState(false)
  const [showRegisterPassword, setShowRegisterPassword] = useState(false)
  const [showRegisterConfirmPassword, setShowRegisterConfirmPassword] = useState(false)
  const [registerForm, setRegisterForm] = useState<RegisterFormState>(registerInitialState)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
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
      setError('Escribe tu correo o usuario y tu contrasena.')
      return
    }

    setError('')
    setSuccess('')
    setIsSubmitting(true)

    try {
      await signIn(identifier.trim(), password)
      navigate('/admin/resumen', { replace: true })
    } catch (signInError) {
      setError(signInError instanceof Error ? signInError.message : 'No se pudo iniciar sesion.')
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleRegister(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const { email, firstName, password: registerPassword, confirmPassword } = registerForm
    if (!firstName.trim() || !email.trim() || !registerPassword.trim() || !confirmPassword.trim()) {
      setError('Completa los campos obligatorios para crear la cuenta.')
      return
    }

    setError('')
    setSuccess('')
    setIsSubmitting(true)

    try {
      await authApi.registerStudent({
        confirmPassword: registerForm.confirmPassword,
        email: registerForm.email.trim(),
        firstName: registerForm.firstName.trim(),
        lastName: registerForm.lastName.trim(),
        password: registerForm.password,
      })

      setIdentifier('')
      setPassword('')
      setRegisterForm(registerInitialState)
      setMode('sign-in')
      setSuccess('Cuenta creada. Ahora inicia sesion manualmente con tu correo y tu contrasena.')
    } catch (registerError) {
      setError(registerError instanceof Error ? registerError.message : 'No se pudo crear la cuenta.')
    } finally {
      setIsSubmitting(false)
    }
  }

  function updateRegisterField<K extends keyof RegisterFormState>(field: K, value: RegisterFormState[K]) {
    setRegisterForm((current) => ({ ...current, [field]: value }))
  }

  function switchMode(nextMode: AuthMode) {
    setMode(nextMode)
    setError('')
    if (nextMode === 'register') {
      setSuccess('El registro crea una cuenta de alumno en la base de datos.')
    } else if (success === 'El registro crea una cuenta de alumno en la base de datos.') {
      setSuccess('')
    }
  }

  if (isAuthenticated && accessToken && user?.role === 'admin') {
    return <Navigate replace to="/admin/resumen" />
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
                  El panel administrativo usa inicio de sesion con JWT y el registro crea usuarios nuevos en la base
                  de datos. Ya no dejamos credenciales visibles ni formularios precargados.
                </p>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <InfoTile
                icon={LockKeyhole}
                text="Inicio de sesion con tokens reales y permisos por rol."
                title="Sesion real"
              />
              <InfoTile
                icon={UserPlus}
                text="El registro crea cuentas de alumno listas para continuar el flujo."
                title="Alta en base"
              />
              <InfoTile
                icon={BadgeCheck}
                text="Sin datos expuestos en pantalla ni accesos de ejemplo precargados."
                title="Mas serio"
              />
            </div>
          </div>
        </section>

        <section className="flex items-center bg-[#fffdfa] px-4 py-6 sm:px-8 sm:py-8 lg:px-10">
          <div className="mx-auto w-full max-w-[440px]">
            <div className="mb-6 grid gap-4">
              <div className="inline-flex w-fit items-center gap-2 rounded-full border border-[#eadfce] bg-[#fbf6ef] px-3 py-2 text-sm font-medium text-[#6f2d38]">
                {mode === 'sign-in' ? <ShieldCheck size={16} strokeWidth={1.8} /> : <UserPlus size={16} strokeWidth={1.8} />}
                {mode === 'sign-in' ? 'Acceso administrativo' : 'Registro de alumno'}
              </div>

              <div className="space-y-2">
                <h2 className="text-[28px] font-semibold leading-tight text-[#1f2937]">
                  {mode === 'sign-in' ? 'Inicia sesion para entrar al panel.' : 'Crea una cuenta nueva.'}
                </h2>
                <p className="text-sm leading-6 text-[#6b7280]">
                  {mode === 'sign-in'
                    ? 'Usa tu correo o tu usuario. Si la cuenta no es administrativa, el panel no te dejara entrar.'
                    : 'Este registro crea una cuenta de alumno en la base de datos. El enlace con datos academicos se puede completar despues.'}
                </p>
              </div>
            </div>

            <div className="mb-6 grid grid-cols-2 rounded-2xl border border-[#eadfce] bg-[#f8f1e8] p-1">
              <ModeButton
                active={mode === 'sign-in'}
                icon={ShieldCheck}
                label="Iniciar sesion"
                onClick={() => switchMode('sign-in')}
              />
              <ModeButton
                active={mode === 'register'}
                icon={UserPlus}
                label="Registrarse"
                onClick={() => switchMode('register')}
              />
            </div>

            {success ? (
              <div className="mb-5 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
                {success}
              </div>
            ) : null}

            {error ? (
              <div className="mb-5 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">
                {error}
              </div>
            ) : null}

            {mode === 'sign-in' ? (
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
                <FieldShell icon={Mail} label="Correo o usuario">
                  <input
                    ref={identifierRef}
                    autoComplete="off"
                    className="h-14 w-full bg-transparent text-[15px] text-[#111827] outline-none placeholder:text-[#9ca3af]"
                    onChange={(event) => setIdentifier(event.target.value)}
                    name="admin-access-key"
                    placeholder="Escribe tu correo o usuario"
                    type="text"
                    value={identifier}
                  />
                </FieldShell>

                <FieldShell icon={LockKeyhole} label="Contrasena">
                  <div className="flex items-center gap-3">
                    <input
                      ref={passwordRef}
                      autoComplete="new-password"
                      className="h-14 w-full bg-transparent text-[15px] text-[#111827] outline-none placeholder:text-[#9ca3af]"
                      name="admin-access-secret"
                      onChange={(event) => setPassword(event.target.value)}
                      placeholder="Escribe tu contrasena"
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
                  <ShieldCheck size={18} strokeWidth={1.8} />
                  {isSubmitting ? 'Validando acceso...' : 'Entrar al panel'}
                </button>
              </form>
            ) : (
              <form autoComplete="off" className="grid gap-4" onSubmit={handleRegister}>
                <div className="grid gap-4 sm:grid-cols-2">
                  <FieldShell icon={UserRound} label="Nombres">
                    <input
                      autoComplete="given-name"
                      className="h-14 w-full bg-transparent text-[15px] text-[#111827] outline-none placeholder:text-[#9ca3af]"
                      onChange={(event) => updateRegisterField('firstName', event.target.value)}
                      placeholder="Jefferson"
                      type="text"
                      value={registerForm.firstName}
                    />
                  </FieldShell>
                  <FieldShell icon={UserRound} label="Apellidos">
                    <input
                      autoComplete="family-name"
                      className="h-14 w-full bg-transparent text-[15px] text-[#111827] outline-none placeholder:text-[#9ca3af]"
                      onChange={(event) => updateRegisterField('lastName', event.target.value)}
                      placeholder="Gonzalez"
                      type="text"
                      value={registerForm.lastName}
                    />
                  </FieldShell>
                </div>

                <FieldShell icon={Mail} label="Correo">
                  <input
                    autoComplete="email"
                    className="h-14 w-full bg-transparent text-[15px] text-[#111827] outline-none placeholder:text-[#9ca3af]"
                    onChange={(event) => updateRegisterField('email', event.target.value)}
                    placeholder="nombre@correo.com"
                    type="email"
                    value={registerForm.email}
                  />
                </FieldShell>

                <FieldShell icon={LockKeyhole} label="Contrasena">
                  <div className="flex items-center gap-3">
                    <input
                      autoComplete="new-password"
                      className="h-14 w-full bg-transparent text-[15px] text-[#111827] outline-none placeholder:text-[#9ca3af]"
                      onChange={(event) => updateRegisterField('password', event.target.value)}
                      placeholder="Minimo 8 caracteres"
                      type={showRegisterPassword ? 'text' : 'password'}
                      value={registerForm.password}
                    />
                    <VisibilityButton
                      isVisible={showRegisterPassword}
                      onClick={() => setShowRegisterPassword((current) => !current)}
                    />
                  </div>
                </FieldShell>

                <FieldShell icon={BadgeCheck} label="Confirmar contrasena">
                  <div className="flex items-center gap-3">
                    <input
                      autoComplete="new-password"
                      className="h-14 w-full bg-transparent text-[15px] text-[#111827] outline-none placeholder:text-[#9ca3af]"
                      onChange={(event) => updateRegisterField('confirmPassword', event.target.value)}
                      placeholder="Repite tu contrasena"
                      type={showRegisterConfirmPassword ? 'text' : 'password'}
                      value={registerForm.confirmPassword}
                    />
                    <VisibilityButton
                      isVisible={showRegisterConfirmPassword}
                      onClick={() => setShowRegisterConfirmPassword((current) => !current)}
                    />
                  </div>
                </FieldShell>

                <button
                  className="mt-2 inline-flex h-14 items-center justify-center gap-2 rounded-2xl bg-[#1f2937] px-6 text-[15px] font-semibold text-white transition hover:bg-[#111827] disabled:cursor-not-allowed disabled:bg-[#d6d3d1]"
                  disabled={isSubmitting}
                  type="submit"
                >
                  <UserPlus size={18} strokeWidth={1.8} />
                  {isSubmitting ? 'Creando cuenta...' : 'Crear cuenta'}
                </button>
              </form>
            )}

            <div className="mt-6 flex items-center gap-2 text-sm text-[#6b7280]">
              <ArrowRight size={15} strokeWidth={1.8} />
              <span>{mode === 'sign-in' ? 'Sin credenciales visibles ni valores precargados.' : 'El usuario se guarda de inmediato en la base de datos.'}</span>
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
