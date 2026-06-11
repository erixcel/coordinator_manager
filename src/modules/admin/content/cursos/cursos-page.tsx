import { useEffect, useMemo, useState } from 'react'
import { BookOpen, Award, Clock } from 'lucide-react'
import { useAdminStore } from '../../../../store/use-admin-store'
import { SearchField, SelectField } from '../../shared/controls'
import { getCareerName, normalize } from '../../shared/formatters'
import { PageTitle } from '../../shared/page-title'
import { cn } from '../../shared/styles'
import { DataTable } from '../../shared/table'

function CycleBadge({ value }: { value: number }) {
  let style = 'bg-emerald-50 text-emerald-700 border-emerald-200/60'
  if (value >= 5 && value <= 8) {
    style = 'bg-sky-50 text-sky-700 border-sky-200/60'
  } else if (value >= 9) {
    style = 'bg-violet-50 text-violet-700 border-violet-200/60'
  }

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-lg border px-2 py-0.5 text-[11px] font-bold',
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
      // Keep 'all' as default for global view
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

  const totalCredits = useMemo(() => {
    return filtered.reduce((acc, course) => acc + (parseFloat(course.creditos) || 0), 0)
  }, [filtered])

  return (
    <section className="grid gap-6 animate-fade-in-up">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <div className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-[#34D399] to-[#10B981] text-white shadow-[0_8px_24px_rgba(16,185,129,0.20)]">
            <BookOpen size={22} strokeWidth={1.8} />
          </div>
          <div>
            <PageTitle>Cursos</PageTitle>
            <p className="text-xs font-medium text-slate-400 mt-0.5">
              Asignaturas curriculares, creditos lectivos y horas semanales estructuradas.
            </p>
          </div>
        </div>
        <SearchField onChange={setQuery} placeholder="Buscar curso..." value={query} />
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
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

        {/* Summary */}
        <div className="flex flex-wrap gap-3">
          <div className="rounded-xl bg-white/80 backdrop-blur border border-slate-200/60 px-4 py-3 flex items-center gap-3 shadow-sm">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-emerald-50 text-emerald-600">
              <BookOpen size={15} />
            </span>
            <div>
              <span className="block text-[10px] font-bold uppercase tracking-[0.05em] text-slate-400 leading-none">Cursos</span>
              <strong className="text-sm font-extrabold text-slate-800 mt-0.5 block">{filtered.length}</strong>
            </div>
          </div>
          <div className="rounded-xl bg-white/80 backdrop-blur border border-slate-200/60 px-4 py-3 flex items-center gap-3 shadow-sm">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-rose-50 text-[#FF385C]">
              <Award size={15} />
            </span>
            <div>
              <span className="block text-[10px] font-bold uppercase tracking-[0.05em] text-slate-400 leading-none">Creditos</span>
              <strong className="text-sm font-extrabold text-slate-800 mt-0.5 block">{totalCredits}</strong>
            </div>
          </div>
        </div>
      </div>

      <DataTable
        columns={['Codigo', 'Curso / Asignatura', 'Carrera Profesional', 'Ciclo Lectivo', 'Creditos', 'Horas Sem.']}
        rows={filtered.map((course) => [
          <code key={`code-${course.curso_id}`} className="rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-600 border border-slate-200/60">
            {course.codigo}
          </code>,
          <span key={`name-${course.curso_id}`} className="font-bold text-slate-700">
            {course.nombre}
          </span>,
          <span key={`career-${course.curso_id}`} className="font-semibold text-slate-500">
            {getCareerName(careers, course.carrera_id)}
          </span>,
          <CycleBadge key={`cycle-${course.curso_id}`} value={course.ciclo} />,
          <strong key={`cred-${course.curso_id}`} className="text-sm font-extrabold text-slate-800">
            {course.creditos}
          </strong>,
          <span key={`hours-${course.curso_id}`} className="inline-flex items-center gap-1 font-semibold text-slate-500">
            <Clock size={12} className="text-slate-400" />
            {course.horas_semanales} hrs
          </span>
        ])}
      />
    </section>
  )
}
