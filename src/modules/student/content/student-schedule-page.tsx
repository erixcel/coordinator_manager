import { AlertCircle, CalendarDays, CheckCircle2, Clock3, DoorOpen, Filter, Loader2, UsersRound } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useStudentStore } from '../../../store/use-student-store'
import type { StudentScheduleProposal } from '../../../data'

type ScheduleItem = StudentScheduleProposal['schedule'][number]
type ShiftFilter = 'todos' | 'manana' | 'tarde' | 'noche'
type ModalityFilter = 'todas' | 'presencial' | 'virtual' | 'hibrida' | 'sin_modalidad'
type ScheduleGap = {
  day: string
  from: string
  minutes: number
  to: string
}

const dayDefinitions = [
  { key: 'lunes', label: 'Lunes' },
  { key: 'martes', label: 'Martes' },
  { key: 'miercoles', label: 'Miercoles' },
  { key: 'jueves', label: 'Jueves' },
  { key: 'viernes', label: 'Viernes' },
  { key: 'sabado', label: 'Sabado' },
]

const dayOrder = dayDefinitions.map((day) => day.key)
const shiftFilters: Array<{ key: ShiftFilter; label: string }> = [
  { key: 'todos', label: 'Todos' },
  { key: 'manana', label: 'Manana' },
  { key: 'tarde', label: 'Tarde' },
  { key: 'noche', label: 'Noche' },
]
const modalityFilters: Array<{ key: ModalityFilter; label: string }> = [
  { key: 'todas', label: 'Todas' },
  { key: 'presencial', label: 'Presencial' },
  { key: 'virtual', label: 'Virtual' },
  { key: 'hibrida', label: 'Hibrida' },
  { key: 'sin_modalidad', label: 'Sin modalidad' },
]
const courseTones = [
  { accent: '#8b2332', bg: '#fff1f2', border: '#fecdd3' },
  { accent: '#0f766e', bg: '#ecfdf5', border: '#99f6e4' },
  { accent: '#1d4ed8', bg: '#eff6ff', border: '#bfdbfe' },
  { accent: '#b45309', bg: '#fff7ed', border: '#fed7aa' },
  { accent: '#6d28d9', bg: '#f5f3ff', border: '#ddd6fe' },
  { accent: '#047857', bg: '#f0fdf4', border: '#bbf7d0' },
  { accent: '#be123c', bg: '#fff1f2', border: '#fecdd3' },
]

function normalizeText(value: string) {
  return value ? value.charAt(0).toUpperCase() + value.slice(1) : 'Pendiente'
}

function normalizeModality(value: string) {
  return value || 'sin_modalidad'
}

function getModalityLabel(value: string) {
  if (value === 'sin_modalidad') {
    return 'Sin modalidad'
  }

  return normalizeText(value)
}

function getStartMinutes(block: string) {
  const [start] = String(block).split(' - ')
  return getTimeMinutes(start)
}

function getEndMinutes(block: string) {
  const [, end] = String(block).split(' - ')
  return getTimeMinutes(end)
}

function getTimeMinutes(value: string) {
  if (!value) {
    return Number.MAX_SAFE_INTEGER
  }

  const [hours, minutes] = value.split(':').map(Number)

  if (Number.isNaN(hours) || Number.isNaN(minutes)) {
    return Number.MAX_SAFE_INTEGER
  }

  return hours * 60 + minutes
}

function getBlockEndLabel(block: string) {
  return String(block).split(' - ')[1] ?? ''
}

function getBlockStartLabel(block: string) {
  return String(block).split(' - ')[0] ?? ''
}

function getTimeSlots(schedule: ScheduleItem[]) {
  return Array.from(new Set(schedule.map((item) => item.bloque).filter(Boolean))).sort(
    (a, b) => getStartMinutes(a) - getStartMinutes(b),
  )
}

function getCellItems(schedule: ScheduleItem[], day: string, block: string) {
  return schedule.filter((item) => item.dia === day && item.bloque === block)
}

