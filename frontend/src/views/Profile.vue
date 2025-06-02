<template>
  <div class="px-4 py-6 sm:px-0">
    <!-- Page Header -->
    <div class="mb-8">
      <h1 class="text-3xl font-bold text-gray-900">Profile Settings</h1>
      <p class="mt-2 text-sm text-gray-700">
        Manage your account information and preferences
      </p>
    </div>

    <div class="max-w-3xl">
      <!-- Profile Information -->
      <div class="card mb-6">
        <div class="card-header">
          <h2 class="text-lg font-medium text-gray-900">Profile Information</h2>
        </div>
        <div class="card-body">
          <form @submit.prevent="updateProfile" class="space-y-6">
            <div class="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <label for="name" class="block text-sm font-medium text-gray-700">Name *</label>
                <input
                  id="name"
                  v-model="profileForm.name"
                  type="text"
                  required
                  class="form-input mt-1"
                  placeholder="Enter your full name"
                />
              </div>
              
              <div>
                <label for="email" class="block text-sm font-medium text-gray-700">Email *</label>
                <input
                  id="email"
                  v-model="profileForm.email"
                  type="email"
                  required
                  class="form-input mt-1"
                  placeholder="Enter your email"
                />
              </div>
            </div>
            
            <div class="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <label class="block text-sm font-medium text-gray-700">Role</label>
                <div class="mt-1">
                  <span 
                    class="badge"
                    :class="{
                      'badge-success': currentUser?.role === 'admin',
                      'badge-secondary': currentUser?.role === 'user'
                    }"
                  >
                    {{ currentUser?.role || 'User' }}
                  </span>
                </div>
              </div>
              
              <div>
                <label class="block text-sm font-medium text-gray-700">Member Since</label>
                <p class="mt-1 text-sm text-gray-900">
                  {{ formatDate(currentUser?.createdAt) }}
                </p>
              </div>
            </div>
            
            <div v-if="profileError" class="text-red-600 text-sm">
              {{ profileError }}
            </div>
            
            <div v-if="profileSuccess" class="text-green-600 text-sm">
              {{ profileSuccess }}
            </div>
            
            <div class="flex justify-end">
              <button 
                type="submit"
                :disabled="profileLoading"
                class="btn-primary btn-md"
              >
                {{ profileLoading ? 'Updating...' : 'Update Profile' }}
              </button>
            </div>
          </form>
        </div>
      </div>

      <!-- Change Password -->
      <div class="card">
        <div class="card-header">
          <h2 class="text-lg font-medium text-gray-900">Change Password</h2>
        </div>
        <div class="card-body">
          <form @submit.prevent="changePassword" class="space-y-6">
            <div>
              <label for="currentPassword" class="block text-sm font-medium text-gray-700">
                Current Password *
              </label>
              <input
                id="currentPassword"
                v-model="passwordForm.currentPassword"
                type="password"
                required
                class="form-input mt-1"
                placeholder="Enter your current password"
              />
            </div>
            
            <div>
              <label for="newPassword" class="block text-sm font-medium text-gray-700">
                New Password *
              </label>
              <input
                id="newPassword"
                v-model="passwordForm.newPassword"
                type="password"
                required
                class="form-input mt-1"
                placeholder="Enter your new password"
              />
              <p class="mt-1 text-sm text-gray-500">
                Password must be at least 6 characters long
              </p>
            </div>
            
            <div>
              <label for="confirmPassword" class="block text-sm font-medium text-gray-700">
                Confirm New Password *
              </label>
              <input
                id="confirmPassword"
                v-model="passwordForm.confirmPassword"
                type="password"
                required
                class="form-input mt-1"
                placeholder="Confirm your new password"
              />
            </div>
            
            <div v-if="passwordError" class="text-red-600 text-sm">
              {{ passwordError }}
            </div>
            
            <div v-if="passwordSuccess" class="text-green-600 text-sm">
              {{ passwordSuccess }}
            </div>
            
            <div v-if="passwordValidationError" class="text-red-600 text-sm">
              {{ passwordValidationError }}
            </div>
            
            <div class="flex justify-end">
              <button 
                type="submit"
                :disabled="passwordLoading || !isPasswordFormValid"
                class="btn-primary btn-md"
              >
                {{ passwordLoading ? 'Changing...' : 'Change Password' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { reactive, computed, ref } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { authAPI } from '@/services/api'

export default {
  name: 'Profile',
  setup() {
    const authStore = useAuthStore()
    
    // Profile form
    const profileForm = reactive({
      name: '',
      email: ''
    })
    
    // Password form
    const passwordForm = reactive({
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    })
    
    // Loading and error states
    const profileLoading = ref(false)
    const profileError = ref(null)
    const profileSuccess = ref(null)
    
    const passwordLoading = ref(false)
    const passwordError = ref(null)
    const passwordSuccess = ref(null)
    
    // Computed properties
    const currentUser = computed(() => authStore.currentUser)
    
    const passwordValidationError = computed(() => {
      if (passwordForm.newPassword && passwordForm.newPassword.length < 6) {
        return 'Password must be at least 6 characters long'
      }
      if (passwordForm.newPassword && passwordForm.confirmPassword && 
          passwordForm.newPassword !== passwordForm.confirmPassword) {
        return 'Passwords do not match'
      }
      return null
    })
    
    const isPasswordFormValid = computed(() => {
      return passwordForm.currentPassword && 
             passwordForm.newPassword && 
             passwordForm.confirmPassword && 
             !passwordValidationError.value
    })
    
    // Initialize form with current user data
    if (currentUser.value) {
      profileForm.name = currentUser.value.name
      profileForm.email = currentUser.value.email
    }
    
    // Methods
    const updateProfile = async () => {
      profileLoading.value = true
      profileError.value = null
      profileSuccess.value = null
      
      try {
        await authStore.updateProfile(profileForm)
        profileSuccess.value = 'Profile updated successfully'
        
        // Clear success message after 3 seconds
        setTimeout(() => {
          profileSuccess.value = null
        }, 3000)
        
      } catch (error) {
        profileError.value = error.response?.data?.message || 'Failed to update profile'
      } finally {
        profileLoading.value = false
      }
    }
    
    const changePassword = async () => {
      if (!isPasswordFormValid.value) return
      
      passwordLoading.value = true
      passwordError.value = null
      passwordSuccess.value = null
      
      try {
        await authAPI.changePassword({
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword
        })
        
        passwordSuccess.value = 'Password changed successfully'
        
        // Clear form
        passwordForm.currentPassword = ''
        passwordForm.newPassword = ''
        passwordForm.confirmPassword = ''
        
        // Clear success message after 3 seconds
        setTimeout(() => {
          passwordSuccess.value = null
        }, 3000)
        
      } catch (error) {
        passwordError.value = error.response?.data?.message || 'Failed to change password'
      } finally {
        passwordLoading.value = false
      }
    }
    
    const formatDate = (dateString) => {
      if (!dateString) return 'N/A'
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    }
    
    return {
      currentUser,
      profileForm,
      passwordForm,
      profileLoading,
      profileError,
      profileSuccess,
      passwordLoading,
      passwordError,
      passwordSuccess,
      passwordValidationError,
      isPasswordFormValid,
      updateProfile,
      changePassword,
      formatDate
    }
  }
}
</script> 