<template>
  <div class="px-4 py-6 sm:px-0">
    <!-- Page Header -->
    <div class="mb-6">
      <h1 class="text-3xl font-bold text-gray-900">Station Map</h1>
      <p class="mt-2 text-sm text-gray-700">
        View charging stations on an interactive OpenStreetMap
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

          <div>
            <button 
              @click="refreshStations" 
              class="btn-primary btn-sm mt-6"
              :disabled="loading"
            >
              <i class="fas fa-sync-alt mr-1" :class="{ 'animate-spin': loading }"></i>
              Refresh
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
          <!-- Loading state -->
          <div v-if="loading && !isMapLoaded" class="w-full h-full flex items-center justify-center bg-gray-100 rounded-lg">
            <div class="text-center">
                <div class="spinner w-8 h-8 mx-auto"></div>
                <p class="text-gray-600 mt-2">Loading map...</p>
              </div>
          </div>
          <!-- Error state -->
          <div v-else-if="mapError" class="w-full h-full flex items-center justify-center bg-gray-100 rounded-lg">
            <div class="text-center text-red-600">
                <i class="fas fa-exclamation-triangle text-2xl mb-2"></i>
              <p class="font-medium">Map Error</p>
                <p class="text-sm">{{ mapError }}</p>
              <button @click="initializeMap" class="btn-primary btn-sm mt-2">
                Try Again
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Station Statistics -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
      <div class="card">
        <div class="card-body text-center">
          <div class="text-2xl font-bold text-green-600">{{ stationStats.active }}</div>
          <div class="text-sm text-gray-600">Active Stations</div>
        </div>
      </div>
      <div class="card">
        <div class="card-body text-center">
          <div class="text-2xl font-bold text-red-600">{{ stationStats.inactive }}</div>
          <div class="text-sm text-gray-600">Inactive Stations</div>
        </div>
      </div>
      <div class="card">
        <div class="card-body text-center">
          <div class="text-2xl font-bold text-yellow-600">{{ stationStats.maintenance }}</div>
          <div class="text-sm text-gray-600">Under Maintenance</div>
        </div>
      </div>
      <div class="card">
        <div class="card-body text-center">
          <div class="text-2xl font-bold text-blue-600">{{ filteredStations.length }}</div>
          <div class="text-sm text-gray-600">Showing on Map</div>
        </div>
      </div>
    </div>

    <!-- Station Info Panel -->
    <div v-if="selectedStation" class="fixed bottom-4 right-4 w-80 card shadow-lg z-[1001]">
      <div class="card-header flex items-center justify-between">
        <h3 class="font-medium text-gray-900">{{ selectedStation.name }}</h3>
        <button @click="closeInfoPanel" class="text-gray-400 hover:text-gray-600">
          <i class="fas fa-times"></i>
        </button>
      </div>
      <div class="card-body">
        <div class="space-y-3">
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
          <div v-if="selectedStation.location.address" class="mt-2">
            <span class="text-sm text-gray-600">Address:</span>
            <p class="text-sm text-gray-900 mt-1">{{ selectedStation.location.address }}</p>
          </div>
          <div v-if="selectedStation.amenities && selectedStation.amenities.length > 0" class="mt-2">
            <span class="text-sm text-gray-600">Amenities:</span>
            <div class="flex flex-wrap gap-1 mt-1">
              <span 
                v-for="amenity in selectedStation.amenities" 
                :key="amenity"
                class="badge badge-secondary text-xs"
              >
                {{ amenity }}
              </span>
            </div>
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
import { ref, reactive, computed, onMounted, onUnmounted, watch } from 'vue'
import { useStationsStore } from '@/stores/stations'
import L from 'leaflet'

// Fix for default markers in Leaflet with Vite
import markerIcon from 'leaflet/dist/images/marker-icon.png'
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png'
import markerShadow from 'leaflet/dist/images/marker-shadow.png'

// Set default marker icons
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
})

