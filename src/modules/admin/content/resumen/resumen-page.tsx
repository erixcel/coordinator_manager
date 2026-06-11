import { useEffect } from 'react'
import { useAdminStore } from '../../../../store/use-admin-store'
import { cn, panel } from '../../shared/styles'

function Metric({ title, value, tone }: { title: string; value: number; tone: string }) {
  const tones: Record<string, string> = {
    primary: 'bg-[#FF385C] text-white',
    dark: 'bg-[#222222] text-white',
    soft: 'bg-[#F7F7F7] text-[#222222]',
  }

  return (
    <article className={cn(panel, 'overflow-hidden p-5 transition hover:shadow-[0_6px_16px_rgba(0,0,0,0.12)]')}>
      <div className={cn('mb-5 inline-flex rounded-full px-3 py-1 text-xs font-semibold', tones[tone])}>
        {title}
      </div>
      <strong className="block text-4xl font-semibold leading-none text-[#222222]">
        {value.toLocaleString('es-PE')}
      </strong>
    </article>
  )
}

function Insight({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-[#EBEBEB] pb-4 last:border-b-0 last:pb-0">
      <span className="text-sm text-[#717171]">{label}</span>
      <strong className="text-lg font-semibold text-[#222222]">{value.toLocaleString('es-PE')}</strong>
    </div>
  )
}

export function ResumenPage() {
  const loadSummary = useAdminStore((state) => state.loadSummary)
  const summary = useAdminStore((state) => state.summary)

  useEffect(() => {
    void loadSummary()
  }, [loadSummary])

  if (!summary) {
    return null
  }

  return (
    <section className="grid gap-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Metric title="Profesores" value={summary.teachers} tone="primary" />
        <Metric title="Estudiantes" value={summary.students} tone="dark" />
        <Metric title="Carreras" value={summary.careers} tone="soft" />
        <Metric title="Cursos" value={summary.courses} tone="primary" />
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.35fr_0.65fr]">
        <section className={cn(panel, 'p-6')}>
          <h3 className="text-[22px] font-semibold leading-tight text-[#222222]">
            Distribución por carrera
          </h3>
          <div className="mt-6 grid gap-5">
            {summary.career_distribution.map((career) => {
              const width = summary.students > 0 ? (career.student_count / summary.students) * 100 : 0

              return (
                <div className="grid gap-3 md:grid-cols-[1fr_180px_auto_auto] md:items-center" key={career.carrera_id}>
                  <div>
                    <strong className="block text-[15px] font-semibold text-[#222222]">{career.nombre}</strong>
                    <span className="text-sm text-[#717171]">{career.facultad}</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-[#F7F7F7]" aria-hidden="true">
                    <div className="h-full rounded-full bg-[#FF385C]" style={{ width: `${Math.max(12, width)}%` }} />
                  </div>
                  <span className="text-sm text-[#717171]">{career.student_count} estudiantes</span>
                  <span className="text-sm text-[#717171]">{career.course_count} cursos</span>
                </div>
              )
            })}
          </div>
        </section>

        <section className={cn(panel, 'p-6')}>
          <h3 className="text-[22px] font-semibold leading-tight text-[#222222]">
            Indicadores académicos
          </h3>
          <div className="mt-6 grid gap-4">
            <Insight label="Créditos registrados" value={summary.total_credits} />
            <Insight label="Estudiantes de mérito alto" value={summary.high_merit_students} />
            <Insight label="Ciclos disponibles" value={summary.cycles_available} />
            <Insight label="Mallas vinculadas" value={summary.curriculum} />
          </div>
        </section>
      </div>
    </section>
  )
}
