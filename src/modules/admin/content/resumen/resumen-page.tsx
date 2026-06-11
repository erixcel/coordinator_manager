import { useEffect } from 'react'
import {
  Users,
  GraduationCap,
  Layers,
  BookOpen,
  Award,
  Calendar,
  Compass,
  Bookmark,
  TrendingUp
} from 'lucide-react'
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from 'recharts'
import { useAdminStore } from '../../../../store/use-admin-store'
import { cn, panel } from '../../shared/styles'

function MetricCard({
  title,
  value,
  icon: Icon,
  gradient,
  delay
}: {
  title: string
  value: number
  icon: typeof Users
  gradient: string
  delay: string
}) {
  return (
    <article
      className={cn(
        panel,
        `relative overflow-hidden p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_16px_48px_rgba(15,23,42,0.10)] animate-fade-in-up`,
        delay
      )}
    >
      <div className="flex items-center justify-between">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-[0.1em] text-slate-400">
            {title}
          </span>
          <strong className="mt-2 block text-3xl font-extrabold leading-none text-slate-900">
            {value.toLocaleString('es-PE')}
          </strong>
        </div>
        <div className={cn('grid h-12 w-12 place-items-center rounded-2xl text-white shadow-lg', gradient)}>
          <Icon size={22} strokeWidth={1.8} />
        </div>
      </div>
      {/* Decorative bottom bar */}
      <div className={cn('absolute bottom-0 left-0 right-0 h-1 opacity-60', gradient)} />
    </article>
  )
}

function InsightRow({
  label,
  value,
  icon: Icon,
  iconBg
}: {
  label: string
  value: number
  icon: typeof Award
  iconBg: string
}) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-slate-100 pb-4 last:border-b-0 last:pb-0">
      <div className="flex items-center gap-3">
        <span className={cn('grid h-9 w-9 place-items-center rounded-xl text-white', iconBg)}>
          <Icon size={16} strokeWidth={1.8} />
        </span>
        <span className="text-sm font-semibold text-slate-500">{label}</span>
      </div>
      <strong className="text-base font-extrabold text-slate-800">
        {value.toLocaleString('es-PE')}
      </strong>
    </div>
  )
}

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0];
    return (
      <div className="rounded-xl border border-slate-200/60 bg-white/90 p-3 shadow-[0_12px_32px_rgba(15,23,42,0.12)] backdrop-blur-xl">
        <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-slate-400">
          {data.name || data.payload.nombre}
        </p>
        <p className="mt-1 text-sm font-extrabold text-slate-800">
          {data.value.toLocaleString('es-PE')}{' '}
          <span className="text-xs font-semibold text-slate-500">
            {data.dataKey === 'student_count' || data.name === 'Estudiantes' ? 'estudiantes' : 'cursos'}
          </span>
        </p>
      </div>
    )
  }
  return null
}

const PIE_COLORS = ['#FF385C', '#0F172A', '#0EA5E9', '#10B981', '#8B5CF6', '#F59E0B']

