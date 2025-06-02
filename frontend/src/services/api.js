import axios from 'axios'
import { mockStationsAPI } from './mockApi'

// Detect if we're in production and should use mock API
const isProduction = import.meta.env.PROD
const useLocalBackend = import.meta.env.VITE_USE_LOCAL_BACKEND === 'true'
const useMockAPI = isProduction && !useLocalBackend

// Create axios instance only if we're not using mock API
let api = null
if (!useMockAPI) {
  api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api',
    timeout: 10000,
    headers: {
      'Content-Type': 'application/json'
    }
  })

  // Request interceptor to add auth token
  api.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem('token')
      if (token) {
        config.headers.Authorization = `Bearer ${token}`
      }
      return config
    },
    (error) => {
      return Promise.reject(error)
    }
  )

  // Response interceptor to handle errors
  api.interceptors.response.use(
    (response) => {
      return response
    },
    (error) => {
      if (error.response?.status === 401) {
        // Token expired or invalid
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        window.location.href = '/login'
      }
      return Promise.reject(error)
    }
  )
}

// Mock user for demo purposes
const mockUser = {
  id: 'demo-user-1',
  name: 'Demo User',
  email: 'demo@example.com',
  role: 'user',
  createdAt: new Date().toISOString()
}

// Auth API calls
export const authAPI = {
  async register(userData) {
    if (useMockAPI) {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Simple validation
      if (!userData.name || !userData.email || !userData.password) {
        throw new Error('All fields are required')
      }
      
      // Simulate successful registration
      const token = 'demo-token-' + Date.now()
      localStorage.setItem('token', token)
      localStorage.setItem('user', JSON.stringify(mockUser))
      
      return {
        success: true,
        message: 'User registered successfully (Demo Mode)',
        data: {
          user: mockUser,
          token
        }
      }
    }

    const response = await api.post('/auth/register', userData)
    return response.data
  },

  async login(credentials) {
    if (useMockAPI) {
      await new Promise(resolve => setTimeout(resolve, 800))
      
      // Accept any email/password for demo
      const token = 'demo-token-' + Date.now()
      localStorage.setItem('token', token)
      localStorage.setItem('user', JSON.stringify(mockUser))
      
      return {
        success: true,
        message: 'Login successful (Demo Mode)',
        data: {
          user: mockUser,
          token
        }
      }
    }

    const response = await api.post('/auth/login', credentials)
    return response.data
  },

  async getProfile() {
    if (useMockAPI) {
      await new Promise(resolve => setTimeout(resolve, 300))
      return {
        success: true,
        data: {
          user: mockUser
        }
      }
    }

    const response = await api.get('/auth/me')
    return response.data
  },

  async updateProfile(userData) {
    if (useMockAPI) {
      await new Promise(resolve => setTimeout(resolve, 500))
      const updatedUser = { ...mockUser, ...userData }
      localStorage.setItem('user', JSON.stringify(updatedUser))
      
      return {
        success: true,
        message: 'Profile updated successfully (Demo Mode)',
        data: {
          user: updatedUser
        }
      }
    }

    const response = await api.put('/auth/me', userData)
    return response.data
  },

  async changePassword(passwordData) {
    if (useMockAPI) {
      await new Promise(resolve => setTimeout(resolve, 600))
      return {
        success: true,
        message: 'Password changed successfully (Demo Mode)'
      }
    }

    const response = await api.put('/auth/change-password', passwordData)
    return response.data
  }
}

// Stations API calls
export const stationsAPI = {
  async getStations(params = {}) {
    if (useMockAPI) {
      return await mockStationsAPI.getStations(params)
    }

    const response = await api.get('/stations', { params })
    return response.data
  },

  async getStation(id) {
    if (useMockAPI) {
      return await mockStationsAPI.getStation(id)
    }

    const response = await api.get(`/stations/${id}`)
    return response.data
  },

  async createStation(stationData) {
    if (useMockAPI) {
      await new Promise(resolve => setTimeout(resolve, 800))
      return {
        success: true,
        message: 'Station created successfully (Demo Mode - changes not saved)',
        data: {
          station: {
            _id: 'demo-' + Date.now(),
            ...stationData,
            createdAt: new Date().toISOString()
          }
        }
      }
    }

    const response = await api.post('/stations', stationData)
    return response.data
  },

  async updateStation(id, stationData) {
    if (useMockAPI) {
      await new Promise(resolve => setTimeout(resolve, 700))
      return {
        success: true,
        message: 'Station updated successfully (Demo Mode - changes not saved)',
        data: {
          station: {
            _id: id,
            ...stationData,
            updatedAt: new Date().toISOString()
          }
        }
      }
    }

    const response = await api.put(`/stations/${id}`, stationData)
    return response.data
  },

  async deleteStation(id) {
    if (useMockAPI) {
      await new Promise(resolve => setTimeout(resolve, 500))
      return {
        success: true,
        message: 'Station deleted successfully (Demo Mode - not actually deleted)'
      }
    }

    const response = await api.delete(`/stations/${id}`)
    return response.data
  },

  async getStationsByStatus(status) {
    if (useMockAPI) {
      const allStations = await mockStationsAPI.getStations()
      const filteredStations = allStations.data.stations.filter(s => s.status === status)
      return {
        success: true,
        data: {
          stations: filteredStations
        }
      }
    }

    const response = await api.get(`/stations/status/${status}`)
    return response.data
  },

  async getStationsByConnectorType(type) {
    if (useMockAPI) {
      const allStations = await mockStationsAPI.getStations()
      const filteredStations = allStations.data.stations.filter(s => s.connectorType === type)
      return {
        success: true,
        data: {
          stations: filteredStations
        }
      }
    }

    const response = await api.get(`/stations/connector/${type}`)
    return response.data
  },

  async updateStationAvailability(id, availablePorts) {
    if (useMockAPI) {
      await new Promise(resolve => setTimeout(resolve, 400))
      return {
        success: true,
        message: 'Station availability updated (Demo Mode)'
      }
    }

    const response = await api.patch(`/stations/${id}/availability`, { availablePorts })
    return response.data
  },

  async getStationStats() {
    if (useMockAPI) {
      return await mockStationsAPI.getStationStats()
    }

    const response = await api.get('/stations/stats')
    return response.data
  }
}

// Add environment info for debugging
console.log('🔧 API Configuration:', {
  isProduction,
  useMockAPI,
  baseURL: useMockAPI ? 'Mock API' : (import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api')
})

export default api 