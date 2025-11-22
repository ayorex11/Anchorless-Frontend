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
        <div class="verification-icon success">
          <i class="fas fa-check-circle"></i>
        </div>
        
        <h2>Email Verified!</h2>
        <p class="auth-subtitle">Your email has been successfully verified</p>
        
        <div class="success-message">
          <p>Thank you for verifying your email address. You can now access all features of Anchorless and start your journey to financial freedom.</p>
        </div>

        <div class="action-buttons">
          <router-link to="/login" class="btn btn-primary btn-full">
            Continue to Login
          </router-link>
          
          <router-link to="/" class="btn btn-outline btn-full">
            Back to Home
          </router-link>
        </div>

        <div class="next-steps">
          <h4>What's Next?</h4>
          <div class="steps">
            <div class="step">
              <div class="step-icon">1</div>
              <div class="step-content">
                <strong>Login to Your Account</strong>
                <p>Sign in with your email and password</p>
              </div>
            </div>
            <div class="step">
              <div class="step-icon">2</div>
              <div class="step-content">
                <strong>Add Your Debts</strong>
                <p>Input your loans, credit cards, and other debts</p>
              </div>
            </div>
            <div class="step">
              <div class="step-icon">3</div>
              <div class="step-content">
                <strong>Choose Your Strategy</strong>
                <p>Select snowball or avalanche method</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'VerifyEmailView',
  data() {
    return {
      loading: true,
      error: null
    }
  },
  async mounted() {
    const token = this.$route.params.token
    
    if (!token) {
      this.error = 'Invalid verification link'
      this.loading = false
      return
    }

    try {
      const response = await fetch(`http://localhost:8000/auth/verify-email/${token}/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Verification failed')
      }

      // Success - verification completed
      this.loading = false
      
    } catch (error) {
      console.error('Verification error:', error)
      this.error = error.message || 'Failed to verify email. The link may be expired or invalid.'
      this.loading = false
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

.verification-icon.success {
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

.auth-card h2 {
  font-size: 2rem;
  margin-bottom: 0.5rem;
  background: linear-gradient(to right, #10b981, var(--primary));
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}

.auth-subtitle {
  color: var(--gray);
  margin-bottom: 2rem;
  font-size: 1.1rem;
}

.success-message {
  background: rgba(16, 185, 129, 0.1);
  border: 1px solid rgba(16, 185, 129, 0.2);
  border-radius: 10px;
  padding: 1.5rem;
  margin-bottom: 2rem;
}

.success-message p {
  color: var(--light);
  line-height: 1.6;
  margin: 0;
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

.btn-primary:hover {
  box-shadow: var(--glow);
  transform: translateY(-2px);
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

.next-steps {
  text-align: left;
  background: rgba(255, 255, 255, 0.05);
  padding: 1.5rem;
  border-radius: 10px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.next-steps h4 {
  color: var(--light);
  margin-bottom: 1.5rem;
  text-align: center;
  font-size: 1.1rem;
}

.steps {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.step {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
}

.step-icon {
  width: 32px;
  height: 32px;
  background: var(--primary);
  color: var(--dark);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 0.9rem;
  flex-shrink: 0;
}

.step-content {
  flex: 1;
}

.step-content strong {
  color: var(--light);
  display: block;
  margin-bottom: 0.25rem;
}

.step-content p {
  color: var(--gray);
  margin: 0;
  font-size: 0.9rem;
}

/* Error state */
.error-message {
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.3);
  border-radius: 10px;
  padding: 1.5rem;
  margin-bottom: 2rem;
  color: #fca5a5;
}

.error-icon {
  font-size: 3rem;
  color: #ef4444;
  margin-bottom: 1rem;
}

/* Responsive */
@media (max-width: 768px) {
  .auth-card {
    padding: 2rem;
  }
  
  .verification-icon.success {
    font-size: 3rem;
  }
  
  .steps {
    gap: 1.5rem;
  }
  
  .step {
    flex-direction: column;
    text-align: center;
    gap: 0.75rem;
  }
}
</style>