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

      <DataTable
        columns={['Código', 'Estudiante', 'Carrera Profesional', 'Mérito Académico', 'Teléfono']}
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
            </a>
          ]
        })}
      />
    </section>
  )
}
