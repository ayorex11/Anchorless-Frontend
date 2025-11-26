
<template>
  <div class="progress-view">
    <div class="bg-animation"></div>
    
    <header>
      <router-link to="/" class="logo">
        anchor<span>less</span>
      </router-link>
      <nav>
        <ul>
          <li><router-link to="/dashboard">Dashboard</router-link></li>
          <li><a href="#debts" @click.prevent="$router.push('/dashboard#debts')">My Debts</a></li>
          <li><router-link to="/progress" class="active">Progress</router-link></li>
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

    <main class="progress-main">
      <div class="container">
        <!-- Loading State -->
        <div v-if="loading" class="loading-state">
          <div class="spinner"></div>
          <p>Loading your progress...</p>
        </div>

        <!-- Error State -->
        <div v-else-if="error" class="error-state">
          <i class="fas fa-exclamation-triangle"></i>
          <h3>Something went wrong</h3>
          <p>{{ error }}</p>
          <button class="btn btn-primary" @click="fetchDebtPlans">Try Again</button>
        </div>

        <!-- No Debt Plans State -->
        <div v-else-if="!hasDebtPlans" class="empty-state">
          <div class="empty-content">
            <i class="fas fa-chart-line"></i>
            <h2>No Debt Plans Found</h2>
            <p>You need to create a debt plan first to view your progress.</p>
            <router-link to="/dashboard" class="btn btn-primary">
              <i class="fas fa-plus-circle"></i> Create Debt Plan
            </router-link>
          </div>
        </div>

        <!-- Progress Content -->
        <div v-else class="progress-content">
          <!-- Page Header -->
          <div class="page-header">
            <h1>Your Progress</h1>
            <p>Track your debt payoff journey and monitor your monthly schedules</p>
          </div>

          <!-- Debt Plan Selector -->
          <div class="plan-selector-card">
            <label for="planSelect">Select Debt Plan</label>
            <select 
              id="planSelect" 
              v-model="selectedPlanId" 
              @change="handlePlanChange"
              class="plan-select"
            >
              <option value="" disabled>Choose a debt plan</option>
              <option 
                v-for="plan in debtPlans" 
                :key="plan.id" 
                :value="plan.id"
              >
                {{ plan.name }} ({{ plan.strategy }})
                <span v-if="plan.is_active"> - Active</span>
              </option>
            </select>
          </div>

          <!-- Main Progress Dashboard -->
          <div v-if="selectedPlan" class="progress-dashboard">
            
            <!-- Overview Stats -->
            <div class="overview-stats">
              <div class="stat-card">
                <div class="stat-icon">
                  <i class="fas fa-wallet"></i>
                </div>
                <div class="stat-content">
                  <span class="label">Total Debt</span>
                  <span class="value">${{ formatNumber(progressData.total_remaining || 0) }}</span>
                </div>
              </div>
              <div class="stat-card">
                <div class="stat-icon">
                  <i class="fas fa-chart-line"></i>
                </div>
                <div class="stat-content">
                  <span class="label">Paid to Date</span>
                  <span class="value">${{ formatNumber(progressData.total_paid || 0) }}</span>
                </div>
              </div>
              <div class="stat-card">
                <div class="stat-icon">
                  <i class="fas fa-percentage"></i>
                </div>
                <div class="stat-content">
                  <span class="label">Progress</span>
                  <span class="value">{{ progressData.percentage || 0 }}%</span>
                </div>
              </div>
              <div class="stat-card">
                <div class="stat-icon">
                  <i class="fas fa-calendar-check"></i>
                </div>
                <div class="stat-content">
                  <span class="label">Months Remaining</span>
                  <span class="value">{{ progressData.months_remaining || 0 }}</span>
                </div>
              </div>
            </div>

            <!-- Tabbed Interface -->
            <div class="tabs-container">
              <div class="tabs-header">
                <button 
                  v-for="tab in tabs" 
                  :key="tab.id"
                  class="tab-btn" 
                  :class="{ active: activeTab === tab.id }"
                  @click="changeTab(tab.id)"
                >
                  <i :class="tab.icon"></i>
                  <span>{{ tab.label }}</span>
                </button>
              </div>

              <!-- Tab Content -->
              <div class="tab-content">
                
                <!-- Current Month Tab -->
                <div v-if="activeTab === 'current'" class="tab-panel">
                  <div v-if="tabLoading" class="loading-state">
                    <div class="spinner"></div>
                    <p>Loading current schedule...</p>
                  </div>
                  
                  <div v-else-if="currentSchedule" class="current-schedule">
                    <!-- Summary Card -->
                    <div class="summary-card">
                      <div class="summary-header">
                        <h3>This Month's Payment</h3>
                        <div class="month-badge">
                          <i class="fas fa-calendar-alt"></i>
                          {{ currentMonth }}
                        </div>
                      </div>
                      <div class="summary-stats">
                        <div class="summary-stat">
                          <span class="label">Total Payment</span>
                          <span class="value">${{ currentSchedule.total_payment }}</span>
                        </div>
                        <div class="summary-stat">
                          <span class="label">Interest</span>
                          <span class="value">${{ currentSchedule.total_interest }}</span>
                        </div>
                        <div class="summary-stat">
                          <span class="label">Principal</span>
                          <span class="value">${{ currentSchedule.total_principal }}</span>
                        </div>
                        <div class="summary-stat">
                          <span class="label">Focus Loan</span>
                          <span class="value">{{ currentSchedule.focus_loan_name }}</span>
                        </div>
                      </div>
                    </div>

                    <!-- Loan Breakdowns -->
                    <div class="breakdowns-list">
                      <div 
                        v-for="breakdown in currentSchedule.loan_breakdowns" 
                        :key="breakdown.id" 
                        class="breakdown-card"
                        :class="{ 'focus-loan': breakdown.is_focus_loan }"
                      >
                        <div class="breakdown-header">
                          <div class="loan-info">
                            <h4>{{ breakdown.loan_name }}</h4>
                            <span v-if="breakdown.is_focus_loan" class="focus-badge">
                              <i class="fas fa-bullseye"></i> Focus Loan
                            </span>
                          </div>
                        </div>
                        <div class="breakdown-details">
                          <div class="detail-item">
                            <span class="label">Payment</span>
                            <span class="value">${{ breakdown.payment_amount }}</span>
                          </div>
                          <div class="detail-item">
                            <span class="label">Interest</span>
                            <span class="value">${{ breakdown.interest_amount }}</span>
                          </div>
                          <div class="detail-item">
                            <span class="label">Principal</span>
                            <span class="value">${{ breakdown.principal_amount }}</span>
                          </div>
                          <div class="detail-item">
                            <span class="label">Remaining</span>
                            <span class="value">${{ formatNumber(breakdown.remaining_balance) }}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div v-else class="empty-schedule">
                    <i class="fas fa-calendar-times"></i>
                    <h3>No Current Schedule</h3>
                    <p>No payment schedule available for this month.</p>
                  </div>
                </div>

                <!-- Full Schedule Tab -->
                <div v-if="activeTab === 'schedule'" class="tab-panel">
                  <div v-if="tabLoading" class="loading-state">
                    <div class="spinner"></div>
                    <p>Loading full schedule...</p>
                  </div>
                  
                  <div v-else-if="fullSchedule && fullSchedule.length > 0" class="schedule-table-container">
                    <div class="schedule-controls">
                      <div class="search-bar">
                        <i class="fas fa-search"></i>
                        <input 
                          type="text" 
                          v-model="scheduleSearch" 
                          placeholder="Search by month number..."
                        >
                      </div>
                      <button class="btn btn-outline btn-sm" @click="downloadSchedulePDF">
                        <i class="fas fa-download"></i> Download PDF
                      </button>
                    </div>
                    
                    <div class="schedule-table">
                      <div class="table-header">
                        <div class="th">Month</div>
                        <div class="th">Total Payment</div>
                        <div class="th">Interest</div>
                        <div class="th">Principal</div>
                        <div class="th">Focus Loan</div>
                      </div>
                      <div 
                        v-for="schedule in filteredSchedule" 
                        :key="schedule.id" 
                        class="table-row"
                        @click="viewScheduleDetail(schedule)"
                      >
                        <div class="td">{{ schedule.month_number }}</div>
                        <div class="td">${{ schedule.total_payment }}</div>
                        <div class="td">${{ schedule.total_interest }}</div>
                        <div class="td">${{ schedule.total_principal }}</div>
                        <div class="td">{{ schedule.focus_loan_name }}</div>
                      </div>
                    </div>
                  </div>
                  
                  <div v-else class="empty-schedule">
                    <i class="fas fa-list"></i>
                    <h3>No Schedule Data</h3>
                    <p>Full payment schedule not available yet.</p>
                  </div>
                </div>

                <!-- Progress Chart Tab -->
                <div v-if="activeTab === 'progress'" class="tab-panel">
                  <div v-if="tabLoading" class="loading-state">
                    <div class="spinner"></div>
                    <p>Loading progress data...</p>
                  </div>
                  
                  <div v-else-if="progressChartData" class="progress-charts">
                    <div class="chart-card">
                      <h3>Debt Payoff Progress</h3>
                      <div class="progress-bar-container">
                        <div class="progress-bar">
                          <div 
                            class="progress-fill" 
                            :style="{ width: progressChartData.percentage + '%' }"
                          >
                            {{ progressChartData.percentage }}%
                          </div>
                        </div>
                        <div class="progress-labels">
                          <span>Start: ${{ formatNumber(progressChartData.starting_balance) }}</span>
                          <span>Current: ${{ formatNumber(progressChartData.current_balance) }}</span>
                        </div>
                      </div>
                    </div>

                    <div class="stats-grid">
                      <div class="stat-box">
                        <i class="fas fa-dollar-sign"></i>
                        <div class="stat-info">
                          <span class="stat-label">Total Paid</span>
                          <span class="stat-number">${{ formatNumber(progressChartData.total_paid) }}</span>
                        </div>
                      </div>
                      <div class="stat-box">
                        <i class="fas fa-percentage"></i>
                        <div class="stat-info">
                          <span class="stat-label">Interest Paid</span>
                          <span class="stat-number">${{ formatNumber(progressChartData.total_interest) }}</span>
                        </div>
                      </div>
                      <div class="stat-box">
                        <i class="fas fa-chart-line"></i>
                        <div class="stat-info">
                          <span class="stat-label">Principal Paid</span>
                          <span class="stat-number">${{ formatNumber(progressChartData.principal_paid) }}</span>
                        </div>
                      </div>
                      <div class="stat-box">
                        <i class="fas fa-hourglass-half"></i>
                        <div class="stat-info">
                          <span class="stat-label">Time Elapsed</span>
                          <span class="stat-number">{{ progressChartData.months_elapsed }} months</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div v-else class="empty-schedule">
                    <i class="fas fa-chart-bar"></i>
                    <h3>No Progress Data</h3>
                    <p>Progress tracking data not available yet.</p>
                  </div>
                </div>

                <!-- Timeline Tab -->
                <div v-if="activeTab === 'timeline'" class="tab-panel">
                  <div v-if="tabLoading" class="loading-state">
                    <div class="spinner"></div>
                    <p>Loading timeline...</p>
                  </div>
                  
                  <div v-else-if="timelineData && timelineData.length > 0" class="timeline-view">
                    <div class="timeline-container">
                      <div 
                        v-for="(event, index) in timelineData" 
                        :key="index" 
                        class="timeline-item"
                        :class="{ 'completed': event.completed }"
                      >
                        <div class="timeline-marker">
                          <i :class="event.icon"></i>
                        </div>
                        <div class="timeline-content">
                          <div class="timeline-header">
                            <h4>{{ event.title }}</h4>
                            <span class="timeline-date">{{ event.date }}</span>
                          </div>
                          <p class="timeline-description">{{ event.description }}</p>
                          <div v-if="event.amount" class="timeline-amount">
                            Amount: ${{ formatNumber(event.amount) }}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div v-else class="empty-schedule">
                    <i class="fas fa-stream"></i>
                    <h3>No Timeline Data</h3>
                    <p>Payment timeline not available yet.</p>
                  </div>
                </div>

                <!-- Details Tab -->
                <div v-if="activeTab === 'details'" class="tab-panel">
                  <div v-if="tabLoading" class="loading-state">
                    <div class="spinner"></div>
                    <p>Loading details...</p>
                  </div>
                  
                  <div v-else-if="detailsData" class="details-view">
                    <div class="details-section">
                      <h3>Debt Plan Information</h3>
                      <div class="details-grid">
                        <div class="detail-item">
                          <span class="label">Plan Name</span>
                          <span class="value">{{ selectedPlan.name }}</span>
                        </div>
                        <div class="detail-item">
                          <span class="label">Strategy</span>
                          <span class="value">{{ selectedPlan.strategy }}</span>
                        </div>
                        <div class="detail-item">
                          <span class="label">Monthly Budget</span>
                          <span class="value">${{ selectedPlan.monthly_payment_budget }}</span>
                        </div>
                        <div class="detail-item">
                          <span class="label">Created Date</span>
                          <span class="value">{{ formatDate(selectedPlan.created_at) }}</span>
                        </div>
                        <div class="detail-item">
                          <span class="label">Projected Payoff</span>
                          <span class="value">{{ formatDate(selectedPlan.projected_payoff_date) }}</span>
                        </div>
                        <div class="detail-item">
                          <span class="label">Interest Saved</span>
                          <span class="value">${{ formatNumber(selectedPlan.total_interest_saved) }}</span>
                        </div>
                      </div>
                    </div>

                    <div class="details-section">
                      <h3>Loans Summary</h3>
                      <div class="loans-summary">
                        <div 
                          v-for="loan in detailsData.loans" 
                          :key="loan.id" 
                          class="loan-summary-card"
                        >
                          <h4>{{ loan.name }}</h4>
                          <div class="loan-stats">
                            <div class="loan-stat">
                              <span class="label">Original Balance</span>
                              <span class="value">${{ formatNumber(loan.principal_balance) }}</span>
                            </div>
                            <div class="loan-stat">
                              <span class="label">Current Balance</span>
                              <span class="value">${{ formatNumber(loan.remaining_balance) }}</span>
                            </div>
                            <div class="loan-stat">
                              <span class="label">Interest Rate</span>
                              <span class="value">{{ loan.interest_rate }}%</span>
                            </div>
                            <div class="loan-stat">
                              <span class="label">Payoff Order</span>
                              <span class="value">#{{ loan.payoff_order }}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div v-else class="empty-schedule">
                    <i class="fas fa-info-circle"></i>
                    <h3>No Details Available</h3>
                    <p>Detailed information not available yet.</p>
                  </div>
                </div>

              </div>
            </div>

          </div>

          <!-- No Plan Selected -->
          <div v-else class="no-plan-selected">
            <i class="fas fa-mouse-pointer"></i>
            <h3>Select a Debt Plan</h3>
            <p>Choose a debt plan from the dropdown above to view its progress and payment schedules.</p>
          </div>
        </div>
      </div>
    </main>

    <!-- Notifications -->
    <div v-if="notification" class="alert-notification" :class="notificationType">
      <i :class="notificationIcon"></i>
      <span>{{ notification }}</span>
    </div>

    <!-- Throttling Notification -->
    <div v-if="showThrottleNotification" class="throttle-notification">
      <div class="notification-content">
        <i class="fas fa-clock"></i>
        <div class="notification-text">
          <h4>Too Many Requests</h4>
          <p>Please wait a moment before trying again.</p>
        </div>
        <button class="close-notification" @click="showThrottleNotification = false">
          <i class="fas fa-times"></i>
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { useAuthStore } from '@/stores/auth'
import { api } from '@/utils/api'

