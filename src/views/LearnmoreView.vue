<template>
  <div class="learn-more">
    <!-- Background Animation -->
    <div class="bg-animation"></div>
    
    <!-- Header -->
    <header>
      <router-link to="/" class="logo">
        anchor<span>less</span>
      </router-link>
      <nav>
        <ul>
          <li><router-link to="/">Home</router-link></li>
          <li><a href="#snowball" @click="scrollToSection('snowball')">Snowball</a></li>
          <li><a href="#avalanche" @click="scrollToSection('avalanche')">Avalanche</a></li>
          <li><a href="#comparison" @click="scrollToSection('comparison')">Compare</a></li>
        </ul>
      </nav>
      <div class="auth-buttons">
        <button class="btn btn-outline" @click="$router.push('/login')">Log In</button>
        <button class="btn btn-primary" @click="$router.push('/signup')">Sign Up</button>
      </div>
    </header>

    <!-- Hero Section -->
    <section class="hero">
      <h1>Understanding Debt Payoff Strategies</h1>
      <p>Choose the right method to become debt-free faster</p>
    </section>

    <!-- Snowball Method -->
    <section id="snowball" class="method-section">
      <div class="method-content">
        <div class="method-text">
          <div class="method-badge">Psychological Wins</div>
          <h2>❄️ The Snowball Method</h2>
          <p class="method-description">
            Pay off your <strong>smallest debts first</strong>, regardless of interest rate. 
            As each debt is eliminated, you roll that payment into the next smallest debt, 
            creating a "snowball" effect of momentum and motivation.
          </p>
          
          <h3>How It Works:</h3>
          <ol class="steps-list">
            <li>List all debts from smallest to largest balance</li>
            <li>Make minimum payments on all debts</li>
            <li>Put extra money toward the smallest debt</li>
            <li>When paid off, roll that payment to the next smallest</li>
            <li>Repeat until debt-free!</li>
          </ol>

          <div class="pros-cons">
            <div class="pros">
              <h4>✅ Advantages</h4>
              <ul>
                <li>Quick wins boost motivation</li>
                <li>Simpler to understand and follow</li>
                <li>Reduces number of bills faster</li>
                <li>Behavioral psychology advantage</li>
              </ul>
            </div>
            <div class="cons">
              <h4>⚠️ Considerations</h4>
              <ul>
                <li>May pay more interest overall</li>
                <li>Takes longer mathematically</li>
                <li>High-interest debts wait longer</li>
              </ul>
            </div>
          </div>
        </div>

        <div class="method-example">
          <div class="example-card">
            <h3>Real Example</h3>
            <div class="debt-list">
              <div class="debt-item" :class="{ 'paid-off': snowballStep >= 1 }">
                <div class="debt-header">
                  <span class="debt-name">💳 Store Card</span>
                  <span class="debt-amount">$500</span>
                </div>
                <div class="debt-details">
                  <span>18% APR</span>
                  <span class="payoff-order">Pay First ⭐</span>
                </div>
              </div>

              <div class="debt-item" :class="{ 'paid-off': snowballStep >= 2 }">
                <div class="debt-header">
                  <span class="debt-name">💳 Credit Card</span>
                  <span class="debt-amount">$2,000</span>
                </div>
                <div class="debt-details">
                  <span>22% APR</span>
                  <span class="payoff-order">Pay Second</span>
                </div>
              </div>

              <div class="debt-item" :class="{ 'paid-off': snowballStep >= 3 }">
                <div class="debt-header">
                  <span class="debt-name">🚗 Car Loan</span>
                  <span class="debt-amount">$8,000</span>
                </div>
                <div class="debt-details">
                  <span>6% APR</span>
                  <span class="payoff-order">Pay Third</span>
                </div>
              </div>

              <div class="debt-item" :class="{ 'paid-off': snowballStep >= 4 }">
                <div class="debt-header">
                  <span class="debt-name">🎓 Student Loan</span>
                  <span class="debt-amount">$15,000</span>
                </div>
                <div class="debt-details">
                  <span>4.5% APR</span>
                  <span class="payoff-order">Pay Last</span>
                </div>
              </div>
            </div>

            <div class="example-controls">
              <button @click="snowballStep = Math.max(0, snowballStep - 1)" class="btn btn-outline btn-small">
                Previous
              </button>
              <span class="step-counter">Step {{ snowballStep }} / 4</span>
              <button @click="snowballStep = Math.min(4, snowballStep + 1)" class="btn btn-primary btn-small">
                Next
              </button>
            </div>

            <div class="example-summary">
              <div class="summary-stat">
                <span class="stat-label">Total Debt</span>
                <span class="stat-value">$25,500</span>
              </div>
              <div class="summary-stat">
                <span class="stat-label">Monthly Payment</span>
                <span class="stat-value">$1,000</span>
              </div>
              <div class="summary-stat">
                <span class="stat-label">Time to Freedom</span>
                <span class="stat-value">~30 months</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Avalanche Method -->
    <section id="avalanche" class="method-section alternate">
      <div class="method-content">
        <div class="method-text">
          <div class="method-badge math">Mathematical Optimal</div>
          <h2>⛰️ The Avalanche Method</h2>
          <p class="method-description">
            Pay off debts with the <strong>highest interest rates first</strong>. 
            This mathematically optimal approach minimizes the total interest you pay, 
            saving you the most money over time.
          </p>
          
          <h3>How It Works:</h3>
          <ol class="steps-list">
            <li>List all debts from highest to lowest interest rate</li>
            <li>Make minimum payments on all debts</li>
            <li>Put extra money toward the highest interest debt</li>
            <li>When paid off, roll that payment to the next highest rate</li>
            <li>Repeat until debt-free!</li>
          </ol>

          <div class="pros-cons">
            <div class="pros">
              <h4>✅ Advantages</h4>
              <ul>
                <li>Saves the most money on interest</li>
                <li>Faster payoff mathematically</li>
                <li>Most cost-effective approach</li>
                <li>Stops high-interest debt growth</li>
              </ul>
            </div>
            <div class="cons">
              <h4>⚠️ Considerations</h4>
              <ul>
                <li>First win may take longer</li>
                <li>Requires more discipline</li>
                <li>Less immediate satisfaction</li>
              </ul>
            </div>
          </div>
        </div>

        <div class="method-example">
          <div class="example-card">
            <h3>Real Example</h3>
            <div class="debt-list">
              <div class="debt-item" :class="{ 'paid-off': avalancheStep >= 1 }">
                <div class="debt-header">
                  <span class="debt-name">💳 Credit Card</span>
                  <span class="debt-amount">$2,000</span>
                </div>
                <div class="debt-details">
                  <span>22% APR</span>
                  <span class="payoff-order">Pay First ⭐</span>
                </div>
              </div>

              <div class="debt-item" :class="{ 'paid-off': avalancheStep >= 2 }">
                <div class="debt-header">
                  <span class="debt-name">💳 Store Card</span>
                  <span class="debt-amount">$500</span>
                </div>
                <div class="debt-details">
                  <span>18% APR</span>
                  <span class="payoff-order">Pay Second</span>
                </div>
              </div>

              <div class="debt-item" :class="{ 'paid-off': avalancheStep >= 3 }">
                <div class="debt-header">
                  <span class="debt-name">🚗 Car Loan</span>
                  <span class="debt-amount">$8,000</span>
                </div>
                <div class="debt-details">
                  <span>6% APR</span>
                  <span class="payoff-order">Pay Third</span>
                </div>
              </div>

              <div class="debt-item" :class="{ 'paid-off': avalancheStep >= 4 }">
                <div class="debt-header">
                  <span class="debt-name">🎓 Student Loan</span>
                  <span class="debt-amount">$15,000</span>
                </div>
                <div class="debt-details">
                  <span>4.5% APR</span>
                  <span class="payoff-order">Pay Last</span>
                </div>
              </div>
            </div>

            <div class="example-controls">
              <button @click="avalancheStep = Math.max(0, avalancheStep - 1)" class="btn btn-outline btn-small">
                Previous
              </button>
              <span class="step-counter">Step {{ avalancheStep }} / 4</span>
              <button @click="avalancheStep = Math.min(4, avalancheStep + 1)" class="btn btn-primary btn-small">
                Next
              </button>
            </div>

            <div class="example-summary highlight">
              <div class="summary-stat">
                <span class="stat-label">Total Debt</span>
                <span class="stat-value">$25,500</span>
              </div>
              <div class="summary-stat">
                <span class="stat-label">Monthly Payment</span>
                <span class="stat-value">$1,000</span>
              </div>
              <div class="summary-stat success">
                <span class="stat-label">Time to Freedom</span>
                <span class="stat-value">~28 months</span>
              </div>
              <div class="savings-badge">
                💰 Saves ~$800 in interest
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Comparison Section -->
    <section id="comparison" class="comparison-section">
      <div class="section-title">
        <h2>Side-by-Side Comparison</h2>
        <p>Which method is right for you?</p>
      </div>

      <div class="comparison-grid">
        <div class="comparison-card">
          <h3>❄️ Snowball</h3>
          <div class="comparison-stats">
            <div class="stat">
              <span class="stat-icon">⏱️</span>
              <span class="stat-text">~30 months</span>
            </div>
            <div class="stat">
              <span class="stat-icon">💰</span>
              <span class="stat-text">$3,200 interest</span>
            </div>
            <div class="stat">
              <span class="stat-icon">🎯</span>
              <span class="stat-text">Quick wins</span>
            </div>
          </div>
          <p>Best for: Those who need motivation and quick victories</p>
        </div>

        <div class="comparison-card highlight">
          <h3>⛰️ Avalanche</h3>
          <div class="comparison-stats">
            <div class="stat">
              <span class="stat-icon">⏱️</span>
              <span class="stat-text">~28 months</span>
            </div>
            <div class="stat">
              <span class="stat-icon">💰</span>
              <span class="stat-text">$2,400 interest</span>
            </div>
            <div class="stat">
              <span class="stat-icon">📊</span>
              <span class="stat-text">Max savings</span>
            </div>
          </div>
          <p>Best for: Those focused on mathematical efficiency</p>
        </div>
      </div>

      <div class="decision-helper">
        <h3>Still Not Sure? Answer These Questions:</h3>
        <div class="questions">
          <div class="question-card">
            <p class="question">Do you need quick wins to stay motivated?</p>
            <div class="answer-options">
              <span class="answer-yes">Yes → Snowball ❄️</span>
              <span class="answer-no">No → Avalanche ⛰️</span>
            </div>
          </div>

          <div class="question-card">
            <p class="question">Do you have high-interest credit cards?</p>
            <div class="answer-options">
              <span class="answer-yes">Yes → Avalanche ⛰️</span>
              <span class="answer-no">No → Either works!</span>
            </div>
          </div>

          <div class="question-card">
            <p class="question">Want to save the most money possible?</p>
            <div class="answer-options">
              <span class="answer-yes">Yes → Avalanche ⛰️</span>
              <span class="answer-no">Motivation matters more → Snowball ❄️</span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA Section -->
    <section class="cta">
      <h2>Ready to Choose Your Strategy?</h2>
      <p>Sign up now and let Anchorless calculate your personalized debt freedom plan</p>
      <button class="btn btn-primary btn-large" @click="$router.push('/signup')">Get Started Free</button>
    </section>

    <!-- Footer -->
    <footer>
      <div class="footer-content">
        <div class="footer-column">
          <h3>Anchorless</h3>
          <p>Smart debt management for a financially free future.</p>
        </div>
        <div class="footer-column">
          <h3>Learn</h3>
          <ul>
            <li><a href="#snowball" @click="scrollToSection('snowball')">Snowball Method</a></li>
            <li><a href="#avalanche" @click="scrollToSection('avalanche')">Avalanche Method</a></li>
            <li><a href="#comparison" @click="scrollToSection('comparison')">Comparison</a></li>
          </ul>
        </div>
        <div class="footer-column">
          <h3>Company</h3>
          <ul>
            <li><router-link to="/">Home</router-link></li>
            <li><a href="#">About Us</a></li>
            <li><a href="#">Contact</a></li>
          </ul>
        </div>
      </div>
      <div class="copyright">
        <p>&copy; 2025 Anchorless. All rights reserved.</p>
      </div>
    </footer>
  </div>
