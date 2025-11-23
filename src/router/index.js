// router/index.js
import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import HomeView from '../views/HomeView.vue'
import LearnMoreView from '../views/LearnmoreView.vue'
import LoginView from '../views/LoginView.vue'
import SignupView from '../views/SignupView.vue'
import DashboardView from '../views/DashboardView.vue'
import VerifyEmailSentView from '@/views/VerifyEmailSentView.vue'
import VerifyEmailView from '@/views/VerifyEmailView.vue'
import ForgotPasswordView from '@/views/ForgotPasswordView.vue'
import ResetPasswordView from '@/views/ResetPasswordView.vue'
import ProfileView from '@/views/ProfileView.vue'

const routes = [
  {
    path: '/',
    name: 'home',
    component: HomeView,
    meta: { requiresAuth: false }
  },
  {
    path: '/learn-more',
    name: 'learn-more',
    component: LearnMoreView,
    meta: { requiresAuth: false }
  },
  {
    path: '/login',
    name: 'login',
    component: LoginView,
    meta: { requiresAuth: false, guestOnly: true }
  },
  {
    path: '/signup',
    name: 'signup',
    component: SignupView,
    meta: { requiresAuth: false, guestOnly: true }
  },
  {
    path: '/dashboard',
    name: 'dashboard',
    component: DashboardView,
    meta: { requiresAuth: true }
  },
  {
    path: '/verify-email-sent',
    name: 'verify-email-sent',
    component: VerifyEmailSentView,
    meta: { requiresAuth: false }
  },
  {
    path: '/verify-email/:token',
    name: 'verify-email',
    component: VerifyEmailView,
    meta: { requiresAuth: false }
  },
  {
    path: '/forgot-password',
    name: 'forgot-password',
    component: ForgotPasswordView,
    meta: { requiresAuth: false }
  },
  {
    path: '/reset-password/:token?',
    name: 'reset-password',
    component: () => ResetPasswordView,
    meta: { requiresAuth: false }
  },
  {
  path: '/profile',
  name: 'profile',
  component: () => ProfileView,
  meta: { requiresAuth: true }
}
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (to.hash) {
      return {
        el: to.hash,
        behavior: 'smooth',
      }
    }
    return { top: 0 }
  }
})

// Navigation guard
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()
  const isAuthenticated = authStore.isAuthenticated

  // Check if route requires authentication
  if (to.meta.requiresAuth && !isAuthenticated) {
    // Redirect to login
    next({ name: 'login', query: { redirect: to.fullPath } })
  } 
  // Check if route is for guests only (login/signup)
  else if (to.meta.guestOnly && isAuthenticated) {
    // Redirect to dashboard if already logged in
    next({ name: 'dashboard' })
  } 
  else {
    next()
  }
})

export default router