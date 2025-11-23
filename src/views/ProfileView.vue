<template>
  <div class="dashboard">
    <div class="bg-animation"></div>
    
    <header>
      <router-link to="/" class="logo">
        anchor<span>less</span>
      </router-link>
      <nav>
        <ul>
          <li><router-link to="/dashboard">Dashboard</router-link></li>
          <li><a href="#debts">My Debts</a></li>
          <li><a href="#strategy">Strategy</a></li>
          <li><a href="#progress">Progress</a></li>
        </ul>
      </nav>
      <div class="user-menu">
        <div class="user-info">
          <i class="fas fa-user-circle"></i>
          <span>{{ user?.email || 'User' }}</span>
        </div>
        <button class="btn btn-outline" @click="handleLogout">
          <i class="fas fa-sign-out-alt"></i> Log Out
        </button>
      </div>
    </header>

    <main class="dashboard-main">
      <div class="container">
        <!-- Success Alert -->
        <div v-if="success" class="alert alert-success">
          <i class="fas fa-check-circle"></i>
          <span>{{ success }}</span>
        </div>

        <!-- Error Alert -->
        <div v-if="error" class="alert alert-error">
          <i class="fas fa-exclamation-circle"></i>
          <span>{{ error }}</span>
        </div>

        <!-- Profile Header -->
        <div class="profile-header">
          <div class="profile-avatar">
            <i class="fas fa-user-circle"></i>
          </div>
          <div class="profile-info">
            <h1>{{ user?.first_name }} {{ user?.last_name }}</h1>
            <p class="profile-email">{{ user?.email }}</p>
            <div class="profile-status">
              <span class="status-badge" :class="user?.is_verified ? 'verified' : 'unverified'">
                <i class="fas" :class="user?.is_verified ? 'fa-check-circle' : 'fa-clock'"></i>
                {{ user?.is_verified ? 'Verified' : 'Unverified' }}
              </span>
              <span class="member-since">Member since {{ formattedJoinDate }}</span>
            </div>
          </div>
        </div>

        <!-- Profile Content -->
        <div class="profile-content">
          <!-- Account Information -->
          <div class="profile-section">
            <div class="section-header">
              <h2><i class="fas fa-user-cog"></i> Account Information</h2>
            </div>
            <div class="section-content">
              <div class="info-grid">
                <div class="info-item">
                  <label>First Name</label>
                  <div class="info-value">{{ user?.first_name || 'Not set' }}</div>
                </div>
                <div class="info-item">
                  <label>Last Name</label>
                  <div class="info-value">{{ user?.last_name || 'Not set' }}</div>
                </div>
                <div class="info-item">
                  <label>Email Address</label>
                  <div class="info-value">{{ user?.email }}</div>
                </div>
                <div class="info-item">
                  <label>Account Created</label>
                  <div class="info-value">{{ formattedJoinDate }}</div>
                </div>
                <div class="info-item">
                  <label>Last Updated</label>
                  <div class="info-value">{{ formattedUpdateDate }}</div>
                </div>
              </div>
            </div>
          </div>

          <!-- Security -->
          <div class="profile-section">
            <div class="section-header">
              <h2><i class="fas fa-shield-alt"></i> Security</h2>
            </div>
            <div class="section-content">
              <div class="security-actions">
                <button class="btn btn-outline btn-full" @click="showPasswordModal = true">
                  <i class="fas fa-key"></i>
                  Change Password
                </button>
                <button class="btn btn-outline btn-full" @click="resendVerification" v-if="!user?.is_verified">
                  <i class="fas fa-envelope"></i>
                  Resend Verification Email
                </button>
              </div>
            </div>
          </div>

          <!-- Quick Actions -->
          <div class="profile-section">
            <div class="section-header">
              <h2><i class="fas fa-bolt"></i> Quick Actions</h2>
            </div>
            <div class="section-content">
              <div class="action-buttons">
                <button class="btn btn-primary" @click="$router.push('/dashboard')">
                  <i class="fas fa-tachometer-alt"></i>
                  Back to Dashboard
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>

    <!-- Password Change Modal -->
    <div v-if="showPasswordModal" class="modal-overlay" @click="showPasswordModal = false">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>Change Password</h3>
          <button class="modal-close" @click="showPasswordModal = false">
            <i class="fas fa-times"></i>
          </button>
        </div>
        
        <div class="modal-body">
          <!-- Modal Success Alert -->
          <div v-if="modalSuccess" class="alert alert-success">
            <i class="fas fa-check-circle"></i>
            <span>{{ modalSuccess }}</span>
          </div>

          <!-- Modal Error Alert -->
          <div v-if="modalError" class="alert alert-error">
            <i class="fas fa-exclamation-circle"></i>
            <span>{{ modalError }}</span>
          </div>

          <form class="password-form" @submit.prevent="changePassword">
            <div class="form-group">
              <label for="oldPassword">
                <i class="fas fa-lock"></i>
                Current Password
              </label>
              <input 
                type="password" 
                id="oldPassword" 
                v-model="oldPassword" 
                placeholder="Enter your current password"
                required
                :disabled="loading"
              >
            </div>

            <div class="form-group">
              <label for="newPassword">
                <i class="fas fa-key"></i>
                New Password
              </label>
              <input 
                type="password" 
                id="newPassword" 
                v-model="newPassword" 
                placeholder="Enter your new password"
                required
                minlength="8"
                :disabled="loading"
              >
            </div>

            <div class="modal-actions">
              <button 
                type="button" 
                class="btn btn-outline" 
                @click="closeModal"
                :disabled="loading"
              >
                Cancel
              </button>
              <button 
                type="submit" 
                class="btn btn-primary" 
                :disabled="loading || !oldPassword || !newPassword || newPassword.length < 8"
              >
                <span v-if="!loading">Change Password</span>
                <span v-else class="loading-spinner">
                  <i class="fas fa-spinner fa-spin"></i> Changing...
                </span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { useAuthStore } from '@/stores/auth'