export default {
  name: 'ProgressView',
  data() {
    return {
      user: null,
      loading: true,
      error: null,
      debtPlans: [],
      selectedPlanId: '',
      selectedPlan: null,
      activeTab: 'current',
      tabLoading: false,
      notification: null,
      notificationType: 'success',
      showThrottleNotification: false,
      scheduleSearch: '',
      
      // Tab data
      currentSchedule: null,
      fullSchedule: [],
      progressChartData: null,
      timelineData: [],
      detailsData: null,
      progressData: {
        total_remaining: 0,
        total_paid: 0,
        percentage: 0,
        months_remaining: 0
      },
      
      tabs: [
        { id: 'current', label: 'Current Month', icon: 'fas fa-calendar-day' },
        { id: 'schedule', label: 'Full Schedule', icon: 'fas fa-list' },
        { id: 'progress', label: 'Progress Chart', icon: 'fas fa-chart-line' },
        { id: 'timeline', label: 'Timeline', icon: 'fas fa-stream' },
        { id: 'details', label: 'Details', icon: 'fas fa-info-circle' }
      ]
    }
  },
  computed: {
    hasDebtPlans() {
      return this.debtPlans.length > 0
    },
    currentMonth() {
      return new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    },
    notificationIcon() {
      return this.notificationType === 'success' ? 'fas fa-check-circle' : 'fas fa-exclamation-circle'
    },
    filteredSchedule() {
      if (!this.scheduleSearch) return this.fullSchedule
      return this.fullSchedule.filter(schedule => 
        schedule.month_number.toString().includes(this.scheduleSearch)
      )
    }
  },
  methods: {
    async fetchDebtPlans() {
      this.loading = true
      this.error = null
      
      try {
        const response = await api.get('/DebtPlan/list_debt_plans/')
        
        if (response.status === 429) {
          this.handleThrottling()
          return
        }
        
        if (!response.ok) {
          throw new Error('Failed to fetch debt plans')
        }
        
        const data = await response.json()
        this.debtPlans = [...data]
        
        // Auto-select active plan
        const activePlan = this.debtPlans.find(plan => plan.is_active)
        if (activePlan) {
          this.selectedPlanId = activePlan.id
          await this.handlePlanChange()
        }
        
      } catch (error) {
        console.error('Error fetching debt plans:', error)
        this.error = 'Failed to load your debt plans. Please try again.'
      } finally {
        this.loading = false
      }
    },

    async handlePlanChange() {
      this.selectedPlan = this.debtPlans.find(plan => plan.id === this.selectedPlanId)
      if (this.selectedPlan) {
        await this.loadTabData()
      }
    },

    async changeTab(tabId) {
      this.activeTab = tabId
      await this.loadTabData()
    },

    async loadTabData() {
      if (!this.selectedPlan) return
      
      this.tabLoading = true
      
      try {
        switch(this.activeTab) {
          case 'current':
            await this.fetchCurrentSchedule()
            break
          case 'schedule':
            await this.fetchFullSchedule()
            break
          case 'progress':
            await this.fetchProgressData()
            break
          case 'timeline':
            await this.fetchTimelineData()
            break
          case 'details':
            await this.fetchDetailsData()
            break
        }
      } finally {
        this.tabLoading = false
      }
    },

    async fetchCurrentSchedule() {
      try {
        const response = await api.get(`/PaymentSchedule/current/?debt_plan=${this.selectedPlan.id}`)
        
        if (response.status === 404) {
          this.currentSchedule = null
          return
        }
        
        if (!response.ok) throw new Error('Failed to fetch current schedule')
        
        this.currentSchedule = await response.json()
      } catch (error) {
        console.error('Error fetching current schedule:', error)
        this.currentSchedule = null
      }
    },

    async fetchFullSchedule() {
      try {
        const response = await api.get(`/PaymentSchedule/list/?debt_plan=${this.selectedPlan.id}`)
        
        if (!response.ok) throw new Error('Failed to fetch schedule list')
        
        this.fullSchedule = await response.json()
      } catch (error) {
        console.error('Error fetching full schedule:', error)
        this.fullSchedule = []
      }
    },

    async fetchProgressData() {
      try {
        const response = await api.get(`/PaymentSchedule/progress/?debt_plan=${this.selectedPlan.id}`)
        
        if (!response.ok) throw new Error('Failed to fetch progress data')
        
        const data = await response.json()
        this.progressChartData = data
        this.progressData = {
          total_remaining: data.current_balance || 0,
          total_paid: data.total_paid || 0,
          percentage: data.percentage || 0,
          months_remaining: data.months_remaining || 0
        }
      } catch (error) {
        console.error('Error fetching progress data:', error)
        this.progressChartData = null
      }
    },

    async fetchTimelineData() {
      try {
        const response = await api.get(`/PaymentSchedule/timeline/?debt_plan=${this.selectedPlan.id}`)
        
        if (!response.ok) throw new Error('Failed to fetch timeline data')
        
        this.timelineData = await response.json()
      } catch (error) {
        console.error('Error fetching timeline data:', error)
        this.timelineData = []
      }
    },

    async fetchDetailsData() {
      try {
        const response = await api.get(`/PaymentSchedule/detail/?debt_plan=${this.selectedPlan.id}`)
        
        if (!response.ok) throw new Error('Failed to fetch details')
        
        this.detailsData = await response.json()
      } catch (error) {
        console.error('Error fetching details:', error)
        this.detailsData = null
      }
    },

    viewScheduleDetail(schedule) {
      this.showNotification(`Viewing details for Month ${schedule.month_number}`, 'success')
      // TODO: Open modal or navigate to detail view
    },

    downloadSchedulePDF() {
      this.showNotification('PDF download feature coming soon!', 'success')
      // TODO: Implement PDF download
    },

    formatNumber(number) {
      return parseFloat(number || 0).toLocaleString('en-US', { 
        minimumFractionDigits: 2,
        maximumFractionDigits: 2 
      })
    },

    formatDate(dateString) {
      if (!dateString) return 'N/A'
      const date = new Date(dateString)
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    },

    handleThrottling() {
      this.showThrottleNotification = true
      setTimeout(() => {
        this.showThrottleNotification = false
      }, 5000)
    },

    showNotification(message, type = 'success') {
      this.notification = message
      this.notificationType = type
      
      setTimeout(() => {
        this.notification = null
      }, 3000)
    },

    async handleLogout() {
      const authStore = useAuthStore()
      authStore.logout()
      this.$router.push('/')
    }
  },
  mounted() {
    const authStore = useAuthStore()
    this.user = authStore.getUser
    this.fetchDebtPlans()
  }
}
</script>

