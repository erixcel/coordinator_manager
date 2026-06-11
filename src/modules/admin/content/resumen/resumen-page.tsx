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
  borderTone
}: {
  title: string
  value: number
  icon: typeof Users
  gradient: string
  borderTone: string
}) {
  return (
    <article
      className={cn(
        panel,
        'relative overflow-hidden p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_12px_24px_rgba(15,23,42,0.08)] border-b-4',
        borderTone
      )}
    >
      <div className="flex items-center justify-between">
        <div>
          <span className="text-xs font-black uppercase tracking-[0.14em] text-[#8EA0B8]">
            {title}
          </span>
          <strong className="mt-2 block text-3xl font-black leading-none text-[#152033]">
            {value.toLocaleString('es-PE')}
          </strong>
        </div>
        <div className={cn('grid h-12 w-12 place-items-center rounded-[12px] text-white shadow-sm', gradient)}>
          <Icon size={22} />
        </div>
      </div>
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
    <div className="flex items-center justify-between gap-4 border-b border-[#F1F5F9] pb-4 last:border-b-0 last:pb-0">
      <div className="flex items-center gap-3">
        <span className={cn('grid h-8 w-8 place-items-center rounded-[8px] text-white', iconBg)}>
          <Icon size={16} />
        </span>
        <span className="text-sm font-semibold text-[#5D6B82]">{label}</span>
      </div>
      <strong className="text-base font-black text-[#152033]">
        {value.toLocaleString('es-PE')}
      </strong>
    </div>
  )
}

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0];
    return (
      <div className="rounded-[8px] border border-[#E7EDF5] bg-white p-3 shadow-[0_8px_24px_rgba(15,23,42,0.08)]">
        <p className="text-xs font-black uppercase tracking-[0.1em] text-[#8EA0B8]">
          {data.name || data.payload.nombre}
        </p>
        <p className="mt-1 text-sm font-black text-[#152033]">
          {data.value.toLocaleString('es-PE')}{' '}
          <span className="text-xs font-semibold text-[#5D6B82]">
            {data.dataKey === 'student_count' || data.name === 'Estudiantes' ? 'estudiantes' : 'cursos'}
          </span>
        </p>
      </div>
    )
  }
  return null
}

const PIE_COLORS = ['#FF385C', '#0F172A']

