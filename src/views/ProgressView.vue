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
          <li><router-link to="/dashboard#debts">My Debt</router-link></li>
          <li><router-link to="/progress" class="active">Progress</router-link></li>
          <li><router-link to = "/learn-more">Strategies explained</router-link></li>
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
                    <!-- Main Progress Overview -->
                    <div class="progress-overview">
                      <div class="progress-main-card">
                        <h3>Overall Debt Payoff Progress</h3>
                        <div class="progress-visual">
                          <div class="circular-progress">
                            <div class="circular-progress-bar">
                              <svg width="120" height="120" viewBox="0 0 120 120">
                                <circle 
                                  cx="60" 
                                  cy="60" 
                                  r="54" 
                                  fill="none" 
                                  stroke="rgba(255,255,255,0.1)" 
                                  stroke-width="8"
                                />
                                <circle 
                                  cx="60" 
                                  cy="60" 
                                  r="54" 
                                  fill="none" 
                                  stroke="url(#progressGradient)" 
                                  stroke-width="8"
                                  :stroke-dasharray="339.3"
                                  :stroke-dashoffset="339.3 - (339.3 * progressChartData.progress_percentage / 100)"
                                  stroke-linecap="round"
                                  transform="rotate(-90 60 60)"
                                />
                                <defs>
                                  <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                    <stop offset="0%" stop-color="var(--primary)" />
                                    <stop offset="100%" stop-color="var(--accent)" />
                                  </linearGradient>
                                </defs>
                              </svg>
                              <div class="progress-text">
                                <span class="percentage">{{ progressChartData.progress_percentage }}%</span>
                                <span class="label">Complete</span>
                              </div>
                            </div>
                          </div>
                          <div class="progress-details">
                            <div class="progress-stat">
                              <span class="value">${{ formatNumber(progressChartData.total_debt_paid) }}</span>
                              <span class="label">Paid</span>
                            </div>
                            <div class="progress-stat">
                              <span class="value">${{ formatNumber(progressChartData.total_debt_remaining) }}</span>
                              <span class="label">Remaining</span>
                            </div>
                            <div class="progress-stat">
                              <span class="value">{{ progressChartData.months_remaining }}</span>
                              <span class="label">Months Left</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <!-- Timeline Progress -->
                    <div class="timeline-progress">
                      <h3>Payoff Timeline</h3>
                      <div class="timeline-bar">
                        <div class="timeline-labels">
                          <span>Start</span>
                          <span>Projected Payoff: {{ formatDate(progressChartData.projected_payoff_date) }}</span>
                        </div>
                        <div class="timeline-track">
                          <div 
                            class="timeline-progress-fill" 
                            :style="{ width: progressChartData.progress_percentage + '%' }"
                          >
                            <div class="timeline-marker">
                              <span>Current: {{ progressChartData.progress_percentage }}%</span>
                            </div>
                          </div>
                        </div>
                        <div class="timeline-stats">
                          <div class="timeline-stat">
                            <span class="label">Completed Months</span>
                            <span class="value">{{ progressChartData.completed_months }}</span>
                          </div>
                          <div class="timeline-stat">
                            <span class="label">Remaining Months</span>
                            <span class="value">{{ progressChartData.months_remaining }}</span>
                          </div>
                          <div class="timeline-stat">
                            <span class="label">Total Months</span>
                            <span class="value">{{ progressChartData.total_months }}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <!-- Loan Progress Breakdown -->
                    <div class="loan-progress-breakdown">
                      <h3>Loan Progress Breakdown</h3>
                      <div class="loans-progress-list">
                        <div 
                          v-for="loan in progressChartData.loans" 
                          :key="loan.id" 
                          class="loan-progress-card"
                          :class="{ 'focus-loan': loan.is_current_focus, 'paid-off': loan.is_paid_off }"
                        >
                          <div class="loan-header">
                            <div class="loan-info">
                              <h4>{{ loan.name }}</h4>
                              <div class="loan-meta">
                                <span class="payoff-order">Payoff Order: #{{ loan.payoff_order }}</span>
                                <span v-if="loan.is_current_focus" class="focus-badge">
                                  <i class="fas fa-bullseye"></i> Current Focus
                                </span>
                                <span v-if="loan.is_paid_off" class="paid-badge">
                                  <i class="fas fa-check"></i> Paid Off
                                </span>
                              </div>
                            </div>
                            <div class="loan-progress-percentage">
                              {{ loan.progress_percentage }}%
                            </div>
                          </div>
                          
                          <div class="loan-progress-bar">
                            <div 
                              class="loan-progress-fill" 
                              :style="{ width: loan.progress_percentage + '%' }"
                            ></div>
                          </div>
                          
                          <div class="loan-stats-grid">
                            <div class="loan-stat">
                              <span class="label">Original Balance</span>
                              <span class="value">${{ formatNumber(loan.original_balance) }}</span>
                            </div>
                            <div class="loan-stat">
                              <span class="label">Remaining Balance</span>
                              <span class="value">${{ formatNumber(loan.remaining_balance) }}</span>
                            </div>
                            <div class="loan-stat">
                              <span class="label">Paid Amount</span>
                              <span class="value">${{ formatNumber(loan.paid_amount) }}</span>
                            </div>
                            <div class="loan-stat">
                              <span class="label">Interest Rate</span>
                              <span class="value">{{ loan.interest_rate }}%</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <!-- Financial Summary -->
                    <div class="financial-summary">
                      <h3>Financial Summary</h3>
                      <div class="summary-grid">
                        <div class="summary-card">
                          <div class="summary-icon">
                            <i class="fas fa-chart-line"></i>
                          </div>
                          <div class="summary-content">
                            <span class="value">${{ formatNumber(progressChartData.total_interest_to_pay) }}</span>
                            <span class="label">Total Interest</span>
                          </div>
                        </div>
                        <div class="summary-card">
                          <div class="summary-icon">
                            <i class="fas fa-calendar-alt"></i>
                          </div>
                          <div class="summary-content">
                            <span class="value">{{ progressChartData.current_month_number }}</span>
                            <span class="label">Current Month</span>
                          </div>
                        </div>
                        <div class="summary-card">
                          <div class="summary-icon">
                            <i class="fas fa-money-bill-wave"></i>
                          </div>
                          <div class="summary-content">
                            <span class="value">${{ progressChartData.monthly_payment_budget }}</span>
                            <span class="label">Monthly Budget</span>
                          </div>
                        </div>
                        <div class="summary-card">
                          <div class="summary-icon">
                            <i class="fas fa-rocket"></i>
                          </div>
                          <div class="summary-content">
                            <span class="value">{{ progressChartData.strategy }}</span>
                            <span class="label">Strategy</span>
                          </div>
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

                    <div class="timeline-summary">
                      <div class="summary-stat-box">
                        <i class="fas fa-check-circle"></i>
                        <div>
                          <span class="value"> {{ completedMonths }}</span>
                          <span class="label">Completed</span>
                        </div>
                      </div>
                      <div class="summary-stat-box current">
                        <i class="fas fa-calendar-day"></i>
                        <div>
                          <span class="value"> {{ currentMonthNumber }}</span>
                          <span class="label">Current Month</span>
                        </div>
                      </div>
                      <div class="summary-stat-box">
                        <i class="fas fa-calendar"></i>
                        <div>
                          <span class="value"> {{ progressData.months_remaining  }}</span>
                          <span class="label">Remaining</span>
                        </div>
                      </div>  
                    </div>
                    <div class="timeline-container">
                      <div 
                        v-for="(event, index) in timelineData" 
                        :key="index" 
                        class="timeline-item"
                        :class="{ 
                          'completed': event.completed,
                          'current': event.is_current,
                          'past_due': event.is_past && !event.completed
                        }"
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
                            <span class="label">Scheduled Payment:</span>
                            <span class="value">${{ formatNumber(event.amount) }}</span>
                          </div>
                          <div v-if="event.total_paid && parseFloat(event.total_paid) > 0" class="timeline-amount paid">
                            <span class="label">Amount Paid:</span>
                            <span class="value">${{ formatNumber(event.total_paid) }}</span>  
                          </div>
                          <div v-if="event.payment_deficit && parseFloat(event.payment_deficit) > 0" class="timeline-amount deficit">
                            <span class="label">Remaining:</span>
                            <span class="value">${{ formatNumber(event.payment_deficit) }} </span>
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

    <!-- Detailed Schedule Modal -->
    <div v-if="showDetailModal" class="modal-overlay" @click="showDetailModal = false">
      <div class="modal-content large-modal" @click.stop>
        <div class="modal-header">
          <h2>Payment Schedule Details</h2>
          <button class="close-btn" @click="showDetailModal = false">
            <i class="fas fa-times"></i>
          </button>
        </div>
        
        <div v-if="detailLoading" class="loading-state">
          <div class="spinner"></div>
          <p>Loading schedule details...</p>
        </div>

        <div v-else-if="detailError" class="error-state">
          <i class="fas fa-exclamation-triangle"></i>
          <h3>Failed to load details</h3>
          <p>{{ detailError }}</p>
          <button class="btn btn-primary" @click="fetchScheduleDetail(selectedSchedule)">Try Again</button>
        </div>

        <div v-else-if="scheduleDetail" class="schedule-detail">
          <!-- Header Info -->
          <div class="detail-header">
            <div class="month-info">
              <h3>Month {{ scheduleDetail.month_number }}</h3>
              <p class="debt-plan-name">{{ scheduleDetail.debt_plan_name }}</p>
            </div>
            <div class="focus-loan-badge">
              <i class="fas fa-bullseye"></i>
              Focus: {{ scheduleDetail.focus_loan_name }}
            </div>
          </div>

          <!-- Summary Stats -->
          <div class="summary-grid">
            <div class="summary-stat-card">
              <div class="stat-icon">
                <i class="fas fa-money-bill-wave"></i>
              </div>
              <div class="stat-content">
                <span class="label">Total Payment</span>
                <span class="value">${{ scheduleDetail.total_payment }}</span>
              </div>
            </div>
            <div class="summary-stat-card">
              <div class="stat-icon">
                <i class="fas fa-percentage"></i>
              </div>
              <div class="stat-content">
                <span class="label">Total Interest</span>
                <span class="value">${{ scheduleDetail.total_interest }}</span>
              </div>
            </div>
            <div class="summary-stat-card">
              <div class="stat-icon">
                <i class="fas fa-piggy-bank"></i>
              </div>
              <div class="stat-content">
                <span class="label">Total Principal</span>
                <span class="value">${{ scheduleDetail.total_principal }}</span>
              </div>
            </div>
          </div>

          <!-- Loan Breakdowns -->
          <div class="breakdowns-section">
            <h3>Loan Breakdowns</h3>
            <div class="breakdowns-list">
              <div 
                v-for="breakdown in scheduleDetail.loan_breakdowns" 
                :key="breakdown.id" 
                class="breakdown-card detailed"
                :class="{ 'focus-loan': breakdown.is_focus_loan }"
              >
                <div class="breakdown-header">
                  <div class="loan-main-info">
                    <div class="loan-title">
                      <h4>{{ breakdown.loan_name }}</h4>
                      <span class="payoff-order">Payoff Order: #{{ breakdown.loan_payoff_order }}</span>
                    </div>
                    <div class="loan-status">
                      <span v-if="breakdown.is_focus_loan" class="focus-badge">
                        <i class="fas fa-bullseye"></i> Focus Loan
                      </span>
                      <span class="payment-status" :class="getPaymentStatusClass(breakdown)">
                        <i :class="getPaymentStatusIcon(breakdown)"></i>
                        {{ breakdown.has_payment ? 'Paid' : 'Pending' }}
                      </span>
                    </div>
                  </div>
                </div>

                <div class="breakdown-details-grid">
                  <div class="detail-column">
                    <div class="detail-item">
                      <span class="label">Scheduled Payment</span>
                      <span class="value">${{ breakdown.payment_amount }}</span>
                    </div>
                    <div class="detail-item">
                      <span class="label">Interest Amount</span>
                      <span class="value">${{ breakdown.interest_amount }}</span>
                    </div>
                    <div class="detail-item">
                      <span class="label">Principal Amount</span>
                      <span class="value">${{ breakdown.principal_amount }}</span>
                    </div>
                  </div>
                  <div class="detail-column">
                    <div class="detail-item">
                      <span class="label">Remaining Balance</span>
                      <span class="value">${{ formatNumber(breakdown.remaining_balance) }}</span>
                    </div>
                    <div class="detail-item">
                      <span class="label">Payment Status</span>
                      <span class="value" :class="getPaymentStatusClass(breakdown)">
                        {{ breakdown.has_payment ? 'Completed' : 'Pending' }}
                      </span>
                    </div>
                    <div v-if="breakdown.has_payment" class="detail-item">
                      <span class="label">Actual Payment</span>
                      <span class="value actual">${{ breakdown.actual_payment_amount }}</span>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          </div>

          <!-- Payment Tracking Section -->
          <div class="payment-section" v-if="scheduleDetail">
            <h3>Record Payment</h3>
            
            <form @submit.prevent="submitPayment" class="payment-form">
              <div class="form-row">
                <div class="form-group">
                  <label for="paymentLoan">Loan</label>
                  <select 
                    id="paymentLoan" 
                    v-model="newPayment.loan" 
                    required
                    class="form-select"
                  >
                    <option value="" disabled>Select a loan</option>
                    <option 
                      v-for="breakdown in scheduleDetail.loan_breakdowns" 
                      :key="breakdown.loan_id" 
                      :value="breakdown.loan_id"
                    >
                      {{ breakdown.loan_name }} - ${{ breakdown.payment_amount }} due
                    </option>
                  </select>
                </div>
                
                <div class="form-group">
                  <label for="paymentAmount">Amount ($)</label>
                  <input 
                    type="number" 
                    id="paymentAmount" 
                    v-model="newPayment.amount" 
                    step="0.01"
                    min="0.01"
                    required
                    placeholder="0.00"
                  >
                </div>
              </div>

              <div class="form-row">
                <div class="form-group">
                  <label for="paymentDate">Payment Date</label>
                  <input 
                    type="date" 
                    id="paymentDate" 
                    v-model="newPayment.payment_date" 
                    required
                  >
                </div>
                
                <div class="form-group">
                  <label for="paymentMethod">Payment Method</label>
                  <select 
                    id="paymentMethod" 
                    v-model="newPayment.payment_method" 
                    required
                    class="form-select"
                  >
                    <option value="" disabled>Select method</option>
                    <option value="bank_transfer">Bank Transfer</option>
                    <option value="credit_card">Credit Card</option>
                    <option value="debit_card">Debit Card</option>
                    <option value="check">Check</option>
                    <option value="cash">Cash</option>
                    <option value="auto_pay">Automatic Payment</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>

              <div class="form-row">
                <div class="form-group">
                  <label for="confirmationNumber">Confirmation Number (Optional)</label>
                  <input 
                    type="text" 
                    id="confirmationNumber" 
                    v-model="newPayment.confirmation_number" 
                    placeholder="Enter confirmation number"
                    maxlength="100"
                  >
                </div>
              </div>

              <div class="form-group">
                <label for="paymentNotes">Notes (Optional)</label>
                <textarea 
                  id="paymentNotes" 
                  v-model="newPayment.notes" 
                  placeholder="Add any notes about this payment"
                  rows="3"
                ></textarea>
              </div>

              <div v-if="paymentError" class="alert alert-error">
                <i class="fas fa-exclamation-circle"></i>
                <span>{{ paymentError }}</span>
              </div>

              <div class="payment-actions">
                <button 
                  type="submit" 
                  class="btn btn-primary" 
                  :disabled="paymentLoading"
                >
                  <span v-if="!paymentLoading">
                    <i class="fas fa-check-circle"></i> Record Payment
                  </span>
                  <span v-else>
                    <i class="fas fa-spinner fa-spin"></i> Processing...
                  </span>
                </button>
              </div>
            </form>
          </div>

          <!-- Recent Payments Section -->
          <div class="recent-payments" v-if="recentPayments && recentPayments.length > 0">
            <h3>Recent Payments</h3>
            <div class="payments-list">
              <div 
                v-for="payment in recentPayments" 
                :key="payment.id" 
                class="payment-card"
              >
                <div class="payment-header">
                  <div class="payment-info">
                    <h4>{{ payment.loan_name }}</h4>
                    <span class="payment-date">{{ formatDate(payment.payment_date) }}</span>
                  </div>
                  <div class="payment-amount">
                    ${{ parseFloat(payment.amount).toLocaleString() }}
                  </div>
                </div>
                <div class="payment-details">
                  <div class="payment-method">
                    <i class="fas fa-credit-card"></i>
                    {{ payment.payment_method_display }}
                  </div>
                  <div class="payment-breakdown">
                    <span class="breakdown-item">
                      Principal: ${{ payment.principal_paid || '0.00' }}
                    </span>
                    <span class="breakdown-item">
                      Interest: ${{ payment.interest_paid || '0.00' }}
                    </span>
                  </div>
                  <div v-if="payment.confirmation_number" class="confirmation-number">
                    Confirmation: {{ payment.confirmation_number }}
                  </div>
                  <div v-if="payment.notes" class="payment-notes">
                    {{ payment.notes }}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Actions -->
          <div class="detail-actions">
            <button class="btn btn-outline" @click="showDetailModal = false">
              Close
            </button>
          </div>
        </div>
      </div>
    </div>

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
      
      // Detailed Schedule Modal
      showDetailModal: false,
      detailLoading: false,
      detailError: null,
      scheduleDetail: null,
      selectedSchedule: null,
      
      // Payment tracking
      newPayment: {
        loan: '',
        debt_plan: '',
        amount: '',
        payment_date: new Date().toISOString().split('T')[0], // Today's date
        payment_method: '',
        notes: '',
        confirmation_number: ''
      },
      recentPayments: [],
      paymentLoading: false,
      paymentError: null,
      
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
    },
    isMonthPaid() {
      if (!this.scheduleDetail || !this.scheduleDetail.loan_breakdowns) return false
      return this.scheduleDetail.loan_breakdowns.every(loan => loan.has_payment)
    },
    completedMonths(){
      return this.timelineData.filter(event => event.completed).length
    },
    currentMonthNumber(){
      const current = this.timelineData.find(event => event.is_current)
      return current ? current.month_number : 0
    },

    futureMonths(){
      return this.timelineData.filter(event => event.is_future).length
    },

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
        await this.fetchProgressData()
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
        
        // Update progressData for overview stats
        this.progressData = {
          total_remaining: data.total_debt_remaining || 0,
          total_paid: data.total_debt_paid || 0,
          percentage: parseFloat(data.progress_percentage) || 0,
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

        const data = await response.json()

        this.timelineData = data.map(schedule=> {
          const event = {
            title: `Month ${schedule.month_number}`,
            date: this.getMonthDate(schedule.month_number),
            description: `Focus: ${schedule.focus_loan_name} | Payment: $${schedule.total_payment}`,
            amount: parseFloat(schedule.total_payment),
            completed: schedule.has_payments || schedule.is_fully_paid,
            icon: this.getTimelineIcon(schedule),
            month_number: schedule.month_number,
            is_current: schedule.is_current_month,
            is_past: schedule.is_past_month,
            is_future: schedule.is_future_month,
            completion_percentage: schedule.completion_percentage,
            total_paid: schedule.total_paid,
            payment_deficit: schedule.payment_deficit
          }
          if (schedule.is_fully_paid){
            event.description += ' ✓ Fully Paid'
          } else if (schedule.has_payments){
            event.description += ` | Paid: $${schedule.total_paid} (${schedule.completion_percentage}%)`
          } else if (schedule.is_current_month){
            event.description += ' | Current Month'
          }
          return event
        })
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

    // Detailed Schedule Methods
    async viewScheduleDetail(schedule) {
      this.selectedSchedule = schedule
      await this.fetchScheduleDetail(schedule)
    },

    async fetchScheduleDetail(schedule) {
      this.detailLoading = true
      this.detailError = null
      this.showDetailModal = true
      
      try {
        const response = await api.get(
          `/PaymentSchedule/detail/?debt_plan=${this.selectedPlan.id}&month_number=${schedule.month_number}`
        )
        
        if (response.status === 429) {
          this.handleThrottling()
          return
        }
        
        if (!response.ok) {
          throw new Error('Failed to fetch schedule details')
        }
        
        this.scheduleDetail = await response.json()
        
        // Fetch recent payments when detail modal opens
        await this.fetchRecentPayments()
        
      } catch (error) {
        console.error('Error fetching schedule detail:', error)
        this.detailError = error.message || 'Failed to load schedule details'
      } finally {
        this.detailLoading = false
      }
    },

    // Payment Tracking Methods
    async submitPayment() {
      this.paymentLoading = true
      this.paymentError = null
      
      try {
        // Set the debt_plan from the selected plan
        this.newPayment.debt_plan = this.selectedPlan.id
        
        const response = await api.post('/Payment/create_payment/', this.newPayment)
        
        if (response.status === 429) {
          this.handleThrottling()
          return
        }
        
        if (!response.ok) {
          const data = await response.json()
          throw new Error(data.error || 'Failed to record payment')
        }
        
        const paymentData = await response.json()
        
        // Reset form
        this.resetPaymentForm()
        
        // Refresh data
        await this.fetchScheduleDetail(this.selectedSchedule)
        await this.fetchRecentPayments()
        
        this.showNotification('Payment recorded successfully!', 'success')
        
      } catch (error) {
        console.error('Error recording payment:', error)
        this.paymentError = error.message || 'Failed to record payment'
      } finally {
        this.paymentLoading = false
      }
    },

    resetPaymentForm() {
      this.newPayment = {
        loan: '',
        debt_plan: this.selectedPlan.id,
        amount: '',
        payment_date: new Date().toISOString().split('T')[0],
        payment_method: '',
        notes: '',
        confirmation_number: ''
      }
    },

    async fetchRecentPayments() {
      if (!this.selectedPlan) return
      
      try {
        const response = await api.get(`/Payment/list_payments/?debt_plan=${this.selectedPlan.id}&limit=5`)
        
        if (!response.ok) throw new Error('Failed to fetch recent payments')
        
        this.recentPayments = await response.json()
      } catch (error) {
        console.error('Error fetching recent payments:', error)
        this.recentPayments = []
      }
    },

    getPaymentStatusClass(breakdown) {
      return breakdown.has_payment ? 'paid' : 'pending'
    },

    getPaymentStatusIcon(breakdown) {
      return breakdown.has_payment ? 'fas fa-check-circle' : 'fas fa-clock'
    },

    calculateLoanProgress(breakdown) {
      // This is a simplified calculation - you might want to adjust based on your data structure
      const remaining = parseFloat(breakdown.remaining_balance)
      const principal = parseFloat(breakdown.principal_balance || breakdown.remaining_balance * 2) // Fallback
      const paid = principal - remaining
      const progress = (paid / principal) * 100
      return Math.min(Math.max(progress, 0), 100).toFixed(1)
    },

    getMonthDate(monthNumber) {
      if (!this.selectedPlan?.created_at) return 'N/A'
      const createdDate = new Date(this.selectedPlan.created_at)
      const targetDate = new Date(createdDate)
      targetDate.setMonth(createdDate.getMonth() + monthNumber - 1)

      return targetDate.toLocaleDateString('en-US',{
        month: 'short',
        year: 'numeric'
      })
    },

    getTimelineIcon(schedule){
      if (schedule.is_fully_paid){
        return 'fas fa-check-circle'
      } else if (schedule.has_payments){
        return 'fas fa-hourglass-half'
      } else if (schedule.is_current_month){
        return 'fas fa-calendar-day'
      } else if (schedule.is_past_month){
        return 'fas fa-exclamation-circle'
      } else{
        return 'fas fa-calendar'
      }
    },

    async markMonthAsPaid() {
      if (!this.scheduleDetail) return
      
      try {
        // You'll need to implement this endpoint based on your backend
        const response = await api.post('/PaymentSchedule/mark_paid/', {
          debt_plan: this.selectedPlan.id,
          month_number: this.scheduleDetail.month_number
        })
        
        if (response.ok) {
          this.showNotification('Month marked as paid successfully!', 'success')
          await this.fetchScheduleDetail(this.selectedSchedule) // Refresh data
          await this.loadTabData() // Refresh current tab data
        } else {
          throw new Error('Failed to mark month as paid')
        }
      } catch (error) {
        console.error('Error marking month as paid:', error)
        this.showNotification('Failed to mark month as paid', 'error')
      }
    },

    async downloadSchedulePDF() {
      if (!this.selectedPlan){
        this.showNotification('No debt plan selected for PDF download', 'error')
        return
      }
      
      try{
        this.showNotification('Preparing PDF download...', 'success')

        const response = await api.get(
          `/accountability/pdf/${this.selectedPlan.id}/download/`,
          { responseType: 'blob' }
        )

        if (!response.ok) {
          throw new Error('Failed to download PDF')
        }
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url

        const contentDisposition = response.headers.get('Content-Disposition')
        let filename = `payment-schedule-${this.selectedPlan.name}.pdf`
        
        if (contentDisposition) {
          const filenameMatch = contentDisposition.match(/filename="?(.+)"?/)
          if (filenameMatch) {
            filename = filenameMatch[1]
          }
        }

        link.download = filename
        document.body.appendChild(link)
        link.click()

        document.body.removeChild(link)
        window.URL.revokeObjectURL(url)

        this.showNotification('PDF downloaded successfully!', 'success')
      } catch (error) {
        console.error('Error downloading PDF:', error)
        this.showNotification('Failed to download PDF', 'error')
      }
    },

    formatNumber(number) {
      return parseFloat(number || 0).toLocaleString('en-US', { 
        minimumFractionDigits: 2,
        maximumFractionDigits: 2 
      })
    },

    formatDate(dateString) {
      if (!dateString) return 'N/A'
      try {
        const date = new Date(dateString)
        // Handle invalid dates
        if (isNaN(date.getTime())) {
          return 'Invalid Date'
        }
        return date.toLocaleDateString('en-US', { 
          month: 'short', 
          day: 'numeric', 
          year: 'numeric' 
        })
      } catch (error) {
        console.error('Error formatting date:', error)
        return 'Invalid Date'
      }
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
    
    // Initialize payment form with today's date
    this.newPayment.payment_date = new Date().toISOString().split('T')[0]
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

.btn-success {
  background: #22c55e;
  color: white;
}

.btn-success:hover {
  background: #16a34a;
  box-shadow: 0 0 20px rgba(34, 197, 94, 0.4);
}

.btn-success:disabled {
  background: #22c55e;
  opacity: 0.6;
  cursor: not-allowed;
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

/* Timeline Summary Stats */
.timeline-summary {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
  margin-bottom: 2rem;
  padding: 1.5rem;
  background: rgba(0, 245, 255, 0.05);
  border-radius: 12px;
  border: 1px solid rgba(0, 245, 255, 0.2);
}

.summary-stat-box {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 10px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.summary-stat-box.current {
  border-color: var(--primary);
  background: rgba(0, 245, 255, 0.1);
}

.summary-stat-box i {
  font-size: 1.5rem;
  color: var(--primary);
}

.summary-stat-box.current i {
  color: var(--primary);
  animation: pulse-icon 2s ease-in-out infinite;
}

@keyframes pulse-icon {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.6; }
}

.summary-stat-box div {
  display: flex;
  flex-direction: column;
}

.summary-stat-box .value {
  color: var(--light);
  font-size: 1.5rem;
  font-weight: 700;
}

.summary-stat-box .label {
  color: var(--gray);
  font-size: 0.85rem;
}

/* Enhanced Timeline Items */
.timeline-item.current {
  border-color: rgba(0, 245, 255, 0.5);
  background: rgba(0, 245, 255, 0.08);
}

.timeline-item.current .timeline-marker {
  background: rgba(0, 245, 255, 0.3);
  border-color: var(--primary);
  box-shadow: 0 0 15px rgba(0, 245, 255, 0.5);
}

.timeline-item.past-due {
  border-color: rgba(239, 68, 68, 0.3);
  background: rgba(239, 68, 68, 0.05);
}

.timeline-item.past-due .timeline-marker {
  background: rgba(239, 68, 68, 0.2);
  border-color: #ef4444;
}

.timeline-item.past-due .timeline-marker i {
  color: #ef4444;
}

.timeline-amount {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 0.75rem;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  margin-top: 0.5rem;
}

.timeline-amount .label {
  color: var(--gray);
  font-size: 0.85rem;
}

.timeline-amount .value {
  color: var(--light);
  font-weight: 600;
}

.timeline-amount.paid {
  background: rgba(34, 197, 94, 0.1);
  border: 1px solid rgba(34, 197, 94, 0.3);
}

.timeline-amount.paid .value {
  color: #22c55e;
}

.timeline-amount.deficit {
  background: rgba(251, 191, 36, 0.1);
  border: 1px solid rgba(251, 191, 36, 0.3);
}

.timeline-amount.deficit .value {
  color: #fbbf24;
}

/* Current Month Tab */
.current-schedule {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.summary-card {
  background: linear-gradient(135deg, rgba(0, 245, 255, 0.08) 0%, rgba(138, 43, 226, 0.08) 100%);
  border: 1px solid rgba(0, 245, 255, 0.3);
  border-radius: 15px;
  padding: 2rem;
  box-shadow: 0 8px 32px rgba(0,245,255,0.1);
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
  padding: 0.75rem 1.5rem;
  background: linear-gradient(135deg, rgba(0, 245, 255, 0.2) 0%, rgba(138, 43, 226, 0.2) 100%);
  color: var(--primary);
  border: 1px solid rgba(0, 245, 255, 0.4);
  border-radius: 25px;
  font-weight: 600;
  font-size: 1rem;
  box-shadow: 0 4px 15px rgba(0, 245, 255, 0.2);
}

.summary-stats {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1.5rem;
}

.summary-stat {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 1.75rem 1.5rem;
  background: rgba(255, 255, 255, 0.08);
  border : 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 12px;
  transition: all 0.3s ease;
  min-height: 120px;
}

.summary-stat .label {
  color: var(--gray);
  font-size: 0.95rem;
  margin-bottom: 0.75rem;
  font-weight: 500;
}

.summary-stat .value {
  color: var(--light);
  font-weight: 700;
  font-size: 1.5rem;
}

/* Breakdowns List */
.breakdowns-list {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
}

.breakdown-card {
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.06) 0%, rgba(255, 255, 255, 0.03) 100%);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 12px;
  padding: 2rem 1.5rem;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
  min-height: 280px;
}

.breakdown-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 4px;
  height: 100%;
  background: linear-gradient(180deg, var(--primary), var(--accent));
  opacity: 0;
  transition: opacity 0.3s ease;

}

.breakdown-card:hover::before {
  opacity: 1;
}

.breakdown-card.focus-loan {
  border-color: var(--primary);
  background: linear-gradient(135deg, rgba(0, 245, 255, 0.12) 0%, rgba(138, 43, 226, 0.08) 100%);
  box-shadow: 0 4px 20px rgba(0, 245, 255, 0.15);
}

.breakdown-card.focus-loan::before {
  opacity: 1; 
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
}

.breakdown-details {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
  margin-top: 1rem;
}

.detail-item {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding-bottom: 0.5rem;
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

/* Progress Chart Tab - Updated Styles */
.progress-charts {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

/* Progress Overview */
.progress-overview {
  margin-bottom: 2rem;
}

.progress-main-card {
  background: rgba(0, 245, 255, 0.05);
  border: 1px solid rgba(0, 245, 255, 0.2);
  border-radius: 15px;
  padding: 2rem;
}

.progress-main-card h3 {
  color: var(--light);
  margin-bottom: 1.5rem;
  text-align: center;
  font-size: 1.3rem;
}

.progress-visual {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 2rem;
  align-items: center;
}

.circular-progress {
  display: flex;
  justify-content: center;
}

.circular-progress-bar {
  position: relative;
  width: 120px;
  height: 120px;
}

.circular-progress-bar svg {
  transform: rotate(0deg);
}

.progress-text {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
}

.progress-text .percentage {
  display: block;
  color: var(--light);
  font-size: 1.5rem;
  font-weight: 700;
  margin-bottom: 0.25rem;
}

.progress-text .label {
  display: block;
  color: var(--gray);
  font-size: 0.8rem;
}

.progress-details {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
}

.progress-stat {
  text-align: center;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 10px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.progress-stat .value {
  display: block;
  color: var(--light);
  font-weight: 700;
  font-size: 1.2rem;
  margin-bottom: 0.25rem;
}

.progress-stat .label {
  display: block;
  color: var(--gray);
  font-size: 0.8rem;
}

/* Timeline Progress */
.timeline-progress {
  background: rgba(0, 245, 255, 0.05);
  border: 1px solid rgba(0, 245, 255, 0.2);
  border-radius: 15px;
  padding: 2rem;
  margin-bottom: 2rem;
}

.timeline-progress h3 {
  color: var(--light);
  margin-bottom: 1.5rem;
  font-size: 1.3rem;
}

.timeline-labels {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5rem;
  color: var(--gray);
  font-size: 0.9rem;
}

.timeline-track {
  width: 100%;
  height: 12px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 6px;
  position: relative;
  overflow: visible;
}

.timeline-progress-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--primary), var(--accent));
  border-radius: 6px;
  position: relative;
  transition: width 1s ease-in-out;
  min-width: 20px;
}

.timeline-marker {
  position: absolute;
  right: -60px;
  top: 50%;
  transform: translateY(-50%);
  background: var(--primary);
  color: var(--dark);
  padding: 0.5rem 0.75rem;
  border-radius: 15px;
  font-size: 0.8rem;
  font-weight: 600;
  white-space: nowrap;
}

.timeline-marker::after {
  content: '';
  position: absolute;
  left: -6px;
  top: 50%;
  transform: translateY(-50%);
  width: 0;
  height: 0;
  border-top: 6px solid transparent;
  border-bottom: 6px solid transparent;
  border-right: 6px solid var(--primary);
}

.timeline-stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
  margin-top: 1.5rem;
}

