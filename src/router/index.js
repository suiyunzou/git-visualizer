import { createRouter, createWebHistory } from 'vue-router'
import GitVisualizerHome from '../components/git/GitVisualizerHome.vue'
import GitTutorial from '../components/tutorial/GitTutorial.vue'
import GitPractice from '../components/practice/GitPractice.vue'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: GitVisualizerHome
  },
  {
    path: '/tutorial',
    name: 'Tutorial',
    component: GitTutorial
  },
  {
    path: '/practice',
    name: 'Practice',
    component: GitPractice
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
