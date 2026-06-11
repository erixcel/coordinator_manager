import { GraduationCap, Users, BookOpen, Award, ArrowRight } from 'lucide-react'
import { useEffect } from 'react'
import { useAdminStore } from '../../../../store/use-admin-store'
import { PageTitle } from '../../shared/page-title'

function getCareerTheme(name: string) {
  const normalized = name.toLowerCase()
  if (normalized.includes('system')) {
    return {
      gradient: 'from-indigo-600/12 via-violet-600/4 to-transparent',
      accent: 'text-indigo-600 bg-indigo-50 border-indigo-100',
      badge: 'bg-indigo-50 text-indigo-700 border-indigo-150',
      iconColor: 'text-indigo-600',
      shadow: 'hover:shadow-[0_12px_32px_rgba(79,70,229,0.14)] hover:border-indigo-200',
    }
  }
  if (normalized.includes('software')) {
    return {
      gradient: 'from-rose-600/12 via-pink-600/4 to-transparent',
      accent: 'text-rose-600 bg-rose-50 border-rose-100',
      badge: 'bg-rose-50 text-rose-700 border-rose-150',
      iconColor: 'text-rose-600',
      shadow: 'hover:shadow-[0_12px_32px_rgba(225,29,72,0.14)] hover:border-rose-200',
    }
  }
  // Default fallback
  return {
    gradient: 'from-emerald-600/12 via-teal-600/4 to-transparent',
    accent: 'text-emerald-600 bg-emerald-50 border-emerald-100',
    badge: 'bg-emerald-50 text-emerald-700 border-emerald-150',
    iconColor: 'text-emerald-600',
    shadow: 'hover:shadow-[0_12px_32px_rgba(16,185,129,0.14)] hover:border-emerald-200',
  }
}

interface InsightProps {
  icon: React.ReactNode
  label: string
  value: number
}

function Insight({ icon, label, value }: InsightProps) {
  return (
    <div className="flex items-center justify-between gap-4 py-1.5">
      <div className="flex items-center gap-2.5 text-[#555555]">
        <div className="text-neutral-400">{icon}</div>
        <span className="text-sm font-medium">{label}</span>
      </div>
      <strong className="text-base font-semibold text-[#1a1a1a]">{value.toLocaleString('es-PE')}</strong>
    </div>
  )
}

export function CarrerasPage() {
  const careerStats = useAdminStore((state) => state.careerStats)
  const loadCareerStats = useAdminStore((state) => state.loadCareerStats)

  useEffect(() => {
    void loadCareerStats()
  }, [loadCareerStats])

  return (
    <section className="grid gap-6">
      <div className="flex flex-col gap-2">
        <PageTitle>CARRERAS</PageTitle>
        <p className="text-sm text-neutral-500">
          Resumen estadístico y distribución académica por carrera profesional.
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {careerStats.map((career) => {
          const theme = getCareerTheme(career.nombre)

          return (
            <article
              className={`group relative overflow-hidden rounded-2xl border border-neutral-200/80 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1.5 ${theme.shadow}`}
              key={career.carrera_id}
            >
              {/* Background Glow/Gradient Accent */}
              <div className={`absolute top-0 right-0 left-0 h-28 bg-gradient-to-b ${theme.gradient}`} />

              <div className="relative z-10">
                {/* Header */}
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <span className={`inline-flex rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${theme.badge}`}>
                      {career.facultad}
                    </span>
                    <h3 className="mt-2.5 text-xl font-bold tracking-tight text-neutral-800 transition-colors duration-250 group-hover:text-neutral-900 leading-snug">
                      {career.nombre}
                    </h3>
                  </div>
                  <div className={`grid h-12 w-12 shrink-0 place-items-center rounded-xl border transition-all duration-350 ${theme.accent} group-hover:scale-110 group-hover:rotate-6`}>
                    <GraduationCap size={24} strokeWidth={1.8} />
                  </div>
                </div>

                {/* Metrics */}
                <div className="mt-6 flex flex-col gap-1 border-t border-neutral-100 pt-4">
                  <Insight icon={<Users size={16} />} label="Estudiantes" value={career.student_count} />
                  <Insight icon={<BookOpen size={16} />} label="Cursos" value={career.course_count} />
                  <Insight icon={<Award size={16} />} label="Créditos" value={career.total_credits} />
                </div>

                {/* Interactive Footer Action */}
                <div className="mt-6 flex items-center gap-1.5 border-t border-neutral-100 pt-4 text-xs font-semibold text-neutral-500 transition-colors duration-250 group-hover:text-neutral-800">
                  <span>Ver malla curricular</span>
                  <ArrowRight
                    size={14}
                    className="transition-transform duration-250 group-hover:translate-x-1"
                  />
                </div>
              </div>
            </article>
          )
        })}
      </div>
    </section>
  )
}