export function ResumenPage() {
  const loadSummary = useAdminStore((state) => state.loadSummary)
  const summary = useAdminStore((state) => state.summary)

  useEffect(() => {
    void loadSummary()
  }, [loadSummary])

  if (!summary) {
    return null
  }

  // Preparar datos para los gráficos
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
    { subject: 'Créditos', A: summary.total_credits / 5, fullMark: 100 },
    { subject: 'Alumnos Mérito', A: (summary.high_merit_students / summary.students) * 300, fullMark: 100 },
    { subject: 'Ciclos', A: summary.cycles_available * 8, fullMark: 100 },
    { subject: 'Mallas Vinculadas', A: (summary.curriculum / summary.courses) * 80, fullMark: 100 }
  ]

  return (
    <section className="grid gap-6">
      {/* Tarjetas de Métricas Principales */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          title="Profesores"
          value={summary.teachers}
          icon={Users}
          gradient="bg-gradient-to-br from-[#FF5A79] to-[#FF385C]"
          borderTone="border-[#FF385C]"
        />
        <MetricCard
          title="Estudiantes"
          value={summary.students}
          icon={GraduationCap}
          gradient="bg-gradient-to-br from-[#334155] to-[#0F172A]"
          borderTone="border-[#0F172A]"
        />
        <MetricCard
          title="Carreras"
          value={summary.careers}
          icon={Layers}
          gradient="bg-gradient-to-br from-[#38BDF8] to-[#0EA5E9]"
          borderTone="border-[#0EA5E9]"
        />
        <MetricCard
          title="Cursos"
          value={summary.courses}
          icon={BookOpen}
          gradient="bg-gradient-to-br from-[#34D399] to-[#10B981]"
          borderTone="border-[#10B981]"
        />
      </div>

      {/* Sección de Distribución de Carreras y Comparativas */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Gráfico Donut de Estudiantes */}
        <section className={cn(panel, 'p-6 flex flex-col justify-between min-h-[380px]')}>
          <div>
            <h3 className="text-lg font-black text-[#152033] flex items-center gap-2">
              <TrendingUp size={18} className="text-[#FF385C]" />
              Distribución de Estudiantes por Carrera
            </h3>
            <p className="text-xs font-semibold text-[#8EA0B8] mt-1">
              Participación porcentual de matrícula activa en la facultad.
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
              {/* Texto en el centro del Donut */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-[26px] font-black text-[#152033] leading-none">
                  {summary.students}
                </span>
                <span className="text-[10px] font-bold uppercase tracking-[0.1em] text-[#8EA0B8] mt-1">
                  Estudiantes
                </span>
              </div>
            </div>
            {/* Leyenda personalizada */}
            <div className="grid gap-3">
              {summary.career_distribution.map((c, idx) => {
                const pct = ((c.student_count / summary.students) * 100).toFixed(1)
                return (
                  <div key={c.carrera_id} className="flex items-start gap-2.5">
                    <span
                      className="h-3.5 w-3.5 rounded-[4px] shrink-0 mt-0.5"
                      style={{ backgroundColor: PIE_COLORS[idx % PIE_COLORS.length] }}
                    />
                    <div>
                      <strong className="block text-xs font-black text-[#152033] leading-tight">
                        {c.nombre}
                      </strong>
                      <span className="text-[11px] font-semibold text-[#8EA0B8]">
                        {c.student_count} alumnos ({pct}%)
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </section>

        {/* Gráfico de Barras Comparativo */}
        <section className={cn(panel, 'p-6 flex flex-col justify-between min-h-[380px]')}>
          <div>
            <h3 className="text-lg font-black text-[#152033] flex items-center gap-2">
              <Compass size={18} className="text-[#0EA5E9]" />
              Comparativa Académica de Secciones
            </h3>
            <p className="text-xs font-semibold text-[#8EA0B8] mt-1">
              Relación de estudiantes matriculados vs cursos cargados por carrera.
            </p>
          </div>
          <div className="h-[210px] w-full mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData} barGap={8}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                <XAxis
                  dataKey="nombre"
                  stroke="#8EA0B8"
                  fontSize={11}
                  fontWeight="bold"
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis stroke="#8EA0B8" fontSize={11} fontWeight="bold" tickLine={false} axisLine={false} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: '#F8FAFC' }} />
                <Legend
                  verticalAlign="top"
                  align="right"
                  iconSize={10}
                  iconType="circle"
                  wrapperStyle={{ fontSize: 11, fontWeight: 'bold', paddingBottom: 10 }}
                />
                <Bar
                  name="Estudiantes"
                  dataKey="student_count"
                  fill="#FF385C"
                  radius={[4, 4, 0, 0]}
                  maxBarSize={32}
                />
                <Bar
                  name="Cursos"
                  dataKey="course_count"
                  fill="#94A3B8"
                  radius={[4, 4, 0, 0]}
                  maxBarSize={32}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>
      </div>

      {/* Fila Inferior: Indicadores Académicos y Gráfico Radar */}
      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        {/* Radar de Desempeño General */}
        <section className={cn(panel, 'p-6 flex flex-col justify-between min-h-[360px]')}>
          <div>
            <h3 className="text-lg font-black text-[#152033] flex items-center gap-2">
              <Layers size={18} className="text-[#10B981]" />
              Equilibrio de Recursos Académicos
            </h3>
            <p className="text-xs font-semibold text-[#8EA0B8] mt-1">
              Desempeño y distribución ponderada de los indicadores clave.
            </p>
          </div>
          <div className="h-[230px] w-full mt-2 flex justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="75%" data={radarData}>
                <PolarGrid stroke="#E2E8F0" />
                <PolarAngleAxis
                  dataKey="subject"
                  stroke="#5D6B82"
                  fontSize={10}
                  fontWeight="bold"
                />
                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                <Radar
                  name="Recursos"
                  dataKey="A"
                  stroke="#FF385C"
                  fill="#FF385C"
                  fillOpacity={0.25}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </section>

        {/* Listado de Indicadores */}
        <section className={cn(panel, 'p-6 flex flex-col justify-between min-h-[360px]')}>
          <div>
            <h3 className="text-lg font-black text-[#152033] flex items-center gap-2">
              <Award size={18} className="text-[#FF385C]" />
              Indicadores Académicos de Apoyo
            </h3>
            <p className="text-xs font-semibold text-[#8EA0B8] mt-1">
              Métricas auxiliares del estado de la facultad.
            </p>
          </div>
          <div className="grid gap-4 mt-6">
            <InsightRow
              label="Créditos registrados"
              value={summary.total_credits}
              icon={Bookmark}
              iconBg="bg-gradient-to-br from-[#FF5A79] to-[#FF385C]"
            />
            <InsightRow
              label="Estudiantes de mérito alto"
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