import { api } from '@/utils/api'

export default {
  name: 'ProfileView',
  data() {
    return {
      user: null,
      loading: false,
      showPasswordModal: false,
      oldPassword: '',
      newPassword: '',
      success: null,
      error: null,
      modalSuccess: null,
      modalError: null
    }
  },
  computed: {
    formattedJoinDate() {
      if (!this.user?.created_at) return 'N/A'
      return new Date(this.user.created_at).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    },
    formattedUpdateDate() {
      if (!this.user?.updated_at) return 'N/A'
      return new Date(this.user.updated_at).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    }
  },
  methods: {
    clearMessages() {
      this.success = null
      this.error = null
      this.modalSuccess = null
      this.modalError = null
    },

    closeModal() {
      this.showPasswordModal = false
      this.oldPassword = ''
      this.newPassword = ''
      this.modalSuccess = null
      this.modalError = null
    },

    async handleLogout() {
      const authStore = useAuthStore()
      authStore.logout()
      this.$router.push('/')
    },

    async fetchUserProfile() {
      this.loading = true
      this.clearMessages()
      try {
        const response = await api.get('/auth/profile/')
        if (response.ok) {
          this.user = await response.json()
        } else {
          this.error = 'Failed to load profile data'
        }
      } catch (error) {
        console.error('Error fetching user profile:', error)
        this.error = 'Failed to load profile data'
      } finally {
        this.loading = false
      }
    },

    async changePassword() {
      this.loading = true
      this.modalSuccess = null
      this.modalError = null
      
      try {
        const response = await api.post('/auth/change-password/', {
          old_password: this.oldPassword,
          new_password: this.newPassword
        })

        if (response.ok) {
          this.modalSuccess = 'Password changed successfully! You will be logged out for security.'
          
          // Clear form
          this.oldPassword = ''
          this.newPassword = ''
          
          // Logout after a delay
          setTimeout(() => {
            this.showPasswordModal = false
            const authStore = useAuthStore()
            authStore.logout()
            this.$router.push('/login')
          }, 3000)
          
        } else {
          const data = await response.json()
          this.modalError = data.message || data.detail || 'Failed to change password'
        }
      } catch (error) {
        console.error('Password change error:', error)
        this.modalError = 'Network error. Please try again.'
      } finally {
        this.loading = false
      }
    },

    async resendVerification() {
      if (!this.user?.email) return
      
      this.loading = true
      this.clearMessages()
      
      try {
        const response = await api.post('/auth/resend-verification/', {
          email: this.user.email
        })
        
        if (response.ok) {
          this.success = 'Verification email sent! Please check your inbox.'
        } else {
          throw new Error('Failed to resend verification email')
        }
      } catch (error) {
        console.error('Resend verification error:', error)
        this.error = 'Failed to resend verification email. Please try again.'
      } finally {
        this.loading = false
      }
    }
  },
  async mounted() {
    const authStore = useAuthStore()
    this.user = authStore.getUser
    
    // Fetch fresh profile data from API
    await this.fetchUserProfile()
  }
}
</script>

<style scoped>

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

