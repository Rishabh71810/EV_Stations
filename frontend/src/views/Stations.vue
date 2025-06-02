<template>
  <div class="px-4 py-6 sm:px-0">
    <!-- Page Header -->
    <div class="mb-6">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-3xl font-bold text-gray-900">Charging Stations</h1>
          <p class="mt-2 text-sm text-gray-700">
            Manage your charging station network
          </p>
        </div>
        <router-link 
          to="/stations/new" 
          class="btn-primary btn-md"
        >
          <i class="fas fa-plus mr-2"></i>
          Add Station
        </router-link>
      </div>
    </div>

    <!-- Stations List -->
    <div class="card">
      <div class="card-body">
        <div v-if="loading" class="text-center py-8">
          <div class="spinner w-8 h-8 mx-auto"></div>
          <p class="mt-2 text-gray-500">Loading stations...</p>
        </div>
        
        <div v-else-if="stations.length === 0" class="text-center py-12">
          <i class="fas fa-charging-station text-gray-300 text-6xl mb-4"></i>
          <h3 class="text-lg font-medium text-gray-900 mb-2">No stations found</h3>
          <p class="text-gray-500 mb-6">
            Create your first charging station to get started.
          </p>
          <router-link 
            to="/stations/new" 
            class="btn-primary btn-md"
          >
            <i class="fas fa-plus mr-2"></i>
            Add First Station
          </router-link>
        </div>
        
        <div v-else>
          <!-- Desktop Table -->
          <div class="hidden sm:block">
            <table class="min-w-full divide-y divide-gray-200">
              <thead class="bg-gray-50">
                <tr>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Station
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type & Power
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Availability
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200">
                <tr 
                  v-for="station in stations" 
                  :key="station._id"
                  class="hover:bg-gray-50"
                >
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div class="text-sm font-medium text-gray-900">
                        {{ station.name }}
                      </div>
                      <div class="text-sm text-gray-500">
                        {{ station.location.city }}, {{ station.location.state }}
                      </div>
                    </div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <span 
                      class="badge"
                      :class="{
                        'badge-success': station.status === 'Active',
                        'badge-danger': station.status === 'Inactive' || station.status === 'Out of Order',
                        'badge-warning': station.status === 'Maintenance'
                      }"
                    >
                      {{ station.status }}
                    </span>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div>{{ station.connectorType }}</div>
                    <div class="text-gray-500">{{ station.powerOutput }}kW</div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {{ station.availablePorts }}/{{ station.totalPorts }} ports
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div class="flex space-x-2">
                      <router-link 
                        :to="`/stations/${station._id}`"
                        class="text-primary-600 hover:text-primary-900"
                      >
                        View
                      </router-link>
                      <router-link 
                        :to="`/stations/${station._id}/edit`"
                        class="text-blue-600 hover:text-blue-900"
                      >
                        Edit
                      </router-link>
                      <button 
                        @click="confirmDelete(station)"
                        class="text-red-600 hover:text-red-900"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Mobile Cards -->
          <div class="sm:hidden space-y-4">
            <div 
              v-for="station in stations" 
              :key="station._id"
              class="border border-gray-200 rounded-lg p-4"
            >
              <div class="flex items-center justify-between mb-2">
                <h3 class="text-sm font-medium text-gray-900">{{ station.name }}</h3>
                <span 
                  class="badge"
                  :class="{
                    'badge-success': station.status === 'Active',
                    'badge-danger': station.status === 'Inactive' || station.status === 'Out of Order',
                    'badge-warning': station.status === 'Maintenance'
                  }"
                >
                  {{ station.status }}
                </span>
              </div>
              <p class="text-sm text-gray-500 mb-3">
                {{ station.location.city }}, {{ station.location.state }}
              </p>
              <div class="flex items-center justify-between">
                <div class="text-sm">
                  <span class="text-gray-500">{{ station.connectorType }}</span>
                  <span class="mx-2">•</span>
                  <span class="text-gray-500">{{ station.powerOutput }}kW</span>
                </div>
                <div class="flex space-x-2">
                  <router-link 
                    :to="`/stations/${station._id}`"
                    class="btn-secondary btn-sm"
                  >
                    View
                  </router-link>
                  <router-link 
                    :to="`/stations/${station._id}/edit`"
                    class="btn-primary btn-sm"
                  >
                    Edit
                  </router-link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Delete Confirmation Modal -->
    <div 
      v-if="stationToDelete" 
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
    >
      <div class="bg-white rounded-lg p-6 max-w-sm w-full mx-4">
        <h3 class="text-lg font-medium text-gray-900 mb-2">Delete Station</h3>
        <p class="text-sm text-gray-500 mb-4">
          Are you sure you want to delete "{{ stationToDelete.name }}"? This action cannot be undone.
        </p>
        <div class="flex space-x-3">
          <button 
            @click="deleteStation"
            class="btn-danger btn-sm flex-1"
          >
            Delete
          </button>
          <button 
            @click="stationToDelete = null"
            class="btn-secondary btn-sm flex-1"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useStationsStore } from '@/stores/stations'

export default {
  name: 'Stations',
  setup() {
    const stationsStore = useStationsStore()
    const stationToDelete = ref(null)

    const loading = computed(() => stationsStore.loading)
    const stations = computed(() => stationsStore.stations)

    const confirmDelete = (station) => {
      stationToDelete.value = station
    }

    const deleteStation = async () => {
      if (!stationToDelete.value) return
      
      try {
        await stationsStore.deleteStation(stationToDelete.value._id)
        stationToDelete.value = null
      } catch (error) {
        console.error('Failed to delete station:', error)
      }
    }

    onMounted(() => {
      stationsStore.fetchStations()
    })

    return {
      loading,
      stations,
      stationToDelete,
      confirmDelete,
      deleteStation
    }
  }
}
</script> 