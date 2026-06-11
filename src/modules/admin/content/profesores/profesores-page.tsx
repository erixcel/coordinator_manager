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
    <section className="grid gap-6">
      {/* Encabezado con estadísticas rápidas */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <div className="grid h-12 w-12 place-items-center rounded-xl bg-gradient-to-br from-[#FF5A79] to-[#FF385C] text-white shadow-[0_8px_20px_rgba(255,56,92,0.15)]">
            <Users size={22} />
          </div>
          <div>
            <PageTitle>PROFESORES</PageTitle>
            <p className="text-xs font-semibold text-[#8EA0B8] mt-1">
              Docentes registrados y habilitados para el dictado de asignaturas.
            </p>
          </div>
        </div>
        <SearchField onChange={setQuery} placeholder="Buscar docente..." value={query} />
      </div>

      {/* Mini Tarjeta de Resumen */}
      <div className={cn(panel, 'p-4 flex items-center justify-between bg-gradient-to-r from-white to-[#FFF5F7] border-l-4 border-[#FF385C] shadow-sm')}>
        <span className="text-sm font-semibold text-[#5D6B82]">Total Docentes Activos</span>
        <strong className="text-xl font-black text-[#FF385C]">
          {filtered.length} docentes
        </strong>
      </div>

      <DataTable
        columns={['Código', 'Docente', 'Correo Electrónico']}
        rows={filtered.map((teacher) => {
          const name = fullName(teacher)
          return [
            <code key={`code-${teacher.docente_id}`} className="rounded-[6px] bg-[#F1F5F9] px-2.5 py-1 text-xs font-black text-[#344054] border border-[#E2E8F0]">
              {teacher.codigo}
            </code>,
            <div key={`name-${teacher.docente_id}`} className="flex items-center gap-3">
              <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-[#FF385C]/10 text-xs font-bold text-[#FF385C] border border-[#FF385C]/15">
                {getInitials(name)}
              </span>
              <span className="font-bold text-[#152033]">{name}</span>
            </div>,
            <a
              key={`mail-${teacher.docente_id}`}
              href={`mailto:${teacher.email}`}
              className="inline-flex items-center gap-1.5 font-bold text-[#FF385C] hover:underline"
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
