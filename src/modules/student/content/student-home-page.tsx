import {
  ArrowRight,
  BookOpenCheck,
  CalendarDays,
  CheckCircle2,
  Clock3,
  GraduationCap,
  Loader2,
} from 'lucide-react'
import { useEffect } from 'react'
import { useAuthStore } from '../../../store/use-auth-store'
import { useStudentStore } from '../../../store/use-student-store'

function formatNumber(value?: number | null) {
  if (value === null || value === undefined) return '0'
  return Number.isInteger(value) ? String(value) : value.toFixed(1)
}

export function StudentHomePage() {
  const user = useAuthStore((state) => state.user)
  const context = useStudentStore((state) => state.context)
  const error = useStudentStore((state) => state.error)
  const isLoading = useStudentStore((state) => state.isLoading)
  const loadContext = useStudentStore((state) => state.loadContext)
  const displayName = user?.first_name || user?.email || 'Alumno'
  const student = context?.student
  const enrollment = context?.enrollment
  const courses = context?.courses ?? []
  const totalHours = courses.reduce((total, course) => total + Number(course.horas_semanales || 0), 0)

  useEffect(() => {
    void loadContext()
  }, [loadContext])

  return (
    <section className="grid gap-6">
      <div className="rounded-[8px] border border-[#E7E0D3] bg-white p-6 shadow-[0_8px_30px_rgba(31,41,55,0.06)]">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase text-[#8b2332]">Inicio del alumno</p>
            <h1 className="mt-3 text-[28px] font-semibold leading-tight text-[#1f2937]">
              Hola, {displayName}. Esta es tu vista de matricula.
            </h1>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-[#6b7280]">
              {isLoading
                ? 'Estamos cargando tu contexto academico.'
                : context?.profile_completed
                  ? 'Revisa tu ciclo actual, tu carga academica y accede rapido a tus horarios y matricula.'
                  : context?.next_step ?? 'Tu cuenta ya existe, pero falta completar el enlace academico.'}
            </p>
            {error ? <p className="mt-3 text-sm font-medium text-[#C11331]">{error}</p> : null}
          </div>

          <div className="inline-flex w-fit items-center gap-2 rounded-full border border-[#E7E0D3] bg-[#fbfaf7] px-4 py-2 text-sm font-semibold text-[#1f2937]">
            {isLoading ? <Loader2 className="animate-spin" size={16} strokeWidth={1.8} /> : <CheckCircle2 size={16} strokeWidth={1.8} />}
            {context?.profile_completed ? 'Ficha enlazada' : 'Ficha pendiente'}
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <SummaryTile icon={GraduationCap} label="Carrera" value={student?.carrera ?? 'Pendiente'} />
        <SummaryTile icon={Clock3} label="Ciclo actual" value={student?.ciclo_actual ? `Ciclo ${student.ciclo_actual}` : 'Pendiente'} />
        <SummaryTile icon={BookOpenCheck} label="Cursos del ciclo" value={String(enrollment?.course_count ?? 0)} />
        <SummaryTile icon={CalendarDays} label="Horas semanales" value={formatNumber(totalHours)} />
      </div>

      <section className="grid gap-6 rounded-[8px] border border-[#E7E0D3] bg-white p-6 shadow-[0_8px_30px_rgba(31,41,55,0.06)] lg:grid-cols-[1fr_1.2fr]">
        <div className="flex flex-col justify-between gap-5">
          <div>
            <p className="text-sm font-semibold uppercase text-[#8b2332]">Resumen del ciclo</p>
            <h2 className="mt-2 text-xl font-semibold text-[#1f2937]">
              {student?.ciclo_actual ? `Ciclo ${student.ciclo_actual} · ${formatNumber(enrollment?.total_credits)} creditos` : 'Ciclo pendiente'}
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-[#6b7280]">
              {courses.length
                ? `Tienes ${courses.length} cursos en la carga academica de este ciclo, con ${formatNumber(totalHours)} horas semanales estimadas.`
                : 'Cuando tu carga academica este lista, veras aqui el resumen de cursos, creditos y horas.'}
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <MiniStat label="Creditos" value={formatNumber(enrollment?.total_credits)} />
            <MiniStat label="Horas por semana" value={formatNumber(totalHours)} />
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          <ActionPreview href="/student/horario" label="Mi horario" text="Consulta tus clases matriculadas en calendario." />
          <ActionPreview href="/student/cursos" label="Mis cursos" text="Revisa la carga academica por ciclo." />
          <ActionPreview href="/student/matricula" label="Matricula" text="Elige secciones y confirma tus cursos." />
        </div>
      </section>

      <section className="rounded-[8px] border border-[#E7E0D3] bg-white p-6 shadow-[0_8px_30px_rgba(31,41,55,0.06)]">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase text-[#8b2332]">Cursos del ciclo</p>
            <h2 className="mt-2 text-xl font-semibold text-[#1f2937]">Carga academica</h2>
          </div>
          <span className="text-sm font-medium text-[#6b7280]">{courses.length} cursos encontrados</span>
        </div>

        <div className="mt-5 overflow-hidden rounded-[8px] border border-[#E7E0D3]">
          {courses.length > 0 ? (
            <div className="divide-y divide-[#E7E0D3]">
              {courses.slice(0, 8).map((course) => (
                <div className="grid gap-3 bg-white p-4 sm:grid-cols-[120px_1fr_120px_130px] sm:items-center" key={course.curso_id}>
                  <span className="text-sm font-semibold text-[#8b2332]">{course.codigo}</span>
                  <span className="text-sm font-medium text-[#1f2937]">{course.nombre}</span>
                  <span className="text-sm text-[#6b7280]">{formatNumber(course.creditos)} creditos</span>
                  <span className="text-sm text-[#6b7280]">{formatNumber(course.horas_semanales)} h/semana</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-[#fbfaf7] p-5 text-sm leading-6 text-[#6b7280]">
              No hay cursos para mostrar todavia. Cuando tu ficha academica este enlazada a carrera y ciclo, el sistema
              mostrara aqui la carga sugerida.
            </div>
          )}
        </div>
      </section>
    </section>
  )
}

function SummaryTile({ icon: Icon, label, value }: { icon: typeof GraduationCap; label: string; value: string }) {
  return (
    <article className="rounded-[8px] border border-[#E7E0D3] bg-white p-5 shadow-[0_6px_22px_rgba(31,41,55,0.05)]">
      <div className="mb-4 grid h-11 w-11 place-items-center rounded-[8px] bg-[#f2ece2] text-[#8b2332]">
        <Icon size={21} strokeWidth={1.8} />
      </div>
      <p className="text-sm text-[#6b7280]">{label}</p>
      <p className="mt-1 text-lg font-semibold text-[#1f2937]">{value}</p>
    </article>
  )
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[8px] border border-[#E7E0D3] bg-[#fbfaf7] p-4">
      <p className="text-xs font-semibold uppercase text-[#6b7280]">{label}</p>
      <p className="mt-2 text-2xl font-semibold text-[#1f2937]">{value}</p>
    </div>
  )
}

function ActionPreview({ href, label, text }: { href: string; label: string; text: string }) {
  return (
    <a className="group rounded-[8px] border border-[#E7E0D3] bg-[#fbfaf7] p-4 transition hover:border-[#8b2332] hover:bg-white" href={href}>
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-semibold text-[#1f2937]">{label}</p>
        <ArrowRight size={16} strokeWidth={1.8} className="text-[#8b2332] transition group-hover:translate-x-0.5" />
      </div>
      <p className="mt-2 text-sm leading-6 text-[#6b7280]">{text}</p>
    </a>
  )
}
