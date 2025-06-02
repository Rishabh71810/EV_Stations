import { defineStore } from 'pinia'
import { stationsAPI } from '@/services/api'

export const useStationsStore = defineStore('stations', {
  state: () => ({
    stations: [],
    currentStation: null,
    loading: false,
    error: null,
    filters: {
      status: '',
      connectorType: '',
      minPowerOutput: '',
      maxPowerOutput: '',
      location: null,
      radius: 10
    },
    pagination: {
      currentPage: 1,
      totalPages: 1,
      totalStations: 0,
      hasNextPage: false,
      hasPrevPage: false
    },
    statistics: null
  }),

  getters: {
    activeStations: (state) => state.stations.filter(station => station.status === 'Active'),
    availableStations: (state) => state.stations.filter(station => 
      station.status === 'Active' && station.availablePorts > 0
    ),
    filteredStations: (state) => {
      let filtered = [...state.stations]
      
      if (state.filters.status) {
        filtered = filtered.filter(station => station.status === state.filters.status)
      }
      
      if (state.filters.connectorType) {
        filtered = filtered.filter(station => station.connectorType === state.filters.connectorType)
      }
      
      if (state.filters.minPowerOutput) {
        filtered = filtered.filter(station => station.powerOutput >= state.filters.minPowerOutput)
      }
      
      if (state.filters.maxPowerOutput) {
        filtered = filtered.filter(station => station.powerOutput <= state.filters.maxPowerOutput)
      }
      
      return filtered
    }
  },

  actions: {
    async fetchStations(params = {}) {
      try {
        this.loading = true
        this.error = null
        
        const queryParams = {
          ...params,
          ...this.filters,
          page: this.pagination.currentPage
        }
        
        const response = await stationsAPI.getStations(queryParams)
        
        if (response.success) {
          this.stations = response.data.stations
          this.pagination = response.data.pagination
        }
        
        return response
      } catch (error) {
        this.error = error.response?.data?.message || 'Failed to fetch stations'
        throw error
      } finally {
        this.loading = false
      }
    },

    async fetchStation(id) {
      try {
        this.loading = true
        this.error = null
        
        const response = await stationsAPI.getStation(id)
        
        if (response.success) {
          this.currentStation = response.data.station
        }
        
        return response
      } catch (error) {
        this.error = error.response?.data?.message || 'Failed to fetch station'
        throw error
      } finally {
        this.loading = false
      }
    },

    async createStation(stationData) {
      try {
        this.loading = true
        this.error = null
        
        const response = await stationsAPI.createStation(stationData)
        
        if (response.success) {
          this.stations.unshift(response.data.station)
        }
        
        return response
      } catch (error) {
        this.error = error.response?.data?.message || 'Failed to create station'
        throw error
      } finally {
        this.loading = false
      }
    },

    async updateStation(id, stationData) {
      try {
        this.loading = true
        this.error = null
        
        const response = await stationsAPI.updateStation(id, stationData)
        
        if (response.success) {
          const index = this.stations.findIndex(station => station._id === id)
          if (index !== -1) {
            this.stations[index] = response.data.station
          }
          
          if (this.currentStation && this.currentStation._id === id) {
            this.currentStation = response.data.station
          }
        }
        
        return response
      } catch (error) {
        this.error = error.response?.data?.message || 'Failed to update station'
        throw error
      } finally {
        this.loading = false
      }
    },

    async deleteStation(id) {
      try {
        this.loading = true
        this.error = null
        
        const response = await stationsAPI.deleteStation(id)
        
        if (response.success) {
          this.stations = this.stations.filter(station => station._id !== id)
          
          if (this.currentStation && this.currentStation._id === id) {
            this.currentStation = null
          }
        }
        
        return response
      } catch (error) {
        this.error = error.response?.data?.message || 'Failed to delete station'
        throw error
      } finally {
        this.loading = false
      }
    },

    async fetchStationStats() {
      try {
        const response = await stationsAPI.getStationStats()
        
        if (response.success) {
          this.statistics = response.data
        }
        
        return response
      } catch (error) {
        console.error('Failed to fetch station statistics:', error)
      }
    },

    setFilters(filters) {
      this.filters = { ...this.filters, ...filters }
      this.pagination.currentPage = 1
    },

    clearFilters() {
      this.filters = {
        status: '',
        connectorType: '',
        minPowerOutput: '',
        maxPowerOutput: '',
        location: null,
        radius: 10
      }
      this.pagination.currentPage = 1
    },

    setPage(page) {
      this.pagination.currentPage = page
    },

    clearError() {
      this.error = null
    },

    clearCurrentStation() {
      this.currentStation = null
    }
  }
}) 