import { Navigate, Outlet } from 'react-router-dom'
import { useAdminStore } from '../../../store/use-admin-store'
import { Navbar } from './navbar'
import { Sidebar } from './sidebar'
import { shell } from '../shared/styles'

export function AdminLayout() {
  const error = useAdminStore((state) => state.error)
  const isAuthenticated = useAdminStore((state) => state.isAuthenticated)
  const isLoading = useAdminStore((state) => Object.values(state.loading).some(Boolean))

  if (!isAuthenticated) {
    return <Navigate replace to="/auth/sign-in" />
  }

  return (
    <div className={`${shell} flex`}>
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col md:pl-[272px]">
        <Navbar />
        <main className="mx-auto w-full max-w-[1280px] px-4 py-6 md:px-8 md:py-8">
          {isLoading ? (
            <div className="flex items-center gap-3 p-5">
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-slate-200 border-t-[#FF385C]" />
              <p className="text-sm font-medium text-slate-400">Cargando datos academicos...</p>
            </div>
          ) : null}
          {error ? <p className="p-5 text-sm font-semibold text-[#E11D48]">{error}</p> : null}
          {!error ? <Outlet /> : null}
        </main>
      </div>
    </div>
  )
}