<style scoped>
.progress-view {
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

/* Header Styles */
header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem 5%;
  position: fixed;
  width: 100%;
  z-index: 1000;
  background: rgba(10, 10, 26, 0.95);
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
  cursor: pointer;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  transition: all 0.3s ease;
}

.user-info:hover {
  background: rgba(0, 245, 255, 0.1);
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

.btn-sm {
  padding: 0.5rem 1rem;
  font-size: 0.85rem;
}

/* Main Content */
.progress-main {
  padding: 8rem 5% 4rem;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
}

/* Loading and Error States */
.loading-state,
.error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  text-align: center;
}

.spinner {
  width: 50px;
  height: 50px;
  border: 3px solid rgba(0, 245, 255, 0.3);
  border-top: 3px solid var(--primary);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.loading-state p,
.error-state p {
  color: var(--gray);
  font-size: 1.1rem;
}

.error-state i {
  font-size: 3rem;
  color: #ff6b6b;
  margin-bottom: 1rem;
}

.error-state h3 {
  margin-bottom: 0.5rem;
}

/* Empty States */
.empty-state,
.no-plan-selected,
.empty-schedule {
  text-align: center;
  padding: 4rem 2rem;
  color: var(--light);
}

.empty-state i,
.no-plan-selected i,
.empty-schedule i {
  font-size: 4rem;
  color: var(--primary);
  margin-bottom: 1.5rem;
}

.empty-state h2,
.no-plan-selected h3,
.empty-schedule h3 {
  margin-bottom: 1rem;
}

.empty-state p,
.no-plan-selected p,
.empty-schedule p {
  color: var(--gray);
  margin-bottom: 2rem;
  line-height: 1.6;
}

/* Page Header */
.page-header {
  text-align: center;
  margin-bottom: 3rem;
}

.page-header h1 {
  font-size: 2.5rem;
  margin-bottom: 0.5rem;
  background: linear-gradient(to right, var(--primary), var(--accent));
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}

.page-header p {
  color: var(--gray);
  font-size: 1.1rem;
}

/* Plan Selector */
.plan-selector-card {
  background: var(--card-bg);
  border: 1px solid rgba(0, 245, 255, 0.2);
  border-radius: 15px;
  padding: 1.5rem;
  margin-bottom: 2rem;
}

.plan-selector-card label {
  display: block;
  color: var(--light);
  margin-bottom: 0.75rem;
  font-weight: 600;
  font-size: 1.1rem;
}

.plan-select {
  width: 100%;
  padding: 0.75rem 1rem;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 10px;
  color: var(--light);
  font-size: 1rem;
  transition: all 0.3s ease;
}

.plan-select:focus {
  outline: none;
  border-color: var(--primary);
  box-shadow: 0 0 0 2px rgba(0, 245, 255, 0.2);
}

.plan-select option {
  background: var(--card-bg);
  color: var(--light);
}

/* Progress Dashboard */
.progress-dashboard {
  margin-top: 2rem;
}

/* Overview Stats */
.overview-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 3rem;
}

