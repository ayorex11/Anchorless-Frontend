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
        <div class="verification-icon">
          <i class="fas fa-envelope-circle-check"></i>
        </div>
        
        <h2>Check Your Email</h2>
        <p class="auth-subtitle">We've sent a verification link to your email address</p>
        
        <div class="verification-details">
          <div class="email-display">
            <i class="fas fa-envelope"></i>
            <span class="email-text">{{ email }}</span>
          </div>
          
          <div class="verification-info">
            <div class="info-item">
              <i class="fas fa-clock"></i>
              <span>Link expires in 24 hours</span>
            </div>
            <div class="info-item">
              <i class="fas fa-shield-check"></i>
              <span>Secure verification process</span>
            </div>
          </div>
        </div>

        <div class="action-buttons">
          <button class="btn btn-primary btn-full" @click="resendVerification" :disabled="resendLoading">
            <span v-if="!resendLoading">Resend Verification Email</span>
            <span v-else class="loading-spinner">
              <i class="fas fa-spinner fa-spin"></i> Sending...
            </span>
          </button>
          
          <router-link to="/login" class="btn btn-outline btn-full">
            Back to Login
          </router-link>
        </div>

        <div class="help-section">
          <h4>Didn't receive the email?</h4>
          <ul>
            <li>Check your spam or junk folder</li>
            <li>Make sure you entered the correct email address</li>
            <li>Wait a few minutes and try again</li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { useAuthStore } from '@/stores/auth'

export default {
  name: 'VerifyEmailSentView',
  data() {
    return {
      email: '',
      resendLoading: false
    }
  },
  methods: {
    async resendVerification() {
      if (!this.email) return
      
      this.resendLoading = true
      try {
        const response = await fetch('http://localhost:8000/auth/resend-verification/', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: this.email
          })
        })

        if (response.ok) {
          this.$notify({
            title: 'Verification Email Sent',
            text: 'We\'ve sent a new verification link to your email.',
            type: 'success'
          })
        } else {
          throw new Error('Failed to resend verification email')
        }
      } catch (error) {
        console.error('Resend verification error:', error)
        this.$notify({
          title: 'Error',
          text: 'Failed to resend verification email. Please try again.',
          type: 'error'
        })
      } finally {
        this.resendLoading = false
      }
    }
  },
  mounted() {
    // Get email from route query or localStorage
    this.email = this.$route.query.email || localStorage.getItem('pending_verification_email') || 'your email address'
    
    // Store email for potential resend
    if (this.email) {
      localStorage.setItem('pending_verification_email', this.email)
    }
  },
  beforeUnmount() {
    // Clean up stored email when leaving the page
    localStorage.removeItem('pending_verification_email')
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

.verification-icon {
  font-size: 4rem;
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
}

.verification-details {
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

.verification-info {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  color: var(--gray);
  font-size: 0.9rem;
}

.info-item i {
  color: var(--primary);
  width: 16px;
}

.action-buttons {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 2rem;
}

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

.btn-outline:hover {
  background: var(--primary);
  color: var(--dark);
  box-shadow: var(--glow);
}

.btn-full {
  width: 100%;
  padding: 1rem;
  font-size: 1rem;
}

.loading-spinner {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.help-section {
  text-align: left;
  background: rgba(255, 255, 255, 0.05);
  padding: 1.5rem;
  border-radius: 10px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.help-section h4 {
  color: var(--light);
  margin-bottom: 1rem;
  font-size: 1.1rem;
}

.help-section ul {
  list-style: none;
  padding: 0;
}

.help-section li {
  color: var(--gray);
  margin-bottom: 0.5rem;
  padding-left: 1.5rem;
  position: relative;
}

.help-section li:before {
  content: '•';
  color: var(--primary);
  position: absolute;
  left: 0.5rem;
}

/* Responsive */
@media (max-width: 768px) {
  .auth-card {
    padding: 2rem;
  }
  
  .verification-icon {
    font-size: 3rem;
  }
  
  .email-display {
    flex-direction: column;
    text-align: center;
  }
}
</style>