import { create } from 'zustand'
import api from '../services/api'

export const useNotificationStore = create((set, get) => ({
  // State
  notifications: [],
  unreadCount: 0,
  isLoading: false,
  error: null,

  // Actions
  clearError: () => set({ error: null }),

  fetchNotifications: async (page = 0, size = 20) => {
    set({ isLoading: true, error: null })
    try {
      const response = await api.get('/notifications', { params: { page, size } })
      const pageData = response.data.data
      
      if (page === 0) {
        set({ notifications: pageData.content })
      } else {
        set((state) => ({
          notifications: [...state.notifications, ...pageData.content],
        }))
      }
      
      set({ isLoading: false })
      return pageData
    } catch (error) {
      set({
        error: error.response?.data?.message || 'Failed to fetch notifications',
        isLoading: false,
      })
      return null
    }
  },

  fetchUnreadCount: async () => {
    try {
      const response = await api.get('/notifications/count-unread')
      set({ unreadCount: response.data.data })
      return response.data.data
    } catch (error) {
      console.error('Failed to fetch unread count:', error)
      return 0
    }
  },

  markAsRead: async (notificationId) => {
    try {
      await api.patch(`/notifications/${notificationId}/read`)
      
      set((state) => ({
        notifications: state.notifications.map((n) =>
          n.id === notificationId ? { ...n, isRead: true } : n
        ),
        unreadCount: Math.max(0, state.unreadCount - 1),
      }))
      
      return true
    } catch (error) {
      console.error('Failed to mark as read:', error)
      return false
    }
  },

  markAllAsRead: async () => {
    try {
      await api.patch('/notifications/read-all')
      
      set((state) => ({
        notifications: state.notifications.map((n) => ({ ...n, isRead: true })),
        unreadCount: 0,
      }))
      
      return true
    } catch (error) {
      console.error('Failed to mark all as read:', error)
      return false
    }
  },

  addNotification: (notification) => {
    set((state) => ({
      notifications: [notification, ...state.notifications],
      unreadCount: state.unreadCount + 1,
    }))
  },

  clearNotifications: () => {
    set({ notifications: [], unreadCount: 0 })
  },
}))
