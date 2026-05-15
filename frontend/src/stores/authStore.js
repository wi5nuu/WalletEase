import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import api from '../services/api'

export const useAuthStore = create(
  persist(
    (set, get) => ({
      // State
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      // Actions
      setError: (error) => set({ error }),
      clearError: () => set({ error: null }),

      checkAuth: () => {
        const { accessToken } = get()
        if (accessToken) {
          set({ isAuthenticated: true })
          // Optionally fetch current user data
          get().fetchCurrentUser()
        }
      },

      fetchCurrentUser: async () => {
        try {
          const response = await api.get('/users/me')
          set({ user: response.data.data })
        } catch (error) {
          console.error('Failed to fetch user:', error)
        }
      },

      register: async (data) => {
        set({ isLoading: true, error: null })
        try {
          const response = await api.post('/auth/register', data)
          const { accessToken, refreshToken, user } = response.data.data
          
          set({
            user,
            accessToken,
            refreshToken,
            isAuthenticated: true,
            isLoading: false,
          })
          
          return { success: true, hasPin: user.hasPin }
        } catch (error) {
          set({
            error: error.response?.data?.message || 'Registration failed',
            isLoading: false,
          })
          return { success: false }
        }
      },

      login: async (data) => {
        set({ isLoading: true, error: null })
        try {
          const response = await api.post('/auth/login', data)
          const { accessToken, refreshToken, user } = response.data.data
          
          set({
            user,
            accessToken,
            refreshToken,
            isAuthenticated: true,
            isLoading: false,
          })
          
          return { success: true, hasPin: user.hasPin }
        } catch (error) {
          set({
            error: error.response?.data?.message || 'Login failed',
            isLoading: false,
          })
          return { success: false }
        }
      },

      logout: async () => {
        try {
          const { refreshToken } = get()
          if (refreshToken) {
            await api.post('/auth/logout', null, {
              headers: { 'X-Refresh-Token': refreshToken },
            })
          }
        } catch (error) {
          console.error('Logout error:', error)
        } finally {
          set({
            user: null,
            accessToken: null,
            refreshToken: null,
            isAuthenticated: false,
            error: null,
          })
        }
      },

      setupPin: async (pin, confirmPin) => {
        set({ isLoading: true, error: null })
        try {
          const { user } = get()
          await api.post('/auth/setup-pin', { pin, confirmPin }, {
            headers: { 'X-Username': user.username },
          })
          
          set({
            user: { ...user, hasPin: true },
            isLoading: false,
          })
          
          return { success: true }
        } catch (error) {
          set({
            error: error.response?.data?.message || 'PIN setup failed',
            isLoading: false,
          })
          return { success: false }
        }
      },

      updateUser: (updates) => {
        set((state) => ({
          user: state.user ? { ...state.user, ...updates } : null,
        }))
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ 
        user: state.user, 
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
)
