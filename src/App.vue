<template>
  <div id="app">
    <router-view />
  </div>
</template>

<script>
export default {
  name: 'App'
}
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  background: #050510;
  color: #f0f8ff;
  overflow-x: hidden;
}

:root {
  --primary: #00f5ff;
  --secondary: #8a2be2;
  --accent: #ff00ff;
  --dark: #0a0a1a;
  --darker: #050510;
  --light: #f0f8ff;
  --gray: #a0a0c0;
  --card-bg: rgba(16, 16, 32, 0.7);
  --glow: 0 0 10px var(--primary), 0 0 20px var(--primary);
}
</style>