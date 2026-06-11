import { Menu, ShieldCheck } from 'lucide-react'
import { useAdminStore } from '../../../store/use-admin-store'
import { cn, iconButton } from '../shared/styles'

export function Navbar() {
  const openSidebar = useAdminStore((state) => state.openSidebar)

  return (
    <header className="sticky top-0 z-10 border-b border-[#EBEBEB] bg-white/95 px-4 py-4 backdrop-blur md:px-8">
      <div className="mx-auto flex max-w-[1280px] items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            aria-label="Abrir menú lateral"
            className={cn(iconButton, 'md:hidden')}
            onClick={openSidebar}
            type="button"
          >
            <Menu size={19} strokeWidth={1.8} />
          </button>
          <p className="text-xs font-semibold uppercase text-[#717171]">Panel administrativo</p>
        </div>
        <div className="hidden items-center gap-2 rounded-full border border-[#EBEBEB] bg-white px-4 py-2 text-sm font-medium text-[#222222] shadow-[0_1px_2px_rgba(0,0,0,0.08)] sm:flex">
          <ShieldCheck size={16} strokeWidth={1.8} />
          Admin
        </div>
      </div>
    </header>
  )
}