function getCourseTone(courseId: number) {
  return courseTones[Math.abs(courseId) % courseTones.length]
}

function getConflictCount(schedule: ScheduleItem[], timeSlots: string[]) {
  return timeSlots.reduce((total, block) => {
    const conflictsByBlock = dayOrder.filter((day) => getCellItems(schedule, day, block).length > 1).length
    return total + conflictsByBlock
  }, 0)
}

function getScheduleGaps(schedule: ScheduleItem[]) {
  const gaps: ScheduleGap[] = []

  for (const day of dayOrder) {
    const daySchedule = schedule
      .filter((item) => item.dia === day)
      .sort((a, b) => getStartMinutes(a.bloque) - getStartMinutes(b.bloque))

    for (let index = 0; index < daySchedule.length - 1; index += 1) {
      const current = daySchedule[index]
      const next = daySchedule[index + 1]
      const minutes = getStartMinutes(next.bloque) - getEndMinutes(current.bloque)

      if (minutes > 0) {
        gaps.push({
          day,
          from: getBlockEndLabel(current.bloque),
          minutes,
          to: getBlockStartLabel(next.bloque),
        })
      }
    }
  }

  return gaps
}

function formatGapDuration(minutes: number) {
  const hours = Math.floor(minutes / 60)
  const remainingMinutes = minutes % 60

  if (hours && remainingMinutes) {
    return `${hours} h ${remainingMinutes} min`
  }
  if (hours) {
    return `${hours} h`
  }
  return `${remainingMinutes} min`
}

function getLongestGap(gaps: ScheduleGap[]) {
  return gaps.reduce<ScheduleGap | null>((longest, gap) => {
    if (!longest || gap.minutes > longest.minutes) {
      return gap
    }

    return longest
  }, null)
}

