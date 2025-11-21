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
          <li><a href="#">Debt Plans</a></li>
          <li><a href="#">Payments</a></li>
        </ul>
      </nav>
      <div class="auth-buttons">
        <button class="btn btn-outline" @click="logout">Log Out</button>
      </div>
    </header>

    <main class="dashboard-main">
      <div class="container">
        <h1>Welcome to Your Dashboard</h1>
        <p>This is where your debt management tools will be.</p>
        <div class="dashboard-cards">
          <div class="dashboard-card">
            <h3>Create Debt Plan</h3>
            <p>Start a new debt payoff strategy</p>
            <button class="btn btn-primary">Get Started</button>
          </div>
          <div class="dashboard-card">
            <h3>View Progress</h3>
            <p>Track your debt reduction journey</p>
            <button class="btn btn-outline">View Progress</button>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script>
export default {
  name: 'DashboardView',
  methods: {
    logout() {
      this.$router.push('/');
    }
  }
}
</script>

<style scoped>
.dashboard-main {
  padding: 8rem 5% 4rem;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
}

.dashboard-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
  margin-top: 3rem;
}

.dashboard-card {
  background: var(--card-bg);
  padding: 2rem;
  border-radius: 15px;
  border: 1px solid rgba(0, 245, 255, 0.2);
  text-align: center;
}

.dashboard-card h3 {
  font-size: 1.5rem;
  margin-bottom: 1rem;
  color: var(--light);
}

.dashboard-card p {
  color: var(--gray);
  margin-bottom: 1.5rem;
}
</style>