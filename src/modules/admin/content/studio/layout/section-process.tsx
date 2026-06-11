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
      {/* Progress bar */}
      <div className="h-2.5 overflow-hidden rounded-full bg-slate-100">
        <div
          className={cn(
            'h-full rounded-full bg-gradient-to-r from-[#FF385C] to-[#FF6B81] transition-[width] duration-500',
            isStreaming && 'studio-progress-striped',
          )}
          style={{
            animationPlayState: isStreaming ? 'running' : 'paused',
            width: isStreaming ? '72%' : events.length > 0 ? '100%' : '0%',
          }}
        />
      </div>

      {/* Timeline */}
      <div className={cn(panel, 'overflow-hidden rounded-2xl')}>
        <div ref={timelineRef} className="overflow-x-auto overflow-y-hidden px-4 py-5">
          {events.length === 0 ? (
            <div className="grid min-h-[120px] place-items-center rounded-xl border border-dashed border-slate-200 text-center">
              <div>
                <CalendarClock className="mx-auto mb-3 text-slate-300" size={34} />
                <p className="text-sm font-semibold text-slate-500">Aun no hay eventos.</p>
                <p className="mt-1 text-xs text-slate-400">Crea un horario para ver el avance.</p>
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
                        'min-h-[112px] w-fit min-w-[240px] max-w-[320px] rounded-xl border bg-white/80 backdrop-blur p-3.5 text-left shadow-sm transition-all duration-200 hover:shadow-[0_8px_24px_rgba(15,23,42,0.08)]',
                        isSelected ? 'border-[#FF385C] shadow-[0_8px_24px_rgba(255,56,92,0.12)] ring-2 ring-[#FF385C]/15' : 'border-slate-200/60 hover:border-slate-300',
                      )}
                      onClick={() => onSelectEvent(event.id)}
                      type="button"
                    >
                      <div className="grid min-h-[84px] grid-cols-[38px_minmax(160px,1fr)] items-center gap-3">
                        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-[#FF385C]/10 to-[#FF385C]/5 text-[#FF385C]">
                          <Icon size={15} />
                        </span>
                        <div className="min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">
                              Paso {index + 1}
                            </span>
                            <span
                              className={cn(
                                'shrink-0 rounded-lg px-2 py-0.5 text-[9px] font-bold uppercase tracking-[0.1em]',
                                event.status === 'completed' ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500',
                              )}
                            >
                              {event.status === 'completed' ? 'Listo' : 'Procesando'}
                            </span>
                          </div>
                          <strong className="mt-2 block truncate text-sm text-slate-800">{event.label}</strong>
                          <p className="mt-1 line-clamp-2 text-xs font-medium leading-5 text-slate-400">
                            {getStepHelper(event)}
                          </p>
                        </div>
                      </div>
                    </button>
                    {index < events.length - 1 && (
                      <span className="h-px w-8 shrink-0 bg-gradient-to-r from-slate-200 to-[#FF385C]/30" />
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