export default {
  name: 'MapView',
  setup() {
    const stationsStore = useStationsStore()
    
    // Reactive state
    const mapContainer = ref(null)
    const map = ref(null)
    const markers = ref(new Map()) // Use Map for better performance
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

    const stationStats = computed(() => {
      const stats = {
        active: 0,
        inactive: 0,
        maintenance: 0,
        outOfOrder: 0
      }
      
      stations.value.forEach(station => {
        switch (station.status) {
          case 'Active':
            stats.active++
            break
          case 'Inactive':
            stats.inactive++
            break
          case 'Maintenance':
            stats.maintenance++
            break
          case 'Out of Order':
            stats.outOfOrder++
            break
        }
      })
      
      return stats
    })

    // OpenStreetMap integration with Leaflet
    const initializeMap = async () => {
      loading.value = true
      mapError.value = null
      
      try {
        if (!mapContainer.value) {
          throw new Error('Map container not found')
        }

        // Clear existing map if any
        if (map.value) {
          map.value.remove()
        }
        
        // Initialize Leaflet map with OpenStreetMap tiles
        map.value = L.map(mapContainer.value, {
          center: [37.7749, -122.4194], // Default to San Francisco
          zoom: 10,
          zoomControl: true,
          scrollWheelZoom: true
        })
        
        // Add OpenStreetMap tile layer
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
          maxZoom: 19,
          subdomains: ['a', 'b', 'c']
        }).addTo(map.value)
        
        isMapLoaded.value = true
        await loadStationsOnMap()
        
      } catch (error) {
        console.error('Failed to initialize OpenStreetMap:', error)
        mapError.value = error.message
        // Fallback: load stations data without map
        await loadStations()
      } finally {
        loading.value = false
      }
    }

    const loadStationsOnMap = async () => {
      try {
        console.log('🔄 Loading stations for map...')
        await stationsStore.fetchStations({ 
          limit: 100,
          page: 1
        })
        console.log('📊 Stations loaded:', stations.value.length)
        console.log('📍 Station data:', stations.value)
        updateMapMarkers()
      } catch (error) {
        console.error('Failed to load stations:', error)
        mapError.value = 'Failed to load charging stations data'
      }
    }

    const loadStations = async () => {
      try {
        console.log('🔄 Loading stations fallback...')
        await stationsStore.fetchStations({
          limit: 100,
          page: 1
        })
        console.log('📊 Stations loaded (fallback):', stations.value.length)
      } catch (error) {
        console.error('Failed to load stations:', error)
      }
    }

    const createCustomIcon = (status) => {
      const colors = {
        'Active': '#10b981', // green-500
        'Inactive': '#ef4444', // red-500
        'Maintenance': '#f59e0b', // amber-500
        'Out of Order': '#ef4444' // red-500
      }
      
      const color = colors[status] || '#6b7280' // gray-500
      
      return L.divIcon({
        className: 'custom-marker',
        html: `
          <div style="
            background-color: ${color};
            width: 24px;
            height: 24px;
            border-radius: 50%;
            border: 2px solid white;
            box-shadow: 0 2px 4px rgba(0,0,0,0.3);
            display: flex;
            align-items: center;
            justify-content: center;
          ">
            <i class="fas fa-charging-station" style="color: white; font-size: 10px;"></i>
          </div>
        `,
        iconSize: [24, 24],
        iconAnchor: [12, 12],
        popupAnchor: [0, -12]
      })
    }

    const updateMapMarkers = () => {
      if (!map.value) return
      
      console.log('🗺️ Updating map markers...')
      console.log('📊 Filtered stations:', filteredStations.value.length)
      
      // Clear existing markers
      markers.value.forEach(marker => {
        map.value.removeLayer(marker)
      })
      markers.value.clear()
      
      // Add markers for filtered stations
      const validStations = []
      
      filteredStations.value.forEach((station, index) => {
        console.log(`🔍 Processing station ${index + 1}:`, station.name)
        console.log(`📍 Location:`, station.location)
        
        if (station.location?.latitude && station.location?.longitude) {
          console.log(`✅ Valid coordinates for ${station.name}: ${station.location.latitude}, ${station.location.longitude}`)
          
          const marker = L.marker(
            [station.location.latitude, station.location.longitude],
            { icon: createCustomIcon(station.status) }
          )
          
          // Create popup content
          const popupContent = `
            <div class="p-2">
              <h3 class="font-medium text-gray-900 mb-2">${station.name}</h3>
              <div class="space-y-1 text-sm">
                <div><strong>Status:</strong> <span class="status-${station.status.toLowerCase().replace(/ /g, '-')}">${station.status}</span></div>
                <div><strong>Connector:</strong> ${station.connectorType}</div>
                <div><strong>Power:</strong> ${station.powerOutput}kW</div>
                <div><strong>Ports:</strong> ${station.availablePorts}/${station.totalPorts}</div>
              </div>
              <button 
                onclick="window.selectStation('${station._id}')" 
                class="mt-2 bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600"
              >
                View Details
              </button>
            </div>
          `
          
          marker.bindPopup(popupContent, {
            maxWidth: 250,
            className: 'custom-popup'
          })
          
          // Add click event for info panel
          marker.on('click', () => {
            selectedStation.value = station
          })
          
          marker.addTo(map.value)
          markers.value.set(station._id, marker)
          validStations.push(station)
          console.log(`✅ Added marker for ${station.name}`)
        } else {
          console.log(`❌ Invalid coordinates for ${station.name}:`, station.location)
        }
      })
      
      console.log(`🎯 Added ${validStations.length} markers to map`)
      
      // Adjust map bounds to fit all markers
      if (validStations.length > 0) {
        const group = new L.featureGroup(Array.from(markers.value.values()))
        map.value.fitBounds(group.getBounds().pad(0.1))
        console.log('🔍 Map bounds adjusted to fit all markers')
      } else {
        console.log('⚠️ No valid stations found, keeping default view')
      }
    }

    // Global function for popup button clicks
    window.selectStation = (stationId) => {
      const station = stations.value.find(s => s._id === stationId)
      if (station) {
        selectedStation.value = station
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

    const refreshStations = async () => {
      loading.value = true
      try {
        await stationsStore.fetchStations({ limit: 100 })
        if (isMapLoaded.value) {
          updateMapMarkers()
        }
      } catch (error) {
        console.error('Failed to refresh stations:', error)
      } finally {
        loading.value = false
      }
    }

    const closeInfoPanel = () => {
      selectedStation.value = null
    }

    // Watch for changes in filtered stations
    watch(filteredStations, () => {
      if (isMapLoaded.value) {
        updateMapMarkers()
      }
    })

    // Lifecycle hooks
    onMounted(async () => {
      // Load Leaflet CSS
      if (!document.querySelector('link[href*="leaflet"]')) {
        const link = document.createElement('link')
        link.rel = 'stylesheet'
        link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'
        document.head.appendChild(link)
      }
      
      // Initialize map after a short delay to ensure DOM is ready
      setTimeout(() => {
        if (mapContainer.value) {
          initializeMap()
        }
      }, 100)
    })

    onUnmounted(() => {
      // Cleanup
      if (map.value) {
        map.value.remove()
        map.value = null
      }
      markers.value.clear()
      // Remove global function
      delete window.selectStation
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
      stationStats,
      applyFilters,
      clearFilters,
      refreshStations,
      closeInfoPanel,
      initializeMap
    }
  }
}
</script>

<style scoped>
/* Custom styles for the map */
:deep(.custom-popup .leaflet-popup-content-wrapper) {
  border-radius: 8px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

:deep(.custom-popup .leaflet-popup-content) {
  margin: 0;
}

:deep(.status-active) {
  color: #10b981;
  font-weight: 600;
}

:deep(.status-inactive) {
  color: #ef4444;
  font-weight: 600;
}

:deep(.status-maintenance) {
  color: #f59e0b;
  font-weight: 600;
}

:deep(.status-out-of-order) {
  color: #ef4444;
  font-weight: 600;
}

/* Custom marker animation */
:deep(.custom-marker) {
  transition: transform 0.2s ease;
}

:deep(.custom-marker:hover) {
  transform: scale(1.1);
}

/* Ensure map container has proper styling */
.leaflet-container {
  height: 100%;
  width: 100%;
  border-radius: 0.5rem;
}
</style> 