import { ArrowLeft, CalendarClock, ChevronLeft, ChevronRight, Eye, RefreshCw, Trash2 } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { agentStudioHistoryApi } from '../../../../data'
import { cn, iconButton, panel } from '../../shared/styles'
import { SectionData } from '../studio/layout/section-data'
import { SectionProcess } from '../studio/layout/section-process'
import type { StudioRun, TimelineItem, TimelinePane } from '../studio/layout/studio-types'

const PAGE_SIZE = 8

function formatRunDate(value: string) {
  return new Intl.DateTimeFormat('es-PE', {
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(value))
}

function getStepHelper(item?: TimelineItem | null) {
  if (!item) return 'Selecciona un paso para revisar su detalle.'
  return item.description ?? 'Evento guardado durante la ejecucion del agente.'
}

function statusLabel(status: StudioRun['status']) {
  return status === 'completed' ? 'Listo' : 'Error'
}

function getPreferredHistoryEventId(run: StudioRun) {
  const events = run.events ?? []
  const savedEvent = events.find((event) => event.id === run.selectedEventId)
  const previewEvent = [...events]
    .reverse()
    .find((event) => event.toolName === 'crear_preview_horarios' && (event.responseDetail || event.detail))
  const finalAgentEvent = [...events]
    .reverse()
    .find((event) => event.node === 'call_agent' && (event.detail || event.responseDetail))

  if (!savedEvent) {
    return previewEvent?.id ?? finalAgentEvent?.id ?? events[events.length - 1]?.id ?? null
  }

  const savedIndex = events.findIndex((event) => event.id === savedEvent.id)
  const isEarlyAutoSelection = savedEvent.type === 'tool_call' && savedIndex >= 0 && savedIndex <= 2 && Boolean(previewEvent)

  return isEarlyAutoSelection
    ? previewEvent?.id ?? savedEvent.id
    : savedEvent.id
}

export function HistorialIaPage() {
  const { runId } = useParams()

  if (runId) return <HistorialIaDetail runId={runId} />
  return <HistorialIaTable />
}

function HistorialIaTable() {
  const navigate = useNavigate()
  const [error, setError] = useState('')
  const [history, setHistory] = useState<StudioRun[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [page, setPage] = useState(1)

  const totalPages = Math.max(1, Math.ceil(history.length / PAGE_SIZE))
  const pageRows = useMemo(
    () => history.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE),
    [history, page],
  )

  useEffect(() => {
    void loadHistory()
  }, [])

  async function loadHistory() {
    setIsLoading(true)
    setError('')

    try {
      const runs = await agentStudioHistoryApi.list() as StudioRun[]
      setHistory(runs)
      setPage(1)
    } catch {
      setError('No se pudo cargar el historial de consultas.')
    } finally {
      setIsLoading(false)
    }
  }

  async function clearHistory() {
    try {
      await agentStudioHistoryApi.clear()
      setHistory([])
      setPage(1)
    } catch {
      setError('No se pudo limpiar el historial de consultas.')
    }
  }

  function openRun(id: string) {
    navigate(`/admin/historial-ia/${id}`)
  }

  return (
    <section className="grid gap-5">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black leading-tight text-[#152033]">Historial IA</h1>
          <p className="mt-1 text-sm font-semibold text-[#6B7A90]">
            Consultas guardadas del flow-agent.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button aria-label="Recargar historial" className={iconButton} onClick={loadHistory} type="button">
            <RefreshCw size={18} />
          </button>
          <button
            aria-label="Limpiar historial"
            className={cn(iconButton, 'text-[#FF385C] disabled:cursor-not-allowed disabled:opacity-40')}
            disabled={history.length === 0}
            onClick={clearHistory}
            type="button"
          >
            <Trash2 size={18} />
          </button>
        </div>
      </header>

      {error && <div className="rounded-[8px] border border-rose-200 bg-rose-50 p-4 text-sm font-semibold text-rose-700">{error}</div>}

      <div className={cn(panel, 'overflow-hidden rounded-[8px]')}>
        <div className="flex min-h-[62px] items-center justify-between gap-3 border-b border-[#EBEBEB] px-5 py-4">
          <div>
            <h2 className="text-base font-black text-[#152033]">Consultas registradas</h2>
            <p className="mt-1 text-xs font-bold uppercase tracking-[0.12em] text-[#8EA0B8]">
              {history.length} registros
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full border-collapse text-left">
            <thead className="bg-[#F8FAFC]">
              <tr className="border-b border-[#E7EDF5]">
                <th className="px-5 py-3 text-[11px] font-black uppercase tracking-[0.12em] text-[#8EA0B8]">Fecha</th>
                <th className="px-5 py-3 text-[11px] font-black uppercase tracking-[0.12em] text-[#8EA0B8]">Consulta</th>
                <th className="px-5 py-3 text-[11px] font-black uppercase tracking-[0.12em] text-[#8EA0B8]">Pasos</th>
                <th className="px-5 py-3 text-[11px] font-black uppercase tracking-[0.12em] text-[#8EA0B8]">Estado</th>
                <th className="w-[90px] px-5 py-3 text-right text-[11px] font-black uppercase tracking-[0.12em] text-[#8EA0B8]">Ver</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td className="px-5 py-12 text-center" colSpan={5}>
                    <RefreshCw className="mx-auto mb-3 animate-spin text-[#C6D2E1]" size={30} />
                    <p className="text-sm font-bold text-[#717171]">Cargando historial...</p>
                  </td>
                </tr>
              ) : pageRows.length === 0 ? (
                <tr>
                  <td className="px-5 py-12 text-center" colSpan={5}>
                    <CalendarClock className="mx-auto mb-3 text-[#C6D2E1]" size={34} />
                    <p className="text-sm font-bold text-[#717171]">Aun no hay consultas guardadas.</p>
                  </td>
                </tr>
              ) : (
                pageRows.map((run) => (
                  <tr
                    className="cursor-pointer border-b border-[#EEF2F7] transition last:border-b-0 hover:bg-[#FBFCFE]"
                    key={run.id}
                    onClick={() => openRun(run.id)}
                  >
                    <td className="whitespace-nowrap px-5 py-4 text-sm font-bold text-[#344054]">
                      {formatRunDate(run.createdAt)}
                    </td>
                    <td className="max-w-[560px] px-5 py-4">
                      <p className="line-clamp-2 text-sm font-black leading-5 text-[#152033]">{run.prompt}</p>
                    </td>
                    <td className="whitespace-nowrap px-5 py-4 text-sm font-bold text-[#344054]">
                      {run.events.length}
                    </td>
                    <td className="whitespace-nowrap px-5 py-4">
                      <span
                        className={cn(
                          'rounded-full px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.1em]',
                          run.status === 'completed' ? 'bg-[#ECFDF3] text-[#027A48]' : 'bg-rose-50 text-rose-700',
                        )}
                      >
                        {statusLabel(run.status)}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <button
                        aria-label="Ver consulta"
                        className="inline-grid h-9 w-9 place-items-center rounded-[8px] border border-[#E7EDF5] text-[#6B7A90] transition hover:border-[#FFB6C5] hover:bg-[#FFF5F7] hover:text-[#FF385C]"
                        onClick={(event) => {
                          event.stopPropagation()
                          openRun(run.id)
                        }}
                        type="button"
                      >
                        <Eye size={16} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#EBEBEB] px-5 py-4">
          <p className="text-sm font-semibold text-[#6B7A90]">
            Pagina {page} de {totalPages}
          </p>
          <div className="flex items-center gap-2">
            <button
              className="inline-flex h-9 items-center gap-2 rounded-[8px] border border-[#E7EDF5] px-3 text-sm font-bold text-[#344054] disabled:cursor-not-allowed disabled:opacity-40"
              disabled={page <= 1}
              onClick={() => setPage((current) => Math.max(1, current - 1))}
              type="button"
            >
              <ChevronLeft size={16} />
              Anterior
            </button>
            <button
              className="inline-flex h-9 items-center gap-2 rounded-[8px] border border-[#E7EDF5] px-3 text-sm font-bold text-[#344054] disabled:cursor-not-allowed disabled:opacity-40"
              disabled={page >= totalPages}
              onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
              type="button"
            >
              Siguiente
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}

function HistorialIaDetail({ runId }: { runId: string }) {
  const navigate = useNavigate()
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [run, setRun] = useState<StudioRun | null>(null)
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null)
  const timelineRef = useRef<HTMLDivElement | null>(null)

  const events = run?.events ?? []
  const selectedItem = events.find((event) => event.id === selectedEventId) ?? events[events.length - 1] ?? null
  const selectedPane = selectedItem?.selectedPane ?? 'response'
  const selectedDetail =
    selectedPane === 'params'
      ? selectedItem?.paramsDetail?.trim() ?? selectedItem?.detail?.trim() ?? ''
      : selectedItem?.responseDetail?.trim() ?? selectedItem?.detail?.trim() ?? ''
  const selectedMarkdown = selectedDetail || run?.answer || ''

  useEffect(() => {
    void loadRun()
  }, [runId])

  async function loadRun() {
    setIsLoading(true)
    setError('')

    try {
      const savedRun = await agentStudioHistoryApi.get(runId) as StudioRun
      const defaultEventId = getPreferredHistoryEventId(savedRun)
      setRun({
        ...savedRun,
        events: savedRun.events.map((event) =>
          event.id === defaultEventId && event.type === 'tool_call'
            ? { ...event, selectedPane: 'response' }
            : event,
        ),
      })
      setSelectedEventId(defaultEventId)
    } catch {
      setError('No se pudo cargar la consulta seleccionada.')
      setRun(null)
      setSelectedEventId(null)
    } finally {
      setIsLoading(false)
    }
  }

  function handleSelectEvent(id: string, pane?: TimelinePane) {
    setSelectedEventId(id)
    if (!pane) return

    setRun((current) =>
      current
        ? {
            ...current,
            events: current.events.map((event) =>
              event.id === id
                ? { ...event, selectedPane: pane }
                : event,
            ),
          }
        : current,
    )
  }

  return (
    <section className="grid min-w-0 gap-5">
      <header className="grid min-w-0 grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3">
        <button
          aria-label="Volver al historial"
          className={iconButton}
          onClick={() => navigate('/admin/historial-ia')}
          type="button"
        >
          <ArrowLeft size={18} />
        </button>
        <div className="min-w-0">
          <h1 className="truncate text-2xl font-black leading-tight text-[#152033]">Detalle de consulta</h1>
          <p className="mt-1 truncate text-sm font-semibold text-[#6B7A90]">
            {run?.prompt ?? 'Consulta guardada del flow-agent'}
          </p>
        </div>
        <button aria-label="Recargar consulta" className={iconButton} onClick={loadRun} type="button">
          <RefreshCw size={18} />
        </button>
      </header>

      {error && <div className="rounded-[8px] border border-rose-200 bg-rose-50 p-4 text-sm font-semibold text-rose-700">{error}</div>}

      {isLoading ? (
        <div className={cn(panel, 'grid min-h-[420px] place-items-center rounded-[8px] p-6 text-center')}>
          <div>
            <RefreshCw className="mx-auto mb-3 animate-spin text-[#C6D2E1]" size={34} />
            <p className="text-sm font-bold text-[#717171]">Cargando consulta...</p>
          </div>
        </div>
      ) : !run ? (
        <div className={cn(panel, 'grid min-h-[420px] place-items-center rounded-[8px] p-6 text-center')}>
          <div>
            <CalendarClock className="mx-auto mb-3 text-[#C6D2E1]" size={38} />
            <p className="text-sm font-bold text-[#717171]">No se encontro la consulta.</p>
          </div>
        </div>
      ) : (
        <div className="grid h-[calc(100dvh_-_250px)] min-h-[360px] min-w-0 max-w-full gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(300px,320px)]">
          <SectionData
            bodyClassName="h-[calc(100%_-_66px)] max-h-none"
            className="!min-h-0 h-full min-w-0"
            emptyClassName="h-[calc(100%_-_66px)] min-h-0"
            selectedItem={selectedItem}
            selectedMarkdown={selectedMarkdown}
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
        </div>
      )}
    </section>
  )
}
