import { create } from 'zustand'
import { academicApi } from '../data'
import type { StudentContext } from '../data'

type StudentState = {
  context: StudentContext | null
  error: string
  isLoading: boolean
  loadContext: (force?: boolean) => Promise<void>
  resetStudentState: () => void
}

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : 'No se pudo cargar la informacion del alumno.'
}

export const useStudentStore = create<StudentState>()((set, get) => ({
  context: null,
  error: '',
  isLoading: false,
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
  resetStudentState: () => set({ context: null, error: '', isLoading: false }),
}))
