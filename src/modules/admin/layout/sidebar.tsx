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
          'fixed inset-y-0 left-0 z-30 flex w-[272px] -translate-x-full flex-col bg-gradient-to-b from-[#0F172A] to-[#1E293B] px-5 py-6 transition-transform duration-300 ease-out md:translate-x-0',
          isSidebarOpen && 'translate-x-0',
        )}
      >
        {/* Brand */}
        <div className="relative mb-8 grid justify-items-center border-b border-white/8 pb-7 pt-4 text-center">
          <div className="mt-2 grid h-[72px] w-[72px] place-items-center rounded-2xl bg-gradient-to-br from-[#FF385C] to-[#FF6B81] text-white shadow-[0_8px_32px_rgba(255,56,92,0.35)]">
            <GraduationCap size={38} strokeWidth={1.65} />
          </div>
          <strong className="mt-4 block text-[17px] font-bold leading-tight text-white">
            Coordinator
          </strong>
          <span className="mt-0.5 block text-sm font-medium text-slate-400">Manager</span>
          <button
            aria-label="Cerrar menu lateral"
            className={cn(iconButton, 'absolute right-0 top-0 border-white/10 bg-white/5 text-white hover:bg-white/10 md:hidden')}
            onClick={closeSidebar}
            type="button"
          >
            <X size={18} strokeWidth={1.8} />
          </button>
        </div>

        {/* Navigation */}
        <nav aria-label="Principal" className="grid gap-1.5">
          {navItems.map((item) => {
            const Icon = item.icon

            return (
              <NavLink
                className={({ isActive }) =>
                  cn(
                    'flex h-11 items-center gap-3 rounded-xl px-4 text-left text-[14px] font-semibold transition-all duration-200',
                    isActive
                      ? 'bg-gradient-to-r from-[#FF385C] to-[#FF5A79] text-white shadow-[0_4px_16px_rgba(255,56,92,0.30)]'
                      : 'text-slate-400 hover:bg-white/6 hover:text-white',
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

        {/* Logout */}
        <button
          className="mt-auto flex h-11 items-center gap-3 rounded-xl border border-white/8 px-4 text-[14px] font-semibold text-slate-400 transition-all duration-200 hover:border-[#FF385C]/40 hover:bg-[#FF385C]/8 hover:text-white"
          onClick={handleLogout}
          type="button"
        >
          <LogOut size={18} strokeWidth={1.8} />
          Cerrar sesion
        </button>
      </aside>

      {/* Mobile overlay */}
      <div
        aria-label="Cerrar menu"
        className={cn(
          'fixed inset-0 z-20 bg-black/60 backdrop-blur-sm transition-opacity duration-300',
          isSidebarOpen ? 'block md:hidden' : 'pointer-events-none hidden',
        )}
        onClick={closeSidebar}
        role="button"
        tabIndex={-1}
      />
    </>
  )
}
