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
          <li><a href="#debts" @click.prevent="showMyDebts = true">My Debts</a></li>
          <li><router-link to ="/progress">Progress</router-link></li>
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

    <main class="dashboard-main">
      <div class="container">
        <!-- Loading State -->
        <div v-if="loading" class="loading-state">
          <div class="spinner"></div>
          <p>Loading your dashboard...</p>
        </div>

        <!-- Error State -->
        <div v-else-if="error" class="error-state">
          <i class="fas fa-exclamation-triangle"></i>
          <h3>Something went wrong</h3>
          <p>{{ error }}</p>
          <button class="btn btn-primary" @click="fetchDebtPlans">Try Again</button>
        </div>
        
        <div v-if="notificationSuccess" class="alert-notification alert-success">
          <i class="fas fa-check-circle"></i>
          <span>{{ notificationSuccess }}</span>
        </div>

        <div v-if="notificationError" class="alert-notification alert-error">
          <i class="fas fa-exclamation-circle"></i>
          <span>{{ notificationError }}</span>
        </div>
        

        <!-- No Debt Plan State -->
        <div v-else-if="!hasDebtPlan" class="empty-dashboard">
          <div class="welcome-section">
            <h1>Welcome to Anchorless, {{ user?.first_name || 'Friend' }}! 👋</h1>
            <p>Let's get started on your journey to financial freedom</p>
          </div>

          <div class="onboarding-card">
            <div class="onboarding-icon">
              <i class="fas fa-rocket"></i>
            </div>
            <h2>Create Your First Debt Plan</h2>
            <p>Start by creating a debt payoff plan. Choose your strategy and set your monthly budget to get personalized recommendations.</p>
            
            <button class="btn btn-primary btn-large" @click="showCreatePlanModal = true">
              <i class="fas fa-plus-circle"></i> Create Debt Plan
            </button>

            <div class="info-cards">
              <div class="info-card">
                <i class="fas fa-snowflake"></i>
                <h4>Snowball Method</h4>
                <p>Pay off smallest debts first for quick wins</p>
              </div>
              <div class="info-card">
                <i class="fas fa-mountain"></i>
                <h4>Avalanche Method</h4>
                <p>Pay off highest interest debts to save money</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Dashboard with Debt Plan -->
        <div v-else class="dashboard-content">
          <!-- Welcome Section -->
          <div class="welcome-section with-stats">
            <div class="welcome-content">
              <h1>Welcome Back, {{ user?.first_name || 'Friend' }}! 👋</h1>
              <p>Here's your financial progress overview</p>
            </div>
            <div class="quick-stats">
              <div class="stat-card">
                <div class="stat-icon">
                  <i class="fas fa-wallet"></i>
                </div>
                <div class="stat-content">
                  <span class="stat-label">Total Debt</span>
                  <span class="stat-value">${{ totalDebt.toLocaleString() }}</span>
                </div>
              </div>
              <div class="stat-card">
                <div class="stat-icon">
                  <i class="fas fa-chart-line"></i>
                </div>
                <div class="stat-content">
                  <span class="stat-label">Monthly Budget</span>
                  <span class="stat-value">${{ activePlan?.monthly_payment_budget || 0 }}</span>
                </div>
              </div>
              <div class="stat-card">
                <div class="stat-icon">
                  <i class="fas fa-calendar-alt"></i>
                </div>
                <div class="stat-content">
                  <span class="stat-label">Payoff Date</span>
                  <span class="stat-value">{{ formattedPayoffDate }}</span>
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
                <button class="btn btn-sm btn-outline" @click="editPlan(activePlan)">
                  <i class="fas fa-edit"></i> Edit
                </button>
              </div>
              <div class="card-content">
                <div class="strategy-display">
                  <div class="strategy-badge" :class="activePlan?.strategy">
                    <i :class="strategyIcon"></i>
                    {{ activePlan?.strategy === 'snowball' ? 'Snowball' : 'Avalanche' }}
                  </div>
                  <h3 class="plan-name">{{ activePlan?.name }}</h3>
                  <p class="strategy-description">{{ strategyDescription }}</p>
                </div>
                <div class="strategy-stats">
                  <div class="stat-item">
                    <span class="label">Monthly Budget:</span>
                    <span class="value">${{ activePlan?.monthly_payment_budget }}</span>
                  </div>
                  <div class="stat-item">
                    <span class="label">Interest Saved:</span>
                    <span class="value">${{ formatCurrency(activePlan?.total_interest_saved) }}</span>
                  </div>
                  <div class="stat-item">
                    <span class="label">Created:</span>
                    <span class="value">{{ formatDate(activePlan?.created_at) }}</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Quick Actions Card -->
            <div class="dashboard-card actions-card">
              <div class="card-header">
                <h2><i class="fas fa-bolt"></i> Quick Actions</h2>
              </div>
              <div class="card-content">
                <button class="action-btn" @click="showAddDebtModal = true">
                  <div class="action-icon">
                    <i class="fas fa-plus-circle"></i>
                  </div>
                  <div class="action-text">
                    <span class="action-title">Add New Debt</span>
                    <span class="action-desc">Track a new debt</span>
                  </div>
                </button>
                <button class="action-btn" @click="showCreatePlanModal = true">
                  <div class="action-icon">
                    <i class="fas fa-file-alt"></i>
                  </div>
                  <div class="action-text">
                    <span class="action-title">Create New Plan</span>
                    <span class="action-desc">Start a new strategy</span>
                  </div>
                </button>
                <button class="action-btn" @click="showMyDebts = true">
                  <div class="action-icon">
                    <i class="fas fa-file-invoice-dollar"></i>
                  </div>
                  <div class="action-text">
                    <span class="action-title">View My Debts</span>
                    <span class="action-desc">Manage all loans</span>
                  </div>
                </button>
              </div>
            </div>

            <!-- All Plans Card -->
            <div class="dashboard-card plans-card full-width">
              <div class="card-header">
                <h2><i class="fas fa-list"></i> Your Debt Plans</h2>
              </div>
              <div class="card-content">
                <div class="plans-list">
                  <div 
                    v-for="plan in debtPlans" 
                    :key="plan.id" 
                    class="plan-item" 
                    :class="{ active: plan.is_active }"
                    @click="setActivePlan(plan)"
                  >
                    <div class="plan-main">
                      <div class="plan-info">
                        <h3>{{ plan.name }}</h3>
                        <div class="plan-meta">
                          <span class="plan-strategy" :class="plan.strategy">
                            <i :class="getStrategyIcon(plan.strategy)"></i>
                            {{ plan.strategy === 'snowball' ? 'Snowball' : 'Avalanche' }}
                          </span>
                          <span v-if="plan.is_active" class="active-badge">
                            <i class="fas fa-check"></i> Active
                          </span>
                        </div>
                      </div>
                      <div class="plan-details">
                        <div class="detail">
                          <span class="detail-label">Monthly Budget</span>
                          <span class="detail-value">${{ plan.monthly_payment_budget }}</span>
                        </div>
                        <div class="detail">
                          <span class="detail-label">Created</span>
                          <span class="detail-value">{{ formatDate(plan.created_at) }}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>

    <!-- Create Plan Modal -->
    <div v-if="showCreatePlanModal" class="modal-overlay" @click="showCreatePlanModal = false">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h2>Create Debt Plan</h2>
          <button class="close-btn" @click="showCreatePlanModal = false">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <form @submit.prevent="createPlan">
          <div class="form-group">
            <label for="planName">Plan Name</label>
            <input 
              type="text" 
              id="planName" 
              v-model="newPlan.name" 
              placeholder="e.g., Master Debt Plan"
              required
            >
          </div>
          <div class="form-group">
            <label for="strategy">Strategy</label>
            <div class="strategy-options">
              <label class="strategy-option" :class="{ selected: newPlan.strategy === 'snowball' }">
                <input 
                  type="radio" 
                  v-model="newPlan.strategy" 
                  value="snowball"
                  required
                >
                <div class="option-content">
                  <i class="fas fa-snowflake"></i>
                  <div class="option-text">
                    <strong>Snowball Method</strong>
                    <span>Pay smallest debts first for quick wins</span>
                  </div>
                </div>
              </label>
              <label class="strategy-option" :class="{ selected: newPlan.strategy === 'avalanche' }">
                <input 
                  type="radio" 
                  v-model="newPlan.strategy" 
                  value="avalanche"
                  required
                >
                <div class="option-content">
                  <i class="fas fa-mountain"></i>
                  <div class="option-text">
                    <strong>Avalanche Method</strong>
                    <span>Pay highest interest first to save money</span>
                  </div>
                </div>
              </label>
            </div>
          </div>
          <div class="form-group">
            <label for="budget">Monthly Payment Budget</label>
            <div class="input-with-symbol">
              <span class="input-symbol">$</span>
              <input 
                type="number" 
                id="budget" 
                v-model="newPlan.monthly_payment_budget" 
                placeholder="0.00"
                step="0.01"
                min="0"
                required
              >
            </div>
          </div>
          <div v-if="createError" class="alert alert-error">
            <i class="fas fa-exclamation-circle"></i>
            <span>{{ createError }}</span>
          </div>
          <div class="modal-actions">
            <button type="button" class="btn btn-outline" @click="showCreatePlanModal = false">
              Cancel
            </button>
            <button type="submit" class="btn btn-primary" :disabled="createLoading">
              <span v-if="!createLoading">Create Plan</span>
              <span v-else><i class="fas fa-spinner fa-spin"></i> Creating...</span>
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Edit Plan Modal -->
    <div v-if="showEditPlanModal" class="modal-overlay" @click="showEditPlanModal = false">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h2>Edit Debt Plan</h2>
          <button class="close-btn" @click="showEditPlanModal = false">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <form @submit.prevent="updatePlan">
          <div class="form-group">
            <label for="editPlanName">Plan Name</label>
            <input 
              type="text" 
              id="editPlanName" 
              v-model="editingPlan.name" 
              required
            >
          </div>
          <div class="form-group">
            <label for="editBudget">Monthly Payment Budget</label>
            <div class="input-with-symbol">
              <span class="input-symbol">$</span>
              <input 
                type="number" 
                id="editBudget" 
                v-model="editingPlan.monthly_payment_budget" 
                step="0.01"
                min="0"
                required
              >
            </div>
          </div>
          <div v-if="updateError" class="alert alert-error">
            <i class="fas fa-exclamation-circle"></i>
            <span>{{ updateError }}</span>
          </div>
          <div class="modal-actions">
            <button type="button" class="btn btn-outline" @click="showEditPlanModal = false">
              Cancel
            </button>
            <button type="submit" class="btn btn-primary" :disabled="updateLoading">
              <span v-if="!updateLoading">Update Plan</span>
              <span v-else><i class="fas fa-spinner fa-spin"></i> Updating...</span>
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Add Debt Modal -->
    <div v-if="showAddDebtModal" class="modal-overlay" @click="showAddDebtModal = false">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h2>Add New Debt</h2>
          <button class="close-btn" @click="showAddDebtModal = false">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <form @submit.prevent="createLoan">
          <div class="form-group">
            <label for="debtPlan">Debt Plan</label>
            <select 
              id="debtPlan" 
              v-model="newLoan.debt_plan" 
              required
            >
              <option value="" disabled>Select a debt plan</option>
              <option 
                v-for="plan in debtPlans" 
                :key="plan.id" 
                :value="plan.id"
              >
                {{ plan.name }}
              </option>
            </select>
          </div>
          <div class="form-group">
            <label for="loanName">Loan Name</label>
            <input 
              type="text" 
              id="loanName" 
              v-model="newLoan.name" 
              placeholder="e.g., Credit Card, Car Loan"
              required
            >
          </div>
          <div class="form-group">
            <label for="principalBalance">Principal Balance</label>
            <div class="input-with-symbol">
              <span class="input-symbol">$</span>
              <input 
                type="number" 
                id="principalBalance" 
                v-model="newLoan.principal_balance" 
                placeholder="0.00"
                step="0.01"
                min="0"
                required
              >
            </div>
          </div>
          <div class="form-group">
            <label for="interestRate">Interest Rate (%)</label>
            <div class="input-with-symbol">
              <input 
                type="number" 
                id="interestRate" 
                v-model="newLoan.interest_rate" 
                placeholder="0.00"
                step="0.01"
                min="0"
                max="100"
                required
              >
              <span class="input-symbol">%</span>
            </div>
          </div>
          <div class="form-group">
            <label for="dueDate">Due Date (Day of Month)</label>
            <input 
              type="number" 
              id="dueDate" 
              v-model="newLoan.due_date" 
              placeholder="1-28"
              min="1"
              max="28"
              required
            >
          </div>
          <div class="form-group">
            <label class="checkbox-label">
              <input 
                type="checkbox" 
                v-model="newLoan.manually_set_minimum_payment"
              >
              <span class="checkmark"></span>
              Set minimum payment manually
            </label>
          </div>
          <div v-if="newLoan.manually_set_minimum_payment" class="form-group">
            <label for="minimumPayment">Minimum Payment</label>
            <div class="input-with-symbol">
              <span class="input-symbol">$</span>
              <input 
                type="number" 
                id="minimumPayment" 
                v-model="newLoan.minimum_payment" 
                placeholder="0.00"
                step="0.01"
                min="0"
                required
              >
            </div>
          </div>
          <div v-if="loanError" class="alert alert-error">
            <i class="fas fa-exclamation-circle"></i>
            <span>{{ loanError }}</span>
          </div>
          <div class="modal-actions">
            <button type="button" class="btn btn-outline" @click="showAddDebtModal = false">
              Cancel
            </button>
            <button type="submit" class="btn btn-primary" :disabled="loanLoading">
              <span v-if="!loanLoading">Add Debt</span>
              <span v-else><i class="fas fa-spinner fa-spin"></i> Adding...</span>
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- My Debts Modal -->
    <div v-if="showMyDebts" class="modal-overlay" @click="showMyDebts = false">
      <div class="modal-content large-modal" @click.stop>
        <div class="modal-header">
          <h2>My Debts</h2>
          <button class="close-btn" @click="showMyDebts = false">
            <i class="fas fa-times"></i>
          </button>
        </div>
        
        <!-- Search and Filter Section -->
        <div class="search-section">
          <div class="search-bar">
            <i class="fas fa-search"></i>
            <input 
              type="text" 
              v-model="searchQuery" 
              placeholder="Search by debt plan, loan name, or date..."
              @input="filterLoans"
            >
          </div>
          <button class="btn btn-primary" @click="showAddDebtModal = true; showMyDebts = false;">
            <i class="fas fa-plus"></i> Add New Debt
          </button>
        </div>

        <!-- Loading State -->
        <div v-if="loansLoading" class="loading-state">
          <div class="spinner"></div>
          <p>Loading your debts...</p>
        </div>

        <!-- Error State -->
        <div v-else-if="loansError" class="error-state">
          <i class="fas fa-exclamation-triangle"></i>
          <h3>Failed to load debts</h3>
          <p>{{ loansError }}</p>
          <button class="btn btn-primary" @click="fetchLoans">Try Again</button>
        </div>

        <!-- Empty State -->
        <div v-else-if="filteredLoans.length === 0" class="empty-state">
          <i class="fas fa-file-invoice-dollar"></i>
          <h3>No debts found</h3>
          <p v-if="searchQuery">No debts match your search criteria.</p>
          <p v-else>You haven't added any debts yet.</p>
          <button class="btn btn-primary" @click="showAddDebtModal = true; showMyDebts = false;">
            <i class="fas fa-plus"></i> Add Your First Debt
          </button>
        </div>

        <!-- Loans List -->
        <div v-else class="loans-list">
          <div class="loans-grid">
            <div 
              v-for="loan in filteredLoans" 
              :key="loan.id" 
              class="loan-card"
            >
              <div class="loan-header">
                <h3>{{ loan.name }}</h3>
                <div class="loan-actions">
                  <button class="btn-icon" @click="viewLoan(loan)" title="View Details">
                    <i class="fas fa-eye"></i>
                  </button>
                  <button class="btn-icon" @click="editLoan(loan)" title="Edit Loan">
                    <i class="fas fa-edit"></i>
                  </button>
                  <button class="btn-icon btn-danger" @click="confirmDeleteLoan(loan)" title="Delete Loan">
                    <i class="fas fa-trash"></i>
                  </button>
                </div>
              </div>
              
              <div class="loan-details">
                <div class="detail-row">
                  <span class="label">Debt Plan:</span>
                  <span class="value">{{ loan.debt_plan_name || loan.debt_plan }}</span>
                </div>
                <div class="detail-row">
                  <span class="label">Principal Balance:</span>
                  <span class="value">${{ parseFloat(loan.principal_balance).toLocaleString() }}</span>
                </div>
                <div class="detail-row">
                  <span class="label">Remaining Balance:</span>
                  <span class="value">${{ parseFloat(loan.remaining_balance).toLocaleString() }}</span>
                </div>
                <div class="detail-row">
                  <span class="label">Interest Rate:</span>
                  <span class="value">{{ loan.interest_rate }}%</span>
                </div>
                <div class="detail-row">
                  <span class="label">Minimum Payment:</span>
                  <span class="value">${{ parseFloat(loan.minimum_payment).toLocaleString() }}</span>
                </div>
                <div class="detail-row">
                  <span class="label">Due Date:</span>
                  <span class="value">{{ loan.due_date }}th of month</span>
                </div>
                <div class="detail-row">
                  <span class="label">Payoff Order:</span>
                  <span class="value">#{{ loan.payoff_order }}</span>
                </div>
                <div class="detail-row">
                  <span class="label">Created:</span>
                  <span class="value">{{ formatDate(loan.created_at) }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- View Loan Modal -->
    <div v-if="showViewLoanModal" class="modal-overlay" @click="showViewLoanModal = false">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h2>Loan Details</h2>
          <button class="close-btn" @click="showViewLoanModal = false">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div v-if="selectedLoan" class="loan-details-full">
          <div class="detail-section">
            <h3>Basic Information</h3>
            <div class="detail-grid">
              <div class="detail-item">
                <span class="label">Loan Name:</span>
                <span class="value">{{ selectedLoan.name }}</span>
              </div>
              <div class="detail-item">
                <span class="label">Debt Plan:</span>
                <span class="value">{{ selectedLoan.debt_plan_name || selectedLoan.debt_plan }}</span>
              </div>
              <div class="detail-item">
                <span class="label">Principal Balance:</span>
                <span class="value">${{ parseFloat(selectedLoan.principal_balance).toLocaleString() }}</span>
              </div>
              <div class="detail-item">
                <span class="label">Remaining Balance:</span>
                <span class="value">${{ parseFloat(selectedLoan.remaining_balance).toLocaleString() }}</span>
              </div>
            </div>
          </div>
          
          <div class="detail-section">
            <h3>Payment Details</h3>
            <div class="detail-grid">
              <div class="detail-item">
                <span class="label">Interest Rate:</span>
                <span class="value">{{ selectedLoan.interest_rate }}%</span>
              </div>
              <div class="detail-item">
                <span class="label">Minimum Payment:</span>
                <span class="value">${{ parseFloat(selectedLoan.minimum_payment).toLocaleString() }}</span>
              </div>
              <div class="detail-item">
                <span class="label">Due Date:</span>
                <span class="value">{{ selectedLoan.due_date }}th of month</span>
              </div>
              <div class="detail-item">
                <span class="label">Manual Minimum Payment:</span>
                <span class="value">{{ selectedLoan.manually_set_minimum_payment ? 'Yes' : 'No' }}</span>
              </div>
            </div>
          </div>
          
          <div class="detail-section">
            <h3>Strategy Information</h3>
            <div class="detail-grid">
              <div class="detail-item">
                <span class="label">Payoff Order:</span>
                <span class="value">#{{ selectedLoan.payoff_order }}</span>
              </div>
              <div class="detail-item">
                <span class="label">Created:</span>
                <span class="value">{{ formatDate(selectedLoan.created_at) }}</span>
              </div>
              <div class="detail-item">
                <span class="label">Last Updated:</span>
                <span class="value">{{ formatDate(selectedLoan.updated_at) }}</span>
              </div>
            </div>
          </div>
        </div>
        <div class="modal-actions">
          <button class="btn btn-outline" @click="showViewLoanModal = false">
            Close
          </button>
          <button class="btn btn-primary" @click="editLoan(selectedLoan); showViewLoanModal = false;">
            <i class="fas fa-edit"></i> Edit Loan
          </button>
        </div>
      </div>
    </div>

    <!-- Edit Loan Modal -->
    <div v-if="showEditLoanModal" class="modal-overlay" @click="showEditLoanModal = false">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h2>Edit Loan</h2>
          <button class="close-btn" @click="showEditLoanModal = false">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <form @submit.prevent="updateLoan">
          <div class="form-group">
            <label for="editLoanName">Loan Name</label>
            <input 
              type="text" 
              id="editLoanName" 
              v-model="editingLoan.name" 
              required
            >
          </div>
          <div class="form-group">
            <label for="editDueDate">Due Date (Day of Month)</label>
            <input 
              type="number" 
              id="editDueDate" 
              v-model="editingLoan.due_date" 
              placeholder="1-31"
              min="1"
              max="31"
              required
            >
          </div>
          <div class="form-group">
            <label class="checkbox-label">
              <input 
                type="checkbox" 
                v-model="editingLoan.manually_set_minimum_payment"
              >
              <span class="checkmark"></span>
              Set minimum payment manually
            </label>
          </div>
          <div v-if="editingLoan.manually_set_minimum_payment" class="form-group">
            <label for="editMinimumPayment">Minimum Payment</label>
            <div class="input-with-symbol">
              <span class="input-symbol">$</span>
              <input 
                type="number" 
                id="editMinimumPayment" 
                v-model="editingLoan.minimum_payment" 
                placeholder="0.00"
                step="0.01"
                min="0"
                required
              >
            </div>
          </div>
          <div v-if="loanUpdateError" class="alert alert-error">
            <i class="fas fa-exclamation-circle"></i>
            <span>{{ loanUpdateError }}</span>
          </div>
          <div class="modal-actions">
            <button type="button" class="btn btn-outline" @click="showEditLoanModal = false">
              Cancel
            </button>
            <button type="submit" class="btn btn-primary" :disabled="loanUpdateLoading">
              <span v-if="!loanUpdateLoading">Update Loan</span>
              <span v-else><i class="fas fa-spinner fa-spin"></i> Updating...</span>
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Delete Confirmation Modal -->
    <div v-if="showDeleteConfirmModal" class="modal-overlay" @click="showDeleteConfirmModal = false">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h2>Delete Loan</h2>
          <button class="close-btn" @click="showDeleteConfirmModal = false">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="delete-confirmation">
          <i class="fas fa-exclamation-triangle"></i>
          <h3>Are you sure?</h3>
          <p>You are about to delete the loan "<strong>{{ loanToDelete?.name }}</strong>". This action cannot be undone.</p>
          <div class="modal-actions">
            <button class="btn btn-outline" @click="showDeleteConfirmModal = false">
              Cancel
            </button>
            <button class="btn btn-danger" @click="deleteLoan" :disabled="loanDeleteLoading">
              <span v-if="!loanDeleteLoading">Delete Loan</span>
              <span v-else><i class="fas fa-spinner fa-spin"></i> Deleting...</span>
            </button>
          </div>
        </div>
      </div>
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
  name: 'DashboardView',
  data() {
    return {
      user: null,
      loading: true,
      error: null,
      debtPlans: [],
      activePlan: null,
      totalDebt: 0,
      showCreatePlanModal: false,
      showEditPlanModal: false,
      showAddDebtModal: false,
      showThrottleNotification: false,
      createLoading: false,
      createError: null,
      updateLoading: false,
      updateError: null,
      loanLoading: false,
      loanError: null,
      notificationSuccess: null,
      notificationError: null,
      newPlan: {
        name: '',
        strategy: 'snowball',
        monthly_payment_budget: ''
      },
      editingPlan: {
        id: null,
        name: '',
        monthly_payment_budget: ''
      },
      newLoan: {
        debt_plan: '',
        name: '',
        principal_balance: '',
        interest_rate: '',
        minimum_payment: '',
        due_date: '',
        manually_set_minimum_payment: false
      },
      // New data properties for loans management
      showMyDebts: false,
      loans: [],
      filteredLoans: [],
      loansLoading: false,
      loansError: null,
      searchQuery: '',
      selectedLoan: null,
      loanToDelete: null,
      showViewLoanModal: false,
      showEditLoanModal: false,
      showDeleteConfirmModal: false,
      loanUpdateLoading: false,
      loanUpdateError: null,
      loanDeleteLoading: false,
      editingLoan: {
        id: null,
        name: '',
        minimum_payment: '',
        due_date: '',
        manually_set_minimum_payment: false
      }
    }
  },
  computed: {
    hasDebtPlan() {
      return this.debtPlans.length > 0
    },
    strategyDescription() {
      if (!this.activePlan) return ''
      return this.activePlan.strategy === 'snowball' 
        ? 'Focus on paying off your smallest debts first. This method builds momentum with quick wins and keeps you motivated throughout your debt-free journey.'
        : 'Prioritize debts with the highest interest rates. This approach saves you the most money on interest payments over time.'
    },
    strategyIcon() {
      return this.activePlan?.strategy === 'snowball' ? 'fas fa-snowflake' : 'fas fa-mountain'
    },
    formattedPayoffDate() {
      if (!this.activePlan?.projected_payoff_date) return 'N/A'
      const date = new Date(this.activePlan.projected_payoff_date)
      return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
    }
  },
  methods: {
    async initializeData() {
      await Promise.all([
        this.fetchDebtPlans(),
        this.fetchLoans()
      ])
    },

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
        
        // Use array spread for reactivity
        this.debtPlans = [...data]
        
        // Set active plan (first active plan, or first plan if none active)
        this.activePlan = this.debtPlans.find(plan => plan.is_active) || this.debtPlans[0] || null

        // Recalculate total debt whenever plans change
        await this.calculateTotalDebt()

        if (this.loans.length > 0) {
          await this.mapDebtPlanNames()
        }
        
      } catch (error) {
        console.error('Error fetching debt plans:', error)
        this.error = 'Failed to load your debt plans. Please try again.'
      } finally {
        this.loading = false
      }
    },
    
    async createPlan() {
      this.createLoading = true
      this.createError = null
      
      try {
        const response = await api.post('/DebtPlan/create_plan/', {
          name: this.newPlan.name,
          strategy: this.newPlan.strategy,
          monthly_payment_budget: this.newPlan.monthly_payment_budget
        })
        
        if (response.status === 429) {
          this.handleThrottling()
          return
        }
        
        if (!response.ok) {
          const data = await response.json()
          throw new Error(data.error || 'Failed to create debt plan')
        }
        
        // Instead of manually pushing, refetch all plans to ensure consistency
        await this.fetchDebtPlans()
        
        // Reset form and close modal
        this.newPlan = {
          name: '',
          strategy: 'snowball',
          monthly_payment_budget: ''
        }
        this.showCreatePlanModal = false
        
        // Show success message
        this.showNotification('Debt plan created successfully!', 'success')
        
      } catch (error) {
        console.error('Error creating plan:', error)
        this.createError = error.message || 'Failed to create debt plan'
      } finally {
        this.createLoading = false
      }
    },
    
    editPlan(plan) {
      this.editingPlan = {
        id: plan.id,
        name: plan.name,
        monthly_payment_budget: plan.monthly_payment_budget
      }
      this.showEditPlanModal = true
    },
    
    async updatePlan() {
      this.updateLoading = true
      this.updateError = null
      
      try {
        const response = await api.patch(`/DebtPlan/update_plan/${this.editingPlan.id}/`, {
          name: this.editingPlan.name,
          monthly_payment_budget: this.editingPlan.monthly_payment_budget
        })
        
        if (response.status === 429) {
          this.handleThrottling()
          return
        }
        
        if (!response.ok) {
          const data = await response.json()
          throw new Error(data.error || 'Failed to update debt plan')
        }
        
        // Refetch all plans instead of manually updating
        await this.fetchDebtPlans()
        
        this.showEditPlanModal = false
        this.showNotification('Debt plan updated successfully!', 'success')
        
      } catch (error) {
        console.error('Error updating plan:', error)
        this.updateError = error.message || 'Failed to update debt plan'
      } finally {
        this.updateLoading = false
      }
    },
    
    async createLoan() {
      this.loanLoading = true
      this.loanError = null
      
      try {
        // Prepare the loan data
        const loanData = {
          debt_plan: this.newLoan.debt_plan,
          name: this.newLoan.name,
          principal_balance: this.newLoan.principal_balance,
          interest_rate: this.newLoan.interest_rate,
          due_date: parseInt(this.newLoan.due_date),
          manually_set_minimum_payment: this.newLoan.manually_set_minimum_payment
        }
        
        // Only include minimum_payment if manually set
        if (this.newLoan.manually_set_minimum_payment) {
          loanData.minimum_payment = this.newLoan.minimum_payment
        }
        
        const response = await api.post('/Loan/create/', loanData)
        
        if (response.status === 429) {
          this.handleThrottling()
          return
        }
        
        if (!response.ok) {
          const data = await response.json()
          throw new Error(data.error || 'Failed to create loan')
        }
        
        // Reset form and close modal
        this.resetLoanForm()
        this.showAddDebtModal = false

        // Always refresh loans data
        await this.fetchLoans()
        
        // Also refresh debt plans to get updated calculations
        await this.fetchDebtPlans()
        
        // Show success message
        this.showNotification('Loan added successfully!', 'success')
        
      } catch (error) {
        console.error('Error creating loan:', error)
        this.loanError = error.message || 'Failed to add loan'
      } finally {
        this.loanLoading = false
      }
    },
    
    resetLoanForm() {
      this.newLoan = {
        debt_plan: '',
        name: '',
        principal_balance: '',
        interest_rate: '',
        minimum_payment: '',
        due_date: '',
        manually_set_minimum_payment: false
      }
    },
    
    async viewPlan(planId) {
      try {
        const response = await api.get(`/DebtPlan/get_debt_plan/${planId}/`)
        
        if (response.status === 429) {
          this.handleThrottling()
          return
        }
        
        if (!response.ok) {
          throw new Error('Failed to fetch plan details')
        }
        
        const data = await response.json()
        console.log('Plan details:', data)
        
      } catch (error) {
        console.error('Error viewing plan:', error)
      }
    },

    async setActivePlan(plan) {
      this.activePlan = plan
      await this.calculateTotalDebt()
    },

    getStrategyIcon(strategy) {
      return strategy === 'snowball' ? 'fas fa-snowflake' : 'fas fa-mountain'
    },

    formatCurrency(amount) {
      if (!amount) return '0.00'
      return parseFloat(amount).toFixed(2)
    },
    
    formatDate(dateString) {
      if (!dateString) return 'N/A'
      const date = new Date(dateString)
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    },

    handleThrottling() {
      this.showThrottleNotification = true
      // Auto-hide after 5 seconds
      setTimeout(() => {
        this.showThrottleNotification = false
      }, 5000)
    },

    showNotification(message, type = 'success') {
      if (type === 'success'){
        this.notificationSuccess = message
        this.notificationError = null 
      } else {
        this.notificationError = message
        this.notificationSuccess = null
      }

      setTimeout(() => {
        this.notificationSuccess = null
        this.notificationError = null 
      }, 3000)
    },
    
    async handleLogout() {
      const authStore = useAuthStore()
      authStore.logout()
      this.$router.push('/')
    },
    
    addDebt() {
      this.showAddDebtModal = true
    },

    // New methods for loans management
    async fetchLoans() {
      this.loansLoading = true
      this.loansError = null
      
      try {
        const response = await api.get('/Loan/list_loan/')
        
        if (response.status === 429) {
          this.handleThrottling()
          return
        }
        
        if (!response.ok) {
          throw new Error('Failed to fetch loans')
        }
        
        const data = await response.json()
        this.loans = [...data] // Use array spread for reactivity
        this.filteredLoans = [...data]
        
        // Map debt plan names
        await this.mapDebtPlanNames()
        
        // Recalculate total debt
        this.calculateTotalDebt()
        
      } catch (error) {
        console.error('Error fetching loans:', error)
        this.loansError = 'Failed to load your loans. Please try again.'
      } finally {
        this.loansLoading = false
      }
    },

    async mapDebtPlanNames() {
      // Create a map of debt plan IDs to names
      const debtPlanMap = {}
      for (const plan of this.debtPlans) {
        debtPlanMap[plan.id] = plan.name
      }
      
      // Update loans with debt plan names using array spread for reactivity
      this.loans = this.loans.map(loan => ({
        ...loan,
        debt_plan_name: debtPlanMap[loan.debt_plan]
      }))
      this.filteredLoans = [...this.loans]
    },

    filterLoans() {
      if (!this.searchQuery.trim()) {
        this.filteredLoans = [...this.loans]
        return
      }

      const query = this.searchQuery.toLowerCase().trim()
      this.filteredLoans = this.loans.filter(loan => 
        loan.name.toLowerCase().includes(query) ||
        (loan.debt_plan_name && loan.debt_plan_name.toLowerCase().includes(query)) ||
        this.formatDate(loan.created_at).toLowerCase().includes(query)
      )
    },

    async calculateTotalDebt() {
      if (!this.activePlan || !this.loans.length) {
        this.totalDebt = 0
        return
      }

      try{
        const response = await api.get(`/PaymentSchedule/progress/?debt_plan=${this.activePlan.id}`)
        if (response.ok){
          const progressData = await response.json()
          this.totalDebt = parseFloat(progressData.total_debt_remaining || 0) 
        } else{
          this.totalDebt = this.loans
            .filter(loan => loan.debt_plan === this.activePlan.id)
            .reduce((total, loan) => total + parseFloat(loan.remaining_balance || loan.principal_balance), 0)
        }
      } catch(error){
        console.error('Error calculating total debt:', error)
        this.totalDebt = this.loans
          .filter(loan => loan.debt_plan === this.activePlan.id)
          .reduce((total, loan) => total + parseFloat(loan.remaining_balance || loan.principal_balance), 0)
      }
    },

    async viewLoan(loan) {
      try {
        const response = await api.get(`/Loan/get_loan/${loan.id}/`)
        
        if (response.status === 429) {
          this.handleThrottling()
          return
        }
        
        if (!response.ok) {
          throw new Error('Failed to fetch loan details')
        }
        
        const data = await response.json()
        this.selectedLoan = data
        this.showViewLoanModal = true
        
      } catch (error) {
        console.error('Error viewing loan:', error)
        this.showNotification('Failed to load loan details', 'error')
      }
    },

    editLoan(loan) {
      this.editingLoan = {
        id: loan.id,
        name: loan.name,
        minimum_payment: loan.minimum_payment,
        due_date: loan.due_date,
        manually_set_minimum_payment: loan.manually_set_minimum_payment
      }
      this.showEditLoanModal = true
    },

    async updateLoan() {
      this.loanUpdateLoading = true
      this.loanUpdateError = null
      
      try {
        const updateData = {
          name: this.editingLoan.name,
          due_date: parseInt(this.editingLoan.due_date),
          manually_set_minimum_payment: this.editingLoan.manually_set_minimum_payment
        }

        // Only include minimum_payment if manually set
        if (this.editingLoan.manually_set_minimum_payment) {
          updateData.minimum_payment = this.editingLoan.minimum_payment
        }

        const response = await api.patch(`/Loan/update/${this.editingLoan.id}/`, updateData)
        
        if (response.status === 429) {
          this.handleThrottling()
          return
        }
        
        if (!response.ok) {
          const data = await response.json()
          throw new Error(data.error || 'Failed to update loan')
        }
        
        // Refetch loans to ensure data consistency
        await this.fetchLoans()
        
        this.showEditLoanModal = false
        this.showNotification('Loan updated successfully!', 'success')
        
      } catch (error) {
        console.error('Error updating loan:', error)
        this.loanUpdateError = error.message || 'Failed to update loan'
      } finally {
        this.loanUpdateLoading = false
      }
    },

    confirmDeleteLoan(loan) {
      this.loanToDelete = loan
      this.showDeleteConfirmModal = true
    },

    handleHashNavigation(){
      if (this.$route.hash === '#debts') {
        this.$nextTick(() => {
          this.showMyDebts = true
        })
      }  
    },

    async deleteLoan() {
      this.loanDeleteLoading = true
      
      try {
        const response = await api.delete(`/Loan/delete/${this.loanToDelete.id}/`)
        
        if (response.status === 429) {
          this.handleThrottling()
          return
        }
        
        if (!response.ok) {
          throw new Error('Failed to delete loan')
        }

        // Refetch loans to ensure data consistency
        await this.fetchLoans()
        
        // Also refresh debt plans to update calculations
        await this.fetchDebtPlans()
        
        this.showDeleteConfirmModal = false
        this.loanToDelete = null
        this.showNotification('Loan deleted successfully!', 'success')
        
      } catch (error) {
        console.error('Error deleting loan:', error)
        this.showNotification('Failed to delete loan', 'error')
      } finally {
        this.loanDeleteLoading = false
      }
    },
  },
  mounted() {
    const authStore = useAuthStore()
    this.user = authStore.getUser
    this.initializeData()
    this.handleHashNavigation()
  },
  watch: {
    debtPlans: {
      handler() {
        this.calculateTotalDebt()
        if (this.loans.length > 0) {
          this.mapDebtPlanNames()
        }
      },
      deep: true
    },
    loans: {
      handler() {
        this.calculateTotalDebt()
      },
      deep: true
    },
    showMyDebts(val) {
      if (val) {
        this.fetchLoans()
      }
    },
    activePlan: {
      async handler() {
        await this.calculateTotalDebt()
      },
      deep: true
    },
    '$route.hash'(newHash){
      this.handleHashNavigation()
    }
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

.btn-large {
  padding: 1rem 2rem;
  font-size: 1.1rem;
}

.btn-danger {
  background: #ef4444;
  color: white;
}

.btn-danger:hover {
  background: #dc2626;
  box-shadow: 0 0 20px rgba(239, 68, 68, 0.4);
}

/* Main Content */
.dashboard-main {
  padding: 8rem 5% 4rem;
}

.container {
  max-width: 1400px;
  margin: 0 auto;
}

/* Loading State */
.loading-state {
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

.loading-state p {
  color: var(--gray);
  font-size: 1.1rem;
}

/* Error State */
.error-state {
  text-align: center;
  padding: 4rem 2rem;
  color: var(--light);
}

.error-state i {
  font-size: 3rem;
  color: #ff6b6b;
  margin-bottom: 1rem;
}

.error-state h3 {
  margin-bottom: 0.5rem;
}

.error-state p {
  color: var(--gray);
  margin-bottom: 2rem;
}

/* Empty Dashboard State */
.empty-dashboard {
  max-width: 800px;
  margin: 0 auto;
}

.welcome-section {
  text-align: center;
  margin-bottom: 3rem;
}

.welcome-section h1 {
  font-size: 2.5rem;
  margin-bottom: 0.5rem;
  background: linear-gradient(to right, var(--primary), var(--accent));
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}

.welcome-section p {
  color: var(--gray);
  font-size: 1.1rem;
}

.onboarding-card {
  background: var(--card-bg);
  border-radius: 20px;
  padding: 3rem;
  text-align: center;
  border: 1px solid rgba(0, 245, 255, 0.2);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
}

.onboarding-icon {
  font-size: 4rem;
  color: var(--primary);
  margin-bottom: 1.5rem;
}

.onboarding-card h2 {
  color: var(--light);
  margin-bottom: 1rem;
  font-size: 1.8rem;
}

.onboarding-card p {
  color: var(--gray);
  margin-bottom: 2rem;
  line-height: 1.6;
}

.info-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-top: 3rem;
}

.info-card {
  background: rgba(0, 245, 255, 0.05);
  border: 1px solid rgba(0, 245, 255, 0.2);
  border-radius: 15px;
  padding: 1.5rem;
  text-align: center;
  transition: all 0.3s ease;
}

.info-card:hover {
  transform: translateY(-5px);
  border-color: var(--primary);
}

.info-card i {
  font-size: 2rem;
  color: var(--primary);
  margin-bottom: 1rem;
}

.info-card h4 {
  color: var(--light);
  margin-bottom: 0.5rem;
}

.info-card p {
  color: var(--gray);
  font-size: 0.9rem;
  margin: 0;
}

/* Dashboard Content */
.dashboard-content .welcome-section.with-stats {
  text-align: left;
  margin-bottom: 3rem;
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

/* Dashboard Grid */
.dashboard-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 2rem;
}

.dashboard-card {
  background: var(--card-bg);
  border-radius: 20px;
  border: 1px solid rgba(0, 245, 255, 0.2);
  padding: 2rem;
  transition: all 0.3s ease;
}

.dashboard-card:hover {
  border-color: rgba(0, 245, 255, 0.3);
  transform: translateY(-2px);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
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

/* Strategy Card */
.strategy-display {
  margin-bottom: 1.5rem;
}

.strategy-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-weight: 600;
  margin-bottom: 1rem;
  font-size: 0.9rem;
}

.strategy-badge.snowball {
  background: rgba(0, 245, 255, 0.2);
  color: var(--primary);
  border: 1px solid rgba(0, 245, 255, 0.3);
}

.strategy-badge.avalanche {
  background: rgba(138, 43, 226, 0.2);
  color: var(--secondary);
  border: 1px solid rgba(138, 43, 226, 0.3);
}

.plan-name {
  color: var(--light);
  margin-bottom: 1rem;
  font-size: 1.5rem;
}

.strategy-description {
  color: var(--gray);
  line-height: 1.6;
  margin-bottom: 1.5rem;
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
  padding: 0.75rem 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.stat-item:last-child {
  border-bottom: none;
}

.stat-item .label {
  color: var(--gray);
}

.stat-item .value {
  color: var(--light);
  font-weight: 600;
  font-size: 1.1rem;
}

/* Actions Card */
.action-btn {
  display: flex;
  align-items: center;
  gap: 1rem;
  width: 100%;
  padding: 1.5rem;
  background: rgba(0, 245, 255, 0.05);
  border: 1px solid rgba(0, 245, 255, 0.2);
  border-radius: 12px;
  color: var(--light);
  cursor: pointer;
  transition: all 0.3s ease;
  margin-bottom: 1rem;
  text-align: left;
}

.action-btn:hover {
  background: rgba(0, 245, 255, 0.1);
  transform: translateX(5px);
  border-color: var(--primary);
}

.action-btn:last-child {
  margin-bottom: 0;
}

.action-icon {
  width: 50px;
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 245, 255, 0.1);
  border-radius: 10px;
}

.action-icon i {
  color: var(--primary);
  font-size: 1.5rem;
}

.action-text {
  flex: 1;
}

.action-title {
  display: block;
  font-weight: 600;
  margin-bottom: 0.25rem;
}

.action-desc {
  display: block;
  color: var(--gray);
  font-size: 0.9rem;
}

/* Plans Card */
.plans-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.plan-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.5rem;
  background: rgba(0, 245, 255, 0.05);
  border: 1px solid rgba(0, 245, 255, 0.2);
  border-radius: 12px;
  transition: all 0.3s ease;
  cursor: pointer;
}

