import { Navigate, RouterProvider, createBrowserRouter } from 'react-router-dom'
import { AdminLayout } from '../modules/admin/layout/admin-layout'
import { AgentePage } from '../modules/admin/content/agente/agente-page'
import { CarrerasPage } from '../modules/admin/content/carreras/carreras-page'
import { CursosPage } from '../modules/admin/content/cursos/cursos-page'
import { EstudiantesPage } from '../modules/admin/content/estudiantes/estudiantes-page'
import { HistorialIaPage } from '../modules/admin/content/historial-ia/historial-ia-page'
import { ProfesoresPage } from '../modules/admin/content/profesores/profesores-page'
import { ResumenPage } from '../modules/admin/content/resumen/resumen-page'
import { StudioPage } from '../modules/admin/content/studio/studio-page'
import { SignInPage } from '../modules/auth/sign-in/sign-in-page'
import { StudentHomePage } from '../modules/student/content/student-home-page'
import { StudentPlaceholderPage } from '../modules/student/content/student-placeholder-page'
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
        path: 'agente',
        element: <AgentePage />,
      },
      {
        path: 'studio',
        element: <StudioPage />,
      },
      {
        path: 'historial-ia',
        element: <HistorialIaPage />,
      },
      {
        path: 'historial-ia/:runId',
        element: <HistorialIaPage />,
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
        element: (
          <StudentPlaceholderPage
            description="Aqui mostraremos los cursos sugeridos o asignados para la matricula del alumno."
            title="Mis cursos"
          />
        ),
      },
      {
        path: 'recomendaciones',
        element: (
          <StudentPlaceholderPage
            description="Aqui viviran las recomendaciones y explicaciones de la IA para el estudiante."
            title="Recomendaciones"
          />
        ),
      },
      {
        path: 'exportar',
        element: (
          <StudentPlaceholderPage
            description="Aqui prepararemos el resumen o prompt exportable con la propuesta de matricula."
            title="Exportar propuesta"
          />
        ),
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
