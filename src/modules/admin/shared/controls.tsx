import { ChevronDown, Search } from 'lucide-react'
import type { ReactNode } from 'react'

export function SearchField({
  onChange,
  placeholder,
  value,
}: {
  onChange: (value: string) => void
  placeholder: string
  value: string
}) {
  return (
    <label className="flex h-12 w-full max-w-[380px] items-center gap-3 rounded-full border border-[#EBEBEB] bg-white px-4 shadow-[0_3px_12px_rgba(0,0,0,0.08),0_1px_2px_rgba(0,0,0,0.04)] focus-within:border-[#222222]">
      <Search size={17} strokeWidth={1.8} className="text-[#717171]" />
      <input
        aria-label={placeholder}
        className="min-w-0 flex-1 bg-transparent text-[15px] text-[#222222] outline-none placeholder:text-[#717171]"
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        type="search"
        value={value}
      />
    </label>
  )
}

export function SelectField({
  children,
  label,
  onChange,
  value,
}: {
  children: ReactNode
  label: string
  onChange: (value: string) => void
  value: string
}) {
  return (
    <label className="grid min-w-[230px] gap-2 text-sm font-semibold text-[#222222]">
      {label}
      <span className="flex h-12 items-center rounded-full border border-[#DDDDDD] bg-white px-4 transition focus-within:border-[#222222] hover:border-[#222222]">
        <select
          className="min-w-0 flex-1 appearance-none bg-transparent text-[15px] font-medium text-[#222222] outline-none"
          onChange={(event) => onChange(event.target.value)}
          value={value}
        >
          {children}
        </select>
        <ChevronDown size={16} strokeWidth={1.8} className="text-[#717171]" />
      </span>
    </label>
  )
}

export function SectionToolbar({
  count,
  label,
  search,
}: {
  count: number
  label: string
  search: ReactNode
}) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <strong className="block text-[28px] font-semibold leading-tight text-[#222222]">
          {count.toLocaleString('es-PE')}
        </strong>
        <span className="text-sm text-[#717171]">{label}</span>
      </div>
      {search}
    </div>
  )
}
