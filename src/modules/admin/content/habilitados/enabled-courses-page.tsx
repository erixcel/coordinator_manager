import { useEffect, useMemo, useState, type ReactNode } from 'react'
import {
  BookOpenCheck,
  Building2,
  CalendarDays,
  ChevronDown,
  Clock3,
  FilterX,
  GraduationCap,
  LoaderCircle,
  Search,
  UserRound,
} from 'lucide-react'
import { academicApi, type AdminEnabledCourses } from '../../../../data'
import { normalize } from '../../shared/formatters'
import { PageTitle } from '../../shared/page-title'

type Filters = {
  career: string
  credits: string
  cycle: string
  modality: string
  query: string
  teacher: string
}

const EMPTY_FILTERS: Filters = {
  career: 'all',
  credits: 'all',
  cycle: 'all',
  modality: 'all',
  query: '',
  teacher: 'all',
}

function FilterSelect({ children, label, onChange, value }: {
  children: ReactNode
  label: string
  onChange: (value: string) => void
  value: string
}) {
  return (
    <label className="grid min-w-0 overflow-hidden gap-1.5 text-xs font-bold text-[#475467]">
      {label}
      <span className="relative flex h-10 min-w-0 items-center overflow-hidden rounded-[7px] border border-[#DDE3EA] bg-white px-3 focus-within:border-[#FF385C]">
        <select
          className="min-w-0 w-full flex-1 appearance-none truncate bg-transparent pr-6 text-sm font-semibold text-[#152033] outline-none"
          onChange={(event) => onChange(event.target.value)}
          value={value}
        >
          {children}
        </select>
        <ChevronDown className="pointer-events-none absolute right-3 text-[#667085]" size={15} />
      </span>
    </label>
  )
}

