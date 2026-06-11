import { Bot, BrainCircuit, CalendarClock, Check, ChevronRight, Database, Play, Route, WandSparkles } from 'lucide-react'
import type { RefObject } from 'react'
import { cn, panel } from '../../../shared/styles'
import type { TimelineItem } from './studio-types'

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
  events: TimelineItem[]
  getStepHelper: (item?: TimelineItem | null) => string
  isStreaming: boolean
  onSelectEvent: (id: string) => void
  selectedItem: TimelineItem | null
  timelineRef: RefObject<HTMLDivElement | null>
}

export function SectionProcess({
  events,
  getStepHelper,
  isStreaming,
  onSelectEvent,
  selectedItem,
  timelineRef,
}: SectionProcessProps) {
  return (
    <div className="grid gap-3">
      <div className="h-3 overflow-hidden rounded-full bg-[#E9EEF5]">
        <div
          className={cn(
            'h-full rounded-full bg-[#FF385C] transition-[width] duration-500',
            isStreaming && 'studio-progress-striped',
          )}
          style={{
            animationPlayState: isStreaming ? 'running' : 'paused',
            width: isStreaming ? '72%' : events.length > 0 ? '100%' : '0%',
          }}
        />
      </div>

      <div className={cn(panel, 'overflow-hidden rounded-[8px]')}>
        <div ref={timelineRef} className="overflow-x-auto overflow-y-hidden px-4 py-5">
          {events.length === 0 ? (
            <div className="grid min-h-[120px] place-items-center rounded-[8px] border border-dashed border-[#DDDDDD] text-center">
              <div>
                <CalendarClock className="mx-auto mb-3 text-[#C6D2E1]" size={34} />
                <p className="text-sm font-bold text-[#717171]">Aun no hay eventos.</p>
                <p className="mt-1 text-xs text-[#8EA0B8]">Crea un horario para ver el avance.</p>
              </div>
            </div>
          ) : (
            <div className="flex min-w-max items-center gap-3 pb-1">
              {events.map((event, index) => {
                const Icon = NODE_ICONS[event.node] ?? ChevronRight
                const isSelected = selectedItem?.id === event.id

                return (
                  <div key={event.id} className="flex items-center gap-3">
                    <button
                      className={cn(
                        'min-h-[112px] w-fit min-w-[240px] max-w-[320px] rounded-[8px] border bg-white p-3.5 text-left shadow-[0_1px_2px_rgba(0,0,0,0.04)] transition hover:border-[#C8D6E8] hover:shadow-[0_8px_20px_rgba(15,23,42,0.06)]',
                        isSelected ? 'border-[#FF385C] shadow-[0_10px_28px_rgba(255,56,92,0.12)] ring-2 ring-[#FF385C]/15' : 'border-[#EBEBEB]',
                      )}
                      onClick={() => onSelectEvent(event.id)}
                      type="button"
                    >
                      <div className="grid min-h-[84px] grid-cols-[38px_minmax(160px,1fr)] items-center gap-3">
                        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-[8px] border border-[#FFE1E8] bg-[#FFF5F7] text-[#FF385C]">
                          <Icon size={15} />
                        </span>
                        <div className="min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-[10px] font-black uppercase tracking-[0.14em] text-[#8EA0B8]">
                              Paso {index + 1}
                            </span>
                            <span
                              className={cn(
                                'shrink-0 rounded-full px-2 py-0.5 text-[9px] font-black uppercase tracking-[0.1em]',
                                event.status === 'completed' ? 'bg-[#ECFDF3] text-[#027A48]' : 'bg-[#F1F5F9] text-[#718096]',
                              )}
                            >
                              {event.status === 'completed' ? 'Listo' : 'Procesando'}
                            </span>
                          </div>
                          <strong className="mt-2 block truncate text-sm text-[#152033]">{event.label}</strong>
                          <p className="mt-1 line-clamp-2 text-xs font-semibold leading-5 text-[#6B7A90]">
                            {getStepHelper(event)}
                          </p>
                        </div>
                      </div>
                    </button>
                    {index < events.length - 1 && (
                      <span className="h-px w-8 shrink-0 bg-gradient-to-r from-[#DCE5F2] to-[#FF385C]/40" />
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
