<template>
  <div class="dashboard">
    <div class="bg-animation"></div>
    
    <header>
      <router-link to="/" class="logo">
        anchor<span>less</span>
      </router-link>
      <nav>
        <ul>
          <li><router-link to="/dashboard" class="active">Dashboard</router-link></li>
          <li><a href="#debts">My Debts</a></li>
          <li><a href="#strategy">Strategy</a></li>
          <li><a href="#progress">Progress</a></li>
        </ul>
      </nav>
      <div class="user-menu">
        <div class="user-info clickable" @click="$router.push('/profile')">
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
        <!-- Welcome Section -->
        <div class="welcome-section">
          <div class="welcome-content">
            <h1>Welcome Back, {{ user?.first_name || 'Friend' }}! 👋</h1>
            <p>Let's continue your journey to financial freedom</p>
          </div>
          <div class="quick-stats">
            <div class="stat-card">
              <i class="fas fa-wallet"></i>
              <div class="stat-content">
                <span class="stat-label">Total Debt</span>
                <span class="stat-value">${{ totalDebt.toLocaleString() }}</span>
              </div>
            </div>
            <div class="stat-card">
              <i class="fas fa-chart-line"></i>
              <div class="stat-content">
                <span class="stat-label">Paid Off</span>
                <span class="stat-value success">${{ paidOff.toLocaleString() }}</span>
              </div>
            </div>
            <div class="stat-card">
              <i class="fas fa-calendar-alt"></i>
              <div class="stat-content">
                <span class="stat-label">Months Left</span>
                <span class="stat-value">{{ monthsRemaining }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Main Content Grid -->
        <div class="dashboard-grid">
          <!-- Current Strategy Card -->
          <div class="dashboard-card strategy-card">
            <div class="card-header">
              <h2><i class="fas fa-bullseye"></i> Current Strategy</h2>
              <button class="btn btn-sm btn-outline" @click="changeStrategy">Change</button>
            </div>
            <div class="card-content">
              <div class="strategy-display">
                <div class="strategy-badge" :class="currentStrategy.toLowerCase()">
                  {{ currentStrategy }}
                </div>
                <p class="strategy-description">{{ strategyDescription }}</p>
              </div>
              <div class="strategy-stats">
                <div class="stat-item">
                  <span class="label">Next Payment:</span>
                  <span class="value">${{ nextPayment }}</span>
                </div>
                <div class="stat-item">
                  <span class="label">Current Focus:</span>
                  <span class="value">{{ currentFocus }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Debt Progress Card -->
          <div class="dashboard-card progress-card">
            <div class="card-header">
              <h2><i class="fas fa-chart-pie"></i> Debt Progress</h2>
            </div>
            <div class="card-content">
              <div class="progress-circle">
                <svg viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="45" class="progress-bg"></circle>
                  <circle cx="50" cy="50" r="45" class="progress-bar" 
                          :style="{ strokeDashoffset: progressOffset }"></circle>
                </svg>
                <div class="progress-text">
                  <span class="progress-percent">{{ progressPercent }}%</span>
                  <span class="progress-label">Complete</span>
                </div>
              </div>
              <p class="progress-message">
                You've paid off <strong>${{ paidOff.toLocaleString() }}</strong> of your total debt. Keep going!
              </p>
            </div>
          </div>

          <!-- Quick Actions Card -->
          <div class="dashboard-card actions-card">
            <div class="card-header">
              <h2><i class="fas fa-bolt"></i> Quick Actions</h2>
            </div>
            <div class="card-content">
              <button class="action-btn" @click="addDebt">
                <i class="fas fa-plus-circle"></i>
                <span>Add New Debt</span>
              </button>
              <button class="action-btn" @click="recordPayment">
                <i class="fas fa-money-bill-wave"></i>
                <span>Record Payment</span>
              </button>
              <button class="action-btn" @click="viewReport">
                <i class="fas fa-file-alt"></i>
                <span>View Full Report</span>
              </button>
              <button class="action-btn" @click="$router.push('/learn-more')">
                <i class="fas fa-graduation-cap"></i>
                <span>Learn Strategies</span>
              </button>
            </div>
          </div>

          <!-- Active Debts Card -->
          <div class="dashboard-card debts-card full-width">
            <div class="card-header">
              <h2><i class="fas fa-list"></i> Active Debts</h2>
              <button class="btn btn-sm btn-primary" @click="addDebt">
                <i class="fas fa-plus"></i> Add Debt
              </button>
            </div>
            <div class="card-content">
              <div v-if="debts.length === 0" class="empty-state">
                <i class="fas fa-inbox"></i>
                <h3>No Debts Added Yet</h3>
                <p>Start by adding your first debt to create a personalized payoff plan</p>
                <button class="btn btn-primary" @click="addDebt">Add Your First Debt</button>
              </div>
              <div v-else class="debts-list">
                <div v-for="debt in debts" :key="debt.id" class="debt-item">
                  <div class="debt-info">
                    <h3>{{ debt.name }}</h3>
                    <span class="debt-type">{{ debt.type }}</span>
                  </div>
                  <div class="debt-details">
                    <div class="detail">
                      <span class="detail-label">Balance</span>
                      <span class="detail-value">${{ debt.balance.toLocaleString() }}</span>
                    </div>
                    <div class="detail">
                      <span class="detail-label">APR</span>
                      <span class="detail-value">{{ debt.apr }}%</span>
                    </div>
                    <div class="detail">
                      <span class="detail-label">Min. Payment</span>
                      <span class="detail-value">${{ debt.minPayment }}</span>
                    </div>
                  </div>
                  <div class="debt-actions">
                    <button class="btn-icon" title="Edit"><i class="fas fa-edit"></i></button>
                    <button class="btn-icon" title="Delete"><i class="fas fa-trash"></i></button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Upcoming Payments Card -->
          <div class="dashboard-card payments-card full-width">
            <div class="card-header">
              <h2><i class="fas fa-calendar-check"></i> Upcoming Payments</h2>
            </div>
            <div class="card-content">
              <div class="payments-timeline">
                <div v-for="payment in upcomingPayments" :key="payment.id" class="payment-item">
                  <div class="payment-date">
                    <span class="month">{{ payment.month }}</span>
                    <span class="day">{{ payment.day }}</span>
                  </div>
                  <div class="payment-info">
                    <h4>{{ payment.debtName }}</h4>
                    <p>${{ payment.amount }} payment due</p>
                  </div>
                  <button class="btn btn-sm btn-primary">Mark as Paid</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script>
import { useAuthStore } from '@/stores/auth'
import { api } from '@/utils/api'

export default {
  name: 'DashboardView',
  data() {
    return {
      user: null,
      totalDebt: 25000,
      paidOff: 5000,
      monthsRemaining: 24,
      currentStrategy: 'Snowball',
      currentFocus: 'Credit Card A',
      nextPayment: 450,
      debts: [
        {
          id: 1,
          name: 'Credit Card A',
          type: 'Credit Card',
          balance: 5000,
          apr: 18.99,
          minPayment: 150
        },
        {
          id: 2,
          name: 'Student Loan',
          type: 'Student Loan',
          balance: 15000,
          apr: 4.5,
          minPayment: 200
        },
        {
          id: 3,
          name: 'Personal Loan',
          type: 'Personal Loan',
          balance: 5000,
          apr: 12.5,
          minPayment: 100
        }
      ],
      upcomingPayments: [
        { id: 1, month: 'NOV', day: '25', debtName: 'Credit Card A', amount: 150 },
        { id: 2, month: 'NOV', day: '28', debtName: 'Student Loan', amount: 200 },
        { id: 3, month: 'DEC', day: '05', debtName: 'Personal Loan', amount: 100 }
      ]
    }
  },
  computed: {
    progressPercent() {
      const total = this.totalDebt + this.paidOff
      return Math.round((this.paidOff / total) * 100)
    },
    progressOffset() {
      const circumference = 2 * Math.PI * 45
      return circumference - (this.progressPercent / 100) * circumference
    },
    strategyDescription() {
      return this.currentStrategy === 'Snowball' 
        ? 'Paying off smallest debts first for psychological wins'
        : 'Paying off highest interest debts first to save money'
    }
  },
  methods: {
    async handleLogout() {
      const authStore = useAuthStore()
      authStore.logout()
      this.$router.push('/')
    },
    addDebt() {
      console.log('Add debt clicked')
      // Navigate to add debt page or open modal
    },
    recordPayment() {
      console.log('Record payment clicked')
    },
    viewReport() {
      console.log('View report clicked')
    },
    changeStrategy() {
      console.log('Change strategy clicked')
    }
  },
  mounted() {
    const authStore = useAuthStore()
    this.user = authStore.getUser
  }
}
</script>

<style scoped>
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

nav ul li a:hover,
nav ul li a.active {
  color: var(--primary);
}

nav ul li a.active::after {
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

.user-info.clickable {
    cursor: pointer;
    transition: all 0.3s ease;
    padding: 0.5rem;
    border-radius: 8px;
  }

.user-info.clickable:hover {
    background: rgba(0, 245, 255, 0.1);
    transform: translateY(-2px);
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

.btn-sm {
  padding: 0.5rem 1rem;
  font-size: 0.85rem;
}

.dashboard-main {
  padding: 8rem 5% 4rem;
}

.container {
  max-width: 1400px;
  margin: 0 auto;
}

.welcome-section {
  margin-bottom: 3rem;
}

.welcome-content h1 {
  font-size: 2.5rem;
  margin-bottom: 0.5rem;
  background: linear-gradient(to right, var(--primary), var(--accent));
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}

.welcome-content p {
  color: var(--gray);
  font-size: 1.1rem;
}

.quick-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-top: 2rem;
}

.stat-card {
  background: var(--card-bg);
  padding: 1.5rem;
  border-radius: 15px;
  border: 1px solid rgba(0, 245, 255, 0.2);
  display: flex;
  align-items: center;
  gap: 1.5rem;
  transition: all 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 30px rgba(0, 245, 255, 0.2);
}

.stat-card i {
  font-size: 2.5rem;
  color: var(--primary);
}

.stat-content {
  display: flex;
  flex-direction: column;
}

.stat-label {
  color: var(--gray);
  font-size: 0.9rem;
  margin-bottom: 0.25rem;
}

.stat-value {
  color: var(--light);
  font-size: 1.8rem;
  font-weight: 700;
}

.stat-value.success {
  color: #10b981;
}

.dashboard-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 2rem;
}

.dashboard-card {
  background: var(--card-bg);
  border-radius: 15px;
  border: 1px solid rgba(0, 245, 255, 0.2);
  padding: 2rem;
  transition: all 0.3s ease;
}

.dashboard-card:hover {
  border-color: rgba(0, 245, 255, 0.3);
}

.full-width {
  grid-column: 1 / -1;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.card-header h2 {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  color: var(--light);
  font-size: 1.3rem;
}

.card-header i {
  color: var(--primary);
}

.strategy-display {
  margin-bottom: 1.5rem;
}

.strategy-badge {
  display: inline-block;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-weight: 600;
  margin-bottom: 1rem;
}

.strategy-badge.snowball {
  background: rgba(0, 245, 255, 0.2);
  color: var(--primary);
}

.strategy-badge.avalanche {
  background: rgba(138, 43, 226, 0.2);
  color: var(--secondary);
}

.strategy-description {
  color: var(--gray);
  line-height: 1.6;
}

.strategy-stats {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.stat-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.stat-item .label {
  color: var(--gray);
}

.stat-item .value {
  color: var(--light);
  font-weight: 600;
  font-size: 1.1rem;
}

.progress-circle {
  position: relative;
  width: 200px;
  height: 200px;
  margin: 0 auto 1.5rem;
}

.progress-circle svg {
  transform: rotate(-90deg);
}

.progress-bg {
  fill: none;
  stroke: rgba(255, 255, 255, 0.1);
  stroke-width: 8;
}

.progress-bar {
  fill: none;
  stroke: var(--primary);
  stroke-width: 8;
  stroke-linecap: round;
  stroke-dasharray: 283;
  transition: stroke-dashoffset 1s ease;
  filter: drop-shadow(0 0 10px var(--primary));
}

.progress-text {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
}

.progress-percent {
  display: block;
  font-size: 2.5rem;
  font-weight: 700;
  color: var(--primary);
}

.progress-label {
  display: block;
  color: var(--gray);
  font-size: 0.9rem;
}

.progress-message {
  text-align: center;
  color: var(--gray);
  line-height: 1.6;
}

.progress-message strong {
  color: var(--primary);
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 1rem;
  width: 100%;
  padding: 1rem;
  background: rgba(0, 245, 255, 0.1);
  border: 1px solid rgba(0, 245, 255, 0.2);
  border-radius: 10px;
  color: var(--light);
  cursor: pointer;
  transition: all 0.3s ease;
  margin-bottom: 1rem;
}

.action-btn:hover {
  background: rgba(0, 245, 255, 0.2);
  transform: translateX(5px);
}

.action-btn i {
  color: var(--primary);
  font-size: 1.5rem;
}

.empty-state {
  text-align: center;
  padding: 3rem 1rem;
}

.empty-state i {
  font-size: 4rem;
  color: var(--gray);
  margin-bottom: 1rem;
  opacity: 0.5;
}

.empty-state h3 {
  color: var(--light);
  margin-bottom: 0.5rem;
}

.empty-state p {
  color: var(--gray);
  margin-bottom: 1.5rem;
}

.debts-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.debt-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.5rem;
  background: rgba(0, 245, 255, 0.05);
  border: 1px solid rgba(0, 245, 255, 0.2);
  border-radius: 10px;
  transition: all 0.3s ease;
}

.debt-item:hover {
  background: rgba(0, 245, 255, 0.1);
  transform: translateX(5px);
}

.debt-info {
  flex: 1;
}

.debt-info h3 {
  color: var(--light);
  margin-bottom: 0.25rem;
}

.debt-type {
  color: var(--gray);
  font-size: 0.85rem;
}

.debt-details {
  display: flex;
  gap: 2rem;
  flex: 2;
}

.detail {
  display: flex;
  flex-direction: column;
}

.detail-label {
  color: var(--gray);
  font-size: 0.85rem;
  margin-bottom: 0.25rem;
}

.detail-value {
  color: var(--light);
  font-weight: 600;
}

.debt-actions {
  display: flex;
  gap: 0.5rem;
}

.btn-icon {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: 1px solid rgba(0, 245, 255, 0.3);
  border-radius: 8px;
  color: var(--primary);
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-icon:hover {
  background: var(--primary);
  color: var(--dark);
}

.payments-timeline {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.payment-item {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  padding: 1rem;
  background: rgba(0, 245, 255, 0.05);
  border: 1px solid rgba(0, 245, 255, 0.2);
  border-radius: 10px;
}

.payment-date {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 60px;
  height: 60px;
  background: var(--primary);
  color: var(--dark);
  border-radius: 10px;
  font-weight: 700;
}

.payment-date .month {
  font-size: 0.75rem;
}

.payment-date .day {
  font-size: 1.5rem;
}

.payment-info {
  flex: 1;
}

.payment-info h4 {
  color: var(--light);
  margin-bottom: 0.25rem;
}

.payment-info p {
  color: var(--gray);
  font-size: 0.9rem;
}

@media (max-width: 1024px) {
  .dashboard-grid {
    grid-template-columns: 1fr;
  }
  
  .debt-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
  
  .debt-details {
    width: 100%;
  }
}

@media (max-width: 768px) {
  header {
    flex-direction: column;
    gap: 1rem;
  }
  
  nav ul {
    gap: 1rem;
  }
  
  .welcome-content h1 {
    font-size: 1.8rem;
  }
  
  .quick-stats {
    grid-template-columns: 1fr;
  }
  
  .debt-details {
    flex-direction: column;
    gap: 0.5rem;
  }
  
  .payment-item {
    flex-direction: column;
    align-items: flex-start;
  }

  
}
</style>