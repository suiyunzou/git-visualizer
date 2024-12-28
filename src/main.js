import { createApp } from 'vue'
import { createStore } from 'vuex'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import './style.css'
import App from './App.vue'
import router from './router'

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
app.use(router)
app.use(store)
app.use(ElementPlus)
app.mount('#app')
