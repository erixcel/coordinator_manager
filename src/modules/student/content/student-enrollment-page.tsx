import { Bot, CalendarClock, Check, CheckCircle2, Clipboard, Clock3, GraduationCap, Loader2, MapPin, MessageCircle, Send, Sparkles, X, UserRound } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { academicApi, type StudentEnrollmentAssistantPreferences, type StudentEnrollmentOptions } from '../../../data'
import { useStudentStore } from '../../../store/use-student-store'

type CourseOption = StudentEnrollmentOptions['courses'][number]
type SectionOption = CourseOption['sections'][number]
type ChatMessage = {
  id: number
  role: 'assistant' | 'user'
  text: string
}
type LocalLanguageModelSession = {
  prompt: (message: string) => Promise<string>
}
type LocalLanguageModelApi = {
  availability?: () => Promise<string>
  create: (options?: {
    monitor?: (monitor: EventTarget) => void
    systemPrompt?: string
  }) => Promise<LocalLanguageModelSession>
}

declare global {
  interface Window {
    LanguageModel?: LocalLanguageModelApi
  }
}

export function StudentEnrollmentPage() {
  const enrollmentOptions = useStudentStore((state) => state.enrollmentOptions)
  const confirmedEnrollment = useStudentStore((state) => state.confirmedEnrollment)
  const error = useStudentStore((state) => state.error)
  const isLoading = useStudentStore((state) => state.isEnrollmentLoading)
  const loadConfirmedEnrollment = useStudentStore((state) => state.loadConfirmedEnrollment)
  const loadEnrollmentOptions = useStudentStore((state) => state.loadEnrollmentOptions)
  const saveEnrollment = useStudentStore((state) => state.saveEnrollment)
  const courses = enrollmentOptions?.courses ?? []
  const enrolledCourses = confirmedEnrollment?.courses ?? []
  const summary = enrollmentOptions?.summary
  const [selectedByCourse, setSelectedByCourse] = useState<Record<number, number>>({})
  const [successMessage, setSuccessMessage] = useState('')
  const [chatInput, setChatInput] = useState('')
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: 1,
      role: 'assistant',
      text: 'Puedo ayudarte a elegir secciones sin cruces ✨ Por ejemplo: "quiero solo mananas", "evita lunes" o "dame una opcion sin clases de noche".',
    },
  ])
  const [chatLoading, setChatLoading] = useState(false)
  const [isChatOpen, setIsChatOpen] = useState(false)
  const [localAiStatus, setLocalAiStatus] = useState<'idle' | 'checking' | 'ready' | 'unsupported'>('idle')
  const [localAiSession, setLocalAiSession] = useState<LocalLanguageModelSession | null>(null)
  const [localAiProgress, setLocalAiProgress] = useState(0)
  const [activeTab, setActiveTab] = useState<'available' | 'registered'>('available')
  const [promptCopied, setPromptCopied] = useState(false)

  useEffect(() => {
    void loadEnrollmentOptions()
    void loadConfirmedEnrollment()
  }, [loadConfirmedEnrollment, loadEnrollmentOptions])

  useEffect(() => {
    if (!enrollmentOptions) return

    const selectedIds = new Set(enrollmentOptions.selected_section_ids ?? [])
    const nextSelected: Record<number, number> = {}
    for (const course of enrollmentOptions.courses) {
      const currentSection = course.sections.find((section) => selectedIds.has(section.seccion_id))
      if (currentSection) {
        nextSelected[course.curso_id] = currentSection.seccion_id
      }
    }
    setSelectedByCourse(nextSelected)
  }, [enrollmentOptions])

  useEffect(() => {
    if (!isChatOpen || localAiStatus !== 'idle' || localAiSession) return
    void activateLocalAi()
  }, [isChatOpen, localAiSession, localAiStatus])

  const selectedSectionIds = useMemo(
    () => Object.values(selectedByCourse).filter(Boolean),
    [selectedByCourse],
  )
  const hasSelection = selectedSectionIds.length > 0
  const selectedSections = useMemo(
    () => getSectionsByIds(courses, selectedSectionIds),
    [courses, selectedSectionIds],
  )
  const selectedConflict = useMemo(() => findFirstConflict(selectedSections), [selectedSections])

  async function confirmEnrollment() {
    if (!hasSelection || selectedConflict || isLoading) return
    setSuccessMessage('')
    await saveEnrollment(selectedSectionIds)
    setSuccessMessage('Matricula registrada correctamente.')
    setActiveTab('registered')
  }

  async function activateLocalAi() {
    setLocalAiStatus('checking')
    setLocalAiProgress(0)
    try {
      if (!window.LanguageModel?.create) {
        setLocalAiStatus('unsupported')
        return
      }
      const availability = await window.LanguageModel.availability?.()
      if (availability === 'unavailable') {
        setLocalAiStatus('unsupported')
        return
      }
      const session = await window.LanguageModel.create({
        monitor(monitor) {
          monitor.addEventListener('downloadprogress', (event) => {
            const progressEvent = event as ProgressEvent
            setLocalAiProgress(Math.round((progressEvent.loaded || 0) * 100))
          })
        },
        systemPrompt: [
          'Eres un asistente amable y expresivo para matricula universitaria.',
          'Habla en primera persona, en espanol, breve y natural.',
          'Usa emojis con moderacion para sonar cercano: 1 o 2 por respuesta suelen bastar.',
          'No uses emojis en cada frase ni exageres.',
          'No digas "el alumno".',
        ].join(' '),
      })
      setLocalAiSession(session)
      setLocalAiStatus('ready')
    } catch {
      setLocalAiStatus('unsupported')
    }
  }

  function applyRecommendedSections(sectionIds: number[]) {
    const validIds = new Set(sectionIds)
    const nextSelected: Record<number, number> = {}
    for (const course of courses) {
      const section = course.sections.find((item) => validIds.has(item.seccion_id))
      if (section) nextSelected[course.curso_id] = section.seccion_id
    }
    setSelectedByCourse(nextSelected)
  }

  async function copyExternalAiPrompt() {
    const prompt = buildExternalAiPrompt(courses, selectedSections, enrollmentOptions?.student?.ciclo_actual ?? null)
    await navigator.clipboard.writeText(prompt)
    setPromptCopied(true)
    window.setTimeout(() => setPromptCopied(false), 1800)
  }

  async function sendChatMessage() {
    const message = chatInput.trim()
    if (!message || chatLoading) return

    const history = chatMessages
    setChatInput('')
    setChatLoading(true)
    setChatMessages((current) => [...current, { id: Date.now(), role: 'user', text: message }])
    try {
      const localAnswer = getLocalConversationAnswer(message, localAiStatus)
      if (localAnswer) {
        setChatMessages((current) => [...current, { id: Date.now() + 1, role: 'assistant', text: localAnswer }])
        return
      }

      if (!isScheduleRequest(message)) {
        const text = sanitizeAssistantText(localAiSession
          ? await localAiSession.prompt(
            [
              'Responde como asistente de matricula universitaria, natural, cercano y breve.',
              'Usa 1 o 2 emojis si ayudan al tono. Se expresivo, pero no infantil.',
              'Nunca respondas con JSON, codigo, markdown tecnico ni bloques ```.',
              'No cambies la seleccion de cursos.',
              'No saludes como centro de atencion ni digas "gracias por contactarnos".',
              'Usa el historial para responder con continuidad. No digas hola si la conversacion ya empezo.',
              'Si el estudiante reacciona con pena o frustracion, reconoce la situacion y explica el limite de horarios con calma.',
              'Si el mensaje no tiene que ver con matricula u horarios, responde que puedes ayudar con secciones, cruces, turnos y dias disponibles.',
              `Historial reciente:\n${formatChatHistory(history)}`,
              `Mensaje del estudiante: ${message}`,
            ].join('\n'),
          )
          : getFallbackConversationAnswer(message, history))
        setChatMessages((current) => [...current, { id: Date.now() + 1, role: 'assistant', text }])
        return
      }

      const response = await academicApi.askStudentEnrollmentAssistant({
        preferences: await extractEnrollmentPreferences(message, localAiSession, history),
        selectedSectionIds,
      })
      applyRecommendedSections(response.recommended_section_ids)
      setSuccessMessage('')
      setChatMessages((current) => [
        ...current,
        {
          id: Date.now() + 1,
          role: 'assistant',
          text: formatAssistantScheduleAnswer(response.answer),
        },
      ])
    } catch (assistantError) {
      setChatMessages((current) => [
        ...current,
        {
          id: Date.now() + 1,
          role: 'assistant',
          text: assistantError instanceof Error ? assistantError.message : 'No pude calcular una recomendacion ahora.',
        },
      ])
    } finally {
      setChatLoading(false)
    }
  }

  return (
    <section className="grid gap-6 pb-24">
      <header className="flex flex-col gap-5 border-b border-[#E7E0D3] pb-6 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase text-[#8b2332]">Portal del alumno</p>
          <h1 className="mt-2 text-[28px] font-semibold leading-tight text-[#1f2937]">Matricula</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-[#6b7280]">
            Consulta todos los horarios habilitados para los cursos de tu ciclo actual.
          </p>
        </div>
        <div className="inline-flex w-fit items-center gap-2 rounded-[8px] border border-[#E7E0D3] bg-white px-4 py-2.5 text-sm font-semibold text-[#1f2937]">
          <GraduationCap className="text-[#8b2332]" size={18} strokeWidth={1.8} />
          {enrollmentOptions?.student?.ciclo_actual ? `Ciclo ${enrollmentOptions.student.ciclo_actual}` : 'Ciclo pendiente'}
        </div>
      </header>

      {error ? <p className="rounded-[8px] border border-[#fecdd3] bg-[#fff1f2] p-4 text-sm font-medium text-[#be123c]">{error}</p> : null}
      {selectedConflict ? (
        <p className="rounded-[8px] border border-[#fecdd3] bg-[#fff1f2] p-4 text-sm font-medium text-[#be123c]">
          Hay un cruce entre {selectedConflict.first} y {selectedConflict.second}. Cambia una seccion para poder matricularte.
        </p>
      ) : null}
      {successMessage ? <p className="rounded-[8px] border border-[#bbf7d0] bg-[#f0fdf4] p-4 text-sm font-semibold text-[#047857]">{successMessage}</p> : null}

      {isLoading ? (
        <div className="flex min-h-72 items-center justify-center gap-3 text-sm font-medium text-[#6b7280]">
          <Loader2 className="animate-spin" size={21} strokeWidth={1.8} />
          Cargando horarios habilitados...
        </div>
      ) : courses.length ? (
        <>
          <section className="grid grid-cols-3 border-y border-[#E7E0D3] bg-white py-5">
            <Summary label="Cursos habilitados" value={String(summary?.total_courses ?? 0)} />
            <Summary label="Secciones" value={String(summary?.total_sections ?? 0)} />
            <Summary label="Bloques de horario" value={String(summary?.total_schedules ?? 0)} />
          </section>

          <section className="rounded-[8px] border border-[#E7E0D3] bg-[#f7f2ea] p-1">
            <div className="grid gap-1 sm:grid-cols-2">
              <button
                className={`rounded-[7px] px-4 py-3 text-sm font-bold transition ${
                  activeTab === 'available'
                    ? 'bg-white text-[#1f2937] shadow-[0_6px_18px_rgba(31,41,55,0.08)]'
                    : 'text-[#6b7280] hover:text-[#1f2937]'
                }`}
                onClick={() => setActiveTab('available')}
                type="button"
              >
                Cursos para matricularme
              </button>
              <button
                className={`rounded-[7px] px-4 py-3 text-sm font-bold transition ${
                  activeTab === 'registered'
                    ? 'bg-white text-[#1f2937] shadow-[0_6px_18px_rgba(31,41,55,0.08)]'
                    : 'text-[#6b7280] hover:text-[#1f2937]'
                }`}
                onClick={() => setActiveTab('registered')}
                type="button"
              >
                Mi matricula
                {enrolledCourses.length ? (
                  <span className="ml-2 rounded-full bg-[#ecfdf5] px-2 py-0.5 text-xs text-[#047857]">{enrolledCourses.length}</span>
                ) : null}
              </button>
            </div>
          </section>

          {activeTab === 'available' ? (
          <section className="flex flex-col gap-3 rounded-[8px] border border-[#E7E0D3] bg-white p-4 shadow-[0_8px_24px_rgba(31,41,55,0.04)] lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-sm font-semibold text-[#1f2937]">
                {selectedSectionIds.length}/{courses.length} cursos seleccionados
              </p>
              <p className="mt-1 text-xs leading-5 text-[#6b7280]">
                Escoge una seccion por cada curso que quieras llevar.
              </p>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <button
                className="inline-flex h-11 items-center justify-center gap-2 rounded-[8px] border border-[#E7E0D3] bg-white px-4 text-sm font-bold text-[#1f2937] transition hover:border-[#8b2332] hover:text-[#8b2332]"
                onClick={() => void copyExternalAiPrompt()}
                type="button"
              >
                {promptCopied ? <Check size={16} strokeWidth={1.9} /> : <Clipboard size={16} strokeWidth={1.9} />}
                {promptCopied ? 'Prompt copiado' : 'Copiar prompt IA'}
              </button>
              <button
                className="inline-flex h-11 items-center justify-center rounded-[8px] bg-[#8b2332] px-5 text-sm font-bold text-white transition hover:bg-[#6f1c28] disabled:cursor-not-allowed disabled:bg-[#d1d5db]"
                disabled={!hasSelection || Boolean(selectedConflict) || isLoading}
                onClick={confirmEnrollment}
                type="button"
              >
                {isLoading ? 'Guardando...' : 'Matricularme'}
              </button>
            </div>
          </section>
          ) : null}

          {activeTab === 'registered' ? (
            enrolledCourses.length ? (
            <section className="overflow-hidden rounded-[8px] border border-[#d9e2ec] bg-white shadow-[0_8px_24px_rgba(31,41,55,0.04)]">
              <header className="border-b border-[#d9e2ec] bg-[#f8fafc] px-4 py-4 sm:px-5">
                <p className="text-xs font-bold uppercase text-[#8b2332]">Matricula registrada</p>
                <h2 className="mt-1 text-base font-semibold text-[#1f2937]">Tus cursos matriculados</h2>
              </header>
              <div className="divide-y divide-[#d9e2ec]">
                {enrolledCourses.map((course) => (
                  <article className="grid gap-3 px-4 py-4 sm:grid-cols-[1fr_auto] sm:items-start sm:px-5" key={course.curso_id}>
                    <div className="min-w-0">
                      <p className="text-xs font-bold uppercase text-[#8b2332]">{course.codigo}</p>
                      <h3 className="mt-1 text-sm font-semibold text-[#1f2937]">{course.nombre}</h3>
                      {course.sections.map((section) => (
                        <div className="mt-2 grid gap-1 text-xs text-[#6b7280]" key={section.seccion_id}>
                          <p className="font-semibold text-[#1f2937]">{section.codigo} · {section.docente}</p>
                          {section.schedules.map((schedule) => (
                            <p className="inline-flex items-center gap-2" key={schedule.horario_id}>
                              <Clock3 size={13} strokeWidth={1.8} />
                              {schedule.dia_label}, {schedule.hora_inicio} - {schedule.hora_fin} · {schedule.aula} · {schedule.sede}
                            </p>
                          ))}
                        </div>
                      ))}
                    </div>
                    <div className="flex flex-wrap gap-2 text-xs font-semibold text-[#4b5563]">
                      <span className="rounded-full bg-[#f2ece2] px-3 py-1.5">{formatNumber(course.creditos)} creditos</span>
                      <span className="rounded-full bg-[#ecfdf5] px-3 py-1.5 text-[#047857]">Matriculado</span>
                    </div>
                  </article>
                ))}
              </div>
            </section>
            ) : (
              <div className="grid min-h-64 place-items-center rounded-[8px] border border-dashed border-[#E7E0D3] bg-white p-8 text-center">
                <div className="max-w-md">
                  <CalendarClock className="mx-auto text-[#b5aa99]" size={34} strokeWidth={1.6} />
                  <h2 className="mt-4 text-lg font-semibold text-[#1f2937]">Aun no tienes matricula registrada</h2>
                  <p className="mt-2 text-sm leading-6 text-[#6b7280]">
                    Ve a Cursos para matricularme, escoge tus secciones y confirma tu matricula.
                  </p>
                </div>
              </div>
            )
          ) : null}

          {activeTab === 'available' ? (
          <div className="grid gap-4">
            {courses.map((course) => (
              <article className="overflow-hidden rounded-[8px] border border-[#d9e2ec] bg-white" key={course.curso_id}>
                <header className="flex flex-col gap-3 border-b border-[#d9e2ec] bg-[#eef5f9] px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
                  <div className="min-w-0">
                    <p className="text-xs font-bold uppercase text-[#8b2332]">{course.codigo}</p>
                    <h2 className="mt-1 text-base font-semibold text-[#1f2937]">{course.nombre}</h2>
                  </div>
                  <div className="flex flex-wrap gap-2 text-xs font-semibold text-[#4b5563]">
                    <span className="rounded-full bg-white px-3 py-1.5">{formatNumber(course.creditos)} creditos</span>
                    <span className="rounded-full bg-white px-3 py-1.5">{formatNumber(course.horas_semanales)} h semanales</span>
                    <span className="rounded-full bg-[#1f2937] px-3 py-1.5 text-white">
                      {course.sections.length} {course.sections.length === 1 ? 'seccion' : 'secciones'}
                    </span>
                    {selectedByCourse[course.curso_id] ? (
                      <button
                        className="rounded-full border border-[#E7E0D3] bg-white px-3 py-1.5 text-[#8b2332] transition hover:border-[#8b2332]"
                        onClick={() => {
                          setSuccessMessage('')
                          setSelectedByCourse((current) => {
                            const next = { ...current }
                            delete next[course.curso_id]
                            return next
                          })
                        }}
                        type="button"
                      >
                        Quitar seleccion
                      </button>
                    ) : null}
                  </div>
                </header>

                <div className="hidden grid-cols-[150px_1.1fr_1fr_150px] gap-4 border-b border-[#d9e2ec] bg-[#f8fafc] px-5 py-3 text-xs font-bold uppercase text-[#6b7280] lg:grid">
                  <span>Seccion</span>
                  <span>Horario y aula</span>
                  <span>Docente</span>
                  <span>Modalidad</span>
                </div>

                <div className="divide-y divide-[#d9e2ec]">
                  {course.sections.map((section) => {
                    const disabledReason = getDisabledReason(section, selectedSections)
                    const isSelected = selectedByCourse[course.curso_id] === section.seccion_id

                    return (
                      <label
                        className={`grid gap-4 px-4 py-5 transition lg:grid-cols-[150px_1.1fr_1fr_150px] lg:px-5 ${
                          isSelected
                            ? 'bg-[#fff7ed]'
                            : disabledReason
                              ? 'cursor-not-allowed bg-[#f8fafc] opacity-60'
                              : 'cursor-pointer hover:bg-[#fbfaf7]'
                        }`}
                        key={section.seccion_id}
                        title={disabledReason}
                      >
                        <div>
                          <span className="text-xs font-semibold uppercase text-[#6b7280] lg:hidden">Seccion</span>
                          <div className="mt-1 flex items-center gap-3 lg:mt-0">
                            <input
                              checked={isSelected}
                              className="h-4 w-4 accent-[#8b2332] disabled:cursor-not-allowed"
                              disabled={Boolean(disabledReason)}
                              name={`course-${course.curso_id}`}
                              onChange={() => {
                                if (disabledReason) return
                                setSuccessMessage('')
                                setSelectedByCourse((current) => ({ ...current, [course.curso_id]: section.seccion_id }))
                              }}
                              type="radio"
                            />
                            <span className="inline-flex rounded-[6px] bg-[#f2ece2] px-3 py-1.5 text-sm font-bold text-[#1f2937]">{section.codigo}</span>
                          </div>
                          {disabledReason ? <p className="mt-2 text-xs font-medium text-[#be123c]">{disabledReason}</p> : null}
                        </div>

                        <div className="grid gap-2">
                          <span className="text-xs font-semibold uppercase text-[#6b7280] lg:hidden">Horario y aula</span>
                          {section.schedules.map((schedule) => (
                            <div className="grid gap-1 text-sm" key={schedule.horario_id}>
                              <p className="inline-flex items-center gap-2 font-semibold text-[#1f2937]">
                                <Clock3 className="text-[#8b2332]" size={15} strokeWidth={1.8} />
                                {schedule.dia_label}, {schedule.hora_inicio} - {schedule.hora_fin}
                              </p>
                              <p className="inline-flex items-center gap-2 pl-[23px] text-xs text-[#6b7280]">
                                <MapPin size={13} strokeWidth={1.8} />
                                {schedule.aula} · {schedule.sede}
                              </p>
                            </div>
                          ))}
                        </div>

                        <div>
                          <span className="text-xs font-semibold uppercase text-[#6b7280] lg:hidden">Docente</span>
                          <p className="mt-1 inline-flex items-start gap-2 text-sm font-semibold text-[#1f2937] lg:mt-0">
                            <UserRound className="mt-0.5 shrink-0 text-[#8b2332]" size={15} strokeWidth={1.8} />
                            {section.docente}
                          </p>
                        </div>

                        <div>
                          <span className="text-xs font-semibold uppercase text-[#6b7280] lg:hidden">Modalidad</span>
                          <p className="mt-1 inline-flex items-center gap-2 rounded-full bg-[#ecfdf5] px-3 py-1.5 text-xs font-bold text-[#047857] lg:mt-0">
                            <CheckCircle2 size={14} strokeWidth={1.9} />
                            {section.modalidad_label}
                          </p>
                        </div>
                      </label>
                    )
                  })}
                </div>
              </article>
            ))}
          </div>
          ) : null}
        </>
      ) : (
        <div className="grid min-h-80 place-items-center rounded-[8px] border border-dashed border-[#E7E0D3] bg-white p-8 text-center">
          <div className="max-w-md">
            <CalendarClock className="mx-auto text-[#b5aa99]" size={36} strokeWidth={1.6} />
            <h2 className="mt-4 text-lg font-semibold text-[#1f2937]">Aun no hay horarios habilitados</h2>
            <p className="mt-2 text-sm leading-6 text-[#6b7280]">
              {enrollmentOptions?.message ?? 'Cuando el administrador habilite horarios para tu ciclo actual, apareceran aqui.'}
            </p>
          </div>
        </div>
      )}

      <button
        aria-label="Abrir asistente de matricula"
        className="fixed bottom-6 right-6 z-40 grid h-14 w-14 place-items-center rounded-full bg-[#8b2332] text-white shadow-[0_16px_34px_rgba(139,35,50,0.32)] transition hover:bg-[#6f1c28]"
        onClick={() => setIsChatOpen(true)}
        type="button"
      >
        <MessageCircle size={24} strokeWidth={1.9} />
      </button>

      {isChatOpen ? (
        <div className="fixed inset-0 z-50 bg-[#111827]/25 p-4 sm:bg-transparent sm:p-0">
          <section className="ml-auto flex h-full max-h-[680px] w-full max-w-[430px] flex-col overflow-hidden rounded-[10px] border border-[#d9e2ec] bg-white shadow-[0_24px_60px_rgba(17,24,39,0.22)] sm:absolute sm:bottom-24 sm:right-6 sm:h-[560px]">
            <header className="flex items-start justify-between gap-3 border-b border-[#d9e2ec] bg-[#f8fafc] px-4 py-4">
              <div className="flex items-start gap-3">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-[8px] bg-[#1f2937] text-white">
                  <Bot size={19} strokeWidth={1.8} />
                </span>
                <div>
                  <h2 className="text-base font-semibold text-[#1f2937]">Asistente de matricula</h2>
                  <p className="mt-1 text-xs leading-5 text-[#6b7280]">
                    Recomienda secciones y evita cruces.
                  </p>
                </div>
              </div>
              <button
                aria-label="Cerrar asistente"
                className="grid h-9 w-9 shrink-0 place-items-center rounded-[8px] border border-[#E7E0D3] bg-white text-[#1f2937] transition hover:border-[#8b2332]"
                onClick={() => setIsChatOpen(false)}
                type="button"
              >
                <X size={18} strokeWidth={1.9} />
              </button>
            </header>

            <div className="border-b border-[#d9e2ec] bg-white px-4 py-3">
              <div className="flex items-center gap-3 rounded-[8px] border border-[#E7E0D3] bg-[#fbfaf7] px-3 py-3">
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-[8px] bg-white text-[#8b2332] shadow-sm">
                  {localAiStatus === 'checking' ? <Loader2 className="animate-spin" size={16} strokeWidth={1.8} /> : <Sparkles size={16} strokeWidth={1.8} />}
                </span>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-[#1f2937]">
                    {localAiStatus === 'ready'
                      ? 'IA local activa'
                      : localAiStatus === 'checking'
                        ? `Preparando IA local${localAiProgress ? ` · ${localAiProgress}%` : ''}`
                        : localAiStatus === 'unsupported'
                          ? 'Asistente listo'
                          : 'Preparando asistente'}
                  </p>
                  <p className="mt-0.5 text-xs leading-5 text-[#6b7280]">
                    {localAiStatus === 'unsupported'
                      ? 'Usare el backend para recomendar secciones.'
                      : localAiStatus === 'ready'
                        ? 'Respondera desde este navegador cuando sea posible.'
                        : 'Intentando cargar el modelo del navegador.'}
                  </p>
                </div>
              </div>
            </div>

            <div className="grid flex-1 content-start gap-3 overflow-y-auto bg-[#fbfaf7] p-4">
              {chatMessages.map((message) => (
                <p
                  className={`max-w-[86%] whitespace-pre-line rounded-[10px] px-3 py-2.5 text-sm leading-5 ${
                    message.role === 'user'
                      ? 'ml-auto bg-[#8b2332] text-white shadow-[0_8px_18px_rgba(139,35,50,0.18)]'
                      : 'border border-[#ece4d8] bg-white text-[#1f2937] shadow-sm'
                  }`}
                  key={message.id}
                >
                  {message.text}
                </p>
              ))}
              {chatLoading ? (
                <p className="inline-flex w-fit items-center gap-2 rounded-[10px] border border-[#ece4d8] bg-white px-3 py-2.5 text-sm text-[#6b7280] shadow-sm">
                  <Loader2 className="animate-spin" size={15} /> Cargando...
                </p>
              ) : null}
            </div>

            <div className="flex gap-2 border-t border-[#d9e2ec] bg-white p-3">
              <input
                className="h-11 min-w-0 flex-1 rounded-[8px] border border-[#E7E0D3] bg-white px-3 text-sm text-[#1f2937] outline-none transition placeholder:text-[#9ca3af] focus:border-[#8b2332]"
                onChange={(event) => setChatInput(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') void sendChatMessage()
                }}
                placeholder="Ej: quiero solo mananas"
                value={chatInput}
              />
              <button
                aria-label="Enviar mensaje"
                className="grid h-11 w-11 shrink-0 place-items-center rounded-[8px] bg-[#1f2937] text-white transition hover:bg-[#8b2332] disabled:cursor-not-allowed disabled:opacity-50"
                disabled={!chatInput.trim() || chatLoading}
                onClick={() => void sendChatMessage()}
                type="button"
              >
                <Send size={17} strokeWidth={1.9} />
              </button>
            </div>
          </section>
        </div>
      ) : null}
    </section>
  )
}

function Summary({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0 border-l border-[#E7E0D3] px-3 first:border-l-0 sm:px-6">
      <span className="block text-xs font-medium text-[#6b7280]">{label}</span>
      <strong className="mt-1 block text-xl font-semibold text-[#1f2937]">{value}</strong>
    </div>
  )
}

function formatNumber(value: number) {
  return Number.isInteger(value) ? String(value) : value.toFixed(1)
}

function sanitizeAssistantText(text: string) {
  const trimmed = text.trim()
  if (/^```/.test(trimmed) || extractJsonObject(trimmed)) {
    return 'Te entiendo 🙂 Puedo ayudarte ajustando la seleccion por turno, dias disponibles o evitando cruces. Dime que restriccion quieres priorizar.'
  }
  return trimmed
}

function buildExternalAiPrompt(courses: CourseOption[], selectedSections: SectionOption[], cycle: number | null) {
  const selectedIds = new Set(selectedSections.map((section) => section.seccion_id))
  const courseLines = courses.flatMap((course) => {
    const header = [
      `${course.codigo} - ${course.nombre}`,
      `${formatNumber(course.creditos)} creditos`,
      `${formatNumber(course.horas_semanales)} h semanales`,
    ].join(' | ')

    const sectionLines = course.sections.map((section) => {
      const schedules = section.schedules
        .map((schedule) => `${schedule.dia_label} ${schedule.hora_inicio}-${schedule.hora_fin}, ${schedule.aula} (${schedule.sede})`)
        .join('; ')
      const selected = selectedIds.has(section.seccion_id) ? ' [seleccionada actualmente]' : ''
      return `  - ${section.codigo}${selected}: docente ${section.docente}; modalidad ${section.modalidad_label}; horarios: ${schedules}`
    })

    return [`${header}`, ...sectionLines]
  })

  return [
    'Hazme un horario adecuado para mi matricula universitaria.',
    '',
    'Objetivo:',
    '- Escoge una sola seccion por cada curso.',
    '- Evita cruces de horario.',
    '- Si no se puede llevar todo, dime cuantos cursos sí se pueden llevar y cuales quedan fuera.',
    '- Prioriza un horario compacto y realista.',
    '- Explica brevemente por que elegiste esas secciones.',
    '',
    'Mis preferencias:',
    '- Completa aqui tus restricciones, por ejemplo: solo mananas, evitar lunes, no chocar con almuerzo, sin clases de noche.',
    '',
    `Ciclo actual: ${cycle ? `Ciclo ${cycle}` : 'pendiente'}`,
    '',
    'Horarios disponibles:',
    courseLines.join('\n'),
    '',
    'Devuelveme una propuesta clara con curso, seccion, dia, hora, aula y docente.',
  ].join('\n')
}

function getSectionsByIds(courses: CourseOption[], sectionIds: number[]) {
  const ids = new Set(sectionIds)
  return courses.flatMap((course) => course.sections.filter((section) => ids.has(section.seccion_id)))
}

function getMinutes(value: string) {
  const [hours, minutes] = value.split(':').map(Number)
  return hours * 60 + minutes
}

function schedulesOverlap(first: SectionOption['schedules'][number], second: SectionOption['schedules'][number]) {
  return first.dia === second.dia && getMinutes(first.hora_inicio) < getMinutes(second.hora_fin) && getMinutes(first.hora_fin) > getMinutes(second.hora_inicio)
}

function sectionsOverlap(first: SectionOption, second: SectionOption) {
  return first.schedules.some((firstSchedule) => second.schedules.some((secondSchedule) => schedulesOverlap(firstSchedule, secondSchedule)))
}

function getDisabledReason(section: SectionOption, selectedSections: SectionOption[]) {
  const conflict = selectedSections.find((selected) => selected.seccion_id !== section.seccion_id && sectionsOverlap(section, selected))
  if (!conflict) return ''
  return `Cruza con ${conflict.codigo}`
}

function findFirstConflict(sections: SectionOption[]) {
  for (let index = 0; index < sections.length; index += 1) {
    for (let next = index + 1; next < sections.length; next += 1) {
      if (sectionsOverlap(sections[index], sections[next])) {
        return { first: sections[index].codigo, second: sections[next].codigo }
      }
    }
  }
  return null
}

function normalizeMessage(message: string) {
  return message
    .toLocaleLowerCase('es')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
}

function normalizeDays(values: unknown) {
  const validDays = new Set(['lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado'])
  if (!Array.isArray(values)) return []
  return values
    .map((value) => normalizeMessage(String(value)).trim())
    .filter((value) => validDays.has(value))
}

function normalizeTurn(value: unknown): StudentEnrollmentAssistantPreferences['turn'] {
  const normalized = normalizeMessage(String(value ?? '')).trim()
  if (normalized === 'manana' || normalized === 'tarde' || normalized === 'noche') return normalized
  if (['nocturno', 'nocturna', 'noches'].includes(normalized)) return 'noche'
  if (['matutino', 'matutina', 'mananas'].includes(normalized)) return 'manana'
  return ''
}

function parsePreferencesFromText(message: string): StudentEnrollmentAssistantPreferences {
  const normalized = normalizeMessage(message)
  const dayAliases = ['lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado']
  const excludedDays = dayAliases.filter((day) =>
    [`sin ${day}`, `evita ${day}`, `evitar ${day}`, `no ${day}`, `no puedo ${day}`, `no quiero ${day}`].some((pattern) => normalized.includes(pattern)),
  )
  const allowedDays = dayAliases.filter((day) => normalized.includes(day) && !excludedDays.includes(day))
  let turn: StudentEnrollmentAssistantPreferences['turn'] = ''

  if (['manana', 'mananas', 'matutino', 'matutina'].some((token) => normalized.includes(token))) {
    turn = 'manana'
  } else if (normalized.includes('tarde')) {
    turn = 'tarde'
  } else if (['noche', 'noches', 'nocturno', 'nocturna', 'nocturnos', 'nocturnas'].some((token) => normalized.includes(token))) {
    turn = 'noche'
  }

  return { allowed_days: allowedDays, excluded_days: excludedDays, turn }
}

function extractJsonObject(text: string) {
  const match = text.match(/\{[\s\S]*\}/)
  if (!match) return null
  try {
    return JSON.parse(match[0]) as Record<string, unknown>
  } catch {
    return null
  }
}

function formatChatHistory(messages: ChatMessage[]) {
  const recent = messages.slice(-8)
  if (!recent.length) return 'Sin mensajes previos.'
  return recent.map((message) => `${message.role === 'user' ? 'Estudiante' : 'Asistente'}: ${message.text}`).join('\n')
}

function formatAssistantScheduleAnswer(answer: string) {
  const normalized = normalizeMessage(answer)

  if (normalized.includes('solo encontre')) {
    return `Uy, hay pocas opciones para ese filtro 😕\n\n${answer}`
  }

  if (normalized.includes('no encontre')) {
    return `No encontre una combinacion viable por ahora 😕\n\n${answer}`
  }

  if (normalized.includes('te arme')) {
    return `Listo, te arme una opcion sin cruces ✨\n\n${answer}`
  }

  return `${answer} ✨`
}

async function extractEnrollmentPreferences(
  message: string,
  session: LocalLanguageModelSession | null,
  history: ChatMessage[] = [],
): Promise<StudentEnrollmentAssistantPreferences> {
  if (session) {
    try {
      const response = await session.prompt(
        [
          'Extrae preferencias de matricula universitaria desde el mensaje del estudiante.',
          'Usa el historial si el mensaje actual es seguimiento, por ejemplo "y para la tarde?" o "igual pero sin lunes".',
          'Devuelve solo JSON valido, sin markdown ni explicaciones.',
          'Formato exacto: {"turn":"","allowed_days":[],"excluded_days":[]}',
          'turn debe ser uno de: "manana", "tarde", "noche" o "".',
          'Convierte nocturno/nocturna/noches a "noche".',
          'Convierte mañana/mananas/matutino a "manana".',
          'Dias validos: lunes, martes, miercoles, jueves, viernes, sabado.',
          `Historial reciente:\n${formatChatHistory(history)}`,
          `Mensaje: ${message}`,
        ].join('\n'),
      )
      const parsed = extractJsonObject(response)
      if (parsed) {
        return {
          allowed_days: normalizeDays(parsed.allowed_days),
          excluded_days: normalizeDays(parsed.excluded_days),
          turn: normalizeTurn(parsed.turn),
        }
      }
    } catch {
      return parsePreferencesFromText(message)
    }
  }

  return parsePreferencesFromText(message)
}

function isScheduleRequest(message: string) {
  const normalized = normalizeMessage(message)
  return [
    'horario',
    'horarios',
    'seccion',
    'secciones',
    'curso',
    'cursos',
    'manana',
    'tarde',
    'noche',
    'lunes',
    'martes',
    'miercoles',
    'jueves',
    'viernes',
    'sabado',
    'cruce',
    'cruces',
    'matricula',
    'matricular',
    'evita',
    'evitar',
    'sin clases',
    'elige',
    'escoge',
    'recomienda',
  ].some((token) => normalized.includes(token))
}

function getLocalConversationAnswer(message: string, status: 'idle' | 'checking' | 'ready' | 'unsupported') {
  const normalized = normalizeMessage(message)

  if (normalized.includes('modelo') || normalized.includes('ia local') || normalized.includes('instal')) {
    if (normalized.includes('ver') || normalized.includes('donde') || normalized.includes('como')) {
      return 'Puedes revisarlo en chrome://on-device-internals 🔎 Ahi Chrome muestra info del modelo local. Para espacio del sitio, mira DevTools > Application > Storage; el modelo integrado lo administra Chrome.'
    }
    if (normalized.includes('espacio') || normalized.includes('pesa') || normalized.includes('ocupa') || normalized.includes('gb')) {
      return 'Chrome suele pedir bastante espacio libre para IA integrada: la doc menciona al menos 22 GB libres en el volumen del perfil 💾 El tamano exacto puede cambiar con actualizaciones.'
    }
    if (normalized.includes('elimine') || normalized.includes('borra') || normalized.includes('vive') || normalized.includes('dura')) {
      return 'No vive solo hasta cerrar la pagina 🙂 Chrome lo administra a nivel navegador: puede quedar para usos futuros, actualizarse o eliminarse automaticamente si falta espacio.'
    }
    return status === 'ready'
      ? 'La IA local esta activa en este navegador ✨ Tus mensajes pueden procesarse en el dispositivo, y la seleccion final igual se valida con el sistema academico.'
      : 'La IA local depende de Chrome y del equipo. Si no se puede usar, igual sigo funcionando con el backend para recomendar horarios sin costo externo 🙂'
  }

  if (normalized.includes('gracias') || normalized.includes('thanks')) {
    return 'De nada 😊 Cuando quieras, dime tus preferencias y te ayudo a limpiar la seleccion.'
  }

  return ''
}

function getFallbackConversationAnswer(message: string, history: ChatMessage[] = []) {
  const normalized = normalizeMessage(message)

  if (/^(hola|holaa|holaaa|buenas|hello|hi|hey|oe|ola)\b/.test(normalized) && history.length <= 1) {
    return 'Holaa 😊 Dime como quieres organizar tu horario y te ayudo a escoger secciones sin cruces.'
  }

  if (normalized.includes('wow') || normalized.includes(':/') || normalized.includes(':(') || normalized.includes('triste') || normalized.includes('pena')) {
    return 'Si, se siente limitado 😕 Con los horarios habilitados ahora mismo no siempre alcanza para armar todo en el turno que prefieres, pero puedo probar otra combinacion por tarde, noche o dias libres.'
  }

  if (normalized.includes('gracias') || normalized.includes('thanks')) {
    return 'De nada 😊 Cuando quieras, puedo ayudarte a ajustar la seleccion por turno, dias o cruces.'
  }

  return 'Puedo ayudarte con tu matricula ✨ secciones sin cruces, turnos, dias libres o evitar clases en ciertos horarios.'
}
