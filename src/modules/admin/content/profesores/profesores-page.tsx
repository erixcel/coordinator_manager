import { useEffect, useMemo, useState } from 'react'
import { Users, Mail } from 'lucide-react'
import { useAdminStore } from '../../../../store/use-admin-store'
import { SearchField } from '../../shared/controls'
import { fullName, normalize } from '../../shared/formatters'
import { PageTitle } from '../../shared/page-title'
import { DataTable } from '../../shared/table'
import { cn, panel } from '../../shared/styles'

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/)
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase()
  }
  return parts[0] ? parts[0][0].toUpperCase() : '?'
}

export function ProfesoresPage() {
  const loadTeachers = useAdminStore((state) => state.loadTeachers)
  const teachers = useAdminStore((state) => state.teachers)
  const [query, setQuery] = useState('')

  useEffect(() => {
    void loadTeachers()
  }, [loadTeachers])

  const filtered = useMemo(() => {
    const term = normalize(query)
    return teachers.filter((teacher) =>
      normalize(`${teacher.codigo} ${fullName(teacher)} ${teacher.email}`).includes(term),
    )
  }, [query, teachers])

  return (
    <section className="grid gap-6 animate-fade-in-up">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <div className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-[#FF5A79] to-[#FF385C] text-white shadow-[0_8px_24px_rgba(255,56,92,0.20)]">
            <Users size={22} strokeWidth={1.8} />
          </div>
          <div>
            <PageTitle>Profesores</PageTitle>
            <p className="text-xs font-medium text-slate-400 mt-0.5">
              Docentes registrados y habilitados para el dictado de asignaturas.
            </p>
          </div>
        </div>
        <SearchField onChange={setQuery} placeholder="Buscar docente..." value={query} />
      </div>

      {/* Summary badge */}
      <div className={cn(panel, 'p-4 flex items-center justify-between border-l-4 border-[#FF385C]')}>
        <span className="text-sm font-semibold text-slate-500">Total Docentes Activos</span>
        <strong className="text-xl font-extrabold text-[#FF385C]">
          {filtered.length} docentes
        </strong>
      </div>

      <DataTable
        columns={['Codigo', 'Docente', 'Correo Electronico']}
        rows={filtered.map((teacher) => {
          const name = fullName(teacher)
          return [
            <code key={`code-${teacher.docente_id}`} className="rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-600 border border-slate-200/60">
              {teacher.codigo}
            </code>,
            <div key={`name-${teacher.docente_id}`} className="flex items-center gap-3">
              <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-gradient-to-br from-[#FF385C]/15 to-[#FF385C]/5 text-xs font-bold text-[#FF385C]">
                {getInitials(name)}
              </span>
              <span className="font-bold text-slate-700">{name}</span>
            </div>,
            <a
              key={`mail-${teacher.docente_id}`}
              href={`mailto:${teacher.email}`}
              className="inline-flex items-center gap-1.5 font-semibold text-[#FF385C] transition-colors hover:text-[#E61E43] hover:underline"
            >
              <Mail size={13} />
              {teacher.email}
            </a>
          ]
        })}
      />
    </section>
  )
}
