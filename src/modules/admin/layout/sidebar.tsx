import {
  BookOpen,
  BriefcaseBusiness,
  GraduationCap,
  LayoutDashboard,
  LogOut,
  Sparkles,
  Users,
  X,
} from 'lucide-react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useAdminStore } from '../../../store/use-admin-store'
import { cn, iconButton } from '../shared/styles'

const navItems = [
  { href: '/admin/resumen', label: 'Resumen', icon: LayoutDashboard },
  { href: '/admin/profesores', label: 'Profesores', icon: BriefcaseBusiness },
  { href: '/admin/estudiantes', label: 'Estudiantes', icon: Users },
  { href: '/admin/carreras', label: 'Carreras', icon: GraduationCap },
  { href: '/admin/cursos', label: 'Cursos', icon: BookOpen },
  { href: '/admin/studio', label: 'Studio', icon: Sparkles },
]

export function Sidebar() {
  const closeSidebar = useAdminStore((state) => state.closeSidebar)
  const isSidebarOpen = useAdminStore((state) => state.isSidebarOpen)
  const logout = useAdminStore((state) => state.logout)
  const navigate = useNavigate()

  function handleLogout() {
    logout()
    navigate('/auth/sign-in', { replace: true })
  }

  return (
    <>
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-30 flex w-[292px] -translate-x-full flex-col border-r border-[#EBEBEB] bg-white px-5 py-6 transition-transform md:translate-x-0',
          isSidebarOpen && 'translate-x-0',
        )}
      >
        <div className="relative mb-9 grid justify-items-center border-b border-[#EBEBEB] pb-7 pt-4 text-center">
          <div className="mt-2 grid h-20 w-20 place-items-center rounded-[24px] bg-[#FF385C] text-white shadow-[0_10px_28px_rgba(255,56,92,0.24)]">
            <GraduationCap size={42} strokeWidth={1.65} />
          </div>
          <strong className="mt-4 block text-[17px] font-semibold leading-tight text-[#222222]">
            Coordinator
          </strong>
          <span className="mt-1 block text-sm text-[#717171]">Manager</span>
          <button
            aria-label="Cerrar menú lateral"
            className={cn(iconButton, 'absolute right-0 top-0 md:hidden')}
            onClick={closeSidebar}
            type="button"
          >
            <X size={18} strokeWidth={1.8} />
          </button>
        </div>

        <nav aria-label="Principal" className="grid gap-2">
          {navItems.map((item) => {
            const Icon = item.icon

            return (
              <NavLink
                className={({ isActive }) =>
                  cn(
                    'flex h-12 items-center gap-3 rounded-full px-4 text-left text-[15px] font-medium transition',
                    isActive
                      ? 'bg-[#222222] text-white shadow-[0_3px_12px_rgba(0,0,0,0.08)]'
                      : 'text-[#717171] hover:bg-[#F7F7F7] hover:text-[#222222]',
                  )
                }
                key={item.href}
                onClick={closeSidebar}
                to={item.href}
              >
                <Icon size={18} strokeWidth={1.8} />
                {item.label}
              </NavLink>
            )
          })}
        </nav>

        <button
          className="mt-auto flex h-12 items-center gap-3 rounded-full border border-[#DDDDDD] px-4 text-[15px] font-medium text-[#222222] transition hover:border-[#222222] hover:bg-[#F7F7F7]"
          onClick={handleLogout}
          type="button"
        >
          <LogOut size={18} strokeWidth={1.8} />
          Cerrar sesión
        </button>
      </aside>

      <button
        aria-label="Cerrar menú"
        className={cn('fixed inset-0 z-20 hidden bg-black/50', isSidebarOpen && 'block md:hidden')}
        onClick={closeSidebar}
        type="button"
      />
    </>
  )
}
