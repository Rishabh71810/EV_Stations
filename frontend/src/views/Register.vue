<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md w-full space-y-8">
      <div>
        <div class="mx-auto h-12 w-12 text-primary-600">
          <i class="fas fa-charging-station text-4xl"></i>
        </div>
        <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Create your account
        </h2>
        <p class="mt-2 text-center text-sm text-gray-600">
          Or
          <router-link to="/login" class="font-medium text-primary-600 hover:text-primary-500">
            sign in to your existing account
          </router-link>
        </p>
      </div>
      
      <form class="mt-8 space-y-6" @submit.prevent="handleRegister">
        <div class="space-y-4">
          <div>
            <label for="name" class="block text-sm font-medium text-gray-700">Full Name</label>
            <input
              id="name"
              v-model="form.name"
              name="name"
              type="text"
              required
              class="form-input mt-1"
              placeholder="Enter your full name"
            />
          </div>
          
          <div>
            <label for="email" class="block text-sm font-medium text-gray-700">Email Address</label>
            <input
              id="email"
              v-model="form.email"
              name="email"
              type="email"
              autocomplete="email"
              required
              class="form-input mt-1"
              placeholder="Enter your email"
            />
          </div>
          
          <div>
            <label for="password" class="block text-sm font-medium text-gray-700">Password</label>
            <input
              id="password"
              v-model="form.password"
              name="password"
              type="password"
              autocomplete="new-password"
              required
              class="form-input mt-1"
              placeholder="Enter your password"
            />
          </div>
          
          <div>
            <label for="confirmPassword" class="block text-sm font-medium text-gray-700">Confirm Password</label>
            <input
              id="confirmPassword"
              v-model="form.confirmPassword"
              name="confirmPassword"
              type="password"
              required
              class="form-input mt-1"
              placeholder="Confirm your password"
            />
          </div>
        </div>

        <div v-if="error" class="text-red-600 text-sm">
          {{ error }}
        </div>

        <div v-if="validationError" class="text-red-600 text-sm">
          {{ validationError }}
        </div>

        <div>
          <button
            type="submit"
            :disabled="loading || !isFormValid"
            class="btn-primary btn-lg w-full"
          >
            <span v-if="loading">Creating account...</span>
            <span v-else>Create Account</span>
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
import { reactive, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

export default {
  name: 'Register',
  setup() {
    const router = useRouter()
    const authStore = useAuthStore()

    const form = reactive({
      name: '',
      email: '',
      password: '',
      confirmPassword: ''
    })

    const loading = computed(() => authStore.loading)
    const error = computed(() => authStore.error)
    
    const validationError = computed(() => {
      if (form.password && form.confirmPassword && form.password !== form.confirmPassword) {
        return 'Passwords do not match'
      }
      if (form.password && form.password.length < 6) {
        return 'Password must be at least 6 characters long'
      }
      return null
    })

    const isFormValid = computed(() => {
      return form.name && 
             form.email && 
             form.password && 
             form.confirmPassword && 
             !validationError.value
    })

    const handleRegister = async () => {
      if (!isFormValid.value) return

      try {
        const { confirmPassword, ...userData } = form
        await authStore.register(userData)
        router.push('/dashboard')
      } catch (error) {
        console.error('Registration failed:', error)
      }
    }

    return {
      form,
      loading,
      error,
      validationError,
      isFormValid,
      handleRegister
    }
  }
}
</script> 