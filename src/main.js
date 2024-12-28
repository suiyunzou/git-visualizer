import { createApp } from 'vue'
import { createStore } from 'vuex'
import { createRouter, createWebHistory } from 'vue-router'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import './style.css'
import App from './App.vue'

// 路由配置
const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'Home',
      component: () => import('./components/git/GitVisualizerHome.vue')
    },
    {
      path: '/tutorial',
      name: 'Tutorial',
      component: () => import('./components/tutorial/GitTutorial.vue')
    },
    {
      path: '/practice',
      name: 'Practice',
      component: () => import('./components/git/GitCommandPractice.vue')
    }
  ]
})

// Vuex store
const store = createStore({
  state() {
    return {
      currentLesson: null,
      progress: {},
      gitState: null
    }
  },
  mutations: {
    setCurrentLesson(state, lesson) {
      state.currentLesson = lesson
    },
    updateProgress(state, { lessonId, progress }) {
      state.progress[lessonId] = progress
    },
    updateGitState(state, newState) {
      state.gitState = newState
    }
  }
})

const app = createApp(App)

// 使用插件
app.use(router)
app.use(store)
app.use(ElementPlus)

// 挂载应用
app.mount('#app')
