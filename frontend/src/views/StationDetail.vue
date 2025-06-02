<template>
  <div class="px-4 py-6 sm:px-0">
    <div class="mb-6">
      <router-link to="/stations" class="text-primary-600 hover:text-primary-500">
        ← Back to Stations
      </router-link>
    </div>
    
    <div v-if="loading" class="text-center py-8">
      <div class="spinner w-8 h-8 mx-auto"></div>
    </div>
    
    <div v-else-if="station" class="card">
      <div class="card-header">
        <h1 class="text-2xl font-bold text-gray-900">{{ station.name }}</h1>
      </div>
      <div class="card-body">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h2 class="text-lg font-medium mb-4">Station Details</h2>
            <dl class="space-y-3">
              <div>
                <dt class="text-sm font-medium text-gray-500">Status</dt>
                <dd class="mt-1">
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
                </dd>
              </div>
              <div>
                <dt class="text-sm font-medium text-gray-500">Connector Type</dt>
                <dd class="mt-1 text-sm text-gray-900">{{ station.connectorType }}</dd>
              </div>
              <div>
                <dt class="text-sm font-medium text-gray-500">Power Output</dt>
                <dd class="mt-1 text-sm text-gray-900">{{ station.powerOutput }} kW</dd>
              </div>
              <div>
                <dt class="text-sm font-medium text-gray-500">Available Ports</dt>
                <dd class="mt-1 text-sm text-gray-900">{{ station.availablePorts }} / {{ station.totalPorts }}</dd>
              </div>
            </dl>
          </div>
          
          <div>
            <h2 class="text-lg font-medium mb-4">Location</h2>
            <dl class="space-y-3">
              <div v-if="station.location.address">
                <dt class="text-sm font-medium text-gray-500">Address</dt>
                <dd class="mt-1 text-sm text-gray-900">{{ station.location.address }}</dd>
              </div>
              <div>
                <dt class="text-sm font-medium text-gray-500">City</dt>
                <dd class="mt-1 text-sm text-gray-900">{{ station.location.city }}</dd>
              </div>
              <div>
                <dt class="text-sm font-medium text-gray-500">State</dt>
                <dd class="mt-1 text-sm text-gray-900">{{ station.location.state }}</dd>
              </div>
              <div>
                <dt class="text-sm font-medium text-gray-500">Coordinates</dt>
                <dd class="mt-1 text-sm text-gray-900">
                  {{ station.location.latitude }}, {{ station.location.longitude }}
                </dd>
              </div>
            </dl>
          </div>
        </div>
        
        <div class="mt-6 flex space-x-3">
          <router-link 
            :to="`/stations/${station._id}/edit`"
            class="btn-primary btn-md"
          >
            Edit Station
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useStationsStore } from '@/stores/stations'

export default {
  name: 'StationDetail',
  setup() {
    const route = useRoute()
    const stationsStore = useStationsStore()

    const loading = computed(() => stationsStore.loading)
    const station = computed(() => stationsStore.currentStation)

    onMounted(() => {
      const stationId = route.params.id
      if (stationId) {
        stationsStore.fetchStation(stationId)
      }
    })

    return {
      loading,
      station
    }
  }
}
</script> 