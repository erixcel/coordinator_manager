import { useEffect, useRef, useState } from 'react'
import { streamAgentFlow, type AgentStreamEvent } from '../../../../data'
import { SectionData } from './layout/section-data'
import { SectionProcess } from './layout/section-process'
import { SectionQuery } from './layout/section-query'
import type { TimelineItem } from './layout/studio-types'

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

export function StudioPage() {
  const [prompt, setPrompt] = useState(DEFAULT_PROMPT)
  const [events, setEvents] = useState<TimelineItem[]>([])
  const [answer, setAnswer] = useState('')
  const [error, setError] = useState('')
  const [isStreaming, setIsStreaming] = useState(false)
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null)
  const abortRef = useRef<AbortController | null>(null)
  const timelineRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    timelineRef.current?.scrollTo({ behavior: 'smooth', left: timelineRef.current.scrollWidth })
  }, [events.length])

  const selectedItem = events.find((event) => event.id === selectedEventId) ?? events[events.length - 1] ?? null
  const selectedDetail = selectedItem?.detail?.trim() ?? ''
  const selectedMarkdown = selectedDetail || answer

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

    if ((event.node || event.type || eventName) === 'call_tools') {
      setEvents((current) => {
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
        if (!selectedEventId) setSelectedEventId(item.id)
        return [...next, item]
      })
    } else {
      const items = buildTimelineItems(eventName, event)
      if (items.length > 0) {
        setEvents((current) => {
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
          if (!selectedEventId) {
            setSelectedEventId(uniqueItems[0].id)
          }
          return [...next, ...uniqueItems]
        })
      }
    }

    if (event.type === 'result' && eventDetail) {
      setAnswer(eventDetail)
    }
  }

  async function handleStart() {
    if (!prompt.trim() || isStreaming) return

    abortRef.current?.abort()
    const controller = new AbortController()
    abortRef.current = controller

    setAnswer('')
    setError('')
    setEvents([])
    setIsStreaming(true)
    setSelectedEventId(null)

    try {
      await streamAgentFlow({
        chatId: null,
        message: prompt.trim(),
        onEvent: appendEvent,
        signal: controller.signal,
      })
    } catch (streamError) {
      if (!controller.signal.aborted) {
        setError(streamError instanceof Error ? streamError.message : 'No se pudo completar el flujo IA.')
      }
    } finally {
      if (!controller.signal.aborted) setIsStreaming(false)
    }
  }

  return (
    <section className="grid gap-6">
      <SectionQuery
        isStreaming={isStreaming}
        onPromptChange={setPrompt}
        onStart={handleStart}
        prompt={prompt}
      />

      {error && <div className="rounded-[8px] border border-rose-200 bg-rose-50 p-4 text-sm font-semibold text-rose-700">{error}</div>}

      <div className="grid gap-6">
        <SectionProcess
          events={events}
          getStepHelper={getStepHelper}
          isStreaming={isStreaming}
          onSelectEvent={setSelectedEventId}
          selectedItem={selectedItem}
          timelineRef={timelineRef}
        />
        <SectionData
          selectedItem={selectedItem}
          selectedMarkdown={selectedMarkdown}
        />
      </div>
    </section>
  )
}
