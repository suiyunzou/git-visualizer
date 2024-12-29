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
  --background-secondary: #f0f0f0;
  --border-color: #e0e0e0;
  --border-radius: 4px;
  --transition-quick: 0.3s ease;
  --card-background: #ffffff;
  --terminal-background: #1e1e1e;
  --terminal-header: #323232;
}

[data-theme="dark"] {
  // Dark theme variables
  --primary-color: #64b5f6;
  --secondary-color: #42a5f5;
  --text-primary: #ffffff;
  --text-secondary: #b0b0b0;
  --background-white: #1e1e1e;
  --background-light: #2d2d2d;
  --background-secondary: #333333;
  --border-color: #404040;
  --card-background: #2d2d2d;
  --terminal-background: #1e1e1e;
  --terminal-header: #323232;
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
  background: var(--card-background);
  border-radius: var(--border-radius);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  padding: 1.5rem;
}

// Element Plus 暗色模式覆盖
.el-card {
  --el-card-bg-color: var(--card-background) !important;
  --el-border-color: var(--border-color) !important;
  color: var(--text-primary) !important;
  
  .el-card__header {
    border-bottom-color: var(--border-color) !important;
  }
}

.el-tabs {
  --el-tabs-header-bg-color: var(--card-background) !important;
  --el-bg-color-overlay: var(--card-background) !important;
  
  .el-tabs__nav-wrap::after {
    background-color: var(--border-color) !important;
  }
  
  .el-tabs__item {
    color: var(--text-secondary) !important;
    &.is-active {
      color: var(--primary-color) !important;
    }
  }
}

.el-button {
  &:not(.el-button--primary):not(.el-button--success):not(.el-button--warning):not(.el-button--danger) {
    background: var(--background-secondary) !important;
    border-color: var(--border-color) !important;
    color: var(--text-primary) !important;
  }
}

.el-input {
  --el-input-bg-color: var(--background-secondary) !important;
}

.el-select {
  --el-select-bg-color: var(--background-secondary) !important;
}

.el-dialog {
  --el-dialog-bg-color: var(--card-background) !important;
  --el-dialog-border-color: var(--border-color) !important;
}

.el-dropdown-menu {
  --el-bg-color: var(--card-background) !important;
  --el-border-color: var(--border-color) !important;
}

.el-tree {
  --el-tree-node-bg-color: var(--card-background) !important;
  --el-tree-node-hover-bg-color: var(--background-secondary) !important;
  color: var(--text-primary) !important;
}

.el-step {
  .el-step__title {
    color: var(--text-secondary) !important;
    &.is-active {
      color: var(--primary-color) !important;
    }
    &.is-success {
      color: var(--el-color-success) !important;
    }
  }
}

.el-collapse {
  --el-collapse-header-bg-color: var(--card-background) !important;
  --el-collapse-content-bg-color: var(--card-background) !important;
  border-color: var(--border-color) !important;
  
  .el-collapse-item__header {
    color: var(--text-primary) !important;
    border-bottom-color: var(--border-color) !important;
  }
  
  .el-collapse-item__content {
    color: var(--text-secondary) !important;
  }
}

.el-timeline {
  .el-timeline-item__content {
    color: var(--text-primary) !important;
  }
  
  .el-timeline-item__timestamp {
    color: var(--text-secondary) !important;
  }
}
</style>
