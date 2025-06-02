import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

// Import views
import Login from '@/views/Login.vue'
import Register from '@/views/Register.vue'
import Dashboard from '@/views/Dashboard.vue'
import Stations from '@/views/Stations.vue'
import StationDetail from '@/views/StationDetail.vue'
import StationForm from '@/views/StationForm.vue'
import MapView from '@/views/MapView.vue'
import Profile from '@/views/Profile.vue'

const routes = [
  {
    path: '/',
    redirect: '/dashboard'
  },
  {
    path: '/login',
    name: 'Login',
    component: Login,
    meta: { requiresGuest: true }
  },
  {
    path: '/register',
    name: 'Register',
    component: Register,
    meta: { requiresGuest: true }
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: Dashboard,
    meta: { requiresAuth: true }
  },
  {
    path: '/stations',
    name: 'Stations',
    component: Stations,
    meta: { requiresAuth: true }
  },
  {
    path: '/stations/new',
    name: 'CreateStation',
    component: StationForm,
    meta: { requiresAuth: true }
  },
  {
    path: '/stations/:id',
    name: 'StationDetail',
    component: StationDetail,
    meta: { requiresAuth: true },
    props: true
  },
  {
    path: '/stations/:id/edit',
    name: 'EditStation',
    component: StationForm,
    meta: { requiresAuth: true },
    props: true
  },
  {
    path: '/map',
    name: 'MapView',
    component: MapView,
    meta: { requiresAuth: true }
  },
  {
    path: '/profile',
    name: 'Profile',
    component: Profile,
    meta: { requiresAuth: true }
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/dashboard'
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// Navigation guards
router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore()
  
  // Load stored authentication on app startup
  if (!authStore.isAuthenticated) {
    await authStore.loadStoredAuth()
  }
  
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth)
  const requiresGuest = to.matched.some(record => record.meta.requiresGuest)
  
  if (requiresAuth && !authStore.isAuthenticated) {
    // Redirect to login if authentication required but not authenticated
    next({ name: 'Login', query: { redirect: to.fullPath } })
  } else if (requiresGuest && authStore.isAuthenticated) {
    // Redirect to dashboard if guest required but authenticated
    next({ name: 'Dashboard' })
  } else {
    next()
  }
})

export default router 