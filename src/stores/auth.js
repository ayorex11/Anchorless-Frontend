import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useAuthStore = defineStore('auth', () => {
  // State
  const accessToken = ref(localStorage.getItem('accessToken') || null)
  const refreshToken = ref(localStorage.getItem('refreshToken') || null)
  const user = ref(JSON.parse(localStorage.getItem('user') || 'null'))
  const accessExpires = ref(localStorage.getItem('accessExpires') || null)
  const refreshExpires = ref(localStorage.getItem('refreshExpires') || null)

  // Getters
  const isAuthenticated = computed(() => {
    if (!accessToken.value || !accessExpires.value) return false
    
    // Check if token is expired
    const now = Math.floor(Date.now() / 1000)
    return now < parseInt(accessExpires.value)
  })

  const getUser = computed(() => user.value)

  // Actions
  function setAuth(data) {
    accessToken.value = data.accessToken
    refreshToken.value = data.refreshToken
    user.value = data.user
    accessExpires.value = data.accessExpires
    refreshExpires.value = data.refreshExpires

    // Persist to localStorage
    localStorage.setItem('accessToken', data.accessToken)
    localStorage.setItem('refreshToken', data.refreshToken)
    localStorage.setItem('user', JSON.stringify(data.user))
    localStorage.setItem('accessExpires', data.accessExpires)
    localStorage.setItem('refreshExpires', data.refreshExpires)
  }

  function clearAuth() {
    accessToken.value = null
    refreshToken.value = null
    user.value = null
    accessExpires.value = null
    refreshExpires.value = null

    // Clear localStorage
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
    localStorage.removeItem('user')
    localStorage.removeItem('accessExpires')
    localStorage.removeItem('refreshExpires')
  }

  async function refreshAccessToken() {
    if (!refreshToken.value) {
      clearAuth()
      return false
    }

    try {
      const response = await fetch('http://localhost:8000/auth/token/refresh/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          refresh: refreshToken.value
        })
      })

      if (!response.ok) {
        clearAuth()
        return false
      }

      const data = await response.json()
      
      // Update access token
      accessToken.value = data.access
      accessExpires.value = data.access_expires || (Math.floor(Date.now() / 1000) + 3600)
      
      localStorage.setItem('accessToken', data.access)
      localStorage.setItem('accessExpires', accessExpires.value)

      return true
    } catch (error) {
      console.error('Token refresh error:', error)
      clearAuth()
      return false
    }
  }

  function logout() {
    clearAuth()
  }

  return {
    // State
    accessToken,
    refreshToken,
    user,
    accessExpires,
    refreshExpires,
    
    // Getters
    isAuthenticated,
    getUser,
    
    // Actions
    setAuth,
    clearAuth,
    refreshAccessToken,
    logout
  }
})