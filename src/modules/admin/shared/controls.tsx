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
    <label className="flex h-11 w-full max-w-[380px] items-center gap-3 rounded-xl border border-slate-200/60 bg-white/80 px-4 shadow-[0_2px_8px_rgba(15,23,42,0.05)] backdrop-blur transition-all duration-200 focus-within:border-[#FF385C]/40 focus-within:shadow-[0_0_0_3px_rgba(255,56,92,0.08)]">
      <Search size={16} strokeWidth={1.8} className="text-slate-400" />
      <input
        aria-label={placeholder}
        className="min-w-0 flex-1 bg-transparent text-sm font-medium text-slate-800 outline-none placeholder:text-slate-400"
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
    <label className="grid min-w-[200px] gap-1.5 text-sm font-semibold text-slate-700">
      {label}
      <span className="flex h-11 items-center rounded-xl border border-slate-200/60 bg-white/80 px-4 backdrop-blur transition-all duration-200 focus-within:border-[#FF385C]/40 focus-within:shadow-[0_0_0_3px_rgba(255,56,92,0.08)] hover:border-slate-300">
        <select
          className="min-w-0 flex-1 appearance-none bg-transparent text-sm font-medium text-slate-800 outline-none"
          onChange={(event) => onChange(event.target.value)}
          value={value}
        >
          {children}
        </select>
        <ChevronDown size={15} strokeWidth={1.8} className="text-slate-400" />
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
        <strong className="block text-[28px] font-extrabold leading-tight text-slate-900">
          {count.toLocaleString('es-PE')}
        </strong>
        <span className="text-sm font-medium text-slate-500">{label}</span>
      </div>
      {search}
    </div>
  )
}
