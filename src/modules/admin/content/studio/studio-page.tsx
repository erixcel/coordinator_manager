import { Fragment, useEffect, useMemo, useState, type ReactNode } from 'react'
import {
  BookOpen,
  Building2,
  CalendarRange,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Clock3,
  LoaderCircle,
  Play,
  Settings2,
  UserRound,
} from 'lucide-react'
import {
  schedulingApi,
  type SchedulingAlgorithm,
  type SchedulingConfig,
  type SchedulingCourse,
  type SchedulingProposal,
} from '../../../../data'
import { PageTitle } from '../../shared/page-title'
import { cn } from '../../shared/styles'

type ResultView = 'draft' | 'enabled'

function SelectControl({
  children,
  disabled,
  label,
  onChange,
  value,
}: {
  children: ReactNode
  disabled?: boolean
  label: string
  onChange: (value: string) => void
  value: string
}) {
  return (
    <label className="grid min-w-0 gap-2 text-[13px] font-bold text-[#344054]">
      {label}
      <span className="relative flex h-11 items-center rounded-[7px] border border-[#DDE3EA] bg-white px-3 transition focus-within:border-[#FF385C] focus-within:ring-2 focus-within:ring-[#FF385C]/10">
        <select
          className="min-w-0 flex-1 appearance-none bg-transparent pr-7 text-sm font-semibold text-[#152033] outline-none disabled:text-[#98A2B3]"
          disabled={disabled}
          onChange={(event) => onChange(event.target.value)}
          value={value}
        >
          {children}
        </select>
        <ChevronDown className="pointer-events-none absolute right-3 text-[#667085]" size={16} />
      </span>
    </label>
  )
}