</template>

<script>
export default {
  name: 'LearnMoreView',
  data() {
    return {
      snowballStep: 0,
      avalancheStep: 0
    }
  },
  methods: {
    scrollToSection(sectionId) {
      const element = document.getElementById(sectionId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  }
}
</script>

<style scoped>
/* Copy all base styles from HomeView */
.learn-more {
  background-color: var(--darker);
  color: var(--light);
  overflow-x: hidden;
  line-height: 1.6;
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

/* Header - Same as HomeView */
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
}

nav ul li {
  margin-left: 2rem;
}

nav ul li a {
  color: var(--light);
  text-decoration: none;
  font-weight: 500;
  transition: all 0.3s ease;
  cursor: pointer;
}

nav ul li a:hover {
  color: var(--primary);
}

.auth-buttons {
  display: flex;
  gap: 1rem;
}

.btn {
  padding: 0.7rem 1.5rem;
  border-radius: 30px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  border: none;
  font-size: 0.9rem;
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

.btn-small {
  padding: 0.5rem 1rem;
  font-size: 0.85rem;
}

.btn-large {
  padding: 1rem 2.5rem;
  font-size: 1.1rem;
}

/* Hero */
.hero {
  padding: 10rem 5% 5rem;
  text-align: center;
  max-width: 1200px;
  margin: 0 auto;
}

.hero h1 {
  font-size: 3rem;
  margin-bottom: 1rem;
  background: linear-gradient(to right, var(--primary), var(--accent));
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}

.hero p {
  font-size: 1.2rem;
  color: var(--gray);
}

/* Method Sections */
.method-section {
  padding: 5rem 5%;
}

.method-section.alternate {
  background: rgba(5, 5, 16, 0.5);
}

.method-content {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 4rem;
  max-width: 1400px;
  margin: 0 auto;
  align-items: start;
}

.method-badge {
  display: inline-block;
  background: rgba(0, 245, 255, 0.2);
  color: var(--primary);
  padding: 0.5rem 1.5rem;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 600;
  margin-bottom: 1.5rem;
  border: 1px solid var(--primary);
}

.method-badge.math {
  background: rgba(138, 43, 226, 0.2);
  color: var(--secondary);
  border-color: var(--secondary);
}

.method-text h2 {
  font-size: 2.5rem;
  margin-bottom: 1.5rem;
  color: var(--light);
}

.method-description {
  font-size: 1.1rem;
  color: var(--gray);
  margin-bottom: 2rem;
  line-height: 1.8;
}

.method-text h3 {
  font-size: 1.5rem;
  margin: 2rem 0 1rem;
  color: var(--light);
}

.steps-list {
  padding-left: 1.5rem;
  margin-bottom: 2rem;
}

.steps-list li {
  margin-bottom: 1rem;
  color: var(--gray);
  font-size: 1.05rem;
}

.pros-cons {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
  margin-top: 2rem;
}

.pros, .cons {
  background: var(--card-bg);
  padding: 1.5rem;
  border-radius: 10px;
  border: 1px solid rgba(0, 245, 255, 0.1);
}

.pros h4 {
  color: #4ade80;
  margin-bottom: 1rem;
  font-size: 1.1rem;
}

.cons h4 {
  color: #fbbf24;
  margin-bottom: 1rem;
  font-size: 1.1rem;
}

.pros ul, .cons ul {
  list-style: none;
  padding: 0;
}

.pros ul li, .cons ul li {
  padding: 0.5rem 0;
  color: var(--gray);
  font-size: 0.95rem;
}

/* Example Card */
.example-card {
  background: var(--card-bg);
  border-radius: 15px;
  padding: 2rem;
  border: 1px solid rgba(0, 245, 255, 0.2);
  position: sticky;
  top: 100px;
}

.example-card h3 {
  margin-bottom: 1.5rem;
  color: var(--light);
  font-size: 1.3rem;
}

.debt-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.debt-item {
  background: rgba(16, 16, 32, 0.5);
  padding: 1rem;
  border-radius: 10px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  transition: all 0.3s ease;
}

.debt-item.paid-off {
  opacity: 0.5;
  border-color: #4ade80;
  background: rgba(74, 222, 128, 0.1);
}

.debt-item.paid-off::after {
  content: '✓ PAID OFF';
  display: block;
  color: #4ade80;
  font-weight: 700;
  font-size: 0.85rem;
  margin-top: 0.5rem;
  text-align: center;
}

.debt-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5rem;
}

.debt-name {
  font-weight: 600;
  color: var(--light);
}

.debt-amount {
  font-weight: 700;
  color: var(--primary);
}

.debt-details {
  display: flex;
  justify-content: space-between;
  font-size: 0.9rem;
  color: var(--gray);
}

.payoff-order {
  color: var(--primary);
  font-weight: 600;
}

.example-controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 0;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  margin-bottom: 1.5rem;
}

.step-counter {
  color: var(--gray);
  font-weight: 600;
}

.example-summary {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
  position: relative;
}

.example-summary.highlight {
  grid-template-columns: repeat(3, 1fr);
  grid-template-rows: auto auto;
}

.summary-stat {
  text-align: center;
  padding: 1rem;
  background: rgba(16, 16, 32, 0.5);
  border-radius: 8px;
}

.summary-stat.success {
  border: 1px solid #4ade80;
  background: rgba(74, 222, 128, 0.1);
}

.stat-label {
  display: block;
  font-size: 0.85rem;
  color: var(--gray);
  margin-bottom: 0.5rem;
}

.stat-value {
  display: block;
  font-size: 1.2rem;
  font-weight: 700;
  color: var(--light);
}

.savings-badge {
  grid-column: 1 / -1;
  text-align: center;
  padding: 1rem;
  background: rgba(74, 222, 128, 0.2);
  color: #4ade80;
  font-weight: 700;
  border-radius: 8px;
  margin-top: 0.5rem;
}

/* Comparison Section */
.comparison-section {
  padding: 5rem 5%;
  background: rgba(5, 5, 16, 0.5);
}

.section-title {
  text-align: center;
  margin-bottom: 4rem;
}

.section-title h2 {
  font-size: 2.5rem;
  margin-bottom: 1rem;
  color: var(--light);
}

.section-title p {
  color: var(--gray);
}

.comparison-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 2rem;
  max-width: 1000px;
  margin: 0 auto 4rem;
}

