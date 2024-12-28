<template>
  <div class="app-layout">
    <header class="header">
      <div class="container header-content">
        <div class="logo">
          <router-link to="/" class="logo-link">
            <img src="/git-icon.svg" alt="Git Visualizer" class="logo-img" />
            Git Visualizer
          </router-link>
        </div>
        
        <nav class="nav-menu">
          <router-link to="/" class="nav-item" exact>
            <el-icon><House /></el-icon>
            首页
          </router-link>
          <router-link to="/tutorial" class="nav-item">
            <el-icon><Reading /></el-icon>
            教程
          </router-link>
          <router-link to="/practice" class="nav-item">
            <el-icon><Monitor /></el-icon>
            实践
          </router-link>
          <router-link to="/scenarios" class="nav-item">
            <el-icon><Operation /></el-icon>
            场景
          </router-link>
        </nav>

        <div class="user-actions">
          <el-input
            placeholder="搜索..."
            prefix-icon="Search"
            size="small"
            class="search-input"
          />
          <el-switch
            v-model="isDarkMode"
            active-text="暗色"
            inactive-text="亮色"
            @change="toggleTheme"
            class="theme-switch"
          />
        </div>
      </div>
    </header>

    <main class="main-content">
      <div class="container">
        <slot></slot>
      </div>
    </main>

    <footer class="footer">
      <div class="container">
        <div class="footer-content">
          <div class="footer-section">
            <h3>Git Visualizer</h3>
            <p>通过可视化方式轻松学习Git</p>
          </div>
          <div class="footer-section">
            <h4>快速链接</h4>
            <router-link to="/tutorial">教程</router-link>
            <router-link to="/practice">实践</router-link>
            <router-link to="/scenarios">场景</router-link>
          </div>
          <div class="footer-section">
            <h4>资源</h4>
            <a href="#" target="_blank">Git 文档</a>
            <a href="#" target="_blank">常见问题</a>
            <a href="#" target="_blank">关于我们</a>
          </div>
        </div>
        <div class="footer-bottom">
          <p>&copy; {{ currentYear }} Git Visualizer. All rights reserved.</p>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { House, Reading, Monitor, Operation, Search } from '@element-plus/icons-vue'

const isDarkMode = ref(false)
const currentYear = computed(() => new Date().getFullYear())

const toggleTheme = (value) => {
  document.documentElement.setAttribute('data-theme', value ? 'dark' : 'light')
}
</script>

<style lang="scss" scoped>
.app-layout {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.header {
  background: var(--background-white);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  position: sticky;
  top: 0;
  z-index: 100;
}

.header-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 0;
}

.logo {
  .logo-link {
    display: flex;
    align-items: center;
    text-decoration: none;
    color: var(--text-primary);
    font-size: 1.5rem;
    font-weight: bold;
    
    .logo-img {
      height: 32px;
      margin-right: 0.5rem;
    }
  }
}

.nav-menu {
  display: flex;
  gap: 1.5rem;
  align-items: center;

  .nav-item {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    text-decoration: none;
    color: var(--text-secondary);
    transition: color 0.3s ease;
    font-size: 1rem;

    &:hover,
    &.router-link-active {
      color: var(--primary-color);
    }

    .el-icon {
      font-size: 1.2em;
    }
  }
}

.user-actions {
  display: flex;
  align-items: center;
  gap: 1rem;

  .search-input {
    width: 200px;
  }

  .theme-switch {
    margin-left: 1rem;
  }
}

.main-content {
  flex: 1;
  padding: 2rem 0;
  background: var(--background-light);
}

.footer {
  background: var(--background-white);
  padding: 3rem 0 1.5rem;
  margin-top: auto;
}

.footer-content {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr;
  gap: 2rem;
  margin-bottom: 2rem;

  .footer-section {
    h3, h4 {
      color: var(--text-primary);
      margin-bottom: 1rem;
    }

    p {
      color: var(--text-secondary);
    }

    a {
      display: block;
      color: var(--text-secondary);
      text-decoration: none;
      margin-bottom: 0.5rem;
      transition: color 0.3s ease;

      &:hover {
        color: var(--primary-color);
      }
    }
  }
}

.footer-bottom {
  border-top: 1px solid var(--border-color);
  padding-top: 1.5rem;
  text-align: center;
  color: var(--text-secondary);
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
}

@media (max-width: 768px) {
  .header-content {
    flex-direction: column;
    gap: 1rem;
    padding: 1rem;
  }

  .nav-menu {
    width: 100%;
    justify-content: center;
  }

  .user-actions {
    width: 100%;
    justify-content: center;
  }

  .footer-content {
    grid-template-columns: 1fr;
    text-align: center;
  }
}
</style>
