import { BookOpenCheck, ChevronDown, Clock3, GraduationCap, Loader2, Search } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { useStudentStore } from '../../../store/use-student-store'

function formatAcademicValue(value: string | number) {
  const parsed = Number(value)
  return Number.isInteger(parsed) ? String(parsed) : parsed.toFixed(1)
}

export function StudentCoursesPage() {
  const confirmedEnrollment = useStudentStore((state) => state.confirmedEnrollment)
  const context = useStudentStore((state) => state.context)
  const error = useStudentStore((state) => state.error)
  const isLoading = useStudentStore((state) => state.isCoursesLoading)
  const loadConfirmedEnrollment = useStudentStore((state) => state.loadConfirmedEnrollment)
  const courses = confirmedEnrollment?.courses ?? []
  const currentCycle = context?.student?.ciclo_actual ?? null
  const availableCycles = useMemo(
    () => Array.from(new Set(courses.map((course) => course.ciclo))).sort((a, b) => a - b),
    [courses],
  )
  const [selectedCycle, setSelectedCycle] = useState<number | null>(null)
  const [query, setQuery] = useState('')
  const [expandedCourseId, setExpandedCourseId] = useState<number | null>(null)

  useEffect(() => {
    void loadConfirmedEnrollment()
  }, [loadConfirmedEnrollment])

  useEffect(() => {
    if (selectedCycle !== null || !availableCycles.length) return
    setSelectedCycle(currentCycle && availableCycles.includes(currentCycle) ? currentCycle : availableCycles[0])
  }, [availableCycles, currentCycle, selectedCycle])

  const filteredCourses = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase('es')
    return courses.filter((course) => {
      const matchesCycle = selectedCycle === null || course.ciclo === selectedCycle
      const matchesQuery = `${course.codigo} ${course.nombre}`.toLocaleLowerCase('es').includes(normalizedQuery)
      return matchesCycle && matchesQuery
    })
  }, [courses, query, selectedCycle])

  const totalCredits = filteredCourses.reduce((total, course) => total + Number(course.creditos || 0), 0)
  const totalHours = filteredCourses.reduce((total, course) => total + Number(course.horas_semanales || 0), 0)

  return (
    <section className="grid gap-6">
      <header className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase text-[#8b2332]">Portal del alumno</p>
          <h1 className="mt-2 text-[28px] font-semibold leading-tight text-[#1f2937]">Mis cursos</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-[#6b7280]">
            Revisa los cursos en los que ya confirmaste tu matricula.
          </p>
        </div>
        <label className="relative block w-full max-w-sm">
          <span className="sr-only">Buscar curso</span>
          <Search className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#6b7280]" size={18} strokeWidth={1.8} />
          <input
            className="h-12 w-full rounded-[8px] border border-[#E7E0D3] bg-white pl-11 pr-4 text-sm text-[#1f2937] outline-none transition placeholder:text-[#9ca3af] focus:border-[#8b2332]"
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Buscar por codigo o nombre"
            value={query}
          />
        </label>
      </header>

      <section className="border-y border-[#E7E0D3] bg-white py-5">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <label className="grid w-full max-w-sm gap-2 text-sm font-semibold text-[#1f2937]">
            Ciclo academico
            <select
              className="h-12 rounded-[8px] border border-[#E7E0D3] bg-[#fffdfa] px-4 text-sm font-medium text-[#1f2937] outline-none transition focus:border-[#8b2332]"
              disabled={!availableCycles.length}
              onChange={(event) => {
                setSelectedCycle(Number(event.target.value))
                setExpandedCourseId(null)
              }}
              value={selectedCycle ?? ''}
            >
              {!availableCycles.length ? <option value="">Sin ciclos disponibles</option> : null}
              {availableCycles.map((cycle) => (
                <option key={cycle} value={cycle}>
                  Ciclo {cycle}{cycle === currentCycle ? ' - actual' : ''}
                </option>
              ))}
            </select>
          </label>

          <div className="grid grid-cols-3 gap-3 sm:min-w-[470px]">
            <Summary label="Cursos" value={String(filteredCourses.length)} />
            <Summary label="Creditos" value={formatAcademicValue(String(totalCredits))} />
            <Summary label="Horas semanales" value={formatAcademicValue(String(totalHours))} />
          </div>
        </div>
      </section>

      {error ? <p className="rounded-[8px] border border-[#fecdd3] bg-[#fff1f2] p-4 text-sm font-medium text-[#be123c]">{error}</p> : null}

      {isLoading ? (
        <div className="flex min-h-64 items-center justify-center gap-3 text-sm font-medium text-[#6b7280]">
          <Loader2 className="animate-spin" size={20} strokeWidth={1.8} />
          Cargando cursos de tu carrera...
        </div>
      ) : filteredCourses.length ? (
        <div className="grid gap-3">
          {filteredCourses.map((course) => {
            const isExpanded = expandedCourseId === course.curso_id
            return (
              <article className="overflow-hidden rounded-[8px] border border-[#E7E0D3] bg-white" key={course.curso_id}>
                <button
                  aria-expanded={isExpanded}
                  className="grid w-full grid-cols-[1fr_auto] items-center gap-4 border-l-4 border-[#8b2332] px-4 py-4 text-left transition hover:bg-[#fbfaf7] sm:px-5"
                  onClick={() => setExpandedCourseId(isExpanded ? null : course.curso_id)}
                  type="button"
                >
                  <span className="min-w-0">
                    <span className="block truncate text-[15px] font-semibold text-[#1f2937]">{course.nombre}</span>
                    <span className="mt-1 block text-xs font-medium text-[#6b7280]">{course.codigo} · Ciclo {course.ciclo}</span>
                  </span>
                  <ChevronDown className={`text-[#8b2332] transition-transform ${isExpanded ? 'rotate-180' : ''}`} size={20} strokeWidth={1.8} />
                </button>

                {isExpanded ? (
                  <div className="grid gap-4 border-t border-[#E7E0D3] bg-[#fbfaf7] px-5 py-4 sm:grid-cols-3">
                    <CourseDetail icon={GraduationCap} label="Creditos" value={formatAcademicValue(course.creditos)} />
                    <CourseDetail icon={Clock3} label="Horas semanales" value={formatAcademicValue(course.horas_semanales)} />
                    <CourseDetail icon={BookOpenCheck} label="Estado en la malla" value={course.ciclo === currentCycle ? 'Ciclo actual' : `Ciclo ${course.ciclo}`} />
                  </div>
                ) : null}
              </article>
            )
          })}
        </div>
      ) : (
        <div className="grid min-h-64 place-items-center rounded-[8px] border border-dashed border-[#E7E0D3] bg-white p-8 text-center">
          <div>
            <BookOpenCheck className="mx-auto text-[#b5aa99]" size={32} strokeWidth={1.6} />
            <h2 className="mt-4 text-lg font-semibold text-[#1f2937]">No hay cursos para mostrar</h2>
            <p className="mt-2 text-sm leading-6 text-[#6b7280]">Cuando confirmes tu matricula, tus cursos apareceran aqui.</p>
          </div>
        </div>
      )}
    </section>
  )
}

function Summary({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0 border-l border-[#E7E0D3] px-3 first:border-l-0 sm:px-5">
      <span className="block text-xs font-medium text-[#6b7280]">{label}</span>
      <strong className="mt-1 block truncate text-xl font-semibold text-[#1f2937]">{value}</strong>
    </div>
  )
}

function CourseDetail({ icon: Icon, label, value }: { icon: typeof GraduationCap; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3">
      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-[8px] bg-white text-[#8b2332]">
        <Icon size={18} strokeWidth={1.8} />
      </span>
      <span>
        <span className="block text-xs text-[#6b7280]">{label}</span>
        <strong className="mt-0.5 block text-sm font-semibold text-[#1f2937]">{value}</strong>
      </span>
    </div>
  )
}
