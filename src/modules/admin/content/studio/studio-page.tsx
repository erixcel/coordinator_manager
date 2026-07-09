import { useEffect, useRef, useState } from 'react'
import { agentStudioHistoryApi, streamAgentFlow, type AgentStreamEvent } from '../../../../data'
import { SectionData } from './layout/section-data'
import { SectionProcess } from './layout/section-process'
import { SectionQuery } from './layout/section-query'
import type { StudioRun, TimelineItem, TimelinePane } from './layout/studio-types'

const DEFAULT_PROMPT = 'Quiero crear horarios para los estudiantes de decimo ciclo de ingenieria de software'

const NODE_LABELS: Record<string, string> = {
  call_agent: 'Analizando solicitud',
  call_tools: 'Consultando informacion',
  process_chat: 'Preparando sesion',
  process_context: 'Revisando datos',
  process_messages: 'Guardando avance',
  process_persist: 'Resultado listo',
  request: 'Solicitud recibida',
}

function formatNodeName(node?: string) {
  if (!node) return 'Evento'
  return NODE_LABELS[node] ?? node.replaceAll('_', ' ')
}

function getEventDetail(event: AgentStreamEvent) {
  return event.payload?.text?.trim() ?? ''
}

function getStepHelper(item?: TimelineItem | null) {
  if (!item) return 'Selecciona un paso de la izquierda para ver que obtuvo la IA.'
  return item.description ?? 'Resultado obtenido durante la creacion del horario.'
}

function getPreferredPersistedEventId(events: TimelineItem[], selectedEventId: string | null) {
  const selectedEvent = events.find((event) => event.id === selectedEventId)
  const previewEvent = [...events]
    .reverse()
    .find((event) => event.toolName === 'crear_preview_horarios' && (event.responseDetail || event.detail))
  const finalAgentEvent = [...events]
    .reverse()
    .find((event) => event.node === 'call_agent' && (event.detail || event.responseDetail))

  if (!selectedEvent) {
    return previewEvent?.id ?? finalAgentEvent?.id ?? events[events.length - 1]?.id ?? null
  }

  const selectedIndex = events.findIndex((event) => event.id === selectedEvent.id)
  const isEarlyAutoSelection = selectedEvent.type === 'tool_call' && selectedIndex >= 0 && selectedIndex <= 2 && Boolean(previewEvent)

  return isEarlyAutoSelection
    ? previewEvent?.id ?? selectedEvent.id
    : selectedEvent.id
}

