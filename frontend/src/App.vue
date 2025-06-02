<template>
  <div id="app" class="min-h-screen bg-gray-50">
    <!-- Navigation Header -->
    <nav v-if="isAuthenticated" class="bg-white shadow-sm border-b border-gray-200">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between h-16">
          <div class="flex">
            <!-- Logo -->
            <div class="flex-shrink-0 flex items-center">
              <router-link to="/" class="text-xl font-bold text-primary-600">
                <i class="fas fa-charging-station mr-2"></i>
                EV Stations
              </router-link>
            </div>
            
            <!-- Navigation Links -->
            <div class="hidden sm:ml-6 sm:flex sm:space-x-8">
              <router-link 
                to="/dashboard" 
                class="nav-link"
                :class="{ 'border-primary-500 text-gray-900': $route.name === 'Dashboard' }"
              >
                <i class="fas fa-tachometer-alt mr-1"></i>
                Dashboard
              </router-link>
              
              <router-link 
                to="/stations" 
                class="nav-link"
                :class="{ 'border-primary-500 text-gray-900': $route.name === 'Stations' }"
              >
                <i class="fas fa-list mr-1"></i>
                Stations
              </router-link>
              
              <router-link 
                to="/map" 
                class="nav-link"
                :class="{ 'border-primary-500 text-gray-900': $route.name === 'MapView' }"
              >
                <i class="fas fa-map mr-1"></i>
                Map View
              </router-link>
            </div>
          </div>
          
          <!-- User Menu -->
          <div class="flex items-center">
            <div class="relative ml-3">
              <div class="flex items-center space-x-4">
                <span class="text-sm text-gray-700">
                  Welcome, {{ currentUser?.name }}
                </span>
                
                <router-link 
                  to="/profile" 
                  class="text-gray-500 hover:text-gray-700"
                >
                  <i class="fas fa-user"></i>
                </router-link>
                
                <button 
                  @click="handleLogout" 
                  class="text-gray-500 hover:text-gray-700"
                  title="Logout"
                >
                  <i class="fas fa-sign-out-alt"></i>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </nav>

    <!-- Main Content -->
    <main class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <router-view />
    </main>

    <!-- Loading Overlay -->
    <div 
      v-if="loading" 
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
    >
      <div class="bg-white rounded-lg p-6 flex items-center space-x-3">
        <div class="spinner w-6 h-6"></div>
        <span>Loading...</span>
      </div>
    </div>

    <!-- Global Error Toast -->
    <div 
      v-if="error" 
      class="fixed top-4 right-4 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg z-50"
    >
      <div class="flex items-center justify-between">
        <span>{{ error }}</span>
        <button @click="clearError" class="ml-4">
          <i class="fas fa-times"></i>
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

export default {
  name: 'App',
  setup() {
    const router = useRouter()
    const authStore = useAuthStore()

    const isAuthenticated = computed(() => authStore.isAuthenticated)
    const currentUser = computed(() => authStore.currentUser)
    const loading = computed(() => authStore.loading)
    const error = computed(() => authStore.error)

    const handleLogout = () => {
      authStore.logout()
      router.push('/login')
    }

    const clearError = () => {
      authStore.clearError()
    }

    return {
      isAuthenticated,
      currentUser,
      loading,
      error,
      handleLogout,
      clearError
    }
  }
}
</script>

<style scoped>
.nav-link {
  @apply inline-flex items-center px-1 pt-1 border-b-2 border-transparent text-sm font-medium text-gray-500 hover:text-gray-700 hover:border-gray-300 transition-colors duration-200;
}
</style> 