<template>
  <div class="auth-container">
    <div class="bg-animation"></div>
    
    <header>
      <router-link to="/" class="logo">
        anchor<span>less</span>
      </router-link>
    </header>

    <div class="auth-form-container">
      <div class="auth-card">
        <h2>Welcome Back</h2>
        <p class="auth-subtitle">Sign in to your Anchorless account</p>
        
        <!-- Error Alert -->
        <div v-if="error" class="alert alert-error">
          <i class="fas fa-exclamation-circle"></i>
          <span>{{ error }}</span>
        </div>

        <!-- Success Alert -->
        <div v-if="success" class="alert alert-success">
          <i class="fas fa-check-circle"></i>
          <span>{{ success }}</span>
        </div>
        
        <form class="auth-form" @submit.prevent="login">
          <div class="form-group">
            <label for="email">
              <i class="fas fa-envelope"></i>
              Email
            </label>
            <input 
              type="email" 
              id="email" 
              v-model="email" 
              placeholder="Enter your email" 
              :disabled="loading"
              required
            >
          </div>
          
          <div class="form-group">
            <label for="password">
              <i class="fas fa-lock"></i>
              Password
            </label>
            <div class="password-input-wrapper">
              <input 
                :type="showPassword ? 'text' : 'password'" 
                id="password" 
                v-model="password" 
                placeholder="Enter your password"
                :disabled="loading"
                required
              >
              <button 
                type="button" 
                class="toggle-password" 
                @click="showPassword = !showPassword"
                :disabled="loading"
              >
                <i :class="showPassword ? 'fas fa-eye-slash' : 'fas fa-eye'"></i>
              </button>
            </div>
          </div>

          <div class="form-options">
            <label class="remember-me">
              <input type="checkbox" v-model="rememberMe" :disabled="loading">
              <span>Remember me</span>
            </label>
            <a href="#" class="forgot-password">Forgot password?</a>
          </div>
          
          <button 
            type="submit" 
            class="btn btn-primary btn-full" 
            :disabled="loading"
          >
            <span v-if="!loading">Sign In</span>
            <span v-else class="loading-spinner">
              <i class="fas fa-spinner fa-spin"></i> Signing in...
            </span>
          </button>
        </form>
        
        <div class="auth-links">
          <p>Don't have an account? <router-link to="/signup">Sign up</router-link></p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { useAuthStore } from '@/stores/auth'

export default {
  name: 'LoginView',
  data() {
    return {
      email: '',
      password: '',
      showPassword: false,
      rememberMe: false,
      loading: false,
      error: null,
      success: null
    }
  },
  methods: {
    async login() {
      // Clear previous messages
      this.error = null
      this.success = null
      
      // Validate inputs
      if (!this.email || !this.password) {
        this.error = 'Please fill in all fields'
        return
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(this.email)) {
        this.error = 'Please enter a valid email address'
        return
      }

      this.loading = true

      try {
        const response = await fetch('http://localhost:8000/auth/login/', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: this.email,
            password: this.password
          })
        })

        const data = await response.json()

        if (!response.ok) {
          // Handle error responses
          if (response.status === 401) {
            this.error = 'Invalid email or password'
          } else if (response.status === 400) {
            this.error = data.error || data.detail || 'Invalid login credentials'
          } else if (response.status === 500) {
            this.error = 'Server error. Please try again later.'
          } else {
            this.error = 'An error occurred. Please try again.'
          }
          return
        }

        // Success - Store tokens and user data
        const authStore = useAuthStore()
        authStore.setAuth({
          accessToken: data.access,
          refreshToken: data.refresh,
          user: data.user,
          accessExpires: data.access_expires,
          refreshExpires: data.refresh_expires
        })

        // Show success message briefly
        this.success = `Welcome back, ${data.user.first_name || 'User'}!`

        // Redirect after short delay
        setTimeout(() => {
          this.$router.push('/dashboard')
        }, 1000)

      } catch (error) {
        console.error('Login error:', error)
        this.error = 'Network error. Please check your connection and try again.'
      } finally {
        this.loading = false
      }
    }
  },
  mounted() {
    // Check if already logged in
    const authStore = useAuthStore()
    if (authStore.isAuthenticated) {
      this.$router.push('/dashboard')
    }
  }
}
</script>

