import axios from 'axios'
import { useAuthStore } from '../stores/authStore'
import { getErrorMessage } from './errorHandler'

const api = axios.create({
  baseURL: '/api',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const { accessToken } = useAuthStore.getState()
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor to handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    // If error is 401 and we haven't already tried to refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true

      try {
        const { refreshToken, logout } = useAuthStore.getState()
        
        if (!refreshToken) {
          logout()
          return Promise.reject(error)
        }

        // Try to refresh token
        const response = await axios.post('/api/auth/refresh', {
          refreshToken,
        })

        const { accessToken, refreshToken: newRefreshToken } = response.data.data

        // Update store
        useAuthStore.setState({
          accessToken,
          refreshToken: newRefreshToken,
        })

        // Retry original request with new token
        originalRequest.headers.Authorization = `Bearer ${accessToken}`
        return api(originalRequest)
      } catch (refreshError) {
        // Refresh failed, logout
        const { logout } = useAuthStore.getState()
        logout()
        return Promise.reject(refreshError)
      }
    }

    // Enhance error with user-friendly message
    error.userMessage = getErrorMessage(error)
    return Promise.reject(error)
  }
)

/**
 * Wrapper that provides standardized error handling for API calls.
 * Use in components for automatic user-friendly error messages.
 */
api.handleError = (error, customMessage) => {
  return customMessage || error.userMessage || getErrorMessage(error)
}

/**
 * GET with automatic retry on network/server errors (max 2 retries).
 */
api.getWithRetry = async (url, config = {}, retries = 2) => {
  for (let i = 0; i <= retries; i++) {
    try {
      return await api.get(url, config)
    } catch (error) {
      const isLastAttempt = i === retries
      const isRetryable = !error.response || error.response.status >= 500 || error.response.status === 429

      if (isLastAttempt || !isRetryable) {
        error.userMessage = getErrorMessage(error)
        throw error
      }

      // Exponential backoff: 1s, 2s
      await new Promise((resolve) => setTimeout(resolve, 1000 * Math.pow(2, i)))
    }
  }
}

export default api
