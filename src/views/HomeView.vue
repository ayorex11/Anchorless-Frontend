<template>
  <div class="home">
    <!-- Background Animation -->
    <div class="bg-animation"></div>
    
    <!-- Header -->
    <header>
      <router-link to="/" class="logo">
        anchor<span>less</span>
      </router-link>
      <nav>
        <ul>
          <li><a href="#features" @click="scrollToSection('features')">Features</a></li>
          <li><a href="#how-it-works" @click="scrollToSection('how-it-works')">How It Works</a></li>
        </ul>
      </nav>
      <div class="auth-buttons">
        <button class="btn btn-outline" @click="$router.push('/login')">Log In</button>
        <button class="btn btn-primary" @click="$router.push('/signup')">Sign Up</button>
      </div>
    </header>

    <!-- Hero Section -->
    <section class="hero">
      <h1>Take Control of Your Debt with Smart Strategies</h1>
      <p>Anchorless uses advanced algorithms to create personalized debt payoff plans using snowball or avalanche methods. Get out of debt faster and save money.</p>
      <div class="hero-buttons">
        <button class="btn btn-primary btn-large" @click="$router.push('/signup')">Start Free Trial</button>
        <button class="btn btn-outline btn-large" @click="scrollToSection('features')">Learn More</button>
      </div>
    </section>

    <!-- Features Section -->
    <section id="features" class="features">
      <div class="section-title">
        <h2>Powerful Debt Management Tools</h2>
        <p>Everything you need to conquer your debt and achieve financial freedom</p>
      </div>
      <div class="features-grid">
        <div class="feature-card">
          <div class="feature-icon">
            <i class="fas fa-chart-line"></i>
          </div>
          <h3>Smart Strategy Selection</h3>
          <p>Choose between debt snowball or avalanche methods based on your psychological and financial preferences.</p>
        </div>
        <div class="feature-card">
          <div class="feature-icon">
            <i class="fas fa-calculator"></i>
          </div>
          <h3>Automated Calculations</h3>
          <p>Our system automatically calculates your optimal payment schedule and tracks your progress in real-time.</p>
        </div>
        <div class="feature-card">
          <div class="feature-icon">
            <i class="fas fa-bell"></i>
          </div>
          <h3>Payment Reminders</h3>
          <p>Never miss a payment with smart notifications and progress tracking to keep you motivated.</p>
        </div>
      </div>
    </section>

    <!-- How It Works Section -->
    <section id="how-it-works" class="how-it-works">
      <div class="section-title">
        <h2>How Anchorless Works</h2>
        <p>Get started in just four simple steps</p>
      </div>
      <div class="steps">
        <div class="step">
          <div class="step-number">1</div>
          <h3>Sign Up</h3>
          <p>Create your free account in less than 2 minutes</p>
        </div>
        <div class="step">
          <div class="step-number">2</div>
          <h3>Add Your Debts</h3>
          <p>Input all your loans, credit cards, and other debts</p>
        </div>
        <div class="step">
          <div class="step-number">3</div>
          <h3>Choose Strategy</h3>
          <p>Select snowball or avalanche method for payoff</p>
        </div>
        <div class="step">
          <div class="step-number">4</div>
          <h3>Track Progress</h3>
          <p>Follow your custom plan and watch your debt disappear</p>
        </div>
      </div>
    </section>

    <!-- CTA Section -->
    <section class="cta">
      <h2>Ready to Become Debt-Free?</h2>
      <p>Join thousands of users who have already saved millions using Anchorless</p>
      <button class="btn btn-primary btn-large" @click="$router.push('/signup')">Start Your Journey Today</button>
    </section>

    <!-- Footer -->
    <footer>
      <div class="footer-content">
        <div class="footer-column">
          <h3>Anchorless</h3>
          <p>Smart debt management for a financially free future.</p>
        </div>
        <div class="footer-column">
          <h3>Product</h3>
          <ul>
            <li><a href="#features" @click="scrollToSection('features')">Features</a></li>
            <li><a href="#how-it-works" @click="scrollToSection('how-it-works')">How It Works</a></li>
          </ul>
        </div>
        <div class="footer-column">
          <h3>Company</h3>
          <ul>
            <li><a href="#">About Us</a></li>
            <li><a href="#">Contact</a></li>
            <li><a href="#">Privacy Policy</a></li>
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
  name: 'HomeView',
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
.home {
  background-color: var(--darker);
  color: var(--light);
  overflow-x: hidden;
  line-height: 1.6;
}

