`<template>
  <app-layout>
    <div class="tutorial-container">
      <h1>Git 教程</h1>
      <p>教程内容正在建设中...</p>
    </div>
  </app-layout>
</template>

<script>
import AppLayout from '../common/AppLayout.vue'

export default {
  name: 'TutorialView',
  components: {
    AppLayout
  }
}
</script>

<style scoped>
.tutorial-container {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}
</style>`
