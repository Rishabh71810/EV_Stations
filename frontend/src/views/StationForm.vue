<template>
  <div class="px-4 py-6 sm:px-0">
    <div class="mb-6">
      <router-link to="/stations" class="text-primary-600 hover:text-primary-500">
        ← Back to Stations
      </router-link>
    </div>

    <div class="card">
      <div class="card-header">
        <h1 class="text-2xl font-bold text-gray-900">
          {{ isEditing ? 'Edit Station' : 'Add New Station' }}
        </h1>
      </div>
      <div class="card-body">
        <form @submit.prevent="handleSubmit" class="space-y-6">
          <!-- Basic Information -->
          <div>
            <h2 class="text-lg font-medium text-gray-900 mb-4">Basic Information</h2>
            <div class="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <label for="name" class="block text-sm font-medium text-gray-700">Station Name *</label>
                <input
                  id="name"
                  v-model="form.name"
                  type="text"
                  required
                  class="form-input mt-1"
                  placeholder="Enter station name"
                />
              </div>
              
              <div>
                <label for="status" class="block text-sm font-medium text-gray-700">Status *</label>
                <select
                  id="status"
                  v-model="form.status"
                  required
                  class="form-select mt-1"
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                  <option value="Maintenance">Maintenance</option>
                  <option value="Out of Order">Out of Order</option>
                </select>
              </div>
            </div>
          </div>

          <!-- Technical Specifications -->
          <div>
            <h2 class="text-lg font-medium text-gray-900 mb-4">Technical Specifications</h2>
            <div class="grid grid-cols-1 gap-6 sm:grid-cols-3">
              <div>
                <label for="connectorType" class="block text-sm font-medium text-gray-700">Connector Type *</label>
                <select
                  id="connectorType"
                  v-model="form.connectorType"
                  required
                  class="form-select mt-1"
                >
                  <option value="">Select type</option>
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
                <label for="powerOutput" class="block text-sm font-medium text-gray-700">Power Output (kW) *</label>
                <input
                  id="powerOutput"
                  v-model.number="form.powerOutput"
                  type="number"
                  min="1"
                  max="1000"
                  required
                  class="form-input mt-1"
                  placeholder="50"
                />
              </div>
              
              <div>
                <label for="totalPorts" class="block text-sm font-medium text-gray-700">Total Ports *</label>
                <input
                  id="totalPorts"
                  v-model.number="form.totalPorts"
                  type="number"
                  min="1"
                  max="50"
                  required
                  class="form-input mt-1"
                  placeholder="2"
                />
              </div>
            </div>
            
            <div class="mt-4">
              <label for="availablePorts" class="block text-sm font-medium text-gray-700">Available Ports *</label>
              <input
                id="availablePorts"
                v-model.number="form.availablePorts"
                type="number"
                min="0"
                :max="form.totalPorts || 50"
                required
                class="form-input mt-1 max-w-xs"
                placeholder="2"
              />
              <p class="mt-1 text-sm text-gray-500">
                Must be between 0 and {{ form.totalPorts || 'total ports' }}
              </p>
            </div>
          </div>

          <!-- Location -->
          <div>
            <h2 class="text-lg font-medium text-gray-900 mb-4">Location</h2>
            <div class="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <label for="latitude" class="block text-sm font-medium text-gray-700">Latitude *</label>
                <input
                  id="latitude"
                  v-model.number="form.location.latitude"
                  type="number"
                  step="any"
                  min="-90"
                  max="90"
                  required
                  class="form-input mt-1"
                  placeholder="37.7749"
                />
              </div>
              
              <div>
                <label for="longitude" class="block text-sm font-medium text-gray-700">Longitude *</label>
                <input
                  id="longitude"
                  v-model.number="form.location.longitude"
                  type="number"
                  step="any"
                  min="-180"
                  max="180"
                  required
                  class="form-input mt-1"
                  placeholder="-122.4194"
                />
              </div>
            </div>
            
            <div class="mt-4">
              <label for="address" class="block text-sm font-medium text-gray-700">Address</label>
              <input
                id="address"
                v-model="form.location.address"
                type="text"
                class="form-input mt-1"
                placeholder="123 Main St"
              />
            </div>
            
            <div class="grid grid-cols-1 gap-6 sm:grid-cols-3 mt-4">
              <div>
                <label for="city" class="block text-sm font-medium text-gray-700">City</label>
                <input
                  id="city"
                  v-model="form.location.city"
                  type="text"
                  class="form-input mt-1"
                  placeholder="San Francisco"
                />
              </div>
              
              <div>
                <label for="state" class="block text-sm font-medium text-gray-700">State</label>
                <input
                  id="state"
                  v-model="form.location.state"
                  type="text"
                  class="form-input mt-1"
                  placeholder="CA"
                />
              </div>
              
              <div>
                <label for="zipCode" class="block text-sm font-medium text-gray-700">Zip Code</label>
                <input
                  id="zipCode"
                  v-model="form.location.zipCode"
                  type="text"
                  class="form-input mt-1"
                  placeholder="94102"
                />
              </div>
            </div>
          </div>

          <!-- Error Display -->
          <div v-if="error" class="text-red-600 text-sm">
            {{ error }}
          </div>

          <!-- Form Actions -->
          <div class="flex justify-end space-x-3">
            <router-link 
              to="/stations" 
              class="btn-secondary btn-md"
            >
              Cancel
            </router-link>
            <button 
              type="submit" 
              :disabled="loading"
              class="btn-primary btn-md"
            >
              {{ loading ? 'Saving...' : (isEditing ? 'Update Station' : 'Create Station') }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
import { reactive, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useStationsStore } from '@/stores/stations'

export default {
  name: 'StationForm',
  setup() {
    const route = useRoute()
    const router = useRouter()
    const stationsStore = useStationsStore()

    const isEditing = computed(() => !!route.params.id)
    const loading = computed(() => stationsStore.loading)
    const error = computed(() => stationsStore.error)

    const form = reactive({
      name: '',
      status: 'Active',
      connectorType: '',
      powerOutput: null,
      totalPorts: null,
      availablePorts: null,
      location: {
        latitude: null,
        longitude: null,
        address: '',
        city: '',
        state: '',
        zipCode: ''
      }
    })

    const loadStation = async () => {
      if (isEditing.value) {
        try {
          await stationsStore.fetchStation(route.params.id)
          const station = stationsStore.currentStation
          if (station) {
            Object.assign(form, {
              name: station.name,
              status: station.status,
              connectorType: station.connectorType,
              powerOutput: station.powerOutput,
              totalPorts: station.totalPorts,
              availablePorts: station.availablePorts,
              location: { ...station.location }
            })
          }
        } catch (error) {
          console.error('Failed to load station:', error)
          router.push('/stations')
        }
      }
    }

    const handleSubmit = async () => {
      try {
        if (isEditing.value) {
          await stationsStore.updateStation(route.params.id, form)
        } else {
          await stationsStore.createStation(form)
        }
        router.push('/stations')
      } catch (error) {
        console.error('Failed to save station:', error)
      }
    }

    onMounted(() => {
      loadStation()
    })

    return {
      form,
      isEditing,
      loading,
      error,
      handleSubmit
    }
  }
}
</script> 