/* Background Animation */
.bg-animation {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: -1;
  background: linear-gradient(125deg, var(--darker) 0%, var(--dark) 100%);
  overflow: hidden;
}

.bg-animation::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: radial-gradient(circle at 20% 50%, rgba(0, 245, 255, 0.1) 0%, transparent 50%),
              radial-gradient(circle at 80% 20%, rgba(138, 43, 226, 0.1) 0%, transparent 50%),
              radial-gradient(circle at 40% 80%, rgba(255, 0, 255, 0.05) 0%, transparent 50%);
  animation: pulse 15s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 0.5; }
  50% { opacity: 0.8; }
}

/* Header & Navigation */
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
  position: relative;
  cursor: pointer;
}

nav ul li a:hover {
  color: var(--primary);
}

nav ul li a::after {
  content: '';
  position: absolute;
  bottom: -5px;
  left: 0;
  width: 0;
  height: 2px;
  background: var(--primary);
  transition: width 0.3s ease;
}

nav ul li a:hover::after {
  width: 100%;
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

/* Hero Section */
.hero {
  padding: 12rem 5% 8rem;
  text-align: center;
  max-width: 1200px;
  margin: 0 auto;
}

.hero h1 {
  font-size: 3.5rem;
  margin-bottom: 1.5rem;
  line-height: 1.2;
  background: linear-gradient(to right, var(--primary), var(--accent));
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  text-shadow: 0 5px 15px rgba(0, 245, 255, 0.3);
}

.hero p {
  font-size: 1.2rem;
  max-width: 700px;
  margin: 0 auto 2.5rem;
  color: var(--gray);
}

.hero-buttons {
  display: flex;
  justify-content: center;
  gap: 1.5rem;
  margin-top: 2rem;
}

.btn-large {
  padding: 1rem 2.5rem;
  font-size: 1.1rem;
}

/* Features Section */
.features {
  padding: 6rem 5%;
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
  max-width: 600px;
  margin: 0 auto;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
  max-width: 1200px;
  margin: 0 auto;
}

.feature-card {
  background: var(--card-bg);
  border-radius: 15px;
  padding: 2rem;
  transition: all 0.3s ease;
  border: 1px solid rgba(0, 245, 255, 0.1);
  position: relative;
  overflow: hidden;
}

.feature-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, rgba(0, 245, 255, 0.05) 0%, transparent 50%);
  z-index: -1;
}

.feature-card:hover {
  transform: translateY(-10px);
  box-shadow: 0 10px 30px rgba(0, 245, 255, 0.2);
  border-color: rgba(0, 245, 255, 0.3);
}

.feature-icon {
  font-size: 2.5rem;
  margin-bottom: 1.5rem;
  color: var(--primary);
  text-shadow: var(--glow);
}

.feature-card h3 {
  font-size: 1.5rem;
  margin-bottom: 1rem;
  color: var(--light);
}

.feature-card p {
  color: var(--gray);
}

/* How It Works */
.how-it-works {
  padding: 6rem 5%;
}

.steps {
  display: flex;
  justify-content: space-between;
  max-width: 1000px;
  margin: 0 auto;
  position: relative;
}

.steps::before {
  content: '';
  position: absolute;
  top: 40px;
  left: 10%;
  width: 80%;
  height: 2px;
  background: linear-gradient(to right, var(--primary), var(--accent));
  z-index: 0;
}

.step {
  text-align: center;
  position: relative;
  z-index: 1;
  flex: 1;
  padding: 0 1rem;
}

.step-number {
  width: 80px;
  height: 80px;
  background: var(--card-bg);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 1.5rem;
  font-size: 1.8rem;
  font-weight: 700;
  color: var(--primary);
  border: 2px solid var(--primary);
  box-shadow: var(--glow);
}

.step h3 {
  margin-bottom: 1rem;
  color: var(--light);
}

.step p {
  color: var(--gray);
}

/* CTA Section */
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
@media (max-width: 768px) {
  header {
    flex-direction: column;
    padding: 1rem 5%;
  }
  
  nav ul {
    margin: 1rem 0;
  }
  
  nav ul li {
    margin: 0 0.5rem;
  }
  
  .auth-buttons {
    margin-top: 1rem;
  }
  
  .hero h1 {
    font-size: 2.5rem;
  }
  
  .hero-buttons {
    flex-direction: column;
    align-items: center;
  }
  
  .steps {
    flex-direction: column;
    gap: 3rem;
  }
  
  .steps::before {
    display: none;
  }
}
</style>