.stat-card {
  background: var(--card-bg);
  border: 1px solid rgba(0, 245, 255, 0.2);
  border-radius: 15px;
  padding: 1.5rem;
  display: flex;
  align-items: center;
  gap: 1.5rem;
  transition: all 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 30px rgba(0, 245, 255, 0.2);
}

.stat-icon {
  width: 60px;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 245, 255, 0.1);
  border-radius: 12px;
}

.stat-icon i {
  font-size: 1.5rem;
  color: var(--primary);
}

.stat-content {
  display: flex;
  flex-direction: column;
}

.stat-content .label {
  color: var(--gray);
  font-size: 0.9rem;
  margin-bottom: 0.25rem;
}

.stat-content .value {
  color: var(--light);
  font-size: 1.8rem;
  font-weight: 700;
}

/* Tabs Container */
.tabs-container {
  background: var(--card-bg);
  border: 1px solid rgba(0, 245, 255, 0.2);
  border-radius: 15px;
  overflow: hidden;
}

.tabs-header {
  display: flex;
  background: rgba(0, 245, 255, 0.05);
  border-bottom: 1px solid rgba(0, 245, 255, 0.2);
  overflow-x: auto;
}

.tab-btn {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem 1.5rem;
  background: transparent;
  border: none;
  color: var(--gray);
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  white-space: nowrap;
  border-bottom: 3px solid transparent;
}

