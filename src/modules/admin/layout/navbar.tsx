import { Menu, ShieldCheck } from 'lucide-react'
import { useAdminStore } from '../../../store/use-admin-store'
import { cn, iconButton } from '../shared/styles'

export function Navbar() {
  const openSidebar = useAdminStore((state) => state.openSidebar)

  return (
    <header className="sticky top-0 z-10 border-b border-slate-200/50 bg-white/70 px-4 py-3.5 backdrop-blur-xl md:px-8">
      <div className="mx-auto flex max-w-[1280px] items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            aria-label="Abrir menu lateral"
            className={cn(iconButton, 'md:hidden')}
            onClick={openSidebar}
            type="button"
          >
            <Menu size={19} strokeWidth={1.8} />
          </button>
          <p className="text-xs font-bold uppercase tracking-[0.12em] text-slate-400">Panel administrativo</p>
        </div>
        <div className="hidden items-center gap-2 rounded-full border border-slate-200/60 bg-white/80 px-4 py-2 text-sm font-semibold text-slate-700 shadow-[0_2px_8px_rgba(15,23,42,0.05)] backdrop-blur sm:flex">
          <ShieldCheck size={15} strokeWidth={1.8} className="text-[#FF385C]" />
          Admin
        </div>
      </div>
    </header>
  )
}
