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
        
        <form class="auth-form" @submit.prevent="signup">
          <div class="form-group">
            <label for="fullName">Full Name</label>
            <input type="text" id="fullName" v-model="fullName" placeholder="Enter your full name" required>
          </div>
          
          <div class="form-group">
            <label for="email">Email</label>
            <input type="email" id="email" v-model="email" placeholder="Enter your email" required>
          </div>
          
          <div class="form-group">
            <label for="password">Password</label>
            <input type="password" id="password" v-model="password" placeholder="Create a password" required>
          </div>
          
          <div class="form-group">
            <label for="confirmPassword">Confirm Password</label>
            <input type="password" id="confirmPassword" v-model="confirmPassword" placeholder="Confirm your password" required>
          </div>
          
          <button type="submit" class="btn btn-primary btn-full">Create Account</button>
        </form>
        
        <div class="auth-links">
          <p>Already have an account? <router-link to="/login">Sign in</router-link></p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'SignupView',
  data() {
    return {
      fullName: '',
      email: '',
      password: '',
      confirmPassword: ''
    }
  },
  methods: {
    signup() {
      console.log('Signup attempt:', this.email);
      this.$router.push('/dashboard');
    }
  }
}
</script>

<style scoped>
/* Same styles as LoginView */
.auth-container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.auth-form-container {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
}

.auth-card {
  background: var(--card-bg);
  padding: 3rem;
  border-radius: 20px;
  border: 1px solid rgba(0, 245, 255, 0.2);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
  width: 100%;
  max-width: 400px;
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

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  color: var(--light);
  font-weight: 500;
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

.btn-full {
  width: 100%;
  margin-top: 1rem;
}

.auth-links {
  margin-top: 2rem;
  text-align: center;
  color: var(--gray);
}

.auth-links a {
  color: var(--primary);
  text-decoration: none;
}

.auth-links a:hover {
  text-decoration: underline;
}
</style>