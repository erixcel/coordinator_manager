import { CalendarClock } from 'lucide-react'
import { cn, panel } from '../../../shared/styles'
import { MarkdownResult } from './studio-renderers'
import type { TimelineItem } from './studio-types'

type SectionDataProps = {
  selectedItem: TimelineItem | null
  selectedMarkdown: string
}

export function SectionData({
  selectedItem,
  selectedMarkdown,
}: SectionDataProps) {
  return (
    <div className={cn(panel, 'overflow-hidden rounded-2xl')}>
      <div className="border-b border-slate-200/60 bg-gradient-to-r from-white/90 to-slate-50/40 p-5">
        <h2 className="text-lg font-extrabold text-slate-800">Detalles</h2>
      </div>

      {!selectedItem ? (
        <div className="grid min-h-[360px] place-items-center p-6 text-center">
          <div>
            <CalendarClock className="mx-auto mb-3 text-slate-300" size={42} />
            <p className="text-sm font-bold text-slate-600">Aun no hay un paso seleccionado.</p>
            <p className="mt-1 text-sm text-slate-400">Crea un horario y luego elige una tarjeta de progreso.</p>
          </div>
        </div>
      ) : (
        <div className="p-5">
          {selectedMarkdown && (
            <MarkdownResult text={selectedMarkdown} />
          )}
        </div>
      )}
    </div>
  )
}
