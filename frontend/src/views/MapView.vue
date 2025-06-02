<template>
  <div class="px-4 py-6 sm:px-0">
    <!-- Page Header -->
    <div class="mb-6">
      <h1 class="text-3xl font-bold text-gray-900">Station Map</h1>
      <p class="mt-2 text-sm text-gray-700">
        View charging stations on an interactive map
      </p>
    </div>

    <!-- Map Controls -->
    <div class="card mb-6">
      <div class="card-body">
        <div class="flex flex-wrap gap-4 items-center">
          <div>
            <label for="statusFilter" class="block text-sm font-medium text-gray-700 mb-1">
              Filter by Status
            </label>
            <select 
              id="statusFilter" 
              v-model="filters.status" 
              @change="applyFilters"
              class="form-select text-sm"
            >
              <option value="">All Statuses</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
              <option value="Maintenance">Maintenance</option>
              <option value="Out of Order">Out of Order</option>
            </select>
          </div>
          
          <div>
            <label for="connectorFilter" class="block text-sm font-medium text-gray-700 mb-1">
              Filter by Connector
            </label>
            <select 
              id="connectorFilter" 
              v-model="filters.connectorType" 
              @change="applyFilters"
              class="form-select text-sm"
            >
              <option value="">All Connectors</option>
              <option value="Type 1">Type 1</option>
              <option value="Type 2">Type 2</option>
              <option value="CCS1">CCS1</option>
              <option value="CCS2">CCS2</option>
              <option value="CHAdeMO">CHAdeMO</option>
              <option value="Tesla Supercharger">Tesla Supercharger</option>
              <option value="GB/T">GB/T</option>
            </select>
          </div>
          
          <div>
            <button 
              @click="clearFilters" 
              class="btn-secondary btn-sm mt-6"
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Map Container -->
    <div class="card">
      <div class="card-body p-0">
        <div 
          ref="mapContainer" 
          class="w-full h-96 rounded-lg"
          style="min-height: 500px;"
        >
          <!-- Fallback content when Google Maps is not available -->
          <div v-if="!isMapLoaded" class="w-full h-full flex items-center justify-center bg-gray-100 rounded-lg">
            <div class="text-center">
              <div v-if="loading" class="mb-4">
                <div class="spinner w-8 h-8 mx-auto"></div>
                <p class="text-gray-600 mt-2">Loading map...</p>
              </div>
              <div v-else-if="mapError" class="text-red-600">
                <i class="fas fa-exclamation-triangle text-2xl mb-2"></i>
                <p class="font-medium">Map unavailable</p>
                <p class="text-sm">{{ mapError }}</p>
              </div>
              <div v-else>
                <i class="fas fa-map text-gray-400 text-4xl mb-4"></i>
                <p class="text-gray-600 font-medium">Interactive Map</p>
                <p class="text-gray-500 text-sm">Google Maps integration will be available here</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Station Info Panel -->
    <div v-if="selectedStation" class="fixed bottom-4 right-4 w-80 card shadow-lg">
      <div class="card-header flex items-center justify-between">
        <h3 class="font-medium text-gray-900">{{ selectedStation.name }}</h3>
        <button @click="selectedStation = null" class="text-gray-400 hover:text-gray-600">
          <i class="fas fa-times"></i>
        </button>
      </div>
      <div class="card-body">
        <div class="space-y-2">
          <div class="flex items-center justify-between">
            <span class="text-sm text-gray-600">Status:</span>
            <span 
              class="badge"
              :class="{
                'badge-success': selectedStation.status === 'Active',
                'badge-danger': selectedStation.status === 'Inactive' || selectedStation.status === 'Out of Order',
                'badge-warning': selectedStation.status === 'Maintenance'
              }"
            >
              {{ selectedStation.status }}
            </span>
          </div>
          <div class="flex items-center justify-between">
            <span class="text-sm text-gray-600">Connector:</span>
            <span class="text-sm text-gray-900">{{ selectedStation.connectorType }}</span>
          </div>
          <div class="flex items-center justify-between">
            <span class="text-sm text-gray-600">Power:</span>
            <span class="text-sm text-gray-900">{{ selectedStation.powerOutput }}kW</span>
          </div>
          <div class="flex items-center justify-between">
            <span class="text-sm text-gray-600">Ports:</span>
            <span class="text-sm text-gray-900">
              {{ selectedStation.availablePorts }}/{{ selectedStation.totalPorts }}
            </span>
          </div>
        </div>
        <div class="mt-4 flex space-x-2">
          <router-link 
            :to="`/stations/${selectedStation._id}`"
            class="btn-primary btn-sm flex-1"
          >
            View Details
          </router-link>
          <router-link 
            :to="`/stations/${selectedStation._id}/edit`"
            class="btn-secondary btn-sm flex-1"
          >
            Edit
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, reactive, computed, onMounted, onUnmounted } from 'vue'
import { useStationsStore } from '@/stores/stations'

