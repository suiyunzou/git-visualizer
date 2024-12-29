<template>
  <div class="app-layout">
    <header class="header">
      <div class="container header-content">
        <div class="logo">
          <router-link to="/" class="logo-link">
            <img src="/git-icon.svg" alt="Git Visualizer" />
            Git Visualizer
          </router-link>
        </div>
        
        <nav class="nav-links">
          <router-link to="/" class="nav-item" exact>
            首页
          </router-link>
          <router-link to="/tutorial" class="nav-item">
            教程
          </router-link>
          <router-link to="/practice" class="nav-item">
            实践
          </router-link>
          <router-link to="/scenarios" class="nav-item">
            场景
          </router-link>
        </nav>

        <div class="right-section">
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

    <main class="app-main">
      <div class="container">
        <slot></slot>
      </div>
    </main>

    <footer class="app-footer">
      <div class="footer-content">
        <div class="footer-section">
          <h3>Git Visualizer</h3>
          <p>通过可视化方式轻松学习Git</p>
        </div>
        <div class="footer-section">
          <h3>快速链接</h3>
          <ul>
            <li><router-link to="/tutorial">教程</router-link></li>
            <li><router-link to="/practice">实践</router-link></li>
            <li><router-link to="/scenarios">场景</router-link></li>
          </ul>
        </div>
        <div class="footer-section">
          <h3>资源</h3>
          <ul>
            <li><a href="https://git-scm.com/doc" target="_blank">Git 文档</a></li>
            <li><a href="https://stackoverflow.com/questions/tagged/git" target="_blank">常见问题</a></li>
            <li><a href="https://github.com/suiyunzou/git-visualizer" target="_blank">关于我们</a></li>
          </ul>
        </div>
      </div>
      <div class="copyright">
        &copy; {{ currentYear }} Git Visualizer. All rights reserved.
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

  .header {
    background: var(--background-white);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    position: sticky;
    top: 0;
    z-index: 100;
    height: 60px;
    display: flex;
    align-items: center;
  }

  .header-content {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 2rem;
    width: 100%;
    height: 100%;

    .logo {
      .logo-link {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        font-size: 1.25rem;
        font-weight: 600;
        color: var(--text-primary);
        text-decoration: none;

        img {
          height: 24px;
          width: 24px;
        }
      }
    }

    .nav-links {
      display: flex;
      align-items: center;
      gap: 2rem;

      a {
        color: var(--text-secondary);
        text-decoration: none;
        font-size: 1rem;
        transition: color 0.3s ease;
        padding: 0.5rem 1rem;
        border-radius: 4px;

        &:hover {
          color: var(--primary-color);
          background: var(--background-light);
        }

        &.router-link-active {
          color: var(--primary-color);
          font-weight: 500;
        }
      }
    }

    .right-section {
      display: flex;
      align-items: center;
      gap: 1rem;

      .theme-switch {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        color: var(--text-secondary);
      }
    }
  }

  .app-main {
    flex: 1;
  }

  .app-footer {
    background: var(--background-light);
    padding: 0.75rem 0;
    font-size: 0.875rem;
    border-top: 1px solid var(--border-color);

    .footer-content {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 1rem;
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 2rem;

      .footer-section {
        h3 {
          margin: 0 0 0.25rem;
          font-size: 0.875rem;
          font-weight: 600;
          color: var(--text-primary);
        }

        p {
          margin: 0;
          font-size: 0.75rem;
          color: var(--text-secondary);
        }

        ul {
          list-style: none;
          padding: 0;
          margin: 0;

          li {
            margin-bottom: 0.125rem;
            font-size: 0.75rem;
            
            a {
              color: var(--text-secondary);
              text-decoration: none;
              
              &:hover {
                color: var(--primary-color);
              }
            }
          }
        }
      }
    }

    .copyright {
      text-align: center;
      color: var(--text-secondary);
      margin-top: 0.5rem;
      padding-top: 0.5rem;
      border-top: 1px solid var(--border-color);
      font-size: 0.75rem;
    }
  }
}
</style>