.timeline-stat {
  text-align: center;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 10px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.timeline-stat .label {
  display: block;
  color: var(--gray);
  font-size: 0.8rem;
  margin-bottom: 0.25rem;
}

.timeline-stat .value {
  display: block;
  color: var(--light);
  font-weight: 700;
  font-size: 1.2rem;
}

/* Loan Progress Breakdown */
.loan-progress-breakdown {
  background: rgba(0, 245, 255, 0.05);
  border: 1px solid rgba(0, 245, 255, 0.2);
  border-radius: 15px;
  padding: 2rem;
  margin-bottom: 2rem;
}

.loan-progress-breakdown h3 {
  color: var(--light);
  margin-bottom: 1.5rem;
  font-size: 1.3rem;
}

.loans-progress-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.loan-progress-card {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  padding: 1.5rem;
  transition: all 0.3s ease;
}

.loan-progress-card.focus-loan {
  border-color: var(--primary);
  background: rgba(0, 245, 255, 0.1);
}

.loan-progress-card.paid-off {
  border-color: #22c55e;
  background: rgba(34, 197, 94, 0.1);
}

.loan-progress-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(0, 245, 255, 0.2);
}

.loan-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
}

.loan-info h4 {
  color: var(--light);
  margin: 0 0 0.5rem 0;
  font-size: 1.1rem;
}

