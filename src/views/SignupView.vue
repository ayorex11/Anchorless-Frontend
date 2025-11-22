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
        <h2>Join Anchorless</h2>
        <p class="auth-subtitle">Start your journey to financial freedom</p>
        
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
        
        <form class="auth-form" @submit.prevent="signup">
          <div class="name-fields">
            <div class="form-group">
              <label for="firstName">
                <i class="fas fa-user"></i>
                First Name
              </label>
              <input 
                type="text" 
                id="firstName" 
                v-model="firstName" 
                placeholder="First name" 
                :disabled="loading"
                required
              >
            </div>
            
            <div class="form-group">
              <label for="lastName">
                <i class="fas fa-user"></i>
                Last Name
              </label>
              <input 
                type="text" 
                id="lastName" 
                v-model="lastName" 
                placeholder="Last name" 
                :disabled="loading"
                required
              >
            </div>
          </div>
          
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
                placeholder="Create a password"
                :disabled="loading"
                required
                minlength="8"
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
            <div class="password-strength" v-if="password">
              <div class="strength-bar" :class="passwordStrength"></div>
              <span class="strength-text">{{ passwordStrengthText }}</span>
            </div>
          </div>
          
          <div class="form-group">
            <label for="confirmPassword">
              <i class="fas fa-lock"></i>
              Confirm Password
            </label>
            <div class="password-input-wrapper">
              <input 
                :type="showConfirmPassword ? 'text' : 'password'" 
                id="confirmPassword" 
                v-model="confirmPassword" 
                placeholder="Confirm your password"
                :disabled="loading"
                required
              >
              <button 
                type="button" 
                class="toggle-password" 
                @click="showConfirmPassword = !showConfirmPassword"
                :disabled="loading"
              >
                <i :class="showConfirmPassword ? 'fas fa-eye-slash' : 'fas fa-eye'"></i>
              </button>
            </div>
            <div v-if="confirmPassword && !passwordsMatch" class="password-match error">
              <i class="fas fa-times"></i> Passwords do not match
            </div>
            <div v-if="confirmPassword && passwordsMatch" class="password-match success">
              <i class="fas fa-check"></i> Passwords match
            </div>
          </div>

          <div class="form-options">
            <label class="terms-agreement">
              <input type="checkbox" v-model="agreeToTerms" :disabled="loading" required>
              <span>I agree to the <a href="#" @click.prevent="showTerms = true">Terms of Service</a> and <a href="#" @click.prevent="showPrivacy = true">Privacy Policy</a></span>
            </label>
          </div>
          
          <button 
            type="submit" 
            class="btn btn-primary btn-full" 
            :disabled="loading || !isFormValid"
          >
            <span v-if="!loading">Create Account</span>
            <span v-else class="loading-spinner">
              <i class="fas fa-spinner fa-spin"></i> Creating account...
            </span>
          </button>
        </form>
        
        <div class="auth-links">
          <p>Already have an account? <router-link to="/login">Sign in</router-link></p>
        </div>
      </div>
    </div>

    <!-- Terms Modal -->
    <div v-if="showTerms" class="modal-overlay" @click="showTerms = false">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>Terms of Service</h3>
          <button class="modal-close" @click="showTerms = false">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="modal-body">
          <p>By using Anchorless, you agree to our terms and conditions...</p>
          <!-- Add full terms content here -->
        </div>
      </div>
    </div>

    <!-- Privacy Modal -->
    <div v-if="showPrivacy" class="modal-overlay" @click="showPrivacy = false">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>Privacy Policy</h3>
          <button class="modal-close" @click="showPrivacy = false">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="modal-body">
          <p>Your privacy is important to us. Learn how we protect your data...</p>
          <!-- Add full privacy policy content here -->
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { useAuthStore } from '@/stores/auth'