.tab-btn:hover {
  color: var(--light);
  background: rgba(0, 245, 255, 0.1);
}

.tab-btn.active {
  color: var(--primary);
  border-bottom-color: var(--primary);
  background: rgba(0, 245, 255, 0.1);
}

.tab-btn i {
  font-size: 1.1rem;
}

.tab-content {
  padding: 2rem;
}

.tab-panel {
  min-height: 400px;
}

/* Current Month Tab */
.current-schedule {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.summary-card {
  background: rgba(0, 245, 255, 0.05);
  border: 1px solid rgba(0, 245, 255, 0.2);
  border-radius: 12px;
  padding: 1.5rem;
}

.summary-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.summary-header h3 {
  color: var(--light);
  margin: 0;
}

.month-badge {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: rgba(0, 245, 255, 0.1);
  color: var(--primary);
  border: 1px solid rgba(0, 245, 255, 0.3);
  border-radius: 20px;
  font-weight: 600;
  font-size: 0.9rem;
}

.summary-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

.summary-stat {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
}

.summary-stat .label {
  color: var(--gray);
  font-size: 0.9rem;
  margin-bottom: 0.5rem;
}

.summary-stat .value {
  color: var(--light);
  font-weight: 700;
  font-size: 1.2rem;
}

/* Breakdowns List */
.breakdowns-list {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1rem;
}

.breakdown-card {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  padding: 1.5rem;
  transition: all 0.3s ease;
}

.breakdown-card.focus-loan {
  border-color: var(--primary);
  background: rgba(0, 245, 255, 0.1);
}

.breakdown-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(0, 245, 255, 0.2);
}