export function ResumenPage() {
  const loadSummary = useAdminStore((state) => state.loadSummary)
  const summary = useAdminStore((state) => state.summary)

  useEffect(() => {
    void loadSummary()
  }, [loadSummary])

  if (!summary) {
    return null
  }

  const pieData = summary.career_distribution.map((c) => ({
    name: c.nombre,
    value: c.student_count
  }))

  const barData = summary.career_distribution.map((c) => ({
    nombre: c.nombre.replace(' Engineering', ''),
    student_count: c.student_count,
    course_count: c.course_count
  }))

  const radarData = [
    { subject: 'Creditos', A: summary.total_credits / 5, fullMark: 100 },
    { subject: 'Merito Alto', A: (summary.high_merit_students / summary.students) * 300, fullMark: 100 },
    { subject: 'Ciclos', A: summary.cycles_available * 8, fullMark: 100 },
    { subject: 'Mallas', A: (summary.curriculum / summary.courses) * 80, fullMark: 100 }
  ]

  return (
    <section className="grid gap-6">
      {/* Metric Cards */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          title="Profesores"
          value={summary.teachers}
          icon={Users}
          gradient="bg-gradient-to-br from-[#FF5A79] to-[#FF385C]"
          delay="animate-fade-in-up-1"
        />
        <MetricCard
          title="Estudiantes"
          value={summary.students}
          icon={GraduationCap}
          gradient="bg-gradient-to-br from-[#334155] to-[#0F172A]"
          delay="animate-fade-in-up-2"
        />
        <MetricCard
          title="Carreras"
          value={summary.careers}
          icon={Layers}
          gradient="bg-gradient-to-br from-[#38BDF8] to-[#0EA5E9]"
          delay="animate-fade-in-up-3"
        />
        <MetricCard
          title="Cursos"
          value={summary.courses}
          icon={BookOpen}
          gradient="bg-gradient-to-br from-[#34D399] to-[#10B981]"
          delay="animate-fade-in-up-4"
        />
      </div>

      {/* Charts Row */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Donut Chart */}
        <section className={cn(panel, 'animate-fade-in-up animate-fade-in-up-5 p-6 flex flex-col justify-between min-h-[380px]')}>
          <div>
            <h3 className="text-lg font-extrabold text-slate-800 flex items-center gap-2">
              <TrendingUp size={18} className="text-[#FF385C]" />
              Distribucion de Estudiantes por Carrera
            </h3>
            <p className="text-xs font-medium text-slate-400 mt-1">
              Participacion porcentual de matricula activa en la facultad.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-[1.2fr_0.8fr] items-center gap-4 mt-4">
            <div className="h-[210px] w-full relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {pieData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-[26px] font-extrabold text-slate-800 leading-none">
                  {summary.students}
                </span>
                <span className="text-[10px] font-bold uppercase tracking-[0.1em] text-slate-400 mt-1">
                  Estudiantes
                </span>
              </div>
            </div>
            <div className="grid gap-3">
              {summary.career_distribution.map((c, idx) => {
                const pct = ((c.student_count / summary.students) * 100).toFixed(1)
                return (
                  <div key={c.carrera_id} className="flex items-start gap-2.5">
                    <span
                      className="h-3 w-3 rounded shrink-0 mt-0.5"
                      style={{ backgroundColor: PIE_COLORS[idx % PIE_COLORS.length] }}
                    />
                    <div>
                      <strong className="block text-xs font-bold text-slate-700 leading-tight">
                        {c.nombre}
                      </strong>
                      <span className="text-[11px] font-medium text-slate-400">
                        {c.student_count} alumnos ({pct}%)
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </section>

        {/* Bar Chart */}
        <section className={cn(panel, 'animate-fade-in-up animate-fade-in-up-6 p-6 flex flex-col justify-between min-h-[380px]')}>
          <div>
            <h3 className="text-lg font-extrabold text-slate-800 flex items-center gap-2">
              <Compass size={18} className="text-[#0EA5E9]" />
              Comparativa Academica de Secciones
            </h3>
            <p className="text-xs font-medium text-slate-400 mt-1">
              Relacion de estudiantes matriculados vs cursos cargados por carrera.
            </p>
          </div>
          <div className="h-[210px] w-full mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData} barGap={8}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
                <XAxis
                  dataKey="nombre"
                  stroke="#94A3B8"
                  fontSize={11}
                  fontWeight={600}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis stroke="#94A3B8" fontSize={11} fontWeight={600} tickLine={false} axisLine={false} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(241,245,249,0.6)' }} />
                <Legend
                  verticalAlign="top"
                  align="right"
                  iconSize={8}
                  iconType="circle"
                  wrapperStyle={{ fontSize: 11, fontWeight: 600, paddingBottom: 10 }}
                />
                <Bar
                  name="Estudiantes"
                  dataKey="student_count"
                  fill="#FF385C"
                  radius={[6, 6, 0, 0]}
                  maxBarSize={32}
                />
                <Bar
                  name="Cursos"
                  dataKey="course_count"
                  fill="#94A3B8"
                  radius={[6, 6, 0, 0]}
                  maxBarSize={32}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>
      </div>

      {/* Bottom Row */}
      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        {/* Radar */}
        <section className={cn(panel, 'p-6 flex flex-col justify-between min-h-[360px]')}>
          <div>
            <h3 className="text-lg font-extrabold text-slate-800 flex items-center gap-2">
              <Layers size={18} className="text-[#10B981]" />
              Equilibrio de Recursos Academicos
            </h3>
            <p className="text-xs font-medium text-slate-400 mt-1">
              Desempeno y distribucion ponderada de los indicadores clave.
            </p>
          </div>
          <div className="h-[230px] w-full mt-2 flex justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="75%" data={radarData}>
                <PolarGrid stroke="#E2E8F0" />
                <PolarAngleAxis
                  dataKey="subject"
                  stroke="#64748B"
                  fontSize={10}
                  fontWeight={600}
                />
                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                <Radar
                  name="Recursos"
                  dataKey="A"
                  stroke="#FF385C"
                  fill="#FF385C"
                  fillOpacity={0.18}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </section>

        {/* Insights */}
        <section className={cn(panel, 'p-6 flex flex-col justify-between min-h-[360px]')}>
          <div>
            <h3 className="text-lg font-extrabold text-slate-800 flex items-center gap-2">
              <Award size={18} className="text-[#FF385C]" />
              Indicadores Academicos de Apoyo
            </h3>
            <p className="text-xs font-medium text-slate-400 mt-1">
              Metricas auxiliares del estado de la facultad.
            </p>
          </div>
          <div className="grid gap-4 mt-6">
            <InsightRow
              label="Creditos registrados"
              value={summary.total_credits}
              icon={Bookmark}
              iconBg="bg-gradient-to-br from-[#FF5A79] to-[#FF385C]"
            />
            <InsightRow
              label="Estudiantes de merito alto"
              value={summary.high_merit_students}
              icon={Award}
              iconBg="bg-gradient-to-br from-[#334155] to-[#0F172A]"
            />
            <InsightRow
              label="Ciclos disponibles"
              value={summary.cycles_available}
              icon={Calendar}
              iconBg="bg-gradient-to-br from-[#38BDF8] to-[#0EA5E9]"
            />
            <InsightRow
              label="Mallas vinculadas"
              value={summary.curriculum}
              icon={Layers}
              iconBg="bg-gradient-to-br from-[#34D399] to-[#10B981]"
            />
          </div>
        </section>
      </div>
    </section>
  )
}