<style scoped>
.auth-container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.bg-animation {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: -1;
  background: linear-gradient(125deg, var(--darker) 0%, var(--dark) 100%);
}

.bg-animation::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: radial-gradient(circle at 20% 50%, rgba(0, 245, 255, 0.1) 0%, transparent 50%),
              radial-gradient(circle at 80% 20%, rgba(138, 43, 226, 0.1) 0%, transparent 50%);
  animation: pulse 15s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 0.5; }
  50% { opacity: 0.8; }
}

header {
  padding: 1.5rem 5%;
  position: fixed;
  width: 100%;
  z-index: 1000;
  background: rgba(10, 10, 26, 0.8);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(0, 245, 255, 0.2);
}

.logo {
  display: flex;
  align-items: center;
  font-size: 1.8rem;
  font-weight: 700;
  color: var(--light);
  text-decoration: none;
}

.logo span {
  color: var(--primary);
  text-shadow: var(--glow);
}

.auth-form-container {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  margin-top: 60px;
}

.auth-card {
  background: var(--card-bg);
  padding: 3rem;
  border-radius: 20px;
  border: 1px solid rgba(0, 245, 255, 0.2);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
  width: 100%;
  max-width: 450px;
  backdrop-filter: blur(10px);
}

.auth-card h2 {
  font-size: 2rem;
  margin-bottom: 0.5rem;
  background: linear-gradient(to right, var(--primary), var(--accent));
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}

.auth-subtitle {
  color: var(--gray);
  margin-bottom: 2rem;
}

/* Alert Styles */
.alert {
  padding: 1rem;
  border-radius: 10px;
  margin-bottom: 1.5rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  animation: slideDown 0.3s ease;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.alert-error {
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.3);
  color: #fca5a5;
}

.alert-success {
  background: rgba(34, 197, 94, 0.1);
  border: 1px solid rgba(34, 197, 94, 0.3);
  color: #86efac;
}

.alert i {
  font-size: 1.2rem;
}

/* Form Styles */
.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
  color: var(--light);
  font-weight: 500;
}

.form-group label i {
  font-size: 0.9rem;
  color: var(--primary);
}

.form-group input {
  width: 100%;
  padding: 1rem;
  border: 1px solid rgba(0, 245, 255, 0.3);
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.05);
  color: var(--light);
  font-size: 1rem;
  transition: all 0.3s ease;
}

.form-group input:focus {
  outline: none;
  border-color: var(--primary);
  box-shadow: 0 0 10px rgba(0, 245, 255, 0.3);
}

.form-group input:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Password Input Wrapper */
.password-input-wrapper {
  position: relative;
}

.password-input-wrapper input {
  padding-right: 3rem;
}

.toggle-password {
  position: absolute;
  right: 1rem;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: var(--gray);
  cursor: pointer;
  transition: color 0.3s ease;
  padding: 0.5rem;
}

.toggle-password:hover {
  color: var(--primary);
}

.toggle-password:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Form Options */
.form-options {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.remember-me {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--gray);
  font-size: 0.9rem;
  cursor: pointer;
}

.remember-me input[type="checkbox"] {
  width: auto;
  cursor: pointer;
}

.forgot-password {
  color: var(--primary);
  font-size: 0.9rem;
  text-decoration: none;
  transition: color 0.3s ease;
}

.forgot-password:hover {
  color: var(--accent);
  text-decoration: underline;
}

/* Button Styles */
.btn {
  padding: 0.7rem 1.5rem;
  border-radius: 30px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  border: none;
  font-size: 0.9rem;
}

.btn-primary {
  background: var(--primary);
  color: var(--dark);
}

.btn-primary:hover:not(:disabled) {
  box-shadow: var(--glow);
  transform: translateY(-2px);
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.btn-full {
  width: 100%;
  margin-top: 1rem;
  padding: 1rem;
  font-size: 1rem;
}

.loading-spinner {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

/* Auth Links */
.auth-links {
  margin-top: 2rem;
  text-align: center;
  color: var(--gray);
}

.auth-links a {
  color: var(--primary);
  text-decoration: none;
  font-weight: 600;
  transition: color 0.3s ease;
}

.auth-links a:hover {
  color: var(--accent);
  text-decoration: underline;
}

/* Responsive */
@media (max-width: 768px) {
  .auth-card {
    padding: 2rem;
  }

  .form-options {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
}
</style>