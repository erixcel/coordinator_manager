import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { academicApi, authApi } from '../data'
import type { AcademicSummary, Career, CareerStats, Course, Student, Teacher } from '../data'
import type { AuthUser } from '../data'

type ResourceKey = 'summary' | 'teachers' | 'students' | 'careers' | 'courses' | 'careerStats'

type LoadedState = Record<ResourceKey, boolean>

type AdminState = {
  accessToken: string
  careerStats: CareerStats[]
  careers: Career[]
  courses: Course[]
  error: string
  isAuthenticated: boolean
  isSidebarOpen: boolean
  loading: Partial<Record<ResourceKey, boolean>>
  loaded: LoadedState
  refreshToken: string
  students: Student[]
  summary: AcademicSummary | null
  teachers: Teacher[]
  user: AuthUser | null
  clearError: () => void
  closeSidebar: () => void
  loadCareerStats: (force?: boolean) => Promise<void>
  loadCareers: (force?: boolean) => Promise<void>
  loadCoursesPage: (force?: boolean) => Promise<void>
  loadStudentsPage: (force?: boolean) => Promise<void>
  loadSummary: (force?: boolean) => Promise<void>
  loadTeachers: (force?: boolean) => Promise<void>
  logout: () => void
  openSidebar: () => void
  signIn: (email: string, password: string) => Promise<void>
  toggleSidebar: () => void
}

const initialLoaded: LoadedState = {
  summary: false,
  teachers: false,
  students: false,
  careers: false,
  courses: false,
  careerStats: false,
}

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : 'No se pudo cargar la informacion academica.'
}

export const useAdminStore = create<AdminState>()(
  persist(
    (set, get) => {
      async function runResource<T>(
        key: ResourceKey,
        force: boolean,
        request: () => Promise<T>,
        onSuccess: (payload: T) => Partial<AdminState>,
      ) {
        const state = get()

        if (!force && state.loaded[key]) {
          return
        }
        if (state.loading[key]) {
          return
        }

        set((current) => ({
          error: '',
          loading: { ...current.loading, [key]: true },
        }))

        try {
          const payload = await request()
          set((current) => ({
            ...onSuccess(payload),
            error: '',
            loaded: { ...current.loaded, [key]: true },
            loading: { ...current.loading, [key]: false },
          }))
        } catch (error) {
          set((current) => ({
            error: getErrorMessage(error),
            loading: { ...current.loading, [key]: false },
          }))
        }
      }

      return {
        accessToken: '',
        careerStats: [],
        careers: [],
        courses: [],
        error: '',
        isAuthenticated: false,
        isSidebarOpen: false,
        loaded: initialLoaded,
        loading: {},
        refreshToken: '',
        students: [],
        summary: null,
        teachers: [],
        user: null,
        clearError: () => set({ error: '' }),
        closeSidebar: () => set({ isSidebarOpen: false }),
        loadCareerStats: (force = false) =>
          runResource('careerStats', force, academicApi.getCareerStats, (careerStats) => ({ careerStats })),
        loadCareers: (force = false) =>
          runResource('careers', force, academicApi.getCareers, (careers) => ({ careers })),
        loadCoursesPage: async (force = false) => {
          await Promise.all([get().loadCareers(force), runResource('courses', force, academicApi.getCourses, (courses) => ({ courses }))])
        },
        loadStudentsPage: async (force = false) => {
          await Promise.all([get().loadCareers(force), runResource('students', force, academicApi.getStudents, (students) => ({ students }))])
        },
        loadSummary: (force = false) =>
          runResource('summary', force, academicApi.getSummary, (summary) => ({ summary })),
        loadTeachers: (force = false) =>
          runResource('teachers', force, academicApi.getTeachers, (teachers) => ({ teachers })),
        logout: () =>
          set({
            accessToken: '',
            careerStats: [],
            careers: [],
            courses: [],
            isAuthenticated: false,
            isSidebarOpen: false,
            loaded: initialLoaded,
            refreshToken: '',
            students: [],
            summary: null,
            teachers: [],
            user: null,
          }),
        openSidebar: () => set({ isSidebarOpen: true }),
        signIn: async (email, password) => {
          set({ error: '' })

          try {
            const session = await authApi.login(email, password)

            if (session.user.role !== 'admin') {
              throw new Error('Esta cuenta no tiene permiso para entrar al panel administrativo.')
            }

            set({
              accessToken: session.accessToken,
              error: '',
              isAuthenticated: true,
              loaded: initialLoaded,
              refreshToken: session.refreshToken,
              user: session.user,
            })
          } catch (error) {
            const message = getErrorMessage(error)
            set({ error: message, isAuthenticated: false })
            throw new Error(message)
          }
        },
        toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
      }
    },
    {
      name: 'coordinator-manager-admin',
      partialize: (state) => ({
        accessToken: state.accessToken,
        isAuthenticated: state.isAuthenticated,
        refreshToken: state.refreshToken,
        user: state.user,
      }),
    },
  ),
)
