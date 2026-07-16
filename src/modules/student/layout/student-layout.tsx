import { BookOpenCheck, CalendarDays, ClipboardCheck, LogOut, Menu, UserRound, X } from 'lucide-react'
import { Navigate, NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../../store/use-auth-store'
import { useStudentStore } from '../../../store/use-student-store'
import { cn, iconButton, shell } from '../../admin/shared/styles'
import { useState } from 'react'

const studentNavItems = [
  { href: '/student/inicio', label: 'Inicio', icon: UserRound },
  { href: '/student/horario', label: 'Mi horario', icon: CalendarDays },
  { href: '/student/cursos', label: 'Mis cursos', icon: BookOpenCheck },
  { href: '/student/matricula', label: 'Matricula', icon: ClipboardCheck },
]

export function StudentLayout() {
  const accessToken = useAuthStore((state) => state.accessToken)
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const logout = useAuthStore((state) => state.logout)
  const resetStudentState = useStudentStore((state) => state.resetStudentState)
  const user = useAuthStore((state) => state.user)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const navigate = useNavigate()

  if (!isAuthenticated || !accessToken || user?.role !== 'student') {
    return <Navigate replace to="/auth/sign-in" />
  }

  function handleLogout() {
    resetStudentState()
    logout()
    navigate('/auth/sign-in', { replace: true })
  }

  return (
    <div className={`${shell} flex bg-[#fbfaf7]`}>
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-30 flex w-[292px] -translate-x-full flex-col border-r border-[#E7E0D3] bg-[#fffdfa] px-5 py-6 transition-transform md:translate-x-0',
          isSidebarOpen && 'translate-x-0',
        )}
      >
        <div className="relative mb-8 border-b border-[#E7E0D3] pb-6">
          <div className="grid h-14 w-14 place-items-center rounded-2xl bg-[#1f2937] text-white">
            <UserRound size={28} strokeWidth={1.7} />
          </div>
          <strong className="mt-4 block text-[17px] font-semibold text-[#1f2937]">Portal del alumno</strong>
          <span className="mt-1 block text-sm text-[#6b7280]">{user.first_name || user.email}</span>
          <button
            aria-label="Cerrar menu lateral"
            className={cn(iconButton, 'absolute right-0 top-0 md:hidden')}
            onClick={() => setIsSidebarOpen(false)}
            type="button"
          >
            <X size={18} strokeWidth={1.8} />
          </button>
        </div>

        <nav aria-label="Alumno" className="grid gap-2">
          {studentNavItems.map((item) => {
            const Icon = item.icon

            return (
              <NavLink
                className={({ isActive }) =>
                  cn(
                    'flex h-12 items-center gap-3 rounded-full px-4 text-left text-[15px] font-medium transition',
                    isActive
                      ? 'bg-[#1f2937] text-white shadow-[0_3px_12px_rgba(31,41,55,0.12)]'
                      : 'text-[#6b7280] hover:bg-[#f2ece2] hover:text-[#1f2937]',
                  )
                }
                key={item.href}
                onClick={() => setIsSidebarOpen(false)}
                to={item.href}
              >
                <Icon size={18} strokeWidth={1.8} />
                {item.label}
              </NavLink>
            )
          })}
        </nav>

        <button
          className="mt-auto flex h-12 items-center gap-3 rounded-full border border-[#E7E0D3] px-4 text-[15px] font-medium text-[#1f2937] transition hover:border-[#1f2937] hover:bg-[#f2ece2]"
          onClick={handleLogout}
          type="button"
        >
          <LogOut size={18} strokeWidth={1.8} />
          Cerrar sesion
        </button>
      </aside>

      <button
        aria-label="Cerrar menu"
        className={cn('fixed inset-0 z-20 hidden bg-black/50', isSidebarOpen && 'block md:hidden')}
        onClick={() => setIsSidebarOpen(false)}
        type="button"
      />

      <div className="flex min-w-0 flex-1 flex-col md:pl-[292px]">
        <header className="sticky top-0 z-10 border-b border-[#E7E0D3] bg-[#fffdfa]/95 px-4 py-4 backdrop-blur md:px-8">
          <div className="mx-auto flex max-w-[1280px] items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <button
                aria-label="Abrir menu lateral"
                className={cn(iconButton, 'md:hidden')}
                onClick={() => setIsSidebarOpen(true)}
                type="button"
              >
                <Menu size={19} strokeWidth={1.8} />
              </button>
              <p className="text-xs font-semibold uppercase text-[#6b7280]">Vista del estudiante</p>
            </div>
            <div className="hidden rounded-full border border-[#E7E0D3] bg-white px-4 py-2 text-sm font-medium text-[#1f2937] sm:block">
              {user.email}
            </div>
          </div>
        </header>

        <main className="mx-auto w-full max-w-[1280px] px-4 py-6 md:px-8 md:py-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
