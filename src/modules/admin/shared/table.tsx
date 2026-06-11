import type { ReactNode } from 'react'
import { Inbox } from 'lucide-react'
import { cn, panel } from './styles'

export function DataTable({ columns, rows }: { columns: string[]; rows: ReactNode[][] }) {
  return (
    <div className={cn(panel, 'overflow-hidden border border-[#E7EDF5] shadow-sm')}>
      <div className="overflow-x-auto">
        <table className="min-w-[760px] w-full border-collapse">
          <thead>
            <tr className="bg-[#F8FAFC]">
              {columns.map((column) => (
                <th
                  className="border-b border-[#E7EDF5] px-6 py-3.5 text-left text-[10px] font-black uppercase tracking-[0.14em] text-[#8EA0B8]"
                  key={column}
                >
                  {column}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#F1F5F9]">
            {rows.map((row, rowIndex) => (
              <tr className="transition-colors duration-150 hover:bg-[#F8FAFC]/60" key={rowIndex}>
                {row.map((cell, cellIndex) => (
                  <td
                    className="px-6 py-4 text-sm font-semibold text-[#344054]"
                    key={`${rowIndex}-${cellIndex}`}
                  >
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {rows.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
          <span className="grid h-12 w-12 place-items-center rounded-full bg-[#F1F5F9] text-[#8EA0B8]">
            <Inbox size={22} />
          </span>
          <h4 className="mt-3 text-sm font-bold text-[#152033]">Sin resultados</h4>
          <p className="mt-1 text-xs text-[#8EA0B8] max-w-[280px]">
            No pudimos encontrar registros que coincidan con los filtros seleccionados.
          </p>
        </div>
      ) : null}
    </div>
  )
}