.breakdown-header {
  margin-bottom: 1rem;
}

.loan-info {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1rem;
}

.loan-info h4 {
  color: var(--light);
  margin: 0 0 0.5rem 0;
  font-size: 1.1rem;
}

.focus-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.25rem 0.75rem;
  background: rgba(0, 245, 255, 0.2);
  color: var(--primary);
  border: 1px solid rgba(0, 245, 255, 0.3);
  border-radius: 15px;
  font-size: 0.8rem;
  font-weight: 500;
  white-space: nowrap;
}

.breakdown-details {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.75rem;
}

.detail-item {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.detail-item .label {
  color: var(--gray);
  font-size: 0.8rem;
}

.detail-item .value {
  color: var(--light);
  font-weight: 600;
  font-size: 0.9rem;
}

/* Full Schedule Tab */
.schedule-table-container {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.schedule-controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
}

.search-bar {
  position: relative;
  flex: 1;
  max-width: 300px;
}

.search-bar i {
  position: absolute;
  left: 1rem;
  top: 50%;
  transform: translateY(-50%);
  color: var(--gray);
}

.search-bar input {
  width: 100%;
  padding: 0.75rem 1rem 0.75rem 2.5rem;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 10px;
  color: var(--light);
  font-size: 1rem;
}

.search-bar input:focus {
  outline: none;
  border-color: var(--primary);
}

.schedule-table {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 10px;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.table-header {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr 1fr 2fr;
  background: rgba(0, 245, 255, 0.1);
  border-bottom: 1px solid rgba(0, 245, 255, 0.2);
}

.th {
  padding: 1rem;
  color: var(--light);
  font-weight: 600;
  font-size: 0.9rem;
  text-align: left;
}

.table-row {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr 1fr 2fr;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  cursor: pointer;
  transition: all 0.3s ease;
}

.table-row:hover {
  background: rgba(0, 245, 255, 0.05);
}

.table-row:last-child {
  border-bottom: none;
}

.td {
  padding: 1rem;
  color: var(--light);
  font-size: 0.9rem;
  display: flex;
  align-items: center;
}

/* Progress Chart Tab */
.progress-charts {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.chart-card {
  background: rgba(0, 245, 255, 0.05);
  border: 1px solid rgba(0, 245, 255, 0.2);
  border-radius: 12px;
  padding: 1.5rem;
}

.chart-card h3 {
  color: var(--light);
  margin-bottom: 1.5rem;
  text-align: center;
}

.progress-bar-container {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.progress-bar {
  width: 100%;
  height: 40px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 20px;
  overflow: hidden;
  position: relative;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--primary), var(--accent));
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--dark);
  font-weight: 700;
  font-size: 0.9rem;
  transition: width 1s ease-in-out;
  min-width: 50px;
}

.progress-labels {
  display: flex;
  justify-content: space-between;
  color: var(--gray);
  font-size: 0.9rem;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

.stat-box {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.5rem;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 10px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.stat-box i {
  font-size: 2rem;
  color: var(--primary);
}

.stat-info {
  display: flex;
  flex-direction: column;
}

.stat-label {
  color: var(--gray);
  font-size: 0.8rem;
  margin-bottom: 0.25rem;
}

.stat-number {
  color: var(--light);
  font-weight: 700;
  font-size: 1.2rem;
}

/* Timeline Tab */
.timeline-view {
  max-height: 600px;
  overflow-y: auto;
}

.timeline-container {
  position: relative;
  padding-left: 2rem;
}

.timeline-container::before {
  content: '';
  position: absolute;
  left: 15px;
  top: 0;
  bottom: 0;
  width: 2px;
  background: rgba(0, 245, 255, 0.3);
}

.timeline-item {
  position: relative;
  margin-bottom: 2rem;
  padding: 1.5rem;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 10px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  transition: all 0.3s ease;
}

.timeline-item:hover {
  transform: translateX(5px);
  border-color: rgba(0, 245, 255, 0.3);
}

.timeline-item.completed {
  border-color: rgba(34, 197, 94, 0.3);
  background: rgba(34, 197, 94, 0.05);
}

.timeline-marker {
  position: absolute;
  left: -2rem;
  top: 50%;
  transform: translateY(-50%);
  width: 30px;
  height: 30px;
  background: var(--card-bg);
  border: 2px solid rgba(0, 245, 255, 0.5);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.timeline-item.completed .timeline-marker {
  background: rgba(34, 197, 94, 0.2);
  border-color: rgba(34, 197, 94, 0.5);
}

.timeline-marker i {
  color: var(--primary);
  font-size: 0.8rem;
}

.timeline-item.completed .timeline-marker i {
  color: #22c55e;
}

.timeline-content {
  margin-left: 0;
}

.timeline-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 0.5rem;
}

.timeline-header h4 {
  color: var(--light);
  margin: 0;
  font-size: 1.1rem;
}

.timeline-date {
  color: var(--primary);
  font-size: 0.9rem;
  font-weight: 600;
}

.timeline-description {
  color: var(--gray);
  margin-bottom: 0.5rem;
  line-height: 1.5;
}

.timeline-amount {
  color: var(--light);
  font-weight: 600;
  font-size: 0.9rem;
}

/* Details Tab */
.details-view {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.details-section {
  background: rgba(0, 245, 255, 0.05);
  border: 1px solid rgba(0, 245, 255, 0.2);
  border-radius: 12px;
  padding: 1.5rem;
}

.details-section h3 {
  color: var(--light);
  margin-bottom: 1.5rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.details-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
}

.detail-item {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.detail-item .label {
  color: var(--gray);
  font-size: 0.9rem;
  font-weight: 500;
}

.detail-item .value {
  color: var(--light);
  font-weight: 600;
  font-size: 1rem;
}

.loans-summary {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1rem;
}

.loan-summary-card {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  padding: 1.5rem;
}

.loan-summary-card h4 {
  color: var(--light);
  margin-bottom: 1rem;
  font-size: 1.1rem;
}

.loan-stats {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.75rem;
}

.loan-stat {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.loan-stat .label {
  color: var(--gray);
  font-size: 0.8rem;
}

.loan-stat .value {
  color: var(--light);
  font-weight: 600;
  font-size: 0.9rem;
}

/* Notifications */
.alert-notification {
  position: fixed;
  top: 100px;
  right: 20px;
  z-index: 3000;
  padding: 1rem 1.5rem;
  border-radius: 10px;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  animation: slideDown 0.3s ease;
  max-width: 400px;
}

.alert-notification.success {
  background: rgba(34, 197, 94, 0.1);
  border: 1px solid rgba(34, 197, 94, 0.3);
  color: #86efac;
}

.alert-notification.error {
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.3);
  color: #fca5a5;
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

/* Throttling Notification */
.throttle-notification {
  position: fixed;
  top: 100px;
  right: 20px;
  z-index: 3000;
  animation: slideIn 0.3s ease-out;
}

.notification-content {
  display: flex;
  align-items: center;
  gap: 1rem;
  background: rgba(239, 68, 68, 0.9);
  color: white;
  padding: 1rem 1.5rem;
  border-radius: 10px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.notification-content i {
  font-size: 1.5rem;
}

.notification-text h4 {
  margin: 0 0 0.25rem 0;
  font-size: 1rem;
}

.notification-text p {
  margin: 0;
  font-size: 0.9rem;
  opacity: 0.9;
}

.close-notification {
  background: transparent;
  border: none;
  color: white;
  cursor: pointer;
  padding: 0.25rem;
  border-radius: 4px;
  transition: background 0.3s ease;
}

.close-notification:hover {
  background: rgba(255, 255, 255, 0.2);
}

@keyframes slideIn {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

/* Responsive Design */
@media (max-width: 768px) {
  .progress-main {
    padding: 7rem 5% 2rem;
  }
  
  .page-header h1 {
    font-size: 2rem;
  }
  
  .overview-stats {
    grid-template-columns: 1fr;
  }
  
  .tabs-header {
    flex-direction: column;
  }
  
  .tab-btn {
    justify-content: center;
    border-bottom: none;
    border-right: 3px solid transparent;
  }
  
  .tab-btn.active {
    border-right-color: var(--primary);
    border-bottom: none;
  }
  
  .tab-content {
    padding: 1rem;
  }
  
  .summary-stats {
    grid-template-columns: 1fr;
  }
  
  .breakdowns-list {
    grid-template-columns: 1fr;
  }
  
  .breakdown-details {
    grid-template-columns: 1fr;
  }
  
  .schedule-controls {
    flex-direction: column;
    align-items: stretch;
  }
  
  .search-bar {
    max-width: none;
  }
  
  .table-header,
  .table-row {
    grid-template-columns: 1fr;
    gap: 0.5rem;
  }
  
  .th,
  .td {
    padding: 0.5rem;
    text-align: center;
  }
  
  .stats-grid {
    grid-template-columns: 1fr;
  }
  
  .details-grid {
    grid-template-columns: 1fr;
  }
  
  .loans-summary {
    grid-template-columns: 1fr;
  }
  
  .loan-stats {
    grid-template-columns: 1fr;
  }
  
  .timeline-container {
    padding-left: 1rem;
  }
  
  .timeline-marker {
    left: -1rem;
    width: 20px;
    height: 20px;
  }
  
  .timeline-marker i {
    font-size: 0.6rem;
  }
  
  .timeline-header {
    flex-direction: column;
    gap: 0.5rem;
  }
  
  .alert-notification,
  .throttle-notification {
    right: 10px;
    left: 10px;
    max-width: none;
  }
}

@media (max-width: 480px) {
  header {
    flex-direction: column;
    gap: 1rem;
    padding: 1rem 5%;
  }
  
  nav ul {
    gap: 1rem;
  }
  
  .user-menu {
    width: 100%;
    justify-content: space-between;
  }
  
  .stat-card {
    flex-direction: column;
    text-align: center;
    gap: 1rem;
  }
  
  .progress-bar {
    height: 30px;
  }
  
  .progress-fill {
    font-size: 0.8rem;
  }
}
</style>