function SummaryMetric({ icon: Icon, label, value }: { icon: typeof BookOpen; label: string; value: string | number }) {
  return (
    <div className="flex min-w-0 items-center gap-2.5">
      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-[7px] bg-[#F2F4F7] text-[#475467]">
        <Icon size={17} strokeWidth={1.8} />
      </span>
      <span className="min-w-0">
        <strong className="block truncate text-sm font-black text-[#152033]">{value}</strong>
        <span className="block truncate text-[11px] font-semibold text-[#8A94A6]">{label}</span>
      </span>
    </div>
  )
}

function CoursesTable({ courses, proposalId }: { courses: SchedulingCourse[]; proposalId: number }) {
  const [expanded, setExpanded] = useState<Set<number>>(new Set())

  useEffect(() => {
    setExpanded(courses[0] ? new Set([courses[0].curso_id]) : new Set())
  }, [courses, proposalId])

  function toggle(courseId: number) {
    setExpanded((current) => {
      const next = new Set(current)
      if (next.has(courseId)) next.delete(courseId)
      else next.add(courseId)
      return next
    })
  }

  if (courses.length === 0) {
    return (
      <div className="grid min-h-52 place-items-center px-6 py-12 text-center">
        <div>
          <BookOpen className="mx-auto text-[#C5CDD8]" size={34} strokeWidth={1.5} />
          <strong className="mt-3 block text-sm text-[#344054]">No hay cursos en esta propuesta.</strong>
        </div>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[820px] border-collapse text-left">
        <thead>
          <tr className="border-y border-[#E5EAF0] bg-[#F8FAFC] text-[11px] font-black uppercase text-[#667085]">
            <th className="px-5 py-3.5">Curso</th>
            <th className="w-32 px-4 py-3.5 text-center">Horas semanales</th>
            <th className="w-24 px-4 py-3.5 text-center">Creditos</th>
            <th className="w-20 px-4 py-3.5 text-center">Ciclo</th>
            <th className="w-24 px-4 py-3.5 text-center">Secciones</th>
            <th className="w-14 px-4 py-3.5"><span className="sr-only">Expandir</span></th>
          </tr>
        </thead>
        <tbody>
          {courses.map((course) => {
            const isExpanded = expanded.has(course.curso_id)
            return (
              <Fragment key={course.curso_id}>
                <tr className={cn('border-b border-[#E5EAF0] transition', isExpanded ? 'bg-[#F0F7FC]' : 'bg-white hover:bg-[#FAFBFC]')}>
                  <td className="px-5 py-4">
                    <button className="flex w-full items-center gap-3 text-left" onClick={() => toggle(course.curso_id)} type="button">
                      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-[7px] border border-[#DCE8F1] bg-white text-[#147D92]">
                        <BookOpen size={17} strokeWidth={1.8} />
                      </span>
                      <span className="min-w-0">
                        <strong className="block text-sm font-extrabold text-[#152033]">{course.nombre}</strong>
                        <span className="mt-0.5 block text-xs font-semibold text-[#667085]">{course.codigo}</span>
                      </span>
                    </button>
                  </td>
                  <td className="px-4 py-4 text-center text-sm font-bold text-[#475467]">{course.horas_semanales || '-'}</td>
                  <td className="px-4 py-4 text-center text-sm font-bold text-[#475467]">{course.creditos || '-'}</td>
                  <td className="px-4 py-4 text-center">
                    <span className="inline-flex rounded-full bg-[#E9F7EF] px-2.5 py-1 text-xs font-black text-[#16794C]">{course.ciclo}</span>
                  </td>
                  <td className="px-4 py-4 text-center text-sm font-black text-[#152033]">{course.secciones.length}</td>
                  <td className="px-4 py-4">
                    <button
                      aria-label={isExpanded ? `Ocultar secciones de ${course.nombre}` : `Mostrar secciones de ${course.nombre}`}
                      className="grid h-8 w-8 place-items-center rounded-[6px] border border-[#D6DDE6] bg-white text-[#475467] transition hover:border-[#98A2B3]"
                      onClick={() => toggle(course.curso_id)}
                      type="button"
                    >
                      {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </button>
                  </td>
                </tr>
                {isExpanded && (
                  <tr className="border-b border-[#B9D8EC] bg-[#F0F7FC]">
                    <td className="px-5 pb-5" colSpan={6}>
                      <div className="overflow-hidden rounded-[7px] border border-[#B9D8EC] bg-white">
                        <table className="w-full table-fixed text-left">
                          <thead className="bg-[#F8FAFC] text-[11px] font-black uppercase text-[#667085]">
                            <tr>
                              <th className="w-[12%] px-4 py-3">Seccion</th>
                              <th className="w-[27%] px-4 py-3">Horario</th>
                              <th className="w-[27%] px-4 py-3">Docente</th>
                              <th className="w-[17%] px-4 py-3">Aula</th>
                              <th className="w-[17%] px-4 py-3">Modalidad</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-[#E5EAF0]">
                            {course.secciones.map((section, index) => (
                              <tr className="text-xs font-semibold text-[#475467]" key={`${course.curso_id}-${section.seccion}-${index}`}>
                                <td className="px-4 py-3.5">S{String(section.seccion).padStart(2, '0')}</td>
                                <td className="px-4 py-3.5">
                                  <span className="flex items-center gap-2"><Clock3 size={14} className="shrink-0 text-[#8A94A6]" />{section.horario}</span>
                                </td>
                                <td className="px-4 py-3.5">
                                  <span className="flex items-center gap-2"><UserRound size={14} className="shrink-0 text-[#8A94A6]" />{section.docente}</span>
                                </td>
                                <td className="px-4 py-3.5">
                                  <span className="flex items-center gap-2"><Building2 size={14} className="shrink-0 text-[#8A94A6]" />{section.aula}</span>
                                </td>
                                <td className="px-4 py-3.5">
                                  <span className="inline-flex rounded-full bg-[#FFF1E7] px-2.5 py-1 text-[11px] font-black capitalize text-[#B54708]">{section.modalidad}</span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </td>
                  </tr>
                )}
              </Fragment>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

function emptyParameters(algorithm?: SchedulingAlgorithm) {
  return Object.fromEntries((algorithm?.parameters ?? []).map((parameter) => [parameter.key, parameter.default]))
}

export function StudioPage() {
  const [config, setConfig] = useState<SchedulingConfig | null>(null)
  const [careerId, setCareerId] = useState('')
  const [cycle, setCycle] = useState('')
  const [algorithmId, setAlgorithmId] = useState<SchedulingAlgorithm['id']>('astar')
  const [turn, setTurn] = useState('automatico')
  const [targetSections, setTargetSections] = useState('2')
  const [parameters, setParameters] = useState<Record<string, number>>({})
  const [draft, setDraft] = useState<SchedulingProposal | null>(null)
  const [enabled, setEnabled] = useState<SchedulingProposal[]>([])
  const [enabledId, setEnabledId] = useState('')
  const [view, setView] = useState<ResultView>('draft')
  const [loading, setLoading] = useState(true)
  const [running, setRunning] = useState(false)
  const [enabling, setEnabling] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true
    Promise.all([schedulingApi.getConfig(), schedulingApi.list('aceptada')])
      .then(([nextConfig, accepted]) => {
        if (!active) return
        const firstCareer = nextConfig.carreras[0]
        const firstAlgorithm = nextConfig.algoritmos[0]
        setConfig(nextConfig)
        setCareerId(firstCareer ? String(firstCareer.carrera_id) : '')
        setCycle(firstCareer?.ciclos[0] ? String(firstCareer.ciclos[0]) : '')
        setAlgorithmId(firstAlgorithm?.id ?? 'astar')
        setParameters(emptyParameters(firstAlgorithm))
        setEnabled(accepted)
        setEnabledId(accepted[0] ? String(accepted[0].propuesta_id) : '')
      })
      .catch((loadError) => setError(loadError instanceof Error ? loadError.message : 'No se pudo cargar la planificacion.'))
      .finally(() => active && setLoading(false))
    return () => { active = false }
  }, [])

  const selectedCareer = useMemo(
    () => config?.carreras.find((career) => String(career.carrera_id) === careerId),
    [careerId, config],
  )
  const selectedAlgorithm = useMemo(
    () => config?.algoritmos.find((algorithm) => algorithm.id === algorithmId),
    [algorithmId, config],
  )
  const enabledProposal = enabled.find((proposal) => String(proposal.propuesta_id) === enabledId) ?? enabled[0] ?? null
  const enabledCoursesCount = enabled.reduce((total, proposal) => total + proposal.total_cursos, 0)
  const visibleProposal = view === 'draft' ? draft : enabledProposal

  function changeCareer(value: string) {
    setCareerId(value)
    const career = config?.carreras.find((item) => String(item.carrera_id) === value)
    setCycle(career?.ciclos[0] ? String(career.ciclos[0]) : '')
  }

  function changeAlgorithm(value: string) {
    const algorithm = config?.algoritmos.find((item) => item.id === value)
    setAlgorithmId(value as SchedulingAlgorithm['id'])
    setParameters(emptyParameters(algorithm))
  }

  async function runAlgorithm() {
    if (!careerId || !cycle || running) return
    setRunning(true)
    setError('')
    try {
      const proposal = await schedulingApi.run({
        algoritmo: algorithmId,
        carrera_id: Number(careerId),
        ciclo: Number(cycle),
        parametros: parameters,
        secciones_objetivo: Number(targetSections),
        turno: turn,
      })
      setDraft(proposal)
      setView('draft')
    } catch (runError) {
      setError(runError instanceof Error ? runError.message : 'No se pudo ejecutar el algoritmo.')
    } finally {
      setRunning(false)
    }
  }

  async function enableDraft() {
    if (!draft || enabling) return
    setEnabling(true)
    setError('')
    try {
      const accepted = await schedulingApi.enable(draft.propuesta_id)
      setDraft(accepted)
      setEnabled((current) => [accepted, ...current.filter((item) => item.propuesta_id !== accepted.propuesta_id)])
      setEnabledId(String(accepted.propuesta_id))
      setView('enabled')
    } catch (enableError) {
      setError(enableError instanceof Error ? enableError.message : 'No se pudieron habilitar los cursos.')
    } finally {
      setEnabling(false)
    }
  }

  if (loading) {
    return <div className="grid min-h-[420px] place-items-center"><LoaderCircle className="animate-spin text-[#FF385C]" size={30} /></div>
  }

  return (
    <section className="grid gap-6 pb-10">
      <div className="flex items-start gap-3">
        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-[8px] bg-[#152033] text-white">
          <CalendarRange size={21} strokeWidth={1.8} />
        </span>
        <div>
          <PageTitle>PLANIFICACION ACADEMICA</PageTitle>
          <p className="mt-1 text-sm font-medium text-[#667085]">Configura el algoritmo, revisa la propuesta y habilita los cursos del periodo.</p>
        </div>
      </div>

      {error && <div role="alert" className="rounded-[7px] border border-[#FECDCA] bg-[#FEF3F2] px-4 py-3 text-sm font-semibold text-[#B42318]">{error}</div>}

      <div className="overflow-hidden rounded-[8px] border border-[#E1E6ED] bg-white shadow-[0_4px_18px_rgba(16,24,40,0.05)]">
        <div className="flex items-center gap-3 border-b border-[#E5EAF0] px-5 py-4">
          <Settings2 className="text-[#FF385C]" size={19} />
          <div>
            <h2 className="text-base font-black text-[#152033]">Configuracion de ejecucion</h2>
            <p className="text-xs font-medium text-[#8A94A6]">Los parametros disponibles cambian segun el algoritmo seleccionado.</p>
          </div>
        </div>

        <div className="grid gap-5 p-5">
          <div className="grid gap-4 xl:grid-cols-[minmax(220px,1.1fr)_minmax(140px,0.6fr)_minmax(240px,1.15fr)]">
            <SelectControl label="Carrera" onChange={changeCareer} value={careerId}>
              {config?.carreras.map((career) => <option key={career.carrera_id} value={career.carrera_id}>{career.nombre}</option>)}
            </SelectControl>
            <SelectControl disabled={!selectedCareer?.ciclos.length} label="Ciclo" onChange={setCycle} value={cycle}>
              {selectedCareer?.ciclos.map((item) => <option key={item} value={item}>Ciclo {item}</option>)}
            </SelectControl>
            <SelectControl label="Algoritmo" onChange={changeAlgorithm} value={algorithmId}>
              {config?.algoritmos.map((algorithm) => <option key={algorithm.id} value={algorithm.id}>{algorithm.label}</option>)}
            </SelectControl>
          </div>

          <div className="grid gap-4 border-t border-[#EDF0F3] pt-5 sm:grid-cols-2 xl:grid-cols-[minmax(260px,0.75fr)_minmax(190px,0.55fr)_minmax(0,1fr)]">
            <SelectControl label="Turno de preferencia" onChange={setTurn} value={turn}>
              {config?.turnos.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
            </SelectControl>
            <SelectControl label="Secciones por curso" onChange={setTargetSections} value={targetSections}>
              {config?.secciones_por_curso.map((item) => <option key={item} value={item}>{item} secciones</option>)}
            </SelectControl>
          </div>

          <div className="grid gap-4 border-t border-[#EDF0F3] pt-5 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
            <div>
              <div className="mb-3">
                <span className="text-[11px] font-black uppercase text-[#98A2B3]">Parametros del algoritmo</span>
                <p className="mt-1 text-xs font-medium text-[#667085]">{selectedAlgorithm?.description}</p>
                <p className="mt-1 text-xs font-semibold text-[#16794B]">Se conservan las secciones habilitadas y se generan solo las faltantes hasta alcanzar el total elegido.</p>
              </div>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {selectedAlgorithm?.parameters.map((parameter) => (
                  <SelectControl
                    key={parameter.key}
                    label={parameter.label}
                    onChange={(value) => setParameters((current) => ({ ...current, [parameter.key]: Number(value) }))}
                    value={String(parameters[parameter.key] ?? parameter.default)}
                  >
                    {parameter.options.map((option) => <option key={option} value={option}>{option}</option>)}
                  </SelectControl>
                ))}
              </div>
            </div>
            <button
              className="inline-flex h-11 min-w-48 items-center justify-center gap-2 rounded-[7px] bg-[#FF385C] px-5 text-sm font-black text-white shadow-[0_6px_16px_rgba(255,56,92,0.2)] transition hover:bg-[#E31C4B] disabled:cursor-not-allowed disabled:opacity-60"
              disabled={!careerId || !cycle || running}
              onClick={runAlgorithm}
              type="button"
            >
              {running ? <LoaderCircle className="animate-spin" size={17} /> : <Play size={17} fill="currentColor" />}
              {running ? 'Ejecutando...' : 'Ejecutar algoritmo'}
            </button>
          </div>
        </div>
      </div>

      <div className="overflow-hidden rounded-[8px] border border-[#E1E6ED] bg-white shadow-[0_4px_18px_rgba(16,24,40,0.05)]">
        <div className="flex flex-col gap-4 border-b border-[#E5EAF0] px-5 py-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-base font-black text-[#152033]">Cursos y secciones</h2>
            <p className="mt-0.5 text-xs font-medium text-[#8A94A6]">Consulta la propuesta antes de publicarla o revisa los cursos que ya fueron habilitados.</p>
          </div>
          <div className="inline-flex h-10 self-start rounded-[7px] bg-[#F2F4F7] p-1">
            <button className={cn('rounded-[5px] px-4 text-xs font-black transition', view === 'draft' ? 'bg-white text-[#152033] shadow-sm' : 'text-[#667085]')} onClick={() => setView('draft')} type="button">
              Por habilitar {draft ? `(${draft.total_cursos})` : ''}
            </button>
            <button className={cn('rounded-[5px] px-4 text-xs font-black transition', view === 'enabled' ? 'bg-white text-[#152033] shadow-sm' : 'text-[#667085]')} onClick={() => setView('enabled')} type="button">
              Habilitados ({enabledCoursesCount})
            </button>
          </div>
        </div>

        {view === 'enabled' && enabled.length > 0 && (
          <div className="border-b border-[#E5EAF0] bg-[#FAFBFC] px-5 py-3">
            <div className="max-w-xl">
              <SelectControl label="Ejecucion habilitada" onChange={setEnabledId} value={enabledId || String(enabled[0].propuesta_id)}>
                {enabled.map((proposal) => (
                  <option key={proposal.propuesta_id} value={proposal.propuesta_id}>
                    {proposal.carrera} - Ciclo {proposal.ciclo} - #{proposal.propuesta_id}
                  </option>
                ))}
              </SelectControl>
            </div>
          </div>
        )}

        {visibleProposal ? (
          <>
            <div className="grid gap-4 border-b border-[#E5EAF0] px-5 py-4 sm:grid-cols-2 lg:grid-cols-[1.25fr_repeat(3,1fr)_auto] lg:items-center">
              <div>
                <span className={cn('inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-black', visibleProposal.estado === 'aceptada' ? 'bg-[#E9F7EF] text-[#16794C]' : 'bg-[#FFF4E5] text-[#B54708]')}>
                  {visibleProposal.estado === 'aceptada' && <CheckCircle2 size={13} />}
                  {visibleProposal.estado_label}
                </span>
                <strong className="mt-2 block text-sm font-black text-[#152033]">{visibleProposal.carrera} · Ciclo {visibleProposal.ciclo}</strong>
                <span className="mt-0.5 block text-xs font-semibold text-[#8A94A6]">Propuesta #{visibleProposal.propuesta_id} · {visibleProposal.algoritmo.toUpperCase()}</span>
              </div>
              <SummaryMetric icon={BookOpen} label="Cursos" value={visibleProposal.total_cursos} />
              <SummaryMetric icon={UserRound} label="Estudiantes" value={visibleProposal.total_estudiantes} />
              <SummaryMetric icon={CalendarRange} label="Secciones" value={visibleProposal.total_secciones} />
              {view === 'draft' && visibleProposal.estado === 'borrador' && (
                <button className="inline-flex h-10 items-center justify-center gap-2 rounded-[7px] bg-[#152033] px-4 text-xs font-black text-white transition hover:bg-[#25334A] disabled:opacity-60" disabled={enabling} onClick={enableDraft} type="button">
                  {enabling ? <LoaderCircle className="animate-spin" size={16} /> : <CheckCircle2 size={16} />}
                  Habilitar cursos
                </button>
              )}
            </div>
            <CoursesTable courses={visibleProposal.cursos} proposalId={visibleProposal.propuesta_id} />
          </>
        ) : (
          <div className="grid min-h-64 place-items-center px-6 py-12 text-center">
            <div className="max-w-sm">
              {view === 'draft' ? <Play className="mx-auto text-[#C5CDD8]" size={34} /> : <CheckCircle2 className="mx-auto text-[#C5CDD8]" size={34} />}
              <strong className="mt-3 block text-sm text-[#344054]">{view === 'draft' ? 'Aun no hay una propuesta' : 'Aun no hay cursos habilitados'}</strong>
              <p className="mt-1 text-xs font-medium leading-5 text-[#8A94A6]">{view === 'draft' ? 'Selecciona la configuracion y ejecuta un algoritmo para ver los cursos sugeridos.' : 'Las propuestas aceptadas apareceran en esta seccion.'}</p>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