.plan-item:hover {
  background: rgba(0, 245, 255, 0.1);
  transform: translateX(5px);
  border-color: rgba(0, 245, 255, 0.3);
}

.plan-item.active {
  border-color: var(--primary);
  background: rgba(0, 245, 255, 0.1);
}

.plan-main {
  display: flex;
  align-items: center;
  gap: 2rem;
  flex: 1;
}

.plan-info {
  flex: 1;
}

.plan-info h3 {
  color: var(--light);
  margin-bottom: 0.5rem;
  font-size: 1.2rem;
}

.plan-meta {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.plan-strategy {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.25rem 0.75rem;
  border-radius: 15px;
  font-size: 0.8rem;
  font-weight: 500;
}

.plan-strategy.snowball {
  background: rgba(0, 245, 255, 0.1);
  color: var(--primary);
  border: 1px solid rgba(0, 245, 255, 0.3);
}

.plan-strategy.avalanche {
  background: rgba(138, 43, 226, 0.1);
  color: var(--secondary);
  border: 1px solid rgba(138, 43, 226, 0.3);
}

.active-badge {
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

.plan-details {
  display: flex;
  gap: 2rem;
}

.detail {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.detail-label {
  color: var(--gray);
  font-size: 0.8rem;
  margin-bottom: 0.25rem;
}

.detail-value {
  color: var(--light);
  font-weight: 600;
  font-size: 0.9rem;
}

.plan-actions {
  display: flex;
  gap: 0.5rem;
}

.btn-icon {
  width: 40px;
  height: 40px;
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
  transform: scale(1.1);
}

.btn-icon.btn-danger {
  color: #ef4444;
  border-color: rgba(239, 68, 68, 0.3);
}

.btn-icon.btn-danger:hover {
  background: #ef4444;
  color: white;
}

/* Modal Styles */
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
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 25px 50px rgba(0, 0, 0, 0.5);
}

.large-modal {
  max-width: 900px;
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

.modal-content form {
  padding: 1rem 2rem 2rem;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  color: var(--light);
  margin-bottom: 0.5rem;
  font-weight: 500;
}

.form-group input,
.form-group select {
  width: 100%;
  padding: 0.75rem 1rem;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 10px;
  color: var(--light);
  font-size: 1rem;
  transition: all 0.3s ease;
}

.form-group input:focus,
.form-group select:focus {
  outline: none;
  border-color: var(--primary);
  box-shadow: 0 0 0 2px rgba(0, 245, 255, 0.2);
}

/* Fix for white dropdown background */
.form-group select {
  background: rgba(255, 255, 255, 0.05) !important;
  color: var(--light) !important;
}

.form-group select option {
  background: var(--card-bg);
  color: var(--light);
}

.input-with-symbol {
  position: relative;
}

.input-symbol {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  color: var(--gray);
  font-weight: 600;
}

.input-with-symbol input {
  padding-left: 2.5rem;
}

.input-with-symbol .input-symbol:first-child {
  left: 1rem;
}

.input-with-symbol .input-symbol:last-child {
  right: 1rem;
}

.checkbox-label {
  display: flex;
  align-items: center;
  cursor: pointer;
  font-weight: normal;
}

.checkbox-label input {
  display: none;
}

.checkmark {
  width: 20px;
  height: 20px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 4px;
  margin-right: 0.75rem;
  position: relative;
  transition: all 0.3s ease;
}

.checkbox-label input:checked + .checkmark {
  background: var(--primary);
  border-color: var(--primary);
}

.checkbox-label input:checked + .checkmark::after {
  content: '';
  position: absolute;
  left: 6px;
  top: 2px;
  width: 6px;
  height: 10px;
  border: solid var(--dark);
  border-width: 0 2px 2px 0;
  transform: rotate(45deg);
}

.strategy-options {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.strategy-option {
  display: block;
  cursor: pointer;
}

.strategy-option input {
  display: none;
}

.option-content {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem 1.5rem;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 10px;
  transition: all 0.3s ease;
}

.strategy-option.selected .option-content {
  border-color: var(--primary);
  background: rgba(0, 245, 255, 0.1);
}

.option-content i {
  font-size: 1.5rem;
  color: var(--primary);
}

.option-text {
  display: flex;
  flex-direction: column;
}

.option-text strong {
  color: var(--light);
  margin-bottom: 0.25rem;
}

.option-text span {
  color: var(--gray);
  font-size: 0.9rem;
}

.alert {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem;
  border-radius: 10px;
  margin-bottom: 1.5rem;
  font-size: 0.9rem;
}

.alert-error {
  background: rgba(239, 68, 68, 0.1);
  color: #ef4444;
  border: 1px solid rgba(239, 68, 68, 0.3);
}

.alert-notification {
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

.alert-notification.alert-error {
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.3);
  color: #fca5a5;
}

.alert-notification.alert-success {
  background: rgba(34, 197, 94, 0.1);
  border: 1px solid rgba(34, 197, 94, 0.3);
  color: #86efac;
}

.alert i {
  font-size: 1.2rem;
}

.modal-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  margin-top: 2rem;
}

/* Search Section */
.search-section {
  display: flex;
  gap: 1rem;
  padding: 1.5rem 2rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.search-bar {
  position: relative;
  flex: 1;
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

/* Loans Grid */
.loans-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 1.5rem;
  padding: 1.5rem 2rem;
  max-height: 60vh;
  overflow-y: auto;
}

.loan-card {
  background: rgba(0, 245, 255, 0.05);
  border: 1px solid rgba(0, 245, 255, 0.2);
  border-radius: 12px;
  padding: 1.5rem;
  transition: all 0.3s ease;
}

.loan-card:hover {
  border-color: var(--primary);
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(0, 245, 255, 0.2);
}

.loan-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
}

.loan-header h3 {
  color: var(--light);
  margin: 0;
  font-size: 1.2rem;
}

.loan-actions {
  display: flex;
  gap: 0.5rem;
}

.loan-details {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.detail-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.25rem 0;
}

.detail-row .label {
  color: var(--gray);
  font-size: 0.9rem;
}

.detail-row .value {
  color: var(--light);
  font-weight: 500;
  font-size: 0.9rem;
}

/* Empty State */
.empty-state {
  text-align: center;
  padding: 3rem 2rem;
  color: var(--light);
}

.empty-state i {
  font-size: 3rem;
  color: var(--primary);
  margin-bottom: 1rem;
}

.empty-state h3 {
  margin-bottom: 0.5rem;
}

.empty-state p {
  color: var(--gray);
  margin-bottom: 2rem;
}

/* Loan Details Full */
.loan-details-full {
  padding: 0 2rem;
}

.detail-section {
  margin-bottom: 2rem;
}

.detail-section h3 {
  color: var(--light);
  margin-bottom: 1rem;
  font-size: 1.1rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  padding-bottom: 0.5rem;
}

.detail-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
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
}

.detail-item .value {
  color: var(--light);
  font-weight: 500;
}

/* Delete Confirmation */
.delete-confirmation {
  text-align: center;
  padding: 2rem;
}

.delete-confirmation i {
  font-size: 3rem;
  color: #ef4444;
  margin-bottom: 1rem;
}

.delete-confirmation h3 {
  color: var(--light);
  margin-bottom: 1rem;
}

.delete-confirmation p {
  color: var(--gray);
  margin-bottom: 2rem;
  line-height: 1.5;
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
@media (max-width: 1024px) {
  .dashboard-grid {
    grid-template-columns: 1fr;
  }
  
  .plan-main {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
  
  .plan-details {
    width: 100%;
    justify-content: space-between;
  }
}

@media (max-width: 768px) {
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
  
  .dashboard-main {
    padding: 7rem 5% 2rem;
  }
  
  .welcome-section h1 {
    font-size: 2rem;
  }
  
  .quick-stats {
    grid-template-columns: 1fr;
  }
  
  .plan-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
  
  .plan-actions {
    width: 100%;
    justify-content: flex-end;
  }
  
  .modal-overlay {
    padding: 1rem;
  }
  
  .modal-content {
    margin: 0;
  }
  
  .modal-header,
  .modal-content form {
    padding: 1.5rem;
  }
  
  .search-section {
    flex-direction: column;
  }
  
  .loans-grid {
    grid-template-columns: 1fr;
    padding: 1rem;
  }
  
  .loan-header {
    flex-direction: column;
    gap: 1rem;
  }
  
  .loan-actions {
    align-self: flex-end;
  }
  
  .detail-grid {
    grid-template-columns: 1fr;
  }
  
  .throttle-notification {
    top: 80px;
    right: 10px;
    left: 10px;
  }
  
  .notification-content {
    padding: 0.75rem 1rem;
  }
}
</style>