export function StudioPage() {
  const [prompt, setPrompt] = useState(DEFAULT_PROMPT)
  const [events, setEvents] = useState<TimelineItem[]>([])
  const [answer, setAnswer] = useState('')
  const [error, setError] = useState('')
  const [isStreaming, setIsStreaming] = useState(false)
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null)
  const abortRef = useRef<AbortController | null>(null)
  const answerRef = useRef('')
  const eventsRef = useRef<TimelineItem[]>([])
  const selectedEventIdRef = useRef<string | null>(null)
  const timelineRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    timelineRef.current?.scrollTo({ behavior: 'smooth', top: timelineRef.current.scrollHeight })
  }, [events.length])

  useEffect(() => {
    eventsRef.current = events
  }, [events])

  useEffect(() => {
    answerRef.current = answer
  }, [answer])

  useEffect(() => {
    selectedEventIdRef.current = selectedEventId
  }, [selectedEventId])

  function updateEvents(updater: (current: TimelineItem[]) => TimelineItem[]) {
    setEvents((current) => {
      const next = updater(current)
      eventsRef.current = next
      return next
    })
  }

  function updateAnswer(value: string) {
    answerRef.current = value
    setAnswer(value)
  }

  const selectedItem = events.find((event) => event.id === selectedEventId) ?? events[events.length - 1] ?? null
  const selectedPane = selectedItem?.selectedPane ?? 'response'
  const selectedDetail =
    selectedPane === 'params'
      ? selectedItem?.paramsDetail?.trim() ?? selectedItem?.detail?.trim() ?? ''
      : selectedItem?.responseDetail?.trim() ?? selectedItem?.detail?.trim() ?? ''
  const selectedMarkdown = selectedDetail || answer

  function handleSelectEvent(id: string, pane?: TimelinePane) {
    selectedEventIdRef.current = id
    setSelectedEventId(id)
    if (pane) {
      updateEvents((current) =>
        current.map((item) =>
          item.id === id
            ? { ...item, selectedPane: pane }
            : item,
        ),
      )
    }
  }

  function buildTimelineItems(eventName: string, event: AgentStreamEvent): TimelineItem[] {
    const node = event.node || event.type || eventName
    let label = ''

    if (event.type === 'done') return []

    if (event.type === 'start' || node === 'request') {
      label = event.label ?? 'Solicitud recibida'
    } else if (node === 'process_chat' || node === 'process_messages' || node === 'process_context') {
      label = event.label ?? formatNodeName(node)
    } else if (node === 'call_agent') {
      label = event.label ?? 'Generando respuesta'
    } else if (node === 'call_tools') {
      return []
    } else if (event.type === 'result' || node === 'process_persist') {
      label = event.label ?? 'Cerrar propuesta'
    } else {
      return []
    }

    return [{
      description: event.description,
      detail: getEventDetail(event),
      eventName,
      id: `${Date.now()}-${Math.random()}`,
      label,
      node,
      payload: event.payload,
      status: event.status || 'completed',
      tone: event.tone,
      type: event.type || eventName,
    }]
  }

  function appendEvent(eventName: string, event: AgentStreamEvent) {
    const eventDetail = getEventDetail(event)

    if (event.type === 'tool_call') {
      const toolCallId = event.tool_call_id || `${event.tool_name ?? 'tool'}-${Date.now()}`
      const pane = event.phase === 'request' ? 'params' : 'response'

      updateEvents((current) => {
        const existingIndex = current.findIndex((item) => item.toolCallId === toolCallId)
        const existing = existingIndex >= 0 ? current[existingIndex] : null
        const item: TimelineItem = {
          description: event.description ?? existing?.description,
          detail: eventDetail || existing?.detail,
          eventName,
          id: existing?.id ?? toolCallId,
          label: event.label ?? existing?.label ?? event.tool_name ?? 'Herramienta',
          node: 'call_tools',
          paramsDetail: event.phase === 'request' ? eventDetail : existing?.paramsDetail,
          payload: event.payload ?? existing?.payload,
          responseDetail: event.phase === 'response' ? eventDetail : existing?.responseDetail,
          selectedPane: event.phase === 'response' ? 'response' : existing?.selectedPane ?? pane,
          status: event.phase === 'response' ? 'completed' : existing?.status ?? 'running',
          tone: event.tone ?? existing?.tone,
          toolCallId,
          toolName: event.tool_name ?? existing?.toolName,
          type: 'tool_call',
        }

        if (!selectedEventIdRef.current) {
          selectedEventIdRef.current = item.id
          setSelectedEventId(item.id)
        }
        if (existingIndex >= 0) {
          const next = [...current]
          next[existingIndex] = item
          return next
        }
        return [...current, item]
      })
      return
    }

    if ((event.node || event.type || eventName) === 'call_tools') {
      updateEvents((current) => {
        const next = [...current]
        if (!eventDetail) return current

        const item: TimelineItem = {
          detail: eventDetail,
          description: event.description,
          eventName,
          id: `${Date.now()}-${Math.random()}`,
          label: event.label ?? 'Informacion obtenida',
          node: 'call_tools',
          payload: event.payload,
          status: 'completed',
          tone: event.tone,
          type: 'tool',
        }
        if (!selectedEventIdRef.current) {
          selectedEventIdRef.current = item.id
          setSelectedEventId(item.id)
        }
        return [...next, item]
      })
    } else {
      const items = buildTimelineItems(eventName, event)
      if (items.length > 0) {
        updateEvents((current) => {
          const next = [...current]
          const uniqueItems: TimelineItem[] = []

          items.forEach((item) => {
            const singleStep = ['request', 'process_chat', 'process_messages', 'process_context', 'process_persist'].includes(item.node) || item.type === 'result'
            const existingIndex = singleStep
              ? next.findIndex((entry) => entry.node === item.node || (entry.type === 'result' && item.type === 'result'))
              : -1

            if (existingIndex >= 0) {
              next[existingIndex] = {
                ...next[existingIndex],
                description: item.description ?? next[existingIndex].description,
                detail: item.detail || next[existingIndex].detail,
                eventName: item.eventName,
                label: item.label || next[existingIndex].label,
                payload: item.payload ?? next[existingIndex].payload,
                status: item.status || next[existingIndex].status,
                tone: item.tone ?? next[existingIndex].tone,
                type: item.type || next[existingIndex].type,
              }
              return
            }

            uniqueItems.push(item)
          })

          if (uniqueItems.length === 0) return current
          if (!selectedEventIdRef.current) {
            selectedEventIdRef.current = uniqueItems[0].id
            setSelectedEventId(uniqueItems[0].id)
          }
          return [...next, ...uniqueItems]
        })
      }
    }

    if (event.type === 'result' && eventDetail) {
      updateAnswer(eventDetail)
    }
  }

  async function persistRun(run: Omit<StudioRun, 'createdAt' | 'id'>) {
    await agentStudioHistoryApi.create(run)
  }

  async function handleStart() {
    if (!prompt.trim() || isStreaming) return

    abortRef.current?.abort()
    const controller = new AbortController()
    abortRef.current = controller
    const runPrompt = prompt.trim()

    updateAnswer('')
    setError('')
    eventsRef.current = []
    setEvents([])
    setIsStreaming(true)
    selectedEventIdRef.current = null
    setSelectedEventId(null)

    try {
      await streamAgentFlow({
        chatId: null,
        message: runPrompt,
        onEvent: appendEvent,
        signal: controller.signal,
      })
      if (!controller.signal.aborted && eventsRef.current.length > 0) {
        const persistedSelectedEventId = getPreferredPersistedEventId(eventsRef.current, selectedEventIdRef.current)
        await persistRun({
          answer: answerRef.current,
          events: eventsRef.current,
          prompt: runPrompt,
          selectedEventId: persistedSelectedEventId,
          status: 'completed',
        })
      }
    } catch (streamError) {
      if (!controller.signal.aborted) {
        setError(streamError instanceof Error ? streamError.message : 'No se pudo completar el flujo IA.')
        if (eventsRef.current.length > 0) {
          const persistedSelectedEventId = getPreferredPersistedEventId(eventsRef.current, selectedEventIdRef.current)
          await persistRun({
            answer: answerRef.current,
            events: eventsRef.current,
            prompt: runPrompt,
            selectedEventId: persistedSelectedEventId,
            status: 'error',
          })
        }
      }
    } finally {
      if (!controller.signal.aborted) setIsStreaming(false)
    }
  }

  return (
    <section className="grid gap-4">
      {error && <div className="rounded-[8px] border border-rose-200 bg-rose-50 p-4 text-sm font-semibold text-rose-700">{error}</div>}

      <div className="grid h-[calc(100dvh_-_150px)] min-h-[360px] min-w-0 max-w-full gap-5 xl:grid-cols-[minmax(0,3fr)_minmax(300px,1fr)]">
        <SectionData
          bodyClassName="h-[calc(100%_-_66px)] max-h-none"
          className="!min-h-0 h-full min-w-0"
          emptyClassName="h-[calc(100%_-_66px)] min-h-0"
          selectedItem={selectedItem}
          selectedMarkdown={selectedMarkdown}
        />
        <aside className="grid h-full min-h-0 grid-rows-[auto_1fr] gap-4">
          <SectionQuery
            isStreaming={isStreaming}
            onPromptChange={setPrompt}
            onStart={handleStart}
            prompt={prompt}
          />
          <SectionProcess
            className="h-full min-w-0 !min-h-0"
            events={events}
            getStepHelper={getStepHelper}
            listClassName="flex-1 !max-h-none min-h-0"
            onSelectEvent={handleSelectEvent}
            selectedItem={selectedItem}
            timelineRef={timelineRef}
          />
        </aside>
      </div>
    </section>
  )
}