.comparison-card {
  background: var(--card-bg);
  padding: 2rem;
  border-radius: 15px;
  border: 1px solid rgba(0, 245, 255, 0.1);
  transition: all 0.3s ease;
}

.comparison-card.highlight {
  border-color: var(--primary);
  box-shadow: 0 0 20px rgba(0, 245, 255, 0.2);
}

.comparison-card h3 {
  font-size: 1.8rem;
  margin-bottom: 1.5rem;
  color: var(--light);
}

.comparison-stats {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.stat {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.stat-icon {
  font-size: 1.5rem;
}

.stat-text {
  font-weight: 600;
  color: var(--light);
}

.comparison-card p {
  color: var(--gray);
  font-style: italic;
}

.decision-helper {
  max-width: 900px;
  margin: 0 auto;
}

.decision-helper h3 {
  text-align: center;
  font-size: 1.8rem;
  margin-bottom: 2rem;
  color: var(--light);
}

.questions {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.question-card {
  background: var(--card-bg);
  padding: 1.5rem;
  border-radius: 10px;
  border: 1px solid rgba(0, 245, 255, 0.1);
}

.question {
  font-size: 1.1rem;
  color: var(--light);
  margin-bottom: 1rem;
  font-weight: 600;
}

.answer-options {
  display: flex;
  gap: 2rem;
  flex-wrap: wrap;
}

.answer-yes, .answer-no {
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-weight: 600;
  transition: all 0.3s ease;
}

.answer-yes {
  background: rgba(0, 245, 255, 0.1);
  color: var(--primary);
  border: 1px solid var(--primary);
}

.answer-no {
  background: rgba(138, 43, 226, 0.1);
  color: var(--secondary);
  border: 1px solid var(--secondary);
}

/* CTA */
.cta {
  padding: 6rem 5%;
  text-align: center;
  background: linear-gradient(135deg, rgba(0, 245, 255, 0.1) 0%, rgba(138, 43, 226, 0.1) 100%);
}

.cta h2 {
  font-size: 2.5rem;
  margin-bottom: 1.5rem;
  color: var(--light);
}

.cta p {
  max-width: 600px;
  margin: 0 auto 2.5rem;
  color: var(--gray);
}

/* Footer */
footer {
  padding: 4rem 5% 2rem;
  background: var(--dark);
  border-top: 1px solid rgba(0, 245, 255, 0.2);
}

.footer-content {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 2rem;
  max-width: 1200px;
  margin: 0 auto 3rem;
}

.footer-column h3 {
  font-size: 1.2rem;
  margin-bottom: 1.5rem;
  color: var(--light);
  position: relative;
  padding-bottom: 0.5rem;
}

.footer-column h3::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  width: 40px;
  height: 2px;
  background: var(--primary);
}

.footer-column ul {
  list-style: none;
}

.footer-column ul li {
  margin-bottom: 0.8rem;
}

.footer-column ul li a {
  color: var(--gray);
  text-decoration: none;
  transition: all 0.3s ease;
  cursor: pointer;
}

.footer-column ul li a:hover {
  color: var(--primary);
  padding-left: 5px;
}

.copyright {
  text-align: center;
  padding-top: 2rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  color: var(--gray);
}

/* Responsive Design */
@media (max-width: 1024px) {
  .method-content {
    grid-template-columns: 1fr;
    gap: 3rem;
  }

  .example-card {
    position: static;
  }

  .pros-cons {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  header {
    flex-direction: column;
    padding: 1rem 5%;
  }
  
  nav ul {
    margin: 1rem 0;
    flex-wrap: wrap;
    justify-content: center;
  }
  
  nav ul li {
    margin: 0.5rem;
  }

  .hero h1 {
    font-size: 2rem;
  }

  .method-text h2 {
    font-size: 2rem;
  }

  .comparison-grid {
    grid-template-columns: 1fr;
  }

  .example-summary {
    grid-template-columns: 1fr;
  }

  .answer-options {
    flex-direction: column;
    gap: 1rem;
  }
}
</style>