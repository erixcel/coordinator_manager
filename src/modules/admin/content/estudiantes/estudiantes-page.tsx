import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { Eye, EyeOff, GraduationCap, KeyRound, Link2, LoaderCircle, Mail, Phone, X } from 'lucide-react'
import type { Student } from '../../../../data'
import { useAdminStore } from '../../../../store/use-admin-store'
import { SearchField, SelectField } from '../../shared/controls'
import { fullName, getCareerName, normalize } from '../../shared/formatters'
import { PageTitle } from '../../shared/page-title'
import { cn } from '../../shared/styles'
import { DataTable } from '../../shared/table'

function StatusBadge({ value }: { value: Student['merito'] }) {
  const styles = {
    alto: 'bg-[#ECFDF3] text-[#027A48] border-[#D1FADF]',
    medio: 'bg-[#F8FAFC] text-[#475569] border-[#E2E8F0]',
    bajo: 'bg-[#FEF3F2] text-[#B42318] border-[#FEE4E2]',
  }

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-black uppercase tracking-wider',
        styles[value]
      )}
    >
      {value}
    </span>
  )
}

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/)
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase()
  }
  return parts[0] ? parts[0][0].toUpperCase() : '?'
}

export function EstudiantesPage() {
  const careers = useAdminStore((state) => state.careers)
  const linkStudentAccount = useAdminStore((state) => state.linkStudentAccount)
  const loadStudentsPage = useAdminStore((state) => state.loadStudentsPage)
  const resetStudentPassword = useAdminStore((state) => state.resetStudentPassword)
  const students = useAdminStore((state) => state.students)
  const [query, setQuery] = useState('')
  const [careerId, setCareerId] = useState('all')
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null)
  const [accountEmail, setAccountEmail] = useState('')
  const [linkError, setLinkError] = useState('')
  const [linkSuccess, setLinkSuccess] = useState('')
  const [isLinking, setIsLinking] = useState(false)
  const [passwordStudent, setPasswordStudent] = useState<Student | null>(null)
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [passwordError, setPasswordError] = useState('')
  const [passwordSuccess, setPasswordSuccess] = useState('')
  const [isResetting, setIsResetting] = useState(false)

  useEffect(() => {
    void loadStudentsPage()
  }, [loadStudentsPage])

  const filtered = useMemo(() => {
    const term = normalize(query)
    return students.filter((student) => {
      const matchesCareer = careerId === 'all' || String(student.carrera_id) === careerId
      const matchesQuery = normalize(
        `${student.codigo} ${fullName(student)} ${student.telefono} ${student.account_email ?? ''} ${student.merito}`,
      ).includes(term)

      return matchesCareer && matchesQuery
    })
  }, [careerId, query, students])

  // Métricas del listado
  const meritStats = useMemo(() => {
    const counts = { alto: 0, medio: 0, bajo: 0 }
    filtered.forEach((s) => {
      if (s.merito in counts) {
        counts[s.merito] += 1
      }
    })
    return counts
  }, [filtered])

  async function handleLinkAccount() {
    if (!selectedStudent) return
    if (!accountEmail.trim()) {
      setLinkError('Escribe el correo o usuario de la cuenta a vincular.')
      return
    }

    setIsLinking(true)
    setLinkError('')
    setLinkSuccess('')

    try {
      await linkStudentAccount(selectedStudent.estudiante_id, accountEmail.trim())
      setLinkSuccess(`Cuenta vinculada con ${fullName(selectedStudent)}.`)
      setSelectedStudent(null)
      setAccountEmail('')
    } catch (error) {
      setLinkError(error instanceof Error ? error.message : 'No se pudo vincular la cuenta.')
    } finally {
      setIsLinking(false)
    }
  }

  function closePasswordModal() {
    if (isResetting) return
    setPasswordStudent(null)
    setNewPassword('')
    setConfirmPassword('')
    setShowPassword(false)
    setPasswordError('')
  }

  async function handlePasswordReset(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!passwordStudent) return
    if (newPassword.length < 8) {
      setPasswordError('La nueva contrasena debe tener al menos 8 caracteres.')
      return
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('Las contrasenas no coinciden.')
      return
    }

    setIsResetting(true)
    setPasswordError('')
    try {
      const message = await resetStudentPassword(passwordStudent.estudiante_id, newPassword, confirmPassword)
      setPasswordSuccess(`${message} ${fullName(passwordStudent)} ya puede usar su nueva clave.`)
      setPasswordStudent(null)
      setNewPassword('')
      setConfirmPassword('')
      setShowPassword(false)
    } catch (error) {
      setPasswordError(error instanceof Error ? error.message : 'No se pudo restablecer la contrasena.')
    } finally {
      setIsResetting(false)
    }
  }

  return (
    <section className="grid gap-6">
      {/* Encabezado */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <div className="grid h-12 w-12 place-items-center rounded-xl bg-gradient-to-br from-[#334155] to-[#0F172A] text-white shadow-[0_8px_20px_rgba(15,23,42,0.15)]">
            <GraduationCap size={22} />
          </div>
          <div>
            <PageTitle>ESTUDIANTES</PageTitle>
            <p className="text-xs font-semibold text-[#8EA0B8] mt-1">
              Estudiantes matriculados activos, filtros por carrera y rendimiento académico.
            </p>
          </div>
        </div>
        <SearchField onChange={setQuery} placeholder="Buscar estudiante..." value={query} />
      </div>

      {/* Toolbar & Controles */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-wrap items-end gap-3">
          <SelectField label="Filtrar por Carrera" onChange={setCareerId} value={careerId}>
            <option value="all">Todas las carreras</option>
            {careers.map((career) => (
              <option key={career.carrera_id} value={String(career.carrera_id)}>
                {career.nombre}
              </option>
            ))}
          </SelectField>
        </div>

        {/* Resumen de méritos */}
        <div className="flex flex-wrap gap-3">
          <div className="rounded-[8px] bg-white border border-[#E7EDF5] px-4 py-2 flex items-center gap-2 text-xs font-bold shadow-sm">
            <span className="h-2 w-2 rounded-full bg-[#027A48]" />
            <span className="text-[#5D6B82]">Mérito Alto:</span>
            <strong className="text-[#152033]">{meritStats.alto}</strong>
          </div>
          <div className="rounded-[8px] bg-white border border-[#E7EDF5] px-4 py-2 flex items-center gap-2 text-xs font-bold shadow-sm">
            <span className="h-2 w-2 rounded-full bg-[#475569]" />
            <span className="text-[#5D6B82]">Mérito Medio:</span>
            <strong className="text-[#152033]">{meritStats.medio}</strong>
          </div>
          <div className="rounded-[8px] bg-white border border-[#E7EDF5] px-4 py-2 flex items-center gap-2 text-xs font-bold shadow-sm">
            <span className="h-2 w-2 rounded-full bg-[#B42318]" />
            <span className="text-[#5D6B82]">Mérito Bajo:</span>
            <strong className="text-[#152033]">{meritStats.bajo}</strong>
          </div>
        </div>
      </div>

      {selectedStudent ? (
        <div className="rounded-[8px] border border-[#E7EDF5] bg-white p-4 shadow-sm">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.14em] text-[#8EA0B8]">Vincular cuenta</p>
              <h3 className="mt-1 text-base font-black text-[#152033]">{fullName(selectedStudent)}</h3>
              <p className="mt-1 text-sm font-semibold text-[#5D6B82]">
                Codigo {selectedStudent.codigo} · {getCareerName(careers, selectedStudent.carrera_id)}
              </p>
            </div>
            <div className="grid w-full gap-3 lg:max-w-[520px] lg:grid-cols-[1fr_auto_auto]">
              <label className="flex h-12 items-center gap-3 rounded-full border border-[#E2E8F0] bg-white px-4 focus-within:border-[#0F172A]">
                <Mail size={17} strokeWidth={1.8} className="text-[#8EA0B8]" />
                <input
                  className="min-w-0 flex-1 bg-transparent text-[15px] font-semibold text-[#152033] outline-none placeholder:text-[#8EA0B8]"
                  onChange={(event) => setAccountEmail(event.target.value)}
                  placeholder="correo o usuario de la cuenta"
                  type="text"
                  value={accountEmail}
                />
              </label>
              <button
                className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-[#0F172A] px-5 text-sm font-black text-white transition hover:bg-[#1E293B] disabled:cursor-not-allowed disabled:bg-[#CBD5E1]"
                disabled={isLinking}
                onClick={handleLinkAccount}
                type="button"
              >
                <Link2 size={16} strokeWidth={1.9} />
                {isLinking ? 'Vinculando...' : 'Vincular'}
              </button>
              <button
                className="inline-flex h-12 items-center justify-center rounded-full border border-[#E2E8F0] px-5 text-sm font-black text-[#5D6B82] transition hover:border-[#0F172A] hover:text-[#0F172A]"
                onClick={() => {
                  setSelectedStudent(null)
                  setAccountEmail('')
                  setLinkError('')
                }}
                type="button"
              >
                Cancelar
              </button>
            </div>
          </div>
          {linkError ? <p className="mt-3 text-sm font-bold text-[#C11331]">{linkError}</p> : null}
        </div>
      ) : null}

      {linkSuccess ? (
        <div className="rounded-[8px] border border-[#D1FADF] bg-[#ECFDF3] px-4 py-3 text-sm font-bold text-[#027A48]">
          {linkSuccess}
        </div>
      ) : null}

      {passwordSuccess ? (
        <div className="rounded-[8px] border border-[#D1FADF] bg-[#ECFDF3] px-4 py-3 text-sm font-bold text-[#027A48]">
          {passwordSuccess}
        </div>
      ) : null}

      {passwordStudent ? (
        <div
          aria-labelledby="reset-password-title"
          aria-modal="true"
          className="fixed inset-0 z-50 grid place-items-center bg-[#101828]/45 p-4 backdrop-blur-[2px]"
          role="dialog"
        >
          <form
            className="w-full max-w-[460px] overflow-hidden rounded-[8px] border border-[#E4E7EC] bg-white shadow-[0_24px_64px_rgba(16,24,40,0.24)]"
            onSubmit={handlePasswordReset}
          >
            <div className="flex items-start justify-between border-b border-[#EAECF0] px-5 py-4">
              <div className="flex items-center gap-3">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-[7px] bg-[#FFF1F3] text-[#E31C5F]">
                  <KeyRound size={19} strokeWidth={1.9} />
                </span>
                <div>
                  <h2 className="text-base font-black text-[#152033]" id="reset-password-title">Restablecer contrasena</h2>
                  <p className="mt-0.5 text-xs font-semibold text-[#667085]">{fullName(passwordStudent)}</p>
                </div>
              </div>
              <button
                aria-label="Cerrar modal"
                className="grid h-9 w-9 place-items-center rounded-[6px] text-[#667085] transition hover:bg-[#F2F4F7] hover:text-[#152033]"
                onClick={closePasswordModal}
                type="button"
              >
                <X size={18} />
              </button>
            </div>

            <div className="grid gap-4 px-5 py-5">
              <div className="rounded-[7px] border border-[#E4E7EC] bg-[#F8FAFC] px-4 py-3">
                <span className="block text-[10px] font-black uppercase tracking-[0.12em] text-[#98A2B3]">Cuenta institucional</span>
                <span className="mt-1 flex items-center gap-2 text-sm font-bold text-[#344054]">
                  <Mail size={15} className="text-[#667085]" />
                  {passwordStudent.account_email}
                </span>
              </div>

              <label className="grid gap-2 text-sm font-bold text-[#344054]">
                Nueva contrasena
                <span className="flex h-11 items-center rounded-[7px] border border-[#D0D5DD] px-3 focus-within:border-[#FF385C] focus-within:ring-2 focus-within:ring-[#FF385C]/10">
                  <input
                    autoComplete="new-password"
                    className="min-w-0 flex-1 bg-transparent text-sm font-semibold text-[#152033] outline-none"
                    onChange={(event) => setNewPassword(event.target.value)}
                    placeholder="Minimo 8 caracteres"
                    type={showPassword ? 'text' : 'password'}
                    value={newPassword}
                  />
                  <button
                    aria-label={showPassword ? 'Ocultar contrasena' : 'Mostrar contrasena'}
                    className="grid h-8 w-8 place-items-center text-[#667085]"
                    onClick={() => setShowPassword((current) => !current)}
                    type="button"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </span>
              </label>

              <label className="grid gap-2 text-sm font-bold text-[#344054]">
                Confirmar contrasena
                <span className="flex h-11 items-center rounded-[7px] border border-[#D0D5DD] px-3 focus-within:border-[#FF385C] focus-within:ring-2 focus-within:ring-[#FF385C]/10">
                  <input
                    autoComplete="new-password"
                    className="min-w-0 flex-1 bg-transparent text-sm font-semibold text-[#152033] outline-none"
                    onChange={(event) => setConfirmPassword(event.target.value)}
                    placeholder="Repite la nueva contrasena"
                    type={showPassword ? 'text' : 'password'}
                    value={confirmPassword}
                  />
                </span>
              </label>

              {passwordError ? <p className="text-sm font-bold text-[#B42318]">{passwordError}</p> : null}
            </div>

            <div className="flex justify-end gap-3 border-t border-[#EAECF0] bg-[#F9FAFB] px-5 py-4">
              <button
                className="h-10 rounded-[7px] border border-[#D0D5DD] bg-white px-4 text-sm font-black text-[#475467] transition hover:border-[#98A2B3]"
                disabled={isResetting}
                onClick={closePasswordModal}
                type="button"
              >
                Cancelar
              </button>
              <button
                className="inline-flex h-10 items-center justify-center gap-2 rounded-[7px] bg-[#FF385C] px-4 text-sm font-black text-white transition hover:bg-[#E31C4B] disabled:cursor-not-allowed disabled:opacity-60"
                disabled={isResetting}
                type="submit"
              >
                {isResetting ? <LoaderCircle className="animate-spin" size={16} /> : <KeyRound size={16} />}
                {isResetting ? 'Restableciendo...' : 'Restablecer'}
              </button>
            </div>
          </form>
        </div>
      ) : null}

      <DataTable
        columns={['Código', 'Estudiante', 'Carrera Profesional', 'Mérito', 'Teléfono', 'Correo institucional', 'Acciones']}
        rows={filtered.map((student) => {
          const name = fullName(student)
          return [
            <code key={`code-${student.estudiante_id}`} className="rounded-[6px] bg-[#F1F5F9] px-2.5 py-1 text-xs font-black text-[#344054] border border-[#E2E8F0]">
              {student.codigo}
            </code>,
            <div key={`name-${student.estudiante_id}`} className="flex items-center gap-3">
              <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-[#0F172A]/10 text-xs font-bold text-[#0F172A] border border-[#0F172A]/15">
                {getInitials(name)}
              </span>
              <span className="font-bold text-[#152033]">{name}</span>
            </div>,
            <span key={`career-${student.estudiante_id}`} className="font-semibold text-[#5D6B82]">
              {getCareerName(careers, student.carrera_id)}
            </span>,
            <StatusBadge key={`badge-${student.estudiante_id}`} value={student.merito} />,
            <a
              key={`phone-${student.estudiante_id}`}
              href={`tel:${student.telefono}`}
              className="inline-flex items-center gap-1.5 font-bold text-[#475569] hover:text-[#0F172A] hover:underline"
            >
              <Phone size={13} className="text-[#8EA0B8]" />
              {student.telefono}
            </a>,
            student.account_email ? (
              <a
                className="inline-flex items-center gap-1.5 text-xs font-bold text-[#475467] transition hover:text-[#152033] hover:underline"
                href={`mailto:${student.account_email}`}
                key={`email-${student.estudiante_id}`}
              >
                <Mail size={14} className="text-[#8EA0B8]" />
                {student.account_email}
              </a>
            ) : (
              <span className="text-xs font-semibold text-[#98A2B3]" key={`email-${student.estudiante_id}`}>Sin cuenta</span>
            ),
            student.account_email ? (
              <button
                aria-label={`Restablecer contrasena de ${name}`}
                className="grid h-8 w-8 place-items-center rounded-[6px] border border-[#E2E8F0] bg-white text-[#475467] transition hover:border-[#FF385C] hover:bg-[#FFF1F3] hover:text-[#E31C5F]"
                key={`action-${student.estudiante_id}`}
                onClick={() => {
                  setPasswordStudent(student)
                  setPasswordError('')
                  setPasswordSuccess('')
                }}
                title="Restablecer contrasena"
                type="button"
              >
                <KeyRound size={15} strokeWidth={1.9} />
              </button>
            ) : (
              <button
                className="inline-flex items-center gap-1.5 rounded-full border border-[#E2E8F0] bg-white px-3 py-1 text-xs font-black text-[#475569] transition hover:border-[#0F172A] hover:text-[#0F172A]"
                key={`action-${student.estudiante_id}`}
                onClick={() => {
                  setSelectedStudent(student)
                  setAccountEmail('')
                  setLinkError('')
                  setLinkSuccess('')
                }}
                type="button"
              >
                <Link2 size={13} strokeWidth={1.9} />
                Vincular
              </button>
            ),
          ]
        })}
      />
    </section>
  )
}
