import { Navigate, RouterProvider, createBrowserRouter } from 'react-router-dom'
import { AdminLayout } from '../modules/admin/layout/admin-layout'
import { CarrerasPage } from '../modules/admin/content/carreras/carreras-page'
import { CursosPage } from '../modules/admin/content/cursos/cursos-page'
import { EnabledCoursesPage } from '../modules/admin/content/habilitados/enabled-courses-page'
import { EstudiantesPage } from '../modules/admin/content/estudiantes/estudiantes-page'
import { ProfesoresPage } from '../modules/admin/content/profesores/profesores-page'
import { ResumenPage } from '../modules/admin/content/resumen/resumen-page'
import { StudioPage } from '../modules/admin/content/studio/studio-page'
import { SignInPage } from '../modules/auth/sign-in/sign-in-page'
import { StudentHomePage } from '../modules/student/content/student-home-page'
import { StudentCoursesPage } from '../modules/student/content/student-courses-page'
import { StudentEnrollmentPage } from '../modules/student/content/student-enrollment-page'
import { StudentSchedulePage } from '../modules/student/content/student-schedule-page'
import { StudentLayout } from '../modules/student/layout/student-layout'

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
        path: 'habilitados',
        element: <EnabledCoursesPage />,
      },
      {
        path: 'agente',
        element: <Navigate replace to="/admin/studio" />,
      },
      {
        path: 'studio',
        element: <StudioPage />,
      },
      {
        path: 'historial-ia',
        element: <Navigate replace to="/admin/studio" />,
      },
      {
        path: 'historial-ia/:runId',
        element: <Navigate replace to="/admin/studio" />,
      },
    ],
  },
  {
    path: '/student',
    element: <StudentLayout />,
    children: [
      {
        index: true,
        element: <Navigate replace to="/student/inicio" />,
      },
      {
        path: 'inicio',
        element: <StudentHomePage />,
      },
      {
        path: 'horario',
        element: <StudentSchedulePage />,
      },
      {
        path: 'cursos',
        element: <StudentCoursesPage />,
      },
      {
        path: 'matricula',
        element: <StudentEnrollmentPage />,
      },
      {
        path: 'recomendaciones',
        element: <Navigate replace to="/student/matricula" />,
      },
      {
        path: 'exportar',
        element: <Navigate replace to="/student/matricula" />,
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
