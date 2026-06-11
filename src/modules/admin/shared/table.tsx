import type { ReactNode } from 'react'
import { cn, panel } from './styles'

export function DataTable({ columns, rows }: { columns: string[]; rows: ReactNode[][] }) {
  return (
    <div className={cn(panel, 'overflow-auto')}>
      <table className="min-w-[760px] w-full border-collapse">
        <thead>
          <tr>
            {columns.map((column) => (
              <th
                className="border-b border-[#EBEBEB] bg-[#F7F7F7] px-4 py-4 text-left text-xs font-semibold uppercase text-[#717171]"
                key={column}
              >
                {column}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, rowIndex) => (
            <tr className="transition hover:bg-[#F7F7F7]" key={rowIndex}>
              {row.map((cell, cellIndex) => (
                <td
                  className="border-b border-[#EBEBEB] px-4 py-4 text-sm font-medium text-[#222222]"
                  key={`${rowIndex}-${cellIndex}`}
                >
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      {rows.length === 0 ? <p className="p-5 text-sm text-[#717171]">No hay resultados con esos filtros.</p> : null}
    </div>
  )
}