.dashboard {
  min-height: 100vh;
  background: var(--darker);
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
  display: flex;
  justify-content: space-between;
  align-items: center;
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

nav ul {
  display: flex;
  list-style: none;
  gap: 2rem;
}

nav ul li a {
  color: var(--light);
  text-decoration: none;
  font-weight: 500;
  transition: all 0.3s ease;
  position: relative;
  cursor: pointer;
}

nav ul li a:hover {
  color: var(--primary);
}

nav ul li a.router-link-active {
  color: var(--primary);
}

nav ul li a.router-link-active::after {
  content: '';
  position: absolute;
  bottom: -5px;
  left: 0;
  width: 100%;
  height: 2px;
  background: var(--primary);
}

.user-menu {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--light);
  font-size: 0.9rem;
}

.user-info i {
  font-size: 1.5rem;
  color: var(--primary);
}

.btn {
  padding: 0.7rem 1.5rem;
  border-radius: 30px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  border: none;
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
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

.btn-primary {
  background: var(--primary);
  color: var(--dark);
}

.btn-primary:hover {
  box-shadow: var(--glow);
  transform: translateY(-2px);
}

.btn-full {
  width: 100%;
}

.dashboard-main {
  padding: 8rem 5% 4rem;
}

.container {
  max-width: 800px;
  margin: 0 auto;
}

/* Profile Header */
.profile-header {
  display: flex;
  align-items: center;
  gap: 2rem;
  margin-bottom: 3rem;
  padding: 2rem;
  background: var(--card-bg);
  border-radius: 15px;
  border: 1px solid rgba(0, 245, 255, 0.2);
}

.profile-avatar {
  font-size: 4rem;
  color: var(--primary);
}

.profile-info h1 {
  font-size: 2rem;
  margin-bottom: 0.5rem;
  color: var(--light);
}

.profile-email {
  color: var(--gray);
  font-size: 1.1rem;
  margin-bottom: 1rem;
}

.profile-status {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
}

.status-badge {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 600;
}

.status-badge.verified {
  background: rgba(34, 197, 94, 0.2);
  color: #86efac;
  border: 1px solid rgba(34, 197, 94, 0.3);
}

.status-badge.unverified {
  background: rgba(245, 158, 11, 0.2);
  color: #fcd34d;
  border: 1px solid rgba(245, 158, 11, 0.3);
}

.member-since {
  color: var(--gray);
  font-size: 0.9rem;
}

/* Profile Content */
.profile-content {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.profile-section {
  background: var(--card-bg);
  border-radius: 15px;
  border: 1px solid rgba(0, 245, 255, 0.2);
  overflow: hidden;
}

.section-header {
  padding: 1.5rem 2rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(0, 245, 255, 0.05);
}

.section-header h2 {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  color: var(--light);
  font-size: 1.3rem;
  margin: 0;
}

.section-header i {
  color: var(--primary);
}

.section-content {
  padding: 2rem;
}

/* Info Grid */
.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.info-item label {
  color: var(--gray);
  font-size: 0.9rem;
  font-weight: 500;
}

.info-value {
  color: var(--light);
  font-size: 1rem;
  font-weight: 600;
}

/* Security Actions */
.security-actions {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  max-width: 400px;
}

/* Action Buttons */
.action-buttons {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
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
  width: 100%;
  max-width: 450px;
  margin: 2rem;
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
  font-size: 1.5rem;
}

.modal-close {
  background: none;
  border: none;
  color: var(--gray);
  cursor: pointer;
  font-size: 1.2rem;
  transition: color 0.3s ease;
  padding: 0.5rem;
}

.modal-close:hover {
  color: var(--primary);
}

.modal-body {
  padding: 1.5rem;
}

.password-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-group label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
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

.modal-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  margin-top: 1rem;
}

.modal-actions .btn {
  min-width: 120px;
}

.loading-spinner {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

/* Responsive */
@media (max-width: 768px) {
  header {
    flex-direction: column;
    gap: 1rem;
    padding: 1rem 5%;
  }
  
  nav ul {
    gap: 1rem;
  }
  
  .dashboard-main {
    padding: 6rem 5% 2rem;
  }
  
  .profile-header {
    flex-direction: column;
    text-align: center;
    gap: 1rem;
  }
  
  .profile-info h1 {
    font-size: 1.5rem;
  }
  
  .profile-status {
    justify-content: center;
  }
  
  .info-grid {
    grid-template-columns: 1fr;
  }
  
  .action-buttons {
    flex-direction: column;
  }
  
  .action-buttons .btn {
    justify-content: center;
  }

  .modal-content {
    margin: 1rem;
  }
  
  .modal-actions {
    flex-direction: column;
  }
  
  .modal-actions .btn {
    width: 100%;
  }
}

@media (max-width: 480px) {
  .container {
    padding: 0 1rem;
  }
  
  .profile-header,
  .section-content {
    padding: 1.5rem;
  }
  
  .security-actions {
    max-width: 100%;
  }
}
</style>