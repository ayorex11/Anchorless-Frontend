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
        <h2>Create New Password</h2>
        <p class="auth-subtitle">Enter your new password below</p>
        
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
        
        <form class="auth-form" @submit.prevent="resetPassword" v-if="!success">
          <div class="form-group">
            <label for="newPassword">
              <i class="fas fa-lock"></i>
              New Password
            </label>
            <div class="password-input-wrapper">
              <input 
                :type="showNewPassword ? 'text' : 'password'" 
                id="newPassword" 
                v-model="newPassword" 
                placeholder="Enter new password"
                :disabled="loading"
                required
              >
              <button 
                type="button" 
                class="toggle-password" 
                @click="showNewPassword = !showNewPassword"
                :disabled="loading"
              >
                <i :class="showNewPassword ? 'fas fa-eye-slash' : 'fas fa-eye'"></i>
              </button>
            </div>
          </div>
          
          <div class="form-group">
            <label for="confirmPassword">
              <i class="fas fa-lock"></i>
              Confirm New Password
            </label>
            <div class="password-input-wrapper">
              <input 
                :type="showConfirmPassword ? 'text' : 'password'" 
                id="confirmPassword" 
                v-model="confirmPassword" 
                placeholder="Confirm new password"
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
          </div>
          
          <button 
            type="submit" 
            class="btn btn-primary btn-full" 
            :disabled="loading"
          >
            <span v-if="!loading">Reset Password</span>
            <span v-else class="loading-spinner">
              <i class="fas fa-spinner fa-spin"></i> Resetting...
            </span>
          </button>
        </form>

        <div class="success-content" v-if="success">
          <div class="success-icon">
            <i class="fas fa-check-circle"></i>
          </div>
          <h3>Password Reset Successful!</h3>
          <p>Your password has been updated successfully. You can now sign in with your new password.</p>
          
          <div class="action-buttons">
            <router-link to="/login" class="btn btn-primary btn-full">
              Continue to Login
            </router-link>
          </div>
        </div>

        <div class="auth-links" v-if="!success">
          <p>Remember your password? <router-link to="/login">Sign in</router-link></p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ResetPasswordView',
  data() {
    return {
      token: '',
      newPassword: '',
      confirmPassword: '',
      showNewPassword: false,
      showConfirmPassword: false,
      loading: false,
      error: null,
      success: null
    }
  },
  methods: {
    async resetPassword() {
      // Clear previous messages
      this.error = null
      this.success = null
      
      // Validate inputs
      if (!this.newPassword || !this.confirmPassword) {
        this.error = 'Please fill in all fields'
        return
      }

      // Validate password match
      if (this.newPassword !== this.confirmPassword) {
        this.error = 'Passwords do not match'
        return
      }

      // Validate password length
      if (this.newPassword.length < 8) {
        this.error = 'Password must be at least 8 characters long'
        return
      }

      this.loading = true

      try {
        const response = await fetch('http://localhost:8000/auth/reset-password/', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            token: this.token,
            new_password: this.newPassword,
            new_password2: this.confirmPassword
          })
        })

        const data = await response.json()

        if (!response.ok) {
          // Handle error responses
          if (response.status === 400) {
            if (data.token) {
              this.error = 'Invalid or expired reset token. Please request a new password reset.'
            } else if (data.new_password) {
              this.error = data.new_password[0]
            } else if (data.non_field_errors) {
              this.error = data.non_field_errors[0]
            } else {
              this.error = 'Please check your information and try again.'
            }
          } else if (response.status === 500) {
            this.error = 'Server error. Please try again later.'
          } else {
            this.error = data.message || 'An error occurred. Please try again.'
          }
          return
        }

        // Success - Show success message
        this.success = data.message || 'Your password has been reset successfully!'

      } catch (error) {
        console.error('Password reset error:', error)
        this.error = 'Network error. Please check your connection and try again.'
      } finally {
        this.loading = false
      }
    }
  },
  mounted() {
    // Get token from route parameters
    this.token = this.$route.params.token
    
    if (!this.token) {
      this.error = 'Invalid reset link. Please check your email and try again.'
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
  text-align: center;
  animation: fadeIn 0.5s ease;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.success-icon {
  font-size: 4rem;
  color: #10b981;
  margin-bottom: 1.5rem;
  animation: scaleIn 0.5s ease-out;
}

@keyframes scaleIn {
  from {
    opacity: 0;
    transform: scale(0.5);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.success-content h3 {
  font-size: 1.5rem;
  margin-bottom: 1rem;
  color: var(--light);
}

.success-content p {
  color: var(--gray);
  margin-bottom: 2rem;
  line-height: 1.6;
}

.action-buttons {
  margin-top: 2rem;
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
}
</style>