import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { academicApi } from '../data'
import type { AcademicSummary, Career, CareerStats, Course, Student, Teacher } from '../data'

type ResourceKey = 'summary' | 'teachers' | 'students' | 'careers' | 'courses' | 'careerStats'

type LoadedState = Record<ResourceKey, boolean>

type AdminState = {
  careerStats: CareerStats[]
  careers: Career[]
  courses: Course[]
  error: string
  isAuthenticated: boolean
  isSidebarOpen: boolean
  loading: Partial<Record<ResourceKey, boolean>>
  loaded: LoadedState
  students: Student[]
  summary: AcademicSummary | null
  teachers: Teacher[]
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
  signIn: () => void
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
        careerStats: [],
        careers: [],
        courses: [],
        error: '',
        isAuthenticated: false,
        isSidebarOpen: false,
        loaded: initialLoaded,
        loading: {},
        students: [],
        summary: null,
        teachers: [],
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
        logout: () => set({ isAuthenticated: false, isSidebarOpen: false }),
        openSidebar: () => set({ isSidebarOpen: true }),
        signIn: () => set({ isAuthenticated: true }),
        toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
      }
    },
    {
      name: 'coordinator-manager-admin',
      partialize: (state) => ({
        isAuthenticated: state.isAuthenticated,
      }),
    },
  ),
)
