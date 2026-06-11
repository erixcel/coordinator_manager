import { useEffect, useMemo, useState } from 'react'
import { BookOpen, Award, Clock } from 'lucide-react'
import { useAdminStore } from '../../../../store/use-admin-store'
import { SearchField, SelectField } from '../../shared/controls'
import { getCareerName, normalize } from '../../shared/formatters'
import { PageTitle } from '../../shared/page-title'
import { cn } from '../../shared/styles'
import { DataTable } from '../../shared/table'

function CycleBadge({ value }: { value: number }) {
  // Colores sutiles por ciclos (básico, intermedio, avanzado)
  let style = 'bg-[#ECFDF5] text-[#047857] border-[#D1FADF]'
  if (value >= 5 && value <= 8) {
    style = 'bg-[#EFF6FF] text-[#1D4ED8] border-[#DBEAFE]'
  } else if (value >= 9) {
    style = 'bg-[#FAF5FF] text-[#6D28D9] border-[#F3E8FF]'
  }

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-bold',
        style
      )}
    >
      Ciclo {value}
    </span>
  )
}

export function CursosPage() {
  const careers = useAdminStore((state) => state.careers)
  const courses = useAdminStore((state) => state.courses)
  const loadCoursesPage = useAdminStore((state) => state.loadCoursesPage)
  
  const initialCareer = careers[0] ? String(careers[0].carrera_id) : 'all'
  const [careerId, setCareerId] = useState(initialCareer)
  const [cycle, setCycle] = useState('all')
  const [query, setQuery] = useState('')

  useEffect(() => {
    void loadCoursesPage()
  }, [loadCoursesPage])

  useEffect(() => {
    if (careers.length > 0 && careerId === 'all') {
      // Opcional: mantener 'all' si queremos listar todos, o forzar la primera carrera
      // Por defecto, dejemos 'all' si queremos ver todos los cursos. Pero el código original forzaba.
      // Modifiquemos para permitir 'all' como opción de carrera también para una vista global!
    }
  }, [careers, careerId])

  const filtered = useMemo(() => {
    const term = normalize(query)
    return courses.filter((course) => {
      const matchesCareer = careerId === 'all' || String(course.carrera_id) === careerId
      const matchesCycle = cycle === 'all' || String(course.ciclo) === cycle
      const matchesQuery = normalize(`${course.codigo} ${course.nombre}`).includes(term)

      return matchesCareer && matchesCycle && matchesQuery
    })
  }, [careerId, courses, cycle, query])

  // Métricas del listado filtrado
  const totalCredits = useMemo(() => {
    return filtered.reduce((acc, course) => acc + (parseFloat(course.creditos) || 0), 0)
  }, [filtered])

  return (
    <section className="grid gap-6">
      {/* Encabezado */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <div className="grid h-12 w-12 place-items-center rounded-xl bg-gradient-to-br from-[#34D399] to-[#10B981] text-white shadow-[0_8px_20px_rgba(16,185,129,0.15)]">
            <BookOpen size={22} />
          </div>
          <div>
            <PageTitle>CURSOS</PageTitle>
            <p className="text-xs font-semibold text-[#8EA0B8] mt-1">
              Asignaturas curriculares, créditos lectivos y horas semanales estructuradas.
            </p>
          </div>
        </div>
        <SearchField onChange={setQuery} placeholder="Buscar curso..." value={query} />
      </div>

      {/* Controles de filtro */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-wrap items-end gap-3">
          <SelectField label="Carrera" onChange={setCareerId} value={careerId}>
            <option value="all">Todas las carreras</option>
            {careers.map((career) => (
              <option key={career.carrera_id} value={String(career.carrera_id)}>
                {career.nombre}
              </option>
            ))}
          </SelectField>

          <SelectField label="Ciclo" onChange={setCycle} value={cycle}>
            <option value="all">Todos los ciclos</option>
            {Array.from({ length: 10 }, (_, index) => String(index + 1)).map((item) => (
              <option key={item} value={item}>
                Ciclo {item}
              </option>
            ))}
          </SelectField>
        </div>

        {/* Resumen rápido */}
        <div className="flex gap-4">
          <div className="rounded-[8px] bg-white border border-[#E7EDF5] px-4 py-3 flex items-center gap-3 shadow-sm">
            <span className="grid h-8 w-8 place-items-center rounded-full bg-[#10B981]/10 text-[#10B981]">
              <BookOpen size={16} />
            </span>
            <div>
              <span className="block text-[10px] font-black uppercase tracking-[0.05em] text-[#8EA0B8] leading-none">Cursos</span>
              <strong className="text-sm font-black text-[#152033] mt-1 block">{filtered.length}</strong>
            </div>
          </div>
          <div className="rounded-[8px] bg-white border border-[#E7EDF5] px-4 py-3 flex items-center gap-3 shadow-sm">
            <span className="grid h-8 w-8 place-items-center rounded-full bg-[#FF385C]/10 text-[#FF385C]">
              <Award size={16} />
            </span>
            <div>
              <span className="block text-[10px] font-black uppercase tracking-[0.05em] text-[#8EA0B8] leading-none">Créditos Totales</span>
              <strong className="text-sm font-black text-[#152033] mt-1 block">{totalCredits}</strong>
            </div>
          </div>
        </div>
      </div>

      <DataTable
        columns={['Código', 'Curso / Asignatura', 'Carrera Profesional', 'Ciclo Lectivo', 'Créditos', 'Horas Sem.']}
        rows={filtered.map((course) => [
          <code key={`code-${course.curso_id}`} className="rounded-[6px] bg-[#F1F5F9] px-2.5 py-1 text-xs font-black text-[#344054] border border-[#E2E8F0]">
            {course.codigo}
          </code>,
          <span key={`name-${course.curso_id}`} className="font-bold text-[#152033]">
            {course.nombre}
          </span>,
          <span key={`career-${course.curso_id}`} className="font-semibold text-[#5D6B82]">
            {getCareerName(careers, course.carrera_id)}
          </span>,
          <CycleBadge key={`cycle-${course.curso_id}`} value={course.ciclo} />,
          <strong key={`cred-${course.curso_id}`} className="text-sm font-black text-[#152033]">
            {course.creditos}
          </strong>,
          <span key={`hours-${course.curso_id}`} className="inline-flex items-center gap-1 font-semibold text-[#5D6B82]">
            <Clock size={12} className="text-[#8EA0B8]" />
            {course.horas_semanales} hrs
          </span>
        ])}
      />
    </section>
  )
}
