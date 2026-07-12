import { create } from 'zustand'
import { academicApi } from '../data'
import type { StudentContext, StudentScheduleProposal } from '../data'

type StudentState = {
  context: StudentContext | null
  error: string
  isLoading: boolean
  isScheduleLoading: boolean
  loadContext: (force?: boolean) => Promise<void>
  loadScheduleProposal: (force?: boolean, proposalId?: number) => Promise<void>
  resetStudentState: () => void
  scheduleProposal: StudentScheduleProposal | null
}

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : 'No se pudo cargar la informacion del alumno.'
}

export const useStudentStore = create<StudentState>()((set, get) => ({
  context: null,
  error: '',
  isLoading: false,
  isScheduleLoading: false,
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
  resetStudentState: () =>
    set({
      context: null,
      error: '',
      isLoading: false,
      isScheduleLoading: false,
      scheduleProposal: null,
    }),
}))
