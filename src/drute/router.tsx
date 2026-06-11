import { Navigate, RouterProvider, createBrowserRouter } from 'react-router-dom'
import { AdminLayout } from '../modules/admin/layout/admin-layout'
import { CarrerasPage } from '../modules/admin/content/carreras/carreras-page'
import { CursosPage } from '../modules/admin/content/cursos/cursos-page'
import { EstudiantesPage } from '../modules/admin/content/estudiantes/estudiantes-page'
import { ProfesoresPage } from '../modules/admin/content/profesores/profesores-page'
import { ResumenPage } from '../modules/admin/content/resumen/resumen-page'
import { StudioPage } from '../modules/admin/content/studio/studio-page'
import { SignInPage } from '../modules/auth/sign-in/sign-in-page'

const router = createBrowserRouter([
  {
    path: '/',
    element: <Navigate replace to="/admin/resumen" />,
  },
  {
    path: '/auth',
    children: [
      {
        index: true,
        element: <Navigate replace to="/auth/sign-in" />,
      },
      {
        path: 'sign-in',
        element: <SignInPage />,
      },
    ],
  },
  {
    path: '/admin',
    element: <AdminLayout />,
    children: [
      {
        index: true,
        element: <Navigate replace to="/admin/resumen" />,
      },
      {
        path: 'resumen',
        element: <ResumenPage />,
      },
      {
        path: 'profesores',
        element: <ProfesoresPage />,
      },
      {
        path: 'estudiantes',
        element: <EstudiantesPage />,
      },
      {
        path: 'estuadiantes',
        element: <Navigate replace to="/admin/estudiantes" />,
      },
      {
        path: 'carreras',
        element: <CarrerasPage />,
      },
      {
        path: 'cursos',
        element: <CursosPage />,
      },
      {
        path: 'studio',
        element: <StudioPage />,
      },
    ],
  },
  {
    path: '*',
    element: <Navigate replace to="/admin/resumen" />,
  },
])

export function AppRouter() {
  return <RouterProvider router={router} />
}
