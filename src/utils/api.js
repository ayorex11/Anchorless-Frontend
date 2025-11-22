import { useAuthStore } from '@/stores/auth'
import router from '@/router'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'

export async function apiRequest(endpoint, options = {}) {
  const authStore = useAuthStore()
  
  // Add default headers
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers
  }

  // Add auth token if available
  if (authStore.accessToken) {
    headers['Authorization'] = `Bearer ${authStore.accessToken}`
  }

  try {
    let response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers
    })

    // If token expired, try to refresh
    if (response.status === 401 && authStore.refreshToken) {
      const refreshed = await authStore.refreshAccessToken()
      
      if (refreshed) {
        // Retry request with new token
        headers['Authorization'] = `Bearer ${authStore.accessToken}`
        response = await fetch(`${API_BASE_URL}${endpoint}`, {
          ...options,
          headers
        })
      } else {
        // Refresh failed, redirect to login
        authStore.clearAuth()
        router.push('/login')
        throw new Error('Session expired. Please login again.')
      }
    }

    return response
  } catch (error) {
    console.error('API request error:', error)
    throw error
  }
}

// Convenience methods
export const api = {
  get: (endpoint, options = {}) => apiRequest(endpoint, { ...options, method: 'GET' }),
  post: (endpoint, data, options = {}) => apiRequest(endpoint, { 
    ...options, 
    method: 'POST',
    body: JSON.stringify(data)
  }),
  put: (endpoint, data, options = {}) => apiRequest(endpoint, { 
    ...options, 
    method: 'PUT',
    body: JSON.stringify(data)
  }),
  patch: (endpoint, data, options = {}) => apiRequest(endpoint, { 
    ...options, 
    method: 'PATCH',
    body: JSON.stringify(data)
  }),
  delete: (endpoint, options = {}) => apiRequest(endpoint, { ...options, method: 'DELETE' }),
}