export default {
  name: 'MapView',
  setup() {
    const stationsStore = useStationsStore()
    
    // Reactive state
    const mapContainer = ref(null)
    const map = ref(null)
    const markers = ref([])
    const selectedStation = ref(null)
    const isMapLoaded = ref(false)
    const loading = ref(true)
    const mapError = ref(null)
    
    const filters = reactive({
      status: '',
      connectorType: ''
    })

    // Computed properties
    const stations = computed(() => stationsStore.stations)
    const filteredStations = computed(() => {
      let filtered = [...stations.value]
      
      if (filters.status) {
        filtered = filtered.filter(station => station.status === filters.status)
      }
      
      if (filters.connectorType) {
        filtered = filtered.filter(station => station.connectorType === filters.connectorType)
      }
      
      return filtered
    })

    // Google Maps integration (placeholder implementation)
    const initializeMap = async () => {
      loading.value = true
      mapError.value = null
      
      try {
        // Check if Google Maps API is available
        if (typeof google === 'undefined' || !google.maps) {
          throw new Error('Google Maps API not loaded. Add your API key to environment variables.')
        }
        
        // Initialize map
        map.value = new google.maps.Map(mapContainer.value, {
          center: { lat: 37.7749, lng: -122.4194 }, // Default to San Francisco
          zoom: 10,
          styles: [
            {
              featureType: "poi",
              elementType: "labels",
              stylers: [{ visibility: "off" }]
            }
          ]
        })
        
        isMapLoaded.value = true
        await loadStationsOnMap()
        
      } catch (error) {
        console.error('Failed to initialize Google Maps:', error)
        mapError.value = error.message
        // Fallback: show stations in a list format
        await loadStations()
      } finally {
        loading.value = false
      }
    }

    const loadStationsOnMap = async () => {
      try {
        await stationsStore.fetchStations({ limit: 100 })
        updateMapMarkers()
      } catch (error) {
        console.error('Failed to load stations:', error)
      }
    }

    const loadStations = async () => {
      try {
        await stationsStore.fetchStations({ limit: 100 })
      } catch (error) {
        console.error('Failed to load stations:', error)
      }
    }

    const updateMapMarkers = () => {
      if (!map.value) return
      
      // Clear existing markers
      markers.value.forEach(marker => marker.setMap(null))
      markers.value = []
      
      // Add markers for filtered stations
      filteredStations.value.forEach(station => {
        if (station.location.latitude && station.location.longitude) {
          const marker = new google.maps.Marker({
            position: {
              lat: station.location.latitude,
              lng: station.location.longitude
            },
            map: map.value,
            title: station.name,
            icon: {
              url: getMarkerIcon(station.status),
              scaledSize: new google.maps.Size(30, 30)
            }
          })
          
          marker.addListener('click', () => {
            selectedStation.value = station
          })
          
          markers.value.push(marker)
        }
      })
      
      // Adjust map bounds to fit all markers
      if (markers.value.length > 0) {
        const bounds = new google.maps.LatLngBounds()
        markers.value.forEach(marker => {
          bounds.extend(marker.getPosition())
        })
        map.value.fitBounds(bounds)
      }
    }

    const getMarkerIcon = (status) => {
      const baseUrl = 'https://maps.google.com/mapfiles/ms/icons/'
      switch (status) {
        case 'Active':
          return `${baseUrl}green-dot.png`
        case 'Inactive':
          return `${baseUrl}red-dot.png`
        case 'Maintenance':
          return `${baseUrl}yellow-dot.png`
        case 'Out of Order':
          return `${baseUrl}red-dot.png`
        default:
          return `${baseUrl}blue-dot.png`
      }
    }

    const applyFilters = () => {
      if (isMapLoaded.value) {
        updateMapMarkers()
      }
    }

    const clearFilters = () => {
      filters.status = ''
      filters.connectorType = ''
      applyFilters()
    }

    // Lifecycle hooks
    onMounted(() => {
      // Simulate map loading delay
      setTimeout(() => {
        if (mapContainer.value) {
          initializeMap()
        }
      }, 1000)
    })

    onUnmounted(() => {
      // Cleanup markers
      markers.value.forEach(marker => marker.setMap(null))
    })

    return {
      mapContainer,
      selectedStation,
      isMapLoaded,
      loading,
      mapError,
      filters,
      stations,
      filteredStations,
      applyFilters,
      clearFilters
    }
  }
}
</script>

<style scoped>
/* Additional map-specific styles can be added here */
</style> 