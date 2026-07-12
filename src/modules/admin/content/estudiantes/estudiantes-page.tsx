import { useEffect, useMemo, useState } from 'react'
import { Link2, Mail, Phone, UserCheck, GraduationCap } from 'lucide-react'
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
  const students = useAdminStore((state) => state.students)
  const [query, setQuery] = useState('')
  const [careerId, setCareerId] = useState('all')
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null)
  const [accountEmail, setAccountEmail] = useState('')
  const [linkError, setLinkError] = useState('')
  const [linkSuccess, setLinkSuccess] = useState('')
  const [isLinking, setIsLinking] = useState(false)

  useEffect(() => {
    void loadStudentsPage()
  }, [loadStudentsPage])

  const filtered = useMemo(() => {
    const term = normalize(query)
    return students.filter((student) => {
      const matchesCareer = careerId === 'all' || String(student.carrera_id) === careerId
      const matchesQuery = normalize(
        `${student.codigo} ${fullName(student)} ${student.telefono} ${student.merito}`,
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

      <DataTable
        columns={['Código', 'Estudiante', 'Carrera Profesional', 'Mérito Académico', 'Teléfono', 'Cuenta']}
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
              <span
                key={`account-${student.estudiante_id}`}
                className="inline-flex items-center gap-1.5 rounded-full border border-[#D1FADF] bg-[#ECFDF3] px-3 py-1 text-xs font-black text-[#027A48]"
              >
                <UserCheck size={13} strokeWidth={1.9} />
                {student.account_email}
              </span>
            ) : (
              <button
                className="inline-flex items-center gap-1.5 rounded-full border border-[#E2E8F0] bg-white px-3 py-1 text-xs font-black text-[#475569] transition hover:border-[#0F172A] hover:text-[#0F172A]"
                key={`account-${student.estudiante_id}`}
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
