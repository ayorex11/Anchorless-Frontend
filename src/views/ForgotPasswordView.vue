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
        <div class="password-reset-icon">
          <i class="fas fa-key"></i>
        </div>
        
        <h2>Reset Your Password</h2>
        <p class="auth-subtitle">Enter your email address and we'll send you a link to reset your password</p>
        
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
        
        <form class="auth-form" @submit.prevent="requestReset" v-if="!success">
          <div class="form-group">
            <label for="email">
              <i class="fas fa-envelope"></i>
              Email Address
            </label>
            <input 
              type="email" 
              id="email" 
              v-model="email" 
              placeholder="Enter your email address" 
              :disabled="loading"
              required
            >
          </div>
          
          <button 
            type="submit" 
            class="btn btn-primary btn-full" 
            :disabled="loading"
          >
            <span v-if="!loading">Send Reset Link</span>
            <span v-else class="loading-spinner">
              <i class="fas fa-spinner fa-spin"></i> Sending...
            </span>
          </button>
        </form>

        <div class="success-content" v-if="success">
          <div class="success-details">
            <div class="email-display">
              <i class="fas fa-envelope"></i>
              <span class="email-text">{{ email }}</span>
            </div>
            
            <div class="instructions">
              <h4>What to do next:</h4>
              <ul>
                <li>Check your email for a password reset link</li>
                <li>Click the link to create a new password</li>
                <li>The link will expire in 1 hour for security</li>
              </ul>
            </div>
          </div>

          <div class="action-buttons">
            <button class="btn btn-outline btn-full" @click="resendEmail" :disabled="resendLoading">
              <span v-if="!resendLoading">Resend Email</span>
              <span v-else class="loading-spinner">
                <i class="fas fa-spinner fa-spin"></i> Resending...
              </span>
            </button>
            
            <router-link to="/login" class="btn btn-primary btn-full">
              Back to Login
            </router-link>
          </div>
        </div>

        <div class="auth-links">
          <p>Remember your password? <router-link to="/login">Sign in</router-link></p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ForgotPasswordView',
  data() {
    return {
      email: '',
      loading: false,
      resendLoading: false,
      error: null,
      success: null
    }
  },
  methods: {
    async requestReset() {
      // Clear previous messages
      this.error = null
      this.success = null
      
      // Validate inputs
      if (!this.email) {
        this.error = 'Please enter your email address'
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
        const response = await fetch('http://localhost:8000/auth/forgot-password/', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: this.email
          })
        })

        const data = await response.json()

        if (!response.ok) {
          // Handle error responses
          if (response.status === 400) {
            this.error = data.error || data.detail || 'Please check your email address and try again.'
          } else if (response.status === 404) {
            // For security, we show the same message regardless of whether email exists
            this.success = 'If an account with that email exists, a password reset link has been sent.'
          } else if (response.status === 500) {
            this.error = 'Server error. Please try again later.'
          } else {
            this.error = 'An error occurred. Please try again.'
          }
          return
        }

        // Success - Show success message
        this.success = data.message || 'Password reset link has been sent to your email address.'

      } catch (error) {
        console.error('Password reset request error:', error)
        this.error = 'Network error. Please check your connection and try again.'
      } finally {
        this.loading = false
      }
    },

    async resendEmail() {
      this.resendLoading = true
      this.error = null

      try {
        const response = await fetch('http://localhost:8000/auth/forgot-password/', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: this.email
          })
        })

        if (response.ok) {
          this.success = 'Password reset link has been sent again to your email address.'
        } else {
          throw new Error('Failed to resend email')
        }
      } catch (error) {
        console.error('Resend email error:', error)
        this.error = 'Failed to resend email. Please try again.'
      } finally {
        this.resendLoading = false
      }
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
  max-width: 500px;
  backdrop-filter: blur(10px);
  text-align: center;
}

.password-reset-icon {
  font-size: 3.5rem;
  color: var(--primary);
  margin-bottom: 1.5rem;
  animation: bounce 2s infinite;
}

@keyframes bounce {
  0%, 20%, 50%, 80%, 100% {
    transform: translateY(0);
  }
  40% {
    transform: translateY(-10px);
  }
  60% {
    transform: translateY(-5px);
  }
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
  font-size: 1.1rem;
  line-height: 1.6;
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

/* Button Styles */
.btn {
  padding: 0.7rem 1.5rem;
  border-radius: 30px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  border: none;
  font-size: 0.9rem;
  text-decoration: none;
  display: flex;
  align-items: center;
  justify-content: center;
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

.btn-outline {
  background: transparent;
  color: var(--primary);
  border: 1px solid var(--primary);
}

.btn-outline:hover:not(:disabled) {
  background: var(--primary);
  color: var(--dark);
  box-shadow: var(--glow);
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

/* Success Content */
.success-content {
  animation: fadeIn 0.5s ease;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.success-details {
  background: rgba(0, 245, 255, 0.1);
  border: 1px solid rgba(0, 245, 255, 0.2);
  border-radius: 10px;
  padding: 1.5rem;
  margin-bottom: 2rem;
}

.email-display {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
  padding: 1rem;
  background: rgba(0, 245, 255, 0.05);
  border-radius: 8px;
}

.email-display i {
  color: var(--primary);
  font-size: 1.2rem;
}

.email-text {
  color: var(--light);
  font-weight: 600;
  font-size: 1.1rem;
}

.instructions {
  text-align: left;
}

.instructions h4 {
  color: var(--light);
  margin-bottom: 1rem;
  font-size: 1.1rem;
}

.instructions ul {
  list-style: none;
  padding: 0;
}

.instructions li {
  color: var(--gray);
  margin-bottom: 0.5rem;
  padding-left: 1.5rem;
  position: relative;
}

.instructions li:before {
  content: '•';
  color: var(--primary);
  position: absolute;
  left: 0.5rem;
}

.action-buttons {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 2rem;
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
  
  .password-reset-icon {
    font-size: 3rem;
  }
}
</style>