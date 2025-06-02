<template>
  <div class="px-4 py-6 sm:px-0">
    <!-- Page Header -->
    <div class="mb-8">
      <h1 class="text-3xl font-bold text-gray-900">Dashboard</h1>
      <p class="mt-2 text-sm text-gray-700">
        Overview of your charging station network
      </p>
    </div>

    <!-- Statistics Cards -->
    <div class="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
      <div class="card">
        <div class="card-body">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <div class="w-8 h-8 bg-primary-500 rounded-md flex items-center justify-center">
                <i class="fas fa-charging-station text-white text-sm"></i>
              </div>
            </div>
            <div class="ml-4">
              <dt class="text-sm font-medium text-gray-500 truncate">
                Total Stations
              </dt>
              <dd class="text-lg font-medium text-gray-900">
                {{ statistics?.overview?.totalStations || 0 }}
              </dd>
            </div>
          </div>
        </div>
      </div>

      <div class="card">
        <div class="card-body">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <div class="w-8 h-8 bg-success-500 rounded-md flex items-center justify-center">
                <i class="fas fa-check-circle text-white text-sm"></i>
              </div>
            </div>
            <div class="ml-4">
              <dt class="text-sm font-medium text-gray-500 truncate">
                Active Stations
              </dt>
              <dd class="text-lg font-medium text-gray-900">
                {{ statistics?.overview?.activeStations || 0 }}
              </dd>
            </div>
          </div>
        </div>
      </div>

      <div class="card">
        <div class="card-body">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <div class="w-8 h-8 bg-warning-500 rounded-md flex items-center justify-center">
                <i class="fas fa-plug text-white text-sm"></i>
              </div>
            </div>
            <div class="ml-4">
              <dt class="text-sm font-medium text-gray-500 truncate">
                Available Ports
              </dt>
              <dd class="text-lg font-medium text-gray-900">
                {{ statistics?.overview?.totalAvailablePorts || 0 }}
              </dd>
            </div>
          </div>
        </div>
      </div>

      <div class="card">
        <div class="card-body">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <div class="w-8 h-8 bg-blue-500 rounded-md flex items-center justify-center">
                <i class="fas fa-bolt text-white text-sm"></i>
              </div>
            </div>
            <div class="ml-4">
              <dt class="text-sm font-medium text-gray-500 truncate">
                Avg Power Output
              </dt>
              <dd class="text-lg font-medium text-gray-900">
                {{ Math.round(statistics?.overview?.averagePowerOutput || 0) }}kW
              </dd>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Quick Actions -->
    <div class="mb-8">
      <h2 class="text-lg font-medium text-gray-900 mb-4">Quick Actions</h2>
      <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <router-link 
          to="/stations/new" 
          class="card hover:shadow-md transition-shadow duration-200"
        >
          <div class="card-body text-center">
            <div class="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mx-auto mb-3">
              <i class="fas fa-plus text-primary-600"></i>
            </div>
            <h3 class="text-sm font-medium text-gray-900">Add New Station</h3>
            <p class="text-xs text-gray-500 mt-1">Create a new charging station</p>
          </div>
        </router-link>

        <router-link 
          to="/stations" 
          class="card hover:shadow-md transition-shadow duration-200"
        >
          <div class="card-body text-center">
            <div class="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-3">
              <i class="fas fa-list text-blue-600"></i>
            </div>
            <h3 class="text-sm font-medium text-gray-900">Manage Stations</h3>
            <p class="text-xs text-gray-500 mt-1">View and edit your stations</p>
          </div>
        </router-link>

        <router-link 
          to="/map" 
          class="card hover:shadow-md transition-shadow duration-200"
        >
          <div class="card-body text-center">
            <div class="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-3">
              <i class="fas fa-map text-green-600"></i>
            </div>
            <h3 class="text-sm font-medium text-gray-900">View Map</h3>
            <p class="text-xs text-gray-500 mt-1">See stations on map</p>
          </div>
        </router-link>
      </div>
    </div>

    <!-- Recent Stations -->
    <div class="card">
      <div class="card-header">
        <div class="flex items-center justify-between">
          <h2 class="text-lg font-medium text-gray-900">Recent Stations</h2>
          <router-link 
            to="/stations" 
            class="text-sm text-primary-600 hover:text-primary-500"
          >
            View all
          </router-link>
        </div>
      </div>
      <div class="card-body">
        <div v-if="loading" class="text-center py-4">
          <div class="spinner w-6 h-6 mx-auto"></div>
        </div>
        
        <div v-else-if="recentStations.length === 0" class="text-center py-8">
          <i class="fas fa-charging-station text-gray-300 text-4xl mb-4"></i>
          <p class="text-gray-500">No stations found</p>
          <router-link 
            to="/stations/new" 
            class="btn-primary btn-sm mt-3"
          >
            Add your first station
          </router-link>
        </div>
        
        <div v-else class="space-y-3">
          <div 
            v-for="station in recentStations" 
            :key="station._id"
            class="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50"
          >
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <div 
                  class="w-3 h-3 rounded-full"
                  :class="{
                    'bg-green-400': station.status === 'Active',
                    'bg-red-400': station.status === 'Inactive',
                    'bg-yellow-400': station.status === 'Maintenance',
                    'bg-gray-400': station.status === 'Out of Order'
                  }"
                ></div>
              </div>
              <div class="ml-3">
                <p class="text-sm font-medium text-gray-900">{{ station.name }}</p>
                <p class="text-xs text-gray-500">
                  {{ station.location.city }}, {{ station.location.state }}
                </p>
              </div>
            </div>
            <div class="flex items-center space-x-2">
              <span class="badge badge-secondary">{{ station.connectorType }}</span>
              <span class="text-sm text-gray-500">{{ station.powerOutput }}kW</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useStationsStore } from '@/stores/stations'

export default {
  name: 'Dashboard',
  setup() {
    const stationsStore = useStationsStore()
    
    const loading = computed(() => stationsStore.loading)
    const statistics = computed(() => stationsStore.statistics)
    const recentStations = computed(() => stationsStore.stations.slice(0, 5))

    onMounted(async () => {
      try {
        await Promise.all([
          stationsStore.fetchStations({ limit: 5 }),
          stationsStore.fetchStationStats()
        ])
      } catch (error) {
        console.error('Failed to load dashboard data:', error)
      }
    })

    return {
      loading,
      statistics,
      recentStations
    }
  }
}
</script> 