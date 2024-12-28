<template>
  <router-view></router-view>
</template>

<script>
export default {
  name: 'App'
}
</script>

<style lang="scss">
:root {
  // Light theme variables
  --primary-color: #2196f3;
  --secondary-color: #1976d2;
  --text-primary: #333333;
  --text-secondary: #666666;
  --background-white: #ffffff;
  --background-light: #f5f5f5;
  --border-color: #e0e0e0;
  --border-radius: 4px;
  --transition-quick: 0.3s ease;
}

[data-theme="dark"] {
  // Dark theme variables
  --primary-color: #64b5f6;
  --secondary-color: #42a5f5;
  --text-primary: #ffffff;
  --text-secondary: #b0b0b0;
  --background-white: #1e1e1e;
  --background-light: #2d2d2d;
  --border-color: #404040;
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen,
    Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
  line-height: 1.6;
  color: var(--text-primary);
  background-color: var(--background-light);
}

.container {
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
}

.card {
  background: var(--background-white);
  border-radius: var(--border-radius);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  padding: 1.5rem;
}
</style>
