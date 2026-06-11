import { useState, useEffect, type ReactNode } from 'react'
import { Inbox, ChevronLeft, ChevronRight } from 'lucide-react'
import { cn, panel } from './styles'

export function DataTable({ columns, rows }: { columns: string[]; rows: ReactNode[][] }) {
  const [currentPage, setCurrentPage] = useState(1)
  const pageSize = 10

  // Resetear a la página 1 cuando cambien las filas (por búsquedas o filtros)
  useEffect(() => {
    setCurrentPage(1)
  }, [rows])

  const totalRows = rows.length
  const totalPages = Math.ceil(totalRows / pageSize)
  const startIndex = totalRows === 0 ? 0 : (currentPage - 1) * pageSize
  const endIndex = Math.min(startIndex + pageSize, totalRows)
  const paginatedRows = rows.slice(startIndex, endIndex)

  // Generar rango de páginas a mostrar (máximo 5 páginas alrededor de la actual)
  const getPageNumbers = () => {
    const pages: number[] = []
    let start = Math.max(1, currentPage - 2)
    let end = Math.min(totalPages, start + 4)

    if (end - start < 4) {
      start = Math.max(1, end - 4)
    }

    for (let i = start; i <= end; i++) {
      pages.push(i)
    }
    return pages
  }

  return (
    <div className={cn(panel, 'overflow-hidden border border-[#E7EDF5] shadow-sm flex flex-col justify-between')}>
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
            {paginatedRows.map((row, rowIndex) => (
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

      {totalRows === 0 ? (
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

      {/* Controles de Paginación */}
      {totalPages > 1 && (
        <div className="border-t border-[#E7EDF5] bg-[#F8FAFC]/40 px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <span className="text-xs font-semibold text-[#5D6B82]">
            Mostrando{' '}
            <strong className="font-black text-[#152033]">{startIndex + 1}</strong> a{' '}
            <strong className="font-black text-[#152033]">{endIndex}</strong> de{' '}
            <strong className="font-black text-[#152033]">{totalRows}</strong> resultados
          </span>
          <div className="flex items-center gap-1.5">
            {/* Botón Anterior */}
            <button
              className="inline-flex h-8 w-8 items-center justify-center rounded-[6px] border border-[#E2E8F0] bg-white text-[#5D6B82] transition hover:bg-[#F8FAFC] disabled:opacity-40 disabled:hover:bg-white disabled:cursor-not-allowed"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              type="button"
              aria-label="Página anterior"
            >
              <ChevronLeft size={16} />
            </button>

            {/* Números de páginas */}
            {getPageNumbers().map((pageNum) => {
              const isCurrent = pageNum === currentPage
              return (
                <button
                  key={pageNum}
                  className={cn(
                    'inline-flex h-8 min-w-[32px] items-center justify-center rounded-[6px] px-2 text-xs font-black transition',
                    isCurrent
                      ? 'bg-[#FF385C] text-white shadow-[0_4px_12px_rgba(255,56,92,0.2)]'
                      : 'border border-[#E2E8F0] bg-white text-[#5D6B82] hover:bg-[#F8FAFC]'
                  )}
                  onClick={() => setCurrentPage(pageNum)}
                  type="button"
                >
                  {pageNum}
                </button>
              )
            })}

            {/* Botón Siguiente */}
            <button
              className="inline-flex h-8 w-8 items-center justify-center rounded-[6px] border border-[#E2E8F0] bg-white text-[#5D6B82] transition hover:bg-[#F8FAFC] disabled:opacity-40 disabled:hover:bg-white disabled:cursor-not-allowed"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              type="button"
              aria-label="Página siguiente"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
