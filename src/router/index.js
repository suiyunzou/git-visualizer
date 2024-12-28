import { createRouter, createWebHistory } from 'vue-router'
import GitVisualizerHome from '../components/git/GitVisualizerHome.vue'
import GitTutorial from '../components/tutorial/GitTutorial.vue'

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
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
