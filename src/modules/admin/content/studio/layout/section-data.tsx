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
    <div className={cn(panel, 'overflow-hidden rounded-[8px] bg-white text-[#152033]')}>
      <div className="border-b border-[#EBEBEB] p-5">
        <h2 className="text-xl font-black text-[#152033]">Detalles</h2>
      </div>

      {!selectedItem ? (
        <div className="grid min-h-[360px] place-items-center p-6 text-center">
          <div>
            <CalendarClock className="mx-auto mb-3 text-[#C6D2E1]" size={42} />
            <p className="text-sm font-black text-[#152033]">Aun no hay un paso seleccionado.</p>
            <p className="mt-1 text-sm text-[#8EA0B8]">Crea un horario y luego elige una tarjeta de progreso.</p>
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
