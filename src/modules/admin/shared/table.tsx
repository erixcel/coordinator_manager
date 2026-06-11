import type { ReactNode } from 'react'
import { Inbox } from 'lucide-react'
import { cn, panel } from './styles'

export function DataTable({ columns, rows }: { columns: string[]; rows: ReactNode[][] }) {
  return (
    <div className={cn(panel, 'overflow-hidden')}>
      <div className="overflow-x-auto">
        <table className="min-w-[760px] w-full border-collapse">
          <thead>
            <tr className="bg-gradient-to-r from-slate-50/80 to-slate-100/60">
              {columns.map((column) => (
                <th
                  className="border-b border-slate-200/60 px-6 py-3.5 text-left text-[10px] font-extrabold uppercase tracking-[0.14em] text-slate-400"
                  key={column}
                >
                  {column}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100/80">
            {rows.map((row, rowIndex) => (
              <tr className="transition-colors duration-150 hover:bg-slate-50/60" key={rowIndex}>
                {row.map((cell, cellIndex) => (
                  <td
                    className="px-6 py-4 text-sm font-semibold text-slate-600"
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
        <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
          <span className="grid h-14 w-14 place-items-center rounded-2xl bg-slate-100 text-slate-300">
            <Inbox size={24} />
          </span>
          <h4 className="mt-4 text-sm font-bold text-slate-700">Sin resultados</h4>
          <p className="mt-1 text-xs text-slate-400 max-w-[280px]">
            No pudimos encontrar registros que coincidan con los filtros seleccionados.
          </p>
        </div>
      ) : null}
    </div>
  )
}