export default {
  name: 'SignupView',
  data() {
    return {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      confirmPassword: '',
      showPassword: false,
      showConfirmPassword: false,
      agreeToTerms: false,
      loading: false,
      error: null,
      success: null,
      showTerms: false,
      showPrivacy: false
    }
  },
  computed: {
    passwordsMatch() {
      return this.password === this.confirmPassword && this.password.length > 0
    },
    
    passwordStrength() {
      if (!this.password) return 'weak'
      
      const strength = this.calculatePasswordStrength(this.password)
      if (strength < 2) return 'weak'
      if (strength < 4) return 'medium'
      return 'strong'
    },
    
    passwordStrengthText() {
      const strength = this.passwordStrength
      return strength === 'weak' ? 'Weak' : strength === 'medium' ? 'Medium' : 'Strong'
    },
    
    isFormValid() {
      return (
        this.firstName &&
        this.lastName &&
        this.email &&
        this.password &&
        this.confirmPassword &&
        this.passwordsMatch &&
        this.agreeToTerms &&
        this.password.length >= 8
      )
    }
  },
  methods: {
    calculatePasswordStrength(password) {
      let strength = 0
      if (password.length >= 8) strength++
      if (/[A-Z]/.test(password)) strength++
      if (/[a-z]/.test(password)) strength++
      if (/[0-9]/.test(password)) strength++
      if (/[^A-Za-z0-9]/.test(password)) strength++
      return strength
    },
    
    async signup() {
      // Clear previous messages
      this.error = null
      this.success = null
      
      // Validate inputs
      if (!this.isFormValid) {
        this.error = 'Please fill in all fields correctly and agree to the terms.'
        return
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(this.email)) {
        this.error = 'Please enter a valid email address'
        return
      }

      // Validate password strength
      if (this.passwordStrength === 'weak') {
        this.error = 'Please choose a stronger password (min 8 characters with mix of letters, numbers, and symbols)'
        return
      }

      this.loading = true

      try {
        const response = await fetch('http://localhost:8000/auth/register/', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: this.email,
            password: this.password,
            password2: this.confirmPassword,
            first_name: this.firstName,
            last_name: this.lastName
          })
        })

        const data = await response.json()

        if (!response.ok) {
          // Handle error responses
          if (response.status === 400) {
            // Django validation errors
            if (data.email) {
              this.error = data.email[0]
            } else if (data.password) {
              this.error = data.password[0]
            } else if (data.non_field_errors) {
              this.error = data.non_field_errors[0]
            } else {
              this.error = 'Please check your information and try again.'
            }
          } else if (response.status === 500) {
            this.error = 'Server error. Please try again later.'
          } else {
            this.error = data.message || 'An error occurred during registration.'
          }
          return
        }

        // Success - Show success message
        this.success = data.message || 'Registration successful! Please check your email for verification.'

        // Clear form
        this.firstName = ''
        this.lastName = ''
        this.email = ''
        this.password = ''
        this.confirmPassword = ''
        this.agreeToTerms = false

        localStorage.setItem('pending_verification_email', this.email)

        // Optionally redirect to login after delay
        setTimeout(() => {
          this.$router.push({ 
            name: 'verify-email-sent',
            query: { email: this.email }
          })
        }, 2000)

      } catch (error) {
        console.error('Signup error:', error)
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
/* Base styles from LoginView */
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
  max-width: 500px;
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
.name-fields {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

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

/* Password Strength */
.password-strength {
  margin-top: 0.5rem;
}

.strength-bar {
  height: 4px;
  border-radius: 2px;
  margin-bottom: 0.25rem;
  transition: all 0.3s ease;
}

.strength-bar.weak {
  width: 33%;
  background: #ef4444;
}

.strength-bar.medium {
  width: 66%;
  background: #f59e0b;
}

.strength-bar.strong {
  width: 100%;
  background: #10b981;
}

.strength-text {
  font-size: 0.8rem;
  color: var(--gray);
}

/* Password Match Indicator */
.password-match {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.8rem;
  margin-top: 0.5rem;
}

.password-match.success {
  color: #10b981;
}

.password-match.error {
  color: #ef4444;
}

/* Form Options */
.form-options {
  margin-bottom: 1.5rem;
}

.terms-agreement {
  display: flex;
  align-items: flex-start;
  gap: 0.5rem;
  color: var(--gray);
  font-size: 0.9rem;
  cursor: pointer;
  line-height: 1.4;
}

.terms-agreement input[type="checkbox"] {
  margin-top: 0.2rem;
  cursor: pointer;
}

.terms-agreement a {
  color: var(--primary);
  text-decoration: none;
}

.terms-agreement a:hover {
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

/* Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  backdrop-filter: blur(5px);
}

.modal-content {
  background: var(--card-bg);
  border-radius: 15px;
  border: 1px solid rgba(0, 245, 255, 0.3);
  max-width: 500px;
  width: 90%;
  max-height: 80vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid rgba(0, 245, 255, 0.2);
}

.modal-header h3 {
  color: var(--light);
  margin: 0;
}

.modal-close {
  background: none;
  border: none;
  color: var(--gray);
  cursor: pointer;
  font-size: 1.2rem;
  transition: color 0.3s ease;
}

.modal-close:hover {
  color: var(--primary);
}

.modal-body {
  padding: 1.5rem;
  color: var(--gray);
  line-height: 1.6;
}

/* Responsive */
@media (max-width: 768px) {
  .auth-card {
    padding: 2rem;
  }

  .name-fields {
    grid-template-columns: 1fr;
  }

  .modal-content {
    width: 95%;
    margin: 1rem;
  }
}

@media (max-width: 480px) {
  .auth-card {
    padding: 1.5rem;
  }
  
  .auth-form-container {
    padding: 1rem;
  }
}
</style>