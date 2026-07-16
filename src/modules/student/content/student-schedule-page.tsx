import FullCalendar from '@fullcalendar/react'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'
import { AlertCircle, CalendarDays, Loader2 } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import type { EventContentArg } from '@fullcalendar/core'
import type { StudentConfirmedEnrollment } from '../../../data'
import { useStudentStore } from '../../../store/use-student-store'

type ScheduleItem = StudentConfirmedEnrollment['schedule'][number]

const courseTones = [
  { accent: '#8b2332', background: '#fff1f2', border: '#fda4af' },
  { accent: '#0f766e', background: '#ecfdf5', border: '#5eead4' },
  { accent: '#1d4ed8', background: '#eff6ff', border: '#93c5fd' },
  { accent: '#b45309', background: '#fff7ed', border: '#fdba74' },
  { accent: '#6d28d9', background: '#f5f3ff', border: '#c4b5fd' },
  { accent: '#047857', background: '#f0fdf4', border: '#86efac' },
]
const dayIndex: Record<string, number> = {
  lunes: 0,
  martes: 1,
  miercoles: 2,
  jueves: 3,
  viernes: 4,
  sabado: 5,
  domingo: 6,
}

function getLimaDate() {
  return new Date(new Date().toLocaleString('en-US', { timeZone: 'America/Lima' }))
}

function getMonday(date: Date) {
  const monday = new Date(date)
  const day = monday.getDay()
  monday.setHours(0, 0, 0, 0)
  monday.setDate(monday.getDate() - (day === 0 ? 6 : day - 1))
  return monday
}

function addDays(date: Date, amount: number) {
  const result = new Date(date)
  result.setDate(result.getDate() + amount)
  return result
}

function applyTime(date: Date, time: string) {
  const [hours, minutes] = time.split(':').map(Number)
  const result = new Date(date)
  result.setHours(hours || 0, minutes || 0, 0, 0)
  return result
}

function toIso(date: Date) {
  const offsetDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000)
  return offsetDate.toISOString().slice(0, 19)
}

function getCourseTone(courseId: number) {
  return courseTones[Math.abs(courseId) % courseTones.length]
}

function modalityLabel(value: string) {
  if (!value || value === 'sin_modalidad') return 'Por confirmar'
  return value.charAt(0).toUpperCase() + value.slice(1)
}

function getSlotBounds(schedule: ScheduleItem[]) {
  if (!schedule.length) return { maxTime: '22:00:00', minTime: '08:00:00' }
  const starts = schedule.map((item) => item.hora_inicio).sort()
  const ends = schedule.map((item) => item.hora_fin).sort()
  const minHour = Math.max(6, Number(starts[0].slice(0, 2)) - 1)
  const maxHour = Math.min(23, Number(ends[ends.length - 1].slice(0, 2)) + 1)
  return {
    maxTime: `${String(maxHour).padStart(2, '0')}:00:00`,
    minTime: `${String(minHour).padStart(2, '0')}:00:00`,
  }
}

function CalendarEventContent({ event }: EventContentArg) {
  return (
    <div className="grid gap-1 p-1.5 text-[#1f2937]">
      <span
        className="w-fit rounded-full px-2 py-0.5 text-[10px] font-bold text-white"
        style={{ backgroundColor: event.extendedProps.accent }}
      >
        {event.extendedProps.modality}
      </span>
      <strong className="line-clamp-2 text-[11px] leading-4">{event.title}</strong>
      <span className="text-[10px] font-semibold">{event.extendedProps.time}</span>
      <span className="truncate text-[10px] text-[#4b5563]">{event.extendedProps.room}</span>
    </div>
  )
}

