import { AlertCircle, CalendarDays, FileText, GraduationCap } from 'lucide-react'
import { useEffect } from 'react'
import { useAuthStore } from '../../../store/use-auth-store'
import { useStudentStore } from '../../../store/use-student-store'

const studentSections = [
  {
    icon: GraduationCap,
    label: 'Resumen del alumno',
    text: 'Aqui mostraremos carrera, ciclo actual y datos academicos principales.',
  },
  {
    icon: CalendarDays,
    label: 'Mi horario propuesto',
    text: 'Este espacio queda reservado para la malla de horario generada por el coordinador.',
  },
  {
    icon: AlertCircle,
    label: 'Alertas y recomendaciones',
    text: 'Mostraremos cruces, huecos y pendientes que afecten la matricula.',
  },
  {
    icon: FileText,
    label: 'Exportar propuesta',
    text: 'El alumno podra llevar su propuesta como resumen o prompt para otra IA.',
  },
]

export function StudentHomePage() {
  const user = useAuthStore((state) => state.user)
  const context = useStudentStore((state) => state.context)
  const error = useStudentStore((state) => state.error)
  const isLoading = useStudentStore((state) => state.isLoading)
  const loadContext = useStudentStore((state) => state.loadContext)
  const displayName = user?.first_name || user?.email || 'Alumno'

  useEffect(() => {
    void loadContext()
  }, [loadContext])

  return (
    <section className="grid gap-6">
      <div className="rounded-[8px] border border-[#E7E0D3] bg-white p-6 shadow-[0_8px_30px_rgba(31,41,55,0.06)]">
        <p className="text-sm font-semibold uppercase text-[#8b2332]">Portal del alumno</p>
        <h1 className="mt-3 text-[28px] font-semibold leading-tight text-[#1f2937]">
          Hola, {displayName}. Esta sera tu vista de matricula.
        </h1>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-[#6b7280]">
          {isLoading
            ? 'Cargando tu contexto academico...'
            : context?.profile_completed
              ? `Ficha academica enlazada: ${context.student?.carrera ?? 'carrera pendiente'}.`
              : context?.next_step ?? 'Esta base separa la experiencia del estudiante del panel del coordinador.'}
        </p>
        {error ? <p className="mt-3 text-sm font-medium text-[#C11331]">{error}</p> : null}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {studentSections.map((section) => {
          const Icon = section.icon

          return (
            <article
              className="rounded-[8px] border border-[#E7E0D3] bg-white p-5 shadow-[0_6px_22px_rgba(31,41,55,0.05)]"
              key={section.label}
            >
              <div className="mb-4 grid h-11 w-11 place-items-center rounded-[8px] bg-[#f2ece2] text-[#8b2332]">
                <Icon size={21} strokeWidth={1.8} />
              </div>
              <h2 className="text-base font-semibold text-[#1f2937]">{section.label}</h2>
              <p className="mt-2 text-sm leading-6 text-[#6b7280]">{section.text}</p>
            </article>
          )
        })}
      </div>
    </section>
  )
}