export function StudentSchedulePage() {
  const error = useStudentStore((state) => state.error)
  const isScheduleLoading = useStudentStore((state) => state.isScheduleLoading)
  const loadScheduleProposal = useStudentStore((state) => state.loadScheduleProposal)
  const scheduleProposal = useStudentStore((state) => state.scheduleProposal)
  const proposal = scheduleProposal?.proposal
  const [selectedShift, setSelectedShift] = useState<ShiftFilter>('todos')
  const [selectedModality, setSelectedModality] = useState<ModalityFilter>('todas')
  const schedule = [...(scheduleProposal?.schedule ?? [])].sort((a, b) => {
    const dayDiff = dayOrder.indexOf(a.dia) - dayOrder.indexOf(b.dia)
    if (dayDiff !== 0) return dayDiff
    return getStartMinutes(a.bloque) - getStartMinutes(b.bloque)
  })
  const filteredSchedule = schedule.filter((item) => {
    const shiftMatches = selectedShift === 'todos' || item.turno === selectedShift
    const modalityMatches = selectedModality === 'todas' || normalizeModality(item.modalidad) === selectedModality
    return shiftMatches && modalityMatches
  })
  const timeSlots = getTimeSlots(filteredSchedule)
  const occupiedDays = dayDefinitions.filter((day) => filteredSchedule.some((item) => item.dia === day.key)).length
  const conflictCount = getConflictCount(filteredSchedule, timeSlots)
  const scheduleGaps = getScheduleGaps(filteredSchedule)
  const longestGap = getLongestGap(scheduleGaps)

  useEffect(() => {
    void loadScheduleProposal()
  }, [loadScheduleProposal])

  return (
    <section className="grid gap-6">
      <div className="rounded-[8px] border border-[#E7E0D3] bg-white p-6 shadow-[0_8px_30px_rgba(31,41,55,0.06)]">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase text-[#8b2332]">Mi horario</p>
            <h1 className="mt-3 text-[28px] font-semibold leading-tight text-[#1f2937]">
              {proposal ? `Propuesta ${proposal.propuesta_id} · ${proposal.estado_label}` : 'Horario pendiente'}
            </h1>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-[#6b7280]">
              {isScheduleLoading
                ? 'Buscando la ultima propuesta generada para tu carrera y ciclo.'
                : scheduleProposal?.message ?? 'Aqui aparecera tu propuesta cuando el coordinador la genere.'}
            </p>
            {error ? <p className="mt-3 text-sm font-medium text-[#C11331]">{error}</p> : null}
          </div>
          <div className="inline-flex w-fit items-center gap-2 rounded-full border border-[#E7E0D3] bg-[#fbfaf7] px-4 py-2 text-sm font-semibold text-[#1f2937]">
            {isScheduleLoading ? <Loader2 className="animate-spin" size={16} strokeWidth={1.8} /> : <CalendarDays size={16} strokeWidth={1.8} />}
            {proposal ? 'Propuesta disponible' : 'Sin propuesta'}
          </div>
        </div>
      </div>

      {proposal ? (
        <>
          <div className="grid gap-4 md:grid-cols-4">
            <SummaryCard icon={CheckCircle2} label="Aptitud" value={String(proposal.fitness_score)} />
            <SummaryCard icon={CalendarDays} label="Bloques visibles" value={String(filteredSchedule.length)} />
            <SummaryCard icon={UsersRound} label="Dias ocupados" value={String(occupiedDays)} />
            <SummaryCard icon={Clock3} label="Huecos detectados" value={String(scheduleGaps.length)} />
          </div>

          <section className="rounded-[8px] border border-[#E7E0D3] bg-white p-6 shadow-[0_8px_30px_rgba(31,41,55,0.06)]">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-sm font-semibold uppercase text-[#8b2332]">Comparar propuestas</p>
                <h2 className="mt-2 text-xl font-semibold text-[#1f2937]">Alternativas disponibles</h2>
              </div>
              <span className="text-sm font-medium text-[#6b7280]">{scheduleProposal.proposals.length} propuestas encontradas</span>
            </div>

            <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {scheduleProposal.proposals.map((item) => {
                const isSelected = item.propuesta_id === proposal.propuesta_id

                return (
                  <button
                    className={`rounded-[8px] border p-4 text-left transition ${
                      isSelected
                        ? 'border-[#1f2937] bg-[#1f2937] text-white shadow-[0_10px_28px_rgba(31,41,55,0.16)]'
                        : 'border-[#E7E0D3] bg-[#fbfaf7] text-[#1f2937] hover:border-[#8b2332]'
                    }`}
                    key={item.propuesta_id}
                    onClick={() => void loadScheduleProposal(true, item.propuesta_id)}
                    type="button"
                  >
                    <span className={`text-xs font-bold uppercase tracking-[0.08em] ${isSelected ? 'text-white/70' : 'text-[#8b2332]'}`}>
                      Propuesta {item.propuesta_id} · {item.estado_label}
                    </span>
                    <p className="mt-3 text-lg font-semibold">Aptitud {item.fitness_score}</p>
                    <p className={`mt-2 text-sm leading-6 ${isSelected ? 'text-white/70' : 'text-[#6b7280]'}`}>
                      {item.total_cursos} cursos · {item.total_secciones} secciones
                    </p>
                    <p className={`mt-1 text-xs ${isSelected ? 'text-white/60' : 'text-[#6b7280]'}`}>
                      {item.metaheuristica || 'Estrategia no especificada'}
                    </p>
                  </button>
                )
              })}
            </div>

            {scheduleProposal.proposals.length < 2 ? (
              <p className="mt-4 rounded-[8px] border border-dashed border-[#E7E0D3] bg-[#fbfaf7] p-4 text-sm leading-6 text-[#6b7280]">
                Por ahora solo hay una propuesta. Cuando el coordinador genere otra alternativa, aparecera aqui para compararla sin cambiar de pantalla.
              </p>
            ) : null}
          </section>

          <section className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
            <div className="rounded-[8px] border border-[#E7E0D3] bg-white p-5 shadow-[0_6px_22px_rgba(31,41,55,0.05)]">
              <p className="text-sm font-semibold uppercase text-[#8b2332]">Analisis rapido</p>
              <p className="mt-3 text-sm leading-6 text-[#6b7280]">
                {scheduleGaps.length
                  ? `Se encontraron ${scheduleGaps.length} espacios libres entre clases en el turno seleccionado.`
                  : 'No se encontraron huecos entre clases en el turno seleccionado.'}
                {longestGap ? ` El hueco mas largo es de ${formatGapDuration(longestGap.minutes)} el ${normalizeText(longestGap.day)}.` : ''}
              </p>
            </div>
            <div className="rounded-[8px] border border-[#E7E0D3] bg-[#fbfaf7] p-5 shadow-[0_6px_22px_rgba(31,41,55,0.05)]">
              <p className="text-sm font-semibold uppercase text-[#8b2332]">Cruces</p>
              <p className="mt-3 text-2xl font-semibold text-[#1f2937]">{conflictCount}</p>
              <p className="mt-1 text-sm text-[#6b7280]">Bloques con mas de una clase en la misma hora.</p>
            </div>
          </section>

          <section className="rounded-[8px] border border-[#E7E0D3] bg-white p-6 shadow-[0_8px_30px_rgba(31,41,55,0.06)]">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-sm font-semibold uppercase text-[#8b2332]">Vista tipo malla</p>
                <h2 className="mt-2 text-xl font-semibold text-[#1f2937]">Semana academica</h2>
              </div>
              <div className="grid gap-3">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center gap-2 text-sm font-semibold text-[#6b7280]">
                    <Filter size={15} strokeWidth={1.8} />
                    Turno
                  </span>
                  {shiftFilters.map((filter) => (
                    <button
                      className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${
                        selectedShift === filter.key
                          ? 'border-[#1f2937] bg-[#1f2937] text-white'
                          : 'border-[#E7E0D3] bg-[#fbfaf7] text-[#6b7280] hover:border-[#8b2332] hover:text-[#1f2937]'
                      }`}
                      key={filter.key}
                      onClick={() => setSelectedShift(filter.key)}
                      type="button"
                    >
                      {filter.label}
                    </button>
                  ))}
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-sm font-semibold text-[#6b7280]">Modalidad</span>
                  {modalityFilters.map((filter) => (
                    <button
                      className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${
                        selectedModality === filter.key
                          ? 'border-[#8b2332] bg-[#8b2332] text-white'
                          : 'border-[#E7E0D3] bg-[#fbfaf7] text-[#6b7280] hover:border-[#8b2332] hover:text-[#1f2937]'
                      }`}
                      key={filter.key}
                      onClick={() => setSelectedModality(filter.key)}
                      type="button"
                    >
                      {filter.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-5 overflow-x-auto rounded-[8px] border border-[#E7E0D3] bg-[#fffdfa]">
              {timeSlots.length ? (
                <div className="min-w-[980px]">
                  <div className="grid grid-cols-[124px_repeat(6,minmax(132px,1fr))] border-b border-[#E7E0D3] bg-[#f7f2ea]">
                    <div className="border-r border-[#E7E0D3] px-4 py-3 text-xs font-bold uppercase tracking-[0.08em] text-[#6b7280]">
                      Hora
                    </div>
                    {dayDefinitions.map((day) => (
                      <div className="border-r border-[#E7E0D3] px-4 py-3 text-center text-sm font-bold text-[#1f2937] last:border-r-0" key={day.key}>
                        {day.label}
                      </div>
                    ))}
                  </div>

                  {timeSlots.map((block) => (
                    <div className="grid min-h-[142px] grid-cols-[124px_repeat(6,minmax(132px,1fr))] border-b border-[#E7E0D3] last:border-b-0" key={block}>
                      <div className="flex items-start border-r border-[#E7E0D3] bg-[#fbfaf7] px-4 py-4">
                        <span className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-2 text-xs font-bold text-[#1f2937] shadow-[0_4px_14px_rgba(31,41,55,0.06)]">
                          <Clock3 size={13} strokeWidth={1.8} />
                          {block}
                        </span>
                      </div>

                      {dayDefinitions.map((day) => {
                        const cellItems = getCellItems(filteredSchedule, day.key, block)

                        return (
                          <div className="border-r border-[#E7E0D3] bg-white/70 p-3 last:border-r-0" key={`${day.key}-${block}`}>
                            {cellItems.length ? (
                              <div className="grid gap-2">
                                {cellItems.map((item, index) => {
                                  const tone = getCourseTone(item.curso_id)

                                  return (
                                    <article
                                      className={`rounded-[8px] border p-3 shadow-[0_8px_20px_rgba(31,41,55,0.06)] ${
                                        cellItems.length > 1 ? 'ring-2 ring-[#fb7185]/60' : ''
                                      }`}
                                      key={`${item.seccion}-${item.curso_id}-${item.dia}-${item.bloque}-${index}`}
                                      style={{ backgroundColor: tone.bg, borderColor: tone.border }}
                                    >
                                      <div className="mb-2 flex items-center justify-between gap-2">
                                        <span
                                          className="rounded-full px-2 py-1 text-[11px] font-bold uppercase tracking-[0.06em] text-white"
                                          style={{ backgroundColor: tone.accent }}
                                        >
                                          S{item.seccion}
                                        </span>
                                        <span className="text-[11px] font-bold uppercase tracking-[0.06em] text-[#6b7280]">
                                          {normalizeText(item.turno)}
                                        </span>
                                      </div>
                                      <h3 className="text-sm font-bold leading-5 text-[#1f2937]">{item.curso}</h3>
                                      <p className="mt-2 text-xs font-medium leading-5 text-[#6b7280]">{item.docente || 'Docente pendiente'}</p>
                                      <p className="mt-1 text-xs font-medium leading-5 text-[#6b7280]">{getModalityLabel(normalizeModality(item.modalidad))}</p>
                                      <p className="mt-2 inline-flex items-center gap-1.5 text-xs font-bold text-[#1f2937]">
                                        <DoorOpen size={13} strokeWidth={1.8} style={{ color: tone.accent }} />
                                        {item.aula || 'Aula pendiente'}
                                      </p>
                                    </article>
                                  )
                                })}
                              </div>
                            ) : (
                              <div className="flex h-full min-h-[110px] items-center justify-center rounded-[8px] border border-dashed border-[#E7E0D3] text-xs font-medium text-[#b5aa99]">
                                Libre
                              </div>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-6 text-sm font-medium text-[#6b7280]">
                  No hay bloques para el turno seleccionado. Prueba con otro filtro.
                </div>
              )}
            </div>
          </section>

          <section className="rounded-[8px] border border-[#E7E0D3] bg-white p-6 shadow-[0_8px_30px_rgba(31,41,55,0.06)]">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-sm font-semibold uppercase text-[#8b2332]">Detalle</p>
                <h2 className="mt-2 text-xl font-semibold text-[#1f2937]">Lista de bloques</h2>
              </div>
              <span className="text-sm font-medium text-[#6b7280]">{filteredSchedule.length} bloques visibles</span>
            </div>

            <div className="mt-5 overflow-hidden rounded-[8px] border border-[#E7E0D3]">
              <div className="divide-y divide-[#E7E0D3]">
                {filteredSchedule.map((item, index) => (
                  <div
                    className="grid gap-3 bg-white p-4 lg:grid-cols-[120px_150px_1fr_190px_110px] lg:items-center"
                    key={`${item.seccion}-${item.curso_id}-${item.dia}-${item.bloque}-${index}`}
                  >
                    <span className="text-sm font-semibold text-[#8b2332]">{normalizeText(item.dia)}</span>
                    <span className="inline-flex w-fit items-center gap-2 rounded-full bg-[#f2ece2] px-3 py-1 text-xs font-semibold text-[#1f2937]">
                      <Clock3 size={13} strokeWidth={1.8} />
                      {item.bloque}
                    </span>
                    <div>
                      <p className="text-sm font-semibold text-[#1f2937]">{item.curso}</p>
                      <p className="mt-1 text-xs font-medium text-[#6b7280]">Docente: {item.docente || 'Pendiente'}</p>
                    </div>
                    <span className="text-sm text-[#6b7280]">
                      Seccion {item.seccion} · {normalizeText(item.turno)} · {getModalityLabel(normalizeModality(item.modalidad))}
                    </span>
                    <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#1f2937]">
                      <DoorOpen size={15} strokeWidth={1.8} className="text-[#8b2332]" />
                      {item.aula}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section className="rounded-[8px] border border-[#E7E0D3] bg-white p-6 shadow-[0_8px_30px_rgba(31,41,55,0.06)]">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-sm font-semibold uppercase text-[#8b2332]">Huecos entre clases</p>
                <h2 className="mt-2 text-xl font-semibold text-[#1f2937]">Espacios libres detectados</h2>
              </div>
              <span className="text-sm font-medium text-[#6b7280]">{scheduleGaps.length} huecos visibles</span>
            </div>

            {scheduleGaps.length ? (
              <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                {scheduleGaps.map((gap) => (
                  <article className="rounded-[8px] border border-[#E7E0D3] bg-[#fbfaf7] p-4" key={`${gap.day}-${gap.from}-${gap.to}`}>
                    <p className="text-sm font-semibold text-[#1f2937]">{normalizeText(gap.day)}</p>
                    <p className="mt-2 text-sm text-[#6b7280]">
                      Libre de <strong className="text-[#1f2937]">{gap.from}</strong> a <strong className="text-[#1f2937]">{gap.to}</strong>
                    </p>
                    <p className="mt-3 inline-flex rounded-full bg-white px-3 py-1 text-xs font-bold text-[#8b2332]">
                      {formatGapDuration(gap.minutes)}
                    </p>
                  </article>
                ))}
              </div>
            ) : (
              <div className="mt-5 rounded-[8px] border border-dashed border-[#E7E0D3] bg-[#fbfaf7] p-5 text-sm leading-6 text-[#6b7280]">
                No hay huecos entre clases para el turno seleccionado. Esto normalmente significa que las clases estan continuas o que solo hay un bloque ese dia.
              </div>
            )}
          </section>

          <section className="rounded-[8px] border border-[#E7E0D3] bg-white p-6 shadow-[0_8px_30px_rgba(31,41,55,0.06)]">
            <p className="text-sm font-semibold uppercase text-[#8b2332]">Segmentacion</p>
            <div className="mt-4 grid gap-3 md:grid-cols-3">
              {scheduleProposal.sections.map((section) => (
                <div className="rounded-[8px] border border-[#E7E0D3] bg-[#fbfaf7] p-4" key={section.seccion}>
                  <p className="text-sm font-semibold text-[#1f2937]">Seccion {section.seccion}</p>
                  <p className="mt-2 text-sm text-[#6b7280]">{section.cantidad_estudiantes} alumnos</p>
                  <p className="mt-1 text-sm text-[#6b7280]">Turno {normalizeText(section.turno_preferido)}</p>
                </div>
              ))}
            </div>
          </section>
        </>
      ) : (
        <section className="rounded-[8px] border border-[#E7E0D3] bg-white p-6 shadow-[0_8px_30px_rgba(31,41,55,0.06)]">
          <div className="flex gap-4">
            <div className="grid h-12 w-12 shrink-0 place-items-center rounded-[8px] bg-[#fff7ed] text-[#b45309]">
              <AlertCircle size={24} strokeWidth={1.8} />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-[#1f2937]">Aun no hay horario para mostrar</h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-[#6b7280]">
                Cuando el coordinador genere una propuesta para tu carrera y ciclo, aparecera aqui primero como lista.
                La vista tipo malla completa la trabajaremos en la siguiente fase.
              </p>
            </div>
          </div>
        </section>
      )}
    </section>
  )
}

function SummaryCard({ icon: Icon, label, value }: { icon: typeof CalendarDays; label: string; value: string }) {
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
