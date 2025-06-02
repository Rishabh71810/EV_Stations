import axios from 'axios'
import { mockStationsAPI } from './mockApi'

// Create axios instance
const api = axios.create({
  baseURL: 'https://ev-stations-backend.vercel.app/api',
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },
  withCredentials: false // Important for CORS
})

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    // Add CORS headers to every request
    config.headers['Access-Control-Allow-Origin'] = '*'
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
    const response = await api.post('/auth/register', userData)
    return response.data
  },

  async login(credentials) {
    const response = await api.post('/auth/login', credentials)
    return response.data
  },

  async getProfile() {
    const response = await api.get('/auth/me')
    return response.data
  },

  async updateProfile(userData) {
    const response = await api.put('/auth/me', userData)
    return response.data
  },

  async changePassword(passwordData) {
    const response = await api.put('/auth/change-password', passwordData)
    return response.data
  }
}

// Stations API calls
export const stationsAPI = {
  async getStations(params = {}) {
    const response = await api.get('/stations', { params })
    return response.data
  },

  async getStation(id) {
    const response = await api.get(`/stations/${id}`)
    return response.data
  },

  async createStation(stationData) {
    const response = await api.post('/stations', stationData)
    return response.data
  },

  async updateStation(id, stationData) {
    const response = await api.put(`/stations/${id}`, stationData)
    return response.data
  },

  async deleteStation(id) {
    const response = await api.delete(`/stations/${id}`)
    return response.data
  },

  async getStationsByStatus(status) {
    const response = await api.get(`/stations/status/${status}`)
    return response.data
  },

  async getStationsByConnectorType(type) {
    const response = await api.get(`/stations/connector/${type}`)
    return response.data
  },

  async updateStationAvailability(id, availablePorts) {
    const response = await api.patch(`/stations/${id}/availability`, { availablePorts })
    return response.data
  },

  async getStationStats() {
    const response = await api.get('/stations/stats')
    return response.data
  }
}

// Add environment info for debugging
console.log('🔧 API Configuration:', {
  baseURL: api.defaults.baseURL,
  headers: api.defaults.headers
})

export default api 