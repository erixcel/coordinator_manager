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
    <div className={`${shell} flex bg-white`}>
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col md:pl-[292px]">
        <Navbar />
        <main className="mx-auto w-full max-w-[1280px] px-4 py-6 md:px-8 md:py-8">
          {isLoading ? <p className="p-5 text-sm text-[#717171]">Cargando datos académicos...</p> : null}
          {error ? <p className="p-5 text-sm font-medium text-[#C11331]">{error}</p> : null}
          {!error ? <Outlet /> : null}
        </main>
      </div>
    </div>
  )
}