.loan-meta {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.payoff-order {
  color: var(--gray);
  font-size: 0.8rem;
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
}

.paid-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.25rem 0.75rem;
  background: rgba(34, 197, 94, 0.2);
  color: #22c55e;
  border: 1px solid rgba(34, 197, 94, 0.3);
  border-radius: 15px;
  font-size: 0.8rem;
  font-weight: 500;
}

.loan-progress-percentage {
  color: var(--primary);
  font-weight: 700;
  font-size: 1.2rem;
}

.loan-progress-bar {
  width: 100%;
  height: 8px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 4px;
  margin-bottom: 1rem;
  overflow: hidden;
}

.loan-progress-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--primary), var(--accent));
  border-radius: 4px;
  transition: width 1s ease-in-out;
}

.loan-stats-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
}

.loan-stat {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
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

/* Financial Summary */
.financial-summary {
  background: rgba(0, 245, 255, 0.05);
  border: 1px solid rgba(0, 245, 255, 0.2);
  border-radius: 15px;
  padding: 2rem;
}

.financial-summary h3 {
  color: var(--light);
  margin-bottom: 1.5rem;
  font-size: 1.3rem;
}

.summary-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

.summary-card {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.5rem;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 10px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.summary-icon {
  width: 50px;
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 245, 255, 0.1);
  border-radius: 10px;
}

.summary-icon i {
  font-size: 1.25rem;
  color: var(--primary);
}

.summary-content {
  display: flex;
  flex-direction: column;
}

.summary-content .value {
  color: var(--light);
  font-weight: 700;
  font-size: 1.2rem;
  margin-bottom: 0.25rem;
}

.summary-content .label {
  color: var(--gray);
  font-size: 0.8rem;
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

/* Detailed Schedule Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(5px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  padding: 2rem;
}

.modal-content {
  background: var(--card-bg);
  border-radius: 20px;
  border: 1px solid rgba(0, 245, 255, 0.3);
  width: 100%;
  max-width: 500px;
  max-height: 85vh;
  overflow-y: auto;
  box-shadow: 0 25px 50px rgba(0, 0, 0, 0.5);
  display: flex;
  flex-direction: column;
}

.large-modal {
  max-width: 800px;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 2rem 2rem 1rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.modal-header h2 {
  color: var(--light);
  margin: 0;
}

.close-btn {
  background: transparent;
  border: none;
  color: var(--gray);
  font-size: 1.2rem;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 50%;
  transition: all 0.3s ease;
}

.close-btn:hover {
  background: rgba(255, 255, 255, 0.1);
  color: var(--light);
}

.schedule-detail {
  padding: 0 2rem 2rem;
}

.detail-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.month-info h3 {
  color: var(--light);
  margin: 0 0 0.5rem 0;
  font-size: 1.5rem;
}

.debt-plan-name {
  color: var(--gray);
  margin: 0;
}

.focus-loan-badge {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: rgba(0, 245, 255, 0.1);
  color: var(--primary);
  border: 1px solid rgba(0, 245, 255, 0.3);
  border-radius: 20px;
  font-weight: 600;
}

.summary-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
}

.summary-stat-card {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.5rem;
  background: rgba(0, 245, 255, 0.05);
  border: 1px solid rgba(0, 245, 255, 0.2);
  border-radius: 10px;
}

.summary-stat-card .stat-icon {
  width: 50px;
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 245, 255, 0.1);
  border-radius: 10px;
}

.summary-stat-card .stat-icon i {
  font-size: 1.25rem;
  color: var(--primary);
}

.summary-stat-card .stat-content {
  display: flex;
  flex-direction: column;
}

.summary-stat-card .label {
  color: var(--gray);
  font-size: 0.9rem;
  margin-bottom: 0.25rem;
}

.summary-stat-card .value {
  color: var(--light);
  font-weight: 700;
  font-size: 1.3rem;
}

.breakdowns-section {
  margin-top: 2rem;
}

.breakdowns-section h3 {
  color: var(--light);
  margin-bottom: 1.5rem;
  font-size: 1.3rem;
}

.breakdowns-section .breakdowns-list {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  max-height: 500px;
  overflow-y: auto;
  padding-right: 0.5rem;
  padding-bottom: 1rem;
}

.breakdown-card.detailed {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  padding: 1.5rem;
  min-height: auto;
  flex-shrink: 0;
}

.breakdown-card.detailed.focus-loan {
  border-color: var(--primary);
  background: rgba(0, 245, 255, 0.1);
}

.loan-main-info {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1rem;
  margin-bottom: 1rem;
}

.loan-title h4 {
  color: var(--light);
  margin: 0 0 0.5rem 0;
  font-size: 1.2rem;
}

.payoff-order {
  color: var(--gray);
  font-size: 0.9rem;
}

.loan-status {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  align-items: flex-end;
}

.payment-status {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.25rem 0.75rem;
  border-radius: 15px;
  font-size: 0.8rem;
  font-weight: 500;
}

.payment-status.paid {
  background: rgba(34, 197, 94, 0.2);
  color: #22c55e;
  border: 1px solid rgba(34, 197, 94, 0.3);
}

.payment-status.pending {
  background: rgba(251, 191, 36, 0.2);
  color: #fbbf24;
  border: 1px solid rgba(251, 191, 36, 0.3);
}

.breakdown-details-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  margin-top: 1rem;
  margin-bottom: 0;
}

.detail-column {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.detail-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.detail-item:last-child {
  border-bottom: none;
}

.detail-item .label {
  color: var(--gray);
  font-size: 0.9rem;
}

.detail-item .value {
  color: var(--light);
  font-weight: 600;
  font-size: 0.9rem;
}

.detail-item .value.actual {
  color: #22c55e;
}

.detail-item .value.paid {
  color: #22c55e;
}

.detail-item .value.pending {
  color: #fbbf24;
}

.loan-progress {
  margin-top: 1rem;
}

.progress-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.progress-info .label {
  color: var(--gray);
  font-size: 0.9rem;
}

.progress-info .percentage {
  color: var(--primary);
  font-weight: 600;
  font-size: 0.9rem;
}

.progress-bar {
  width: 100%;
  height: 8px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 4px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--primary), var(--accent));
  border-radius: 4px;
  transition: width 0.3s ease;
}

/* Payment Section Styles */
.payment-section {
  margin-top: 2rem;
  padding: 1.5rem;
  background: rgba(0, 245, 255, 0.05);
  border: 1px solid rgba(0, 245, 255, 0.2);
  border-radius: 12px;
}

.payment-section h3 {
  color: var(--light);
  margin-bottom: 1.5rem;
  font-size: 1.3rem;
}

.payment-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-group label {
  color: var(--light);
  font-weight: 500;
  font-size: 0.9rem;
}

.form-group input,
.form-group select,
.form-group textarea {
  padding: 0.75rem;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  color: var(--light);
  font-size: 1rem;
  transition: all 0.3s ease;
}

.form-group input:focus,
.form-group select:focus,
.form-group textarea:focus {
  outline: none;
  border-color: var(--primary);
  box-shadow: 0 0 0 2px rgba(0, 245, 255, 0.2);
}

.form-group textarea {
  resize: vertical;
  min-height: 80px;
}

.form-select option {
  background: var(--card-bg);
  color: var(--light);
}

.payment-actions {
  display: flex;
  justify-content: flex-end;
  margin-top: 1rem;
}

/* Recent Payments Styles */
.recent-payments {
  margin-top: 2rem;
}

.recent-payments h3 {
  color: var(--light);
  margin-bottom: 1rem;
  font-size: 1.3rem;
}

.payments-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  max-height: 400px;
  overflow-y: auto;
}

.payment-card {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  padding: 1.25rem;
  transition: all 0.3s ease;
}

.payment-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(0, 245, 255, 0.2);
}

