<template>
  <app-layout>
    <div class="scenario-list">
      <div class="page-header">
        <h1>Git 场景练习</h1>
        <p class="description">选择一个场景开始练习 Git 操作</p>
      </div>

      <div class="scenarios-grid">
        <el-card 
          v-for="scenario in scenarios" 
          :key="scenario.id" 
          class="scenario-card"
          @click="navigateToScenario(scenario.id)"
        >
          <template #header>
            <div class="scenario-header">
              <h3>{{ scenario.title }}</h3>
              <el-tag size="small" :type="getTagType(scenario)">
                {{ getStepCount(scenario) }} 个步骤
              </el-tag>
            </div>
          </template>
          <div class="scenario-content">
            <p>{{ scenario.description }}</p>
            <div class="scenario-steps">
              <el-steps :active="1" simple>
                <el-step 
                  v-for="(step, index) in scenario.steps.slice(0, 3)" 
                  :key="index"
                  :title="step.title"
                />
              </el-steps>
            </div>
          </div>
        </el-card>
      </div>
    </div>
  </app-layout>
</template>

<script setup>
import { useRouter } from 'vue-router'
import AppLayout from '../common/AppLayout.vue'
import scenarios from '@/data/scenarios'

const router = useRouter()

const navigateToScenario = (id) => {
  router.push(`/scenarios/${id}`)
}

const getStepCount = (scenario) => {
  return scenario.steps.length
}

const getTagType = (scenario) => {
  const count = getStepCount(scenario)
  if (count <= 3) return 'success'
  if (count <= 5) return 'warning'
  return 'danger'
}
</script>

<style lang="scss" scoped>
.scenario-list {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;

  .page-header {
    margin-bottom: 30px;
    text-align: center;

    h1 {
      margin-bottom: 10px;
      color: var(--el-text-color-primary);
      font-size: 32px;
    }

    .description {
      color: var(--el-text-color-secondary);
      font-size: 16px;
    }
  }

  .scenarios-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
    gap: 24px;
  }

  .scenario-card {
    cursor: pointer;
    transition: all 0.3s ease;

    &:hover {
      transform: translateY(-5px);
      box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
    }

    .scenario-header {
      display: flex;
      justify-content: space-between;
      align-items: center;

      h3 {
        margin: 0;
        color: var(--el-text-color-primary);
        font-size: 18px;
      }
    }

    .scenario-content {
      p {
        margin: 0 0 16px;
        color: var(--el-text-color-secondary);
        line-height: 1.5;
      }

      .scenario-steps {
        margin-top: 20px;
        padding-top: 16px;
        border-top: 1px solid var(--el-border-color-lighter);
      }
    }
  }
}
</style>
