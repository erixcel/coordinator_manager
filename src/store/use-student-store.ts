import { create } from 'zustand'
import { academicApi } from '../data'
import type { Course, StudentConfirmedEnrollment, StudentContext, StudentEnrollmentOptions, StudentScheduleProposal } from '../data'

type StudentState = {
  context: StudentContext | null
  courses: Course[]
  error: string
  enrollmentOptions: StudentEnrollmentOptions | null
  confirmedEnrollment: StudentConfirmedEnrollment | null
  isLoading: boolean
  isScheduleLoading: boolean
  isCoursesLoading: boolean
  isEnrollmentLoading: boolean
  loadContext: (force?: boolean) => Promise<void>
  loadCourses: (force?: boolean) => Promise<void>
  loadEnrollmentOptions: (force?: boolean) => Promise<void>
  loadConfirmedEnrollment: (force?: boolean) => Promise<void>
  loadScheduleProposal: (force?: boolean, proposalId?: number) => Promise<void>
  resetStudentState: () => void
  saveEnrollment: (sectionIds: number[]) => Promise<void>
  scheduleProposal: StudentScheduleProposal | null
}

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : 'No se pudo cargar la informacion del alumno.'
}

export const useStudentStore = create<StudentState>()((set, get) => ({
  context: null,
  confirmedEnrollment: null,
  courses: [],
  error: '',
  enrollmentOptions: null,
  isLoading: false,
  isScheduleLoading: false,
  isCoursesLoading: false,
  isEnrollmentLoading: false,
  scheduleProposal: null,
  loadContext: async (force = false) => {
    const state = get()

    if (!force && state.context) {
      return
    }
    if (state.isLoading) {
      return
    }

    set({ error: '', isLoading: true })

    try {
      const context = await academicApi.getStudentContext()
      set({ context, error: '', isLoading: false })
    } catch (error) {
      set({ error: getErrorMessage(error), isLoading: false })
    }
  },
  loadScheduleProposal: async (force = false, proposalId) => {
    const state = get()

    if (!force && state.scheduleProposal) {
      return
    }
    if (state.isScheduleLoading) {
      return
    }

    set({ error: '', isScheduleLoading: true })

    try {
      const scheduleProposal = await academicApi.getStudentScheduleProposal(proposalId)
      set({ scheduleProposal, error: '', isScheduleLoading: false })
    } catch (error) {
      set({ error: getErrorMessage(error), isScheduleLoading: false })
    }
  },
  loadCourses: async (force = false) => {
    const state = get()

    if (!force && state.courses.length) return
    if (state.isCoursesLoading) return

    set({ error: '', isCoursesLoading: true })

    try {
      let context = state.context
      if (!context) {
        context = await academicApi.getStudentContext()
      }
      const careerId = context.student?.carrera_id
      const courses = careerId ? await academicApi.getCourses({ careerId }) : []
      set({ context, courses, error: '', isCoursesLoading: false })
    } catch (error) {
      set({ error: getErrorMessage(error), isCoursesLoading: false })
    }
  },
  loadConfirmedEnrollment: async (force = false) => {
    const state = get()

    if (!force && state.confirmedEnrollment) return

    set({ error: '', isCoursesLoading: true, isScheduleLoading: true })

    try {
      const confirmedEnrollment = await academicApi.getStudentEnrollments()
      set({ confirmedEnrollment, error: '', isCoursesLoading: false, isScheduleLoading: false })
    } catch (error) {
      set({ error: getErrorMessage(error), isCoursesLoading: false, isScheduleLoading: false })
    }
  },
  loadEnrollmentOptions: async (force = false) => {
    const state = get()

    if (!force && state.enrollmentOptions) return
    if (state.isEnrollmentLoading) return

    set({ error: '', isEnrollmentLoading: true })

    try {
      const enrollmentOptions = await academicApi.getStudentEnrollmentOptions()
      set({ enrollmentOptions, error: '', isEnrollmentLoading: false })
    } catch (error) {
      set({ error: getErrorMessage(error), isEnrollmentLoading: false })
    }
  },
  saveEnrollment: async (sectionIds) => {
    set({ error: '', isEnrollmentLoading: true })

    try {
      const confirmedEnrollment = await academicApi.saveStudentEnrollment(sectionIds)
      const enrollmentOptions = await academicApi.getStudentEnrollmentOptions()
      set({
        confirmedEnrollment,
        enrollmentOptions,
        error: '',
        isEnrollmentLoading: false,
        scheduleProposal: null,
      })
    } catch (error) {
      set({ error: getErrorMessage(error), isEnrollmentLoading: false })
      throw error
    }
  },
  resetStudentState: () =>
    set({
      context: null,
      confirmedEnrollment: null,
      courses: [],
      error: '',
      enrollmentOptions: null,
      isLoading: false,
      isScheduleLoading: false,
      isCoursesLoading: false,
      isEnrollmentLoading: false,
      scheduleProposal: null,
    }),
}))