.payment-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
}

.payment-info h4 {
  color: var(--light);
  margin: 0 0 0.25rem 0;
  font-size: 1.1rem;
}

.payment-date {
  color: var(--gray);
  font-size: 0.85rem;
}

.payment-amount {
  color: var(--primary);
  font-weight: 700;
  font-size: 1.3rem;
}

.payment-details {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.payment-method {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--gray);
  font-size: 0.9rem;
}

.payment-breakdown {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.breakdown-item {
  color: var(--gray);
  font-size: 0.85rem;
  padding: 0.25rem 0.5rem;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 6px;
}

.confirmation-number {
  color: var(--gray);
  font-size: 0.85rem;
  font-family: monospace;
}

.payment-notes {
  color: var(--gray);
  font-size: 0.9rem;
  font-style: italic;
  padding-top: 0.5rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.detail-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 2rem;
  padding-top: 1.5rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

/* Scrollbar styling */
.breakdowns-list::-webkit-scrollbar {
  width: 6px;
}

.breakdowns-list::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 3px;
}

.breakdowns-list::-webkit-scrollbar-thumb {
  background: var(--primary);
  border-radius: 3px;
}

.breakdowns-list::-webkit-scrollbar-thumb:hover {
  background: var(--accent);
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
  
  /* Progress Chart Responsive */
  .progress-visual {
    grid-template-columns: 1fr;
    gap: 1.5rem;
    text-align: center;
  }
  
  .progress-details {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .timeline-stats {
    grid-template-columns: 1fr;
  }
  
  .loan-header {
    flex-direction: column;
    gap: 1rem;
    align-items: flex-start;
  }
  
  .loan-stats-grid {
    grid-template-columns: 1fr;
  }
  
  .summary-grid {
    grid-template-columns: 1fr;
  }
  
  .timeline-marker {
    position: static;
    transform: none;
    margin-top: 0.5rem;
    width: fit-content;
  }
  
  .timeline-marker::after {
    display: none;
  }
  
  /* Modal responsive styles */
  .modal-overlay {
    padding: 1rem;
  }
  
  .detail-header {
    flex-direction: column;
    gap: 1rem;
    align-items: flex-start;
  }
  
  .summary-grid {
    grid-template-columns: 1fr;
  }
  
  .breakdown-details-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
  
  .loan-main-info {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .loan-status {
    flex-direction: row;
    align-items: center;
    width: 100%;
    justify-content: space-between;
  }
  
  .detail-actions {
    flex-direction: column;
  }

  .summary-stats{
    grid-template-columns: 1fr;
    gap: 1rem;
  }

  .summary-stat{
    padding: 1.25rem;
  }

  .summary-stat .value{
    font-size: 1.3rem;
  }

  /* Payment Section Responsive */
  .form-row {
    grid-template-columns: 1fr;
  }
  
  .payment-header {
    flex-direction: column;
    gap: 0.5rem;
    align-items: flex-start;
  }
  
  .payment-breakdown {
    flex-direction: column;
    gap: 0.5rem;
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
  
  .progress-details {
    grid-template-columns: 1fr;
  }
}
</style>