import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { AUTH_STORAGE_KEY, authApi } from '../data'
import type { AuthSession, AuthUser } from '../data'

type AuthState = {
  accessToken: string
  error: string
  isAuthenticated: boolean
  refreshToken: string
  user: AuthUser | null
  clearError: () => void
  logout: () => void
  signIn: (identifier: string, password: string) => Promise<AuthUser>
}

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : 'No se pudo completar la autenticacion.'
}

function toAuthState(session: AuthSession) {
  return {
    accessToken: session.accessToken,
    error: '',
    isAuthenticated: true,
    refreshToken: session.refreshToken,
    user: session.user,
  }
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      accessToken: '',
      error: '',
      isAuthenticated: false,
      refreshToken: '',
      user: null,
      clearError: () => set({ error: '' }),
      logout: () =>
        set({
          accessToken: '',
          error: '',
          isAuthenticated: false,
          refreshToken: '',
          user: null,
        }),
      signIn: async (identifier, password) => {
        set({ error: '' })

        try {
          const session = await authApi.login(identifier, password)
          set(toAuthState(session))
          return session.user
        } catch (error) {
          const message = getErrorMessage(error)
          set({ error: message, isAuthenticated: false })
          throw new Error(message)
        }
      },
    }),
    {
      name: AUTH_STORAGE_KEY,
      partialize: (state) => ({
        accessToken: state.accessToken,
        isAuthenticated: state.isAuthenticated,
        refreshToken: state.refreshToken,
        user: state.user,
      }),
    },
  ),
)