export function StudentSchedulePage() {
  const error = useStudentStore((state) => state.error)
  const confirmedEnrollment = useStudentStore((state) => state.confirmedEnrollment)
  const isScheduleLoading = useStudentStore((state) => state.isScheduleLoading)
  const loadConfirmedEnrollment = useStudentStore((state) => state.loadConfirmedEnrollment)
  const schedule = confirmedEnrollment?.schedule ?? []
  const [selectedSection, setSelectedSection] = useState<number | null>(null)
  const sectionNumbers = useMemo(
    () => Array.from(new Set(schedule.map((item) => item.seccion_id))).sort((a, b) => a - b),
    [schedule],
  )
  const visibleSchedule = useMemo(
    () => schedule.filter((item) => selectedSection === null || item.seccion_id === selectedSection),
    [schedule, selectedSection],
  )
  const weekStart = useMemo(() => getMonday(getLimaDate()), [])
  const slotBounds = useMemo(() => getSlotBounds(visibleSchedule), [visibleSchedule])
  const events = useMemo(
    () =>
      visibleSchedule.map((item) => {
        const tone = getCourseTone(item.curso_id)
        const eventDate = addDays(weekStart, dayIndex[item.dia] ?? 0)
        return {
          id: String(item.horario_id),
          title: item.curso,
          start: toIso(applyTime(eventDate, item.hora_inicio)),
          end: toIso(applyTime(eventDate, item.hora_fin)),
          backgroundColor: tone.background,
          borderColor: tone.border,
          textColor: '#1f2937',
          extendedProps: {
            accent: tone.accent,
            modality: modalityLabel(item.modalidad),
            room: `${item.aula} · ${item.sede}`,
            time: `${item.hora_inicio} - ${item.hora_fin}`,
          },
        }
      }),
    [visibleSchedule, weekStart],
  )

  useEffect(() => {
    void loadConfirmedEnrollment()
  }, [loadConfirmedEnrollment])

  useEffect(() => {
    if (selectedSection !== null && !sectionNumbers.includes(selectedSection)) {
      setSelectedSection(null)
    }
  }, [sectionNumbers, selectedSection])

  return (
    <section className="grid gap-6">
      <header className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase text-[#8b2332]">Mi horario</p>
          <h1 className="mt-2 text-[28px] font-semibold leading-tight text-[#1f2937]">Calendario</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-[#6b7280]">
            Revisa tus clases de la semana, sus horarios, docentes y aulas asignadas.
          </p>
        </div>
        {sectionNumbers.length > 1 ? (
          <label className="grid gap-1.5 text-xs font-semibold text-[#6b7280]">
            Seccion
            <select
              className="h-11 rounded-[8px] border border-[#E7E0D3] bg-white px-3 text-sm font-medium text-[#1f2937] outline-none focus:border-[#8b2332]"
              onChange={(event) => setSelectedSection(event.target.value ? Number(event.target.value) : null)}
              value={selectedSection ?? ''}
            >
              <option value="">Todas mis clases</option>
              {sectionNumbers.map((section) => {
                const item = schedule.find((scheduleItem) => scheduleItem.seccion_id === section)
                return <option key={section} value={section}>{item?.seccion_codigo ?? `Seccion ${section}`}</option>
              })}
            </select>
          </label>
        ) : null}
      </header>

      {error ? <p className="rounded-[8px] border border-[#fecdd3] bg-[#fff1f2] p-4 text-sm font-medium text-[#be123c]">{error}</p> : null}

      {!schedule.length && !isScheduleLoading ? (
        <div className="flex items-start gap-3 rounded-[8px] border border-[#fed7aa] bg-[#fff7ed] p-4">
          <AlertCircle className="mt-0.5 shrink-0 text-[#b45309]" size={20} strokeWidth={1.8} />
          <div>
            <p className="text-sm font-semibold text-[#1f2937]">Aun no tienes matricula registrada</p>
            <p className="mt-1 text-sm leading-6 text-[#6b7280]">
              Cuando confirmes tus cursos en Matricula, apareceran aqui como tu horario oficial.
            </p>
          </div>
        </div>
      ) : null}

      <section className="overflow-hidden rounded-[8px] border border-[#d9e2ec] bg-white shadow-[0_8px_30px_rgba(31,41,55,0.05)]">
        <div className="flex items-center gap-2 border-b border-[#d9e2ec] bg-white px-4 py-4 text-sm font-semibold text-[#1f2937]">
          {isScheduleLoading ? <Loader2 className="animate-spin" size={17} strokeWidth={1.8} /> : <CalendarDays size={17} strokeWidth={1.8} />}
          Horario semanal
        </div>
        <div className="student-fullcalendar min-h-[640px] px-3 py-3">
          <FullCalendar
            allDaySlot={false}
            dayHeaderFormat={{ weekday: 'short', day: 'numeric' }}
            eventContent={(arg) => <CalendarEventContent {...arg} />}
            events={events}
            firstDay={1}
            headerToolbar={{
              center: 'title',
              end: 'today prev,next',
              start: '',
            }}
            height="auto"
            initialDate={weekStart}
            initialView="timeGridWeek"
            locale="es"
            nowIndicator
            plugins={[timeGridPlugin, interactionPlugin]}
            slotDuration="00:30:00"
            slotLabelFormat={{ hour: '2-digit', minute: '2-digit', hour12: false }}
            slotMaxTime={slotBounds.maxTime}
            slotMinTime={slotBounds.minTime}
          />
        </div>
      </section>
    </section>
  )
}
