import { GraduationCap, Users, BookOpen, Award, ArrowRight } from 'lucide-react'
import { useEffect } from 'react'
import { useAdminStore } from '../../../../store/use-admin-store'
import { PageTitle } from '../../shared/page-title'

function getCareerTheme(name: string) {
  const normalized = name.toLowerCase()
  if (normalized.includes('system')) {
    return {
      gradient: 'from-indigo-500/10 via-violet-500/4 to-transparent',
      accent: 'text-indigo-600 bg-indigo-50 border-indigo-200/60',
      badge: 'bg-indigo-50 text-indigo-700 border-indigo-200/60',
      iconColor: 'text-indigo-600',
      shadow: 'hover:shadow-[0_16px_48px_rgba(79,70,229,0.12)] hover:border-indigo-200',
      bar: 'bg-gradient-to-r from-indigo-500 to-violet-500',
    }
  }
  if (normalized.includes('software')) {
    return {
      gradient: 'from-rose-500/10 via-pink-500/4 to-transparent',
      accent: 'text-rose-600 bg-rose-50 border-rose-200/60',
      badge: 'bg-rose-50 text-rose-700 border-rose-200/60',
      iconColor: 'text-rose-600',
      shadow: 'hover:shadow-[0_16px_48px_rgba(225,29,72,0.12)] hover:border-rose-200',
      bar: 'bg-gradient-to-r from-rose-500 to-pink-500',
    }
  }
  return {
    gradient: 'from-emerald-500/10 via-teal-500/4 to-transparent',
    accent: 'text-emerald-600 bg-emerald-50 border-emerald-200/60',
    badge: 'bg-emerald-50 text-emerald-700 border-emerald-200/60',
    iconColor: 'text-emerald-600',
    shadow: 'hover:shadow-[0_16px_48px_rgba(16,185,129,0.12)] hover:border-emerald-200',
    bar: 'bg-gradient-to-r from-emerald-500 to-teal-500',
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
      <div className="flex items-center gap-2.5 text-slate-500">
        <div className="text-slate-400">{icon}</div>
        <span className="text-sm font-medium">{label}</span>
      </div>
      <strong className="text-base font-bold text-slate-800">{value.toLocaleString('es-PE')}</strong>
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
    <section className="grid gap-6 animate-fade-in-up">
      <div className="flex flex-col gap-1">
        <PageTitle>Carreras</PageTitle>
        <p className="text-sm text-slate-400 font-medium">
          Resumen estadistico y distribucion academica por carrera profesional.
        </p>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {careerStats.map((career) => {
          const theme = getCareerTheme(career.nombre)

          return (
            <article
              className={`group relative overflow-hidden rounded-2xl border border-slate-200/60 bg-white/80 backdrop-blur p-6 shadow-[0_4px_24px_rgba(15,23,42,0.05)] transition-all duration-300 hover:-translate-y-1.5 ${theme.shadow}`}
              key={career.carrera_id}
            >
              {/* Background gradient accent */}
              <div className={`absolute top-0 right-0 left-0 h-28 bg-gradient-to-b ${theme.gradient}`} />

              {/* Bottom decorative bar */}
              <div className={`absolute bottom-0 left-0 right-0 h-1 ${theme.bar} opacity-0 transition-opacity duration-300 group-hover:opacity-60`} />

              <div className="relative z-10">
                {/* Header */}
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <span className={`inline-flex rounded-lg border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${theme.badge}`}>
                      {career.facultad}
                    </span>
                    <h3 className="mt-2.5 text-xl font-bold tracking-tight text-slate-800 transition-colors duration-250 group-hover:text-slate-900 leading-snug">
                      {career.nombre}
                    </h3>
                  </div>
                  <div className={`grid h-12 w-12 shrink-0 place-items-center rounded-xl border transition-all duration-300 ${theme.accent} group-hover:scale-110 group-hover:rotate-3`}>
                    <GraduationCap size={24} strokeWidth={1.8} />
                  </div>
                </div>

                {/* Metrics */}
                <div className="mt-6 flex flex-col gap-1 border-t border-slate-100 pt-4">
                  <Insight icon={<Users size={16} />} label="Estudiantes" value={career.student_count} />
                  <Insight icon={<BookOpen size={16} />} label="Cursos" value={career.course_count} />
                  <Insight icon={<Award size={16} />} label="Creditos" value={career.total_credits} />
                </div>

                {/* Footer */}
                <div className="mt-6 flex items-center gap-1.5 border-t border-slate-100 pt-4 text-xs font-semibold text-slate-400 transition-colors duration-250 group-hover:text-slate-700">
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
