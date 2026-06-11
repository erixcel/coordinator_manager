import { useEffect, useMemo, useState } from 'react'
import { GraduationCap, Phone } from 'lucide-react'
import type { Student } from '../../../../data'
import { useAdminStore } from '../../../../store/use-admin-store'
import { SearchField, SelectField } from '../../shared/controls'
import { fullName, getCareerName, normalize } from '../../shared/formatters'
import { PageTitle } from '../../shared/page-title'
import { cn } from '../../shared/styles'
import { DataTable } from '../../shared/table'

function StatusBadge({ value }: { value: Student['merito'] }) {
  const styles = {
    alto: 'bg-emerald-50 text-emerald-700 border-emerald-200/60',
    medio: 'bg-slate-50 text-slate-600 border-slate-200/60',
    bajo: 'bg-rose-50 text-rose-700 border-rose-200/60',
  }

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-lg border px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider',
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
  const loadStudentsPage = useAdminStore((state) => state.loadStudentsPage)
  const students = useAdminStore((state) => state.students)
  const [query, setQuery] = useState('')
  const [careerId, setCareerId] = useState('all')

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

  const meritStats = useMemo(() => {
    const counts = { alto: 0, medio: 0, bajo: 0 }
    filtered.forEach((s) => {
      if (s.merito in counts) {
        counts[s.merito] += 1
      }
    })
    return counts
  }, [filtered])

  return (
    <section className="grid gap-6 animate-fade-in-up">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <div className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-[#334155] to-[#0F172A] text-white shadow-[0_8px_24px_rgba(15,23,42,0.20)]">
            <GraduationCap size={22} strokeWidth={1.8} />
          </div>
          <div>
            <PageTitle>Estudiantes</PageTitle>
            <p className="text-xs font-medium text-slate-400 mt-0.5">
              Estudiantes matriculados activos, filtros por carrera y rendimiento academico.
            </p>
          </div>
        </div>
        <SearchField onChange={setQuery} placeholder="Buscar estudiante..." value={query} />
      </div>

      {/* Toolbar */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
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

        {/* Merit summary badges */}
        <div className="flex flex-wrap gap-2">
          <div className="rounded-xl bg-white/80 backdrop-blur border border-slate-200/60 px-3.5 py-2 flex items-center gap-2 text-xs font-semibold shadow-sm">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            <span className="text-slate-500">Alto:</span>
            <strong className="text-slate-800">{meritStats.alto}</strong>
          </div>
          <div className="rounded-xl bg-white/80 backdrop-blur border border-slate-200/60 px-3.5 py-2 flex items-center gap-2 text-xs font-semibold shadow-sm">
            <span className="h-2 w-2 rounded-full bg-slate-400" />
            <span className="text-slate-500">Medio:</span>
            <strong className="text-slate-800">{meritStats.medio}</strong>
          </div>
          <div className="rounded-xl bg-white/80 backdrop-blur border border-slate-200/60 px-3.5 py-2 flex items-center gap-2 text-xs font-semibold shadow-sm">
            <span className="h-2 w-2 rounded-full bg-rose-500" />
            <span className="text-slate-500">Bajo:</span>
            <strong className="text-slate-800">{meritStats.bajo}</strong>
          </div>
        </div>
      </div>

      <DataTable
        columns={['Codigo', 'Estudiante', 'Carrera Profesional', 'Merito Academico', 'Telefono']}
        rows={filtered.map((student) => {
          const name = fullName(student)
          return [
            <code key={`code-${student.estudiante_id}`} className="rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-600 border border-slate-200/60">
              {student.codigo}
            </code>,
            <div key={`name-${student.estudiante_id}`} className="flex items-center gap-3">
              <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-gradient-to-br from-[#0F172A]/12 to-[#0F172A]/4 text-xs font-bold text-[#0F172A]">
                {getInitials(name)}
              </span>
              <span className="font-bold text-slate-700">{name}</span>
            </div>,
            <span key={`career-${student.estudiante_id}`} className="font-semibold text-slate-500">
              {getCareerName(careers, student.carrera_id)}
            </span>,
            <StatusBadge key={`badge-${student.estudiante_id}`} value={student.merito} />,
            <a
              key={`phone-${student.estudiante_id}`}
              href={`tel:${student.telefono}`}
              className="inline-flex items-center gap-1.5 font-semibold text-slate-500 transition-colors hover:text-slate-800 hover:underline"
            >
              <Phone size={13} className="text-slate-400" />
              {student.telefono}
            </a>
          ]
        })}
      />
    </section>
  )
}
