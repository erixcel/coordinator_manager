import { CalendarClock } from 'lucide-react'
import { cn, panel } from '../../../shared/styles'
import { MarkdownResult } from './studio-renderers'
import type { TimelineItem } from './studio-types'

type SectionDataProps = {
  bodyClassName?: string
  className?: string
  emptyClassName?: string
  selectedItem: TimelineItem | null
  selectedMarkdown: string
}

export function SectionData({
  bodyClassName,
  className,
  emptyClassName,
  selectedItem,
  selectedMarkdown,
}: SectionDataProps) {
  return (
    <div className={cn(panel, 'min-h-[calc(100vh-150px)] overflow-hidden rounded-[8px] bg-white text-[#152033]', className)}>
      <div className="flex min-h-[66px] items-center justify-between gap-4 border-b border-[#EBEBEB] px-5 py-4">
        <div className="min-w-0">
          <h2 className="text-xl font-black text-[#152033]">Preview</h2>
          <p className="mt-1 truncate text-xs font-bold uppercase tracking-[0.14em] text-[#8EA0B8]">
            {selectedItem?.label ?? 'Resultado del agente'}
          </p>
        </div>
      </div>

      {!selectedItem ? (
        <div className={cn('grid min-h-[calc(100vh-220px)] place-items-center p-6 text-center', emptyClassName)}>
          <div>
            <CalendarClock className="mx-auto mb-3 text-[#C6D2E1]" size={42} />
            <p className="text-sm font-black text-[#152033]">Aun no hay un paso seleccionado.</p>
            <p className="mt-1 text-sm text-[#8EA0B8]">Crea un horario y luego elige un paso del panel lateral.</p>
          </div>
        </div>
      ) : (
        <div className={cn('max-h-[calc(100vh-220px)] overflow-y-auto p-5', bodyClassName)}>
          <MarkdownResult text={selectedMarkdown} />
        </div>
      )}
    </div>
  )
}
