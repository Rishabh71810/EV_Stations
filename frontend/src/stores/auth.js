import { defineStore } from 'pinia'
import { authAPI } from '@/services/api'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    token: null,
    isAuthenticated: false,
    loading: false,
    error: null
  }),

  getters: {
    currentUser: (state) => state.user,
    isLoggedIn: (state) => state.isAuthenticated && !!state.token
  },

  actions: {
    async login(credentials) {
      try {
        this.loading = true
        this.error = null
        
        const response = await authAPI.login(credentials)
        
        if (response.success) {
          this.user = response.data.user
          this.token = response.data.token
          this.isAuthenticated = true
          
          // Store in localStorage
          localStorage.setItem('token', this.token)
          localStorage.setItem('user', JSON.stringify(this.user))
          
          return response
        }
      } catch (error) {
        this.error = error.response?.data?.message || 'Login failed'
        throw error
      } finally {
        this.loading = false
      }
    },

    async register(userData) {
      try {
        this.loading = true
        this.error = null
        
        const response = await authAPI.register(userData)
        
        if (response.success) {
          this.user = response.data.user
          this.token = response.data.token
          this.isAuthenticated = true
          
          // Store in localStorage
          localStorage.setItem('token', this.token)
          localStorage.setItem('user', JSON.stringify(this.user))
          
          return response
        }
      } catch (error) {
        this.error = error.response?.data?.message || 'Registration failed'
        throw error
      } finally {
        this.loading = false
      }
    },

    async loadStoredAuth() {
      const token = localStorage.getItem('token')
      const user = localStorage.getItem('user')
      
      if (token && user) {
        this.token = token
        this.user = JSON.parse(user)
        this.isAuthenticated = true
        
        // Verify token is still valid
        try {
          await authAPI.getProfile()
        } catch (error) {
          // Token invalid, logout
          this.logout()
        }
      }
    },

    async updateProfile(userData) {
      try {
        this.loading = true
        this.error = null
        
        const response = await authAPI.updateProfile(userData)
        
        if (response.success) {
          this.user = response.data.user
          localStorage.setItem('user', JSON.stringify(this.user))
          return response
        }
      } catch (error) {
        this.error = error.response?.data?.message || 'Profile update failed'
        throw error
      } finally {
        this.loading = false
      }
    },

    logout() {
      this.user = null
      this.token = null
      this.isAuthenticated = false
      
      // Remove from localStorage
      localStorage.removeItem('token')
      localStorage.removeItem('user')
    },

    clearError() {
      this.error = null
    }
  }
}) 