import { Bot, BrainCircuit, CalendarClock, Check, ChevronRight, ClipboardList, Database, Play, Route, WandSparkles } from 'lucide-react'
import type { RefObject } from 'react'
import { cn, panel } from '../../../shared/styles'
import type { TimelineItem, TimelinePane } from './studio-types'

const NODE_ICONS: Record<string, typeof Database> = {
  call_agent: Bot,
  call_tools: WandSparkles,
  process_chat: Route,
  process_context: Database,
  process_messages: BrainCircuit,
  process_persist: Check,
  request: Play,
}

type SectionProcessProps = {
  className?: string
  events: TimelineItem[]
  getStepHelper: (item?: TimelineItem | null) => string
  listClassName?: string
  onSelectEvent: (id: string, pane?: TimelinePane) => void
  selectedItem: TimelineItem | null
  timelineRef: RefObject<HTMLDivElement | null>
}

export function SectionProcess({
  className,
  events,
  getStepHelper,
  listClassName,
  onSelectEvent,
  selectedItem,
  timelineRef,
}: SectionProcessProps) {
  return (
    <div className={cn('grid min-w-0 gap-3', className)}>
      <div className={cn(panel, 'overflow-hidden rounded-[8px] h-full flex flex-col')}>
        <div className="border-b border-[#EBEBEB] px-4 py-3 shrink-0">
          <h2 className="text-sm font-black uppercase tracking-[0.14em] text-[#8EA0B8]">Pasos ejecutados</h2>
        </div>
        <div ref={timelineRef} className={cn('max-h-[calc(100vh-430px)] min-h-[260px] overflow-y-auto px-3 py-3 flex-1', listClassName)}>
          {events.length === 0 ? (
            <div className="grid min-h-[220px] place-items-center rounded-[8px] border border-dashed border-[#DDDDDD] px-4 text-center">
              <div>
                <CalendarClock className="mx-auto mb-3 text-[#C6D2E1]" size={34} />
                <p className="text-sm font-bold text-[#717171]">Aun no hay eventos.</p>
                <p className="mt-1 text-xs text-[#8EA0B8]">Crea un horario para ver el avance.</p>
              </div>
            </div>
          ) : (
            <div className="grid gap-2.5">
              {events.map((event, index) => {
                const Icon = NODE_ICONS[event.node] ?? ChevronRight
                const isSelected = selectedItem?.id === event.id
                const selectedPane = event.selectedPane ?? 'response'
                const isToolCall = event.type === 'tool_call'

                return (
                  <div key={event.id} className="relative">
                    {index < events.length - 1 && (
                      <span className="absolute bottom-[-10px] left-[16px] top-[44px] w-px bg-[#E7EDF5]" />
                    )}
                    {isToolCall ? (
                      <article
                        className={cn(
                          'relative w-full overflow-hidden rounded-[8px] border bg-white shadow-[0_1px_2px_rgba(0,0,0,0.04)] transition',
                          isSelected ? 'border-[#FF385C] shadow-[0_10px_28px_rgba(255,56,92,0.12)] ring-1 ring-[#FF385C]/20' : 'border-[#EBEBEB]',
                        )}
                      >
                        <div className="grid grid-cols-[32px_minmax(0,1fr)] gap-2.5 p-3 pb-2.5">
                          <span
                            className={cn(
                              'relative z-10 grid h-8 w-8 shrink-0 place-items-center rounded-[8px] border text-[#FF385C]',
                              isSelected ? 'border-[#FFB6C5] bg-white' : 'border-[#FFE1E8] bg-[#FFF5F7]',
                            )}
                          >
                            <Icon size={14} />
                          </span>
                          <div className="min-w-0">
                            <div className="flex items-start justify-between gap-2 pt-0.5">
                              <span className="pt-0.5 text-[10px] font-black uppercase tracking-[0.14em] text-[#8EA0B8]">
                                Paso {index + 1}
                              </span>
                              <span
                                className={cn(
                                  'shrink-0 rounded-full px-2 py-1 text-[9px] font-black uppercase leading-none tracking-[0.1em]',
                                  event.status === 'completed' ? 'bg-[#ECFDF3] text-[#027A48]' : 'bg-[#F1F5F9] text-[#718096]',
                                )}
                              >
                                {event.status === 'completed' ? 'Listo' : 'Procesando'}
                              </span>
                            </div>
                            <strong className="mt-2 block text-[13px] font-black leading-[18px] text-[#152033]">{event.label}</strong>
                            <p className="mt-1 break-words text-[11px] font-bold leading-[18px] text-[#6B7A90]">
                              {event.toolName ?? 'tool'}
                            </p>
                          </div>
                        </div>

                        <div className="grid border-t border-[#EEF2F7] bg-[#FBFCFE]">
                          <button
                            className={cn(
                              'grid gap-1 border-b border-[#EEF2F7] px-3 py-2.5 text-left transition hover:bg-white',
                              isSelected && selectedPane === 'params' && 'bg-white shadow-[inset_3px_0_0_#FF385C]',
                            )}
                            onClick={() => onSelectEvent(event.id, 'params')}
                            type="button"
                          >
                            <span className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-[0.12em] text-[#8EA0B8]">
                              <ClipboardList size={12} />
                              Params
                            </span>
                            <span className="text-[11px] font-bold leading-4 text-[#344054]">
                              {event.paramsDetail ? 'Ver entrada' : 'Pendiente'}
                            </span>
                          </button>
                          <button
                            className={cn(
                              'grid gap-1 px-3 py-2.5 text-left transition hover:bg-white',
                              isSelected && selectedPane === 'response' && 'bg-white shadow-[inset_3px_0_0_#FF385C]',
                            )}
                            onClick={() => onSelectEvent(event.id, 'response')}
                            type="button"
                          >
                            <span className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-[0.12em] text-[#8EA0B8]">
                              <Database size={12} />
                              Respuesta
                            </span>
                            <span className="text-[11px] font-bold leading-4 text-[#344054]">
                              {event.responseDetail ? 'Ver salida' : 'Esperando'}
                            </span>
                          </button>
                        </div>
                      </article>
                    ) : (
                      <button
                        className={cn(
                          'relative min-h-[90px] w-full rounded-[8px] border bg-white p-3 text-left shadow-[0_1px_2px_rgba(0,0,0,0.04)] transition hover:border-[#C8D6E8] hover:bg-[#FBFCFE] hover:shadow-[0_8px_20px_rgba(15,23,42,0.06)]',
                          isSelected ? 'border-[#FF385C] bg-[#FFF8FA] shadow-[0_10px_28px_rgba(255,56,92,0.12)] ring-1 ring-[#FF385C]/20' : 'border-[#EBEBEB]',
                        )}
                        onClick={() => onSelectEvent(event.id)}
                        type="button"
                      >
                        <div className="grid grid-cols-[32px_minmax(0,1fr)] items-start gap-2.5">
                          <span
                            className={cn(
                              'relative z-10 grid h-8 w-8 shrink-0 place-items-center rounded-[8px] border text-[#FF385C]',
                              isSelected ? 'border-[#FFB6C5] bg-white' : 'border-[#FFE1E8] bg-[#FFF5F7]',
                            )}
                          >
                            <Icon size={14} />
                          </span>
                          <div className="min-w-0">
                            <div className="flex items-start justify-between gap-2 pt-0.5">
                              <span className="pt-0.5 text-[10px] font-black uppercase tracking-[0.14em] text-[#8EA0B8]">
                                Paso {index + 1}
                              </span>
                              <span
                                className={cn(
                                  'shrink-0 rounded-full px-2 py-1 text-[9px] font-black uppercase leading-none tracking-[0.1em]',
                                  event.status === 'completed' ? 'bg-[#ECFDF3] text-[#027A48]' : 'bg-[#F1F5F9] text-[#718096]',
                                )}
                              >
                                {event.status === 'completed' ? 'Listo' : 'Procesando'}
                              </span>
                            </div>
                            <strong className="mt-2.5 block text-[13px] font-black leading-[18px] text-[#152033]">{event.label}</strong>
                            <p className="mt-1.5 break-words text-[11px] font-bold leading-[18px] text-[#6B7A90]">
                              {getStepHelper(event)}
                            </p>
                          </div>
                        </div>
                      </button>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