function Metric({ icon: Icon, label, value }: {
  icon: typeof BookOpenCheck
  label: string
  value: number
}) {
  return (
    <div className="flex min-w-0 items-center gap-3 border-r border-[#E5EAF0] px-4 py-3 last:border-r-0">
      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-[7px] bg-[#F2F4F7] text-[#344054]">
        <Icon size={17} strokeWidth={1.8} />
      </span>
      <span className="min-w-0">
        <strong className="block text-lg font-black leading-none text-[#152033]">{value}</strong>
        <span className="mt-1 block truncate text-[11px] font-semibold text-[#8A94A6]">{label}</span>
      </span>
    </div>
  )
}

export function EnabledCoursesPage() {
  const [data, setData] = useState<AdminEnabledCourses | null>(null)
  const [filters, setFilters] = useState<Filters>(EMPTY_FILTERS)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true
    academicApi.getEnabledCourses()
      .then((response) => active && setData(response))
      .catch((loadError) => active && setError(loadError instanceof Error ? loadError.message : 'No se pudieron cargar los cursos habilitados.'))
      .finally(() => active && setLoading(false))
    return () => { active = false }
  }, [])

  const courses = useMemo(() => {
    if (!data) return []
    const term = normalize(filters.query)

    return data.courses.flatMap((course) => {
      if (filters.career !== 'all' && String(course.carrera_id) !== filters.career) return []
      if (filters.cycle !== 'all' && String(course.ciclo) !== filters.cycle) return []
      if (filters.credits !== 'all' && String(course.creditos) !== filters.credits) return []

      const matchingSections = course.sections.filter((section) => {
        if (filters.teacher !== 'all' && String(section.docente_id) !== filters.teacher) return false
        if (filters.modality !== 'all' && section.modalidad !== filters.modality) return false
        if (!term) return true

        const scheduleText = section.schedules
          .map((schedule) => `${schedule.dia_label} ${schedule.hora_inicio} ${schedule.hora_fin} ${schedule.aula} ${schedule.sede}`)
          .join(' ')
        return normalize(`${course.codigo} ${course.nombre} ${course.carrera} ${section.codigo} ${section.docente} ${scheduleText}`).includes(term)
      })

      return matchingSections.length ? [{ ...course, sections: matchingSections }] : []
    })
  }, [data, filters])

  const totals = useMemo(() => ({
    courses: courses.length,
    schedules: courses.reduce((sum, course) => sum + course.sections.reduce((sectionSum, section) => sectionSum + section.schedules.length, 0), 0),
    sections: courses.reduce((sum, course) => sum + course.sections.length, 0),
  }), [courses])

  function updateFilter(key: keyof Filters, value: string) {
    setFilters((current) => ({ ...current, [key]: value }))
  }

  if (loading) {
    return <div className="grid min-h-[420px] place-items-center"><LoaderCircle className="animate-spin text-[#FF385C]" size={30} /></div>
  }

  return (
    <section className="grid gap-5 pb-10">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-start gap-3">
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-[8px] bg-[#152033] text-white">
            <BookOpenCheck size={21} strokeWidth={1.8} />
          </span>
          <div>
            <PageTitle>CURSOS HABILITADOS</PageTitle>
            <p className="mt-1 text-sm font-medium text-[#667085]">Secciones publicadas, docentes asignados y horarios disponibles.</p>
          </div>
        </div>
        <label className="flex h-11 w-full max-w-[390px] items-center gap-2 rounded-[7px] border border-[#DDE3EA] bg-white px-3 focus-within:border-[#FF385C]">
          <Search className="shrink-0 text-[#667085]" size={17} />
          <input
            aria-label="Buscar curso habilitado"
            className="min-w-0 flex-1 bg-transparent text-sm text-[#152033] outline-none placeholder:text-[#98A2B3]"
            onChange={(event) => updateFilter('query', event.target.value)}
            placeholder="Curso, docente, aula o sede..."
            type="search"
            value={filters.query}
          />
        </label>
      </div>

      {error && <div role="alert" className="rounded-[7px] border border-[#FECDCA] bg-[#FEF3F2] px-4 py-3 text-sm font-semibold text-[#B42318]">{error}</div>}

      {!error && data && (
        <>
          <div className="overflow-hidden rounded-[8px] border border-[#E1E6ED] bg-[#FAFBFC]">
            <div className="grid grid-cols-[repeat(auto-fit,minmax(190px,1fr))] gap-3 p-4">
              <FilterSelect label="Carrera" onChange={(value) => updateFilter('career', value)} value={filters.career}>
                <option value="all">Todas las carreras</option>
                {data.filters.careers.map((career) => <option key={career.carrera_id} value={career.carrera_id}>{career.nombre}</option>)}
              </FilterSelect>
              <FilterSelect label="Ciclo" onChange={(value) => updateFilter('cycle', value)} value={filters.cycle}>
                <option value="all">Todos los ciclos</option>
                {data.filters.cycles.map((cycle) => <option key={cycle} value={cycle}>Ciclo {cycle}</option>)}
              </FilterSelect>
              <FilterSelect label="Docente" onChange={(value) => updateFilter('teacher', value)} value={filters.teacher}>
                <option value="all">Todos los docentes</option>
                {data.filters.teachers.map((teacher) => <option key={teacher.docente_id} value={teacher.docente_id}>{teacher.nombre}</option>)}
              </FilterSelect>
              <FilterSelect label="Creditos" onChange={(value) => updateFilter('credits', value)} value={filters.credits}>
                <option value="all">Todos los creditos</option>
                {data.filters.credits.map((credits) => <option key={credits} value={credits}>{credits} creditos</option>)}
              </FilterSelect>
              <FilterSelect label="Modalidad" onChange={(value) => updateFilter('modality', value)} value={filters.modality}>
                <option value="all">Todas las modalidades</option>
                {data.filters.modalities.map((modality) => <option key={modality.value} value={modality.value}>{modality.label}</option>)}
              </FilterSelect>
            </div>
            <div className="flex flex-col border-t border-[#E5EAF0] sm:flex-row sm:items-center sm:justify-between">
              <div className="grid grid-cols-3 sm:min-w-[470px]">
                <Metric icon={BookOpenCheck} label="Cursos" value={totals.courses} />
                <Metric icon={GraduationCap} label="Secciones" value={totals.sections} />
                <Metric icon={CalendarDays} label="Bloques horarios" value={totals.schedules} />
              </div>
              <button
                className="m-3 inline-flex h-9 items-center justify-center gap-2 rounded-[7px] border border-[#DDE3EA] bg-white px-3 text-xs font-bold text-[#475467] transition hover:border-[#98A2B3] hover:text-[#152033]"
                onClick={() => setFilters(EMPTY_FILTERS)}
                type="button"
              >
                <FilterX size={15} /> Limpiar filtros
              </button>
            </div>
          </div>

          {courses.length === 0 ? (
            <div className="grid min-h-[260px] place-items-center rounded-[8px] border border-dashed border-[#CDD5DF] px-6 text-center">
              <div>
                <BookOpenCheck className="mx-auto text-[#98A2B3]" size={30} />
                <h2 className="mt-3 text-base font-black text-[#152033]">No hay cursos para mostrar</h2>
                <p className="mt-1 text-sm text-[#667085]">Ajusta los filtros o habilita una propuesta desde Planificacion.</p>
              </div>
            </div>
          ) : (
            <div className="grid gap-4">
              {courses.map((course) => (
                <article className="overflow-hidden rounded-[8px] border border-[#DCE3EA] bg-white shadow-[0_3px_12px_rgba(16,24,40,0.04)]" key={course.curso_id}>
                  <header className="grid gap-3 border-b border-[#E5EAF0] bg-[#F8FAFC] px-4 py-4 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <code className="rounded-[5px] border border-[#DDE3EA] bg-white px-2 py-1 text-[11px] font-black text-[#475467]">{course.codigo}</code>
                        <span className="rounded-full bg-[#EAF8F1] px-2.5 py-1 text-[11px] font-black text-[#16794B]">Ciclo {course.ciclo}</span>
                      </div>
                      <h2 className="mt-2 text-base font-black text-[#152033]">{course.nombre}</h2>
                      <p className="mt-1 text-xs font-semibold text-[#667085]">{course.carrera}</p>
                    </div>
                    <div className="flex flex-wrap gap-x-5 gap-y-2 text-xs font-bold text-[#475467]">
                      <span>{course.creditos} creditos</span>
                      <span>{course.horas_semanales} horas semanales</span>
                      <span>{course.sections.length} {course.sections.length === 1 ? 'seccion' : 'secciones'}</span>
                    </div>
                  </header>

                  <div className="divide-y divide-[#E5EAF0]">
                    {course.sections.map((section) => {
                      const classroomCapacity = Math.min(
                        ...section.schedules.map((schedule) => schedule.aula_capacidad),
                      )
                      const effectiveCapacity = section.capacidad_efectiva
                        ?? (Number.isFinite(classroomCapacity) ? Math.min(section.capacidad, classroomCapacity) : section.capacidad)

                      return (
                      <div className="grid gap-4 px-4 py-4 lg:grid-cols-[230px_minmax(0,1fr)]" key={section.seccion_id}>
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <strong className="text-sm text-[#152033]">Seccion {section.codigo}</strong>
                            <span className="rounded-full bg-[#FFF1E7] px-2.5 py-1 text-[10px] font-black text-[#B54708]">{section.modalidad_label}</span>
                          </div>
                          <span className="mt-2 flex items-start gap-2 text-xs font-semibold text-[#475467]">
                            <UserRound className="mt-0.5 shrink-0 text-[#8A94A6]" size={14} />
                            <span>{section.docente}<small className="mt-0.5 block font-medium text-[#8A94A6]">{section.docente_email}</small></span>
                          </span>
                          <div className="mt-3 flex flex-wrap gap-2">
                            <span className="inline-flex items-center gap-2 rounded-[5px] border border-[#B7E4CF] bg-[#F0FBF6] px-2.5 py-1 text-[11px] font-black text-[#16794B]">
                              <UserRound size={13} />
                              {section.matriculados ?? 0}/{effectiveCapacity} matriculados
                            </span>
                          </div>
                        </div>
                        <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
                          {section.schedules.map((schedule) => (
                            <div className="min-w-0 border-l-2 border-[#FF385C] bg-[#FFF8F9] px-3 py-2.5" key={schedule.horario_id}>
                              <strong className="flex items-center gap-2 text-xs text-[#152033]"><CalendarDays size={14} />{schedule.dia_label}</strong>
                              <span className="mt-1.5 flex items-center gap-2 text-xs font-semibold text-[#475467]"><Clock3 size={14} />{schedule.hora_inicio} - {schedule.hora_fin}</span>
                              <span className="mt-1.5 flex items-center gap-2 text-xs font-semibold text-[#667085]"><Building2 size={14} />{schedule.aula} · {schedule.sede} · {schedule.aula_capacidad} cupos</span>
                            </div>
                          ))}
                        </div>
                      </div>
                      )
                    })}
                  </div>
                </article>
              ))}
            </div>
          )}
        </>
      )}
    </section>
  )
}
