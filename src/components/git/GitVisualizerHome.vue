<template>
  <app-layout>
    <home-hero />
    <div class="git-visualizer">
      <div class="visualization-container card">
        <h2>Git 工作区</h2>
        <git-graph class="graph-component" />
      </div>

      <div class="features-section">
        <el-row :gutter="20">
          <el-col :span="8">
            <div class="feature-card">
              <el-icon class="feature-icon"><Monitor /></el-icon>
              <h3>可视化学习</h3>
              <p>通过直观的可视化界面，轻松理解Git的工作原理和操作流程</p>
            </div>
          </el-col>
          <el-col :span="8">
            <div class="feature-card">
              <el-icon class="feature-icon"><Operation /></el-icon>
              <h3>实践练习</h3>
              <p>在安全的环境中练习Git命令，掌握版本控制的精髓</p>
            </div>
          </el-col>
          <el-col :span="8">
            <div class="feature-card">
              <el-icon class="feature-icon"><Reading /></el-icon>
              <h3>循序渐进</h3>
              <p>从基础到进阶，系统地学习Git的各项功能和最佳实践</p>
            </div>
          </el-col>
        </el-row>
      </div>
    </div>
  </app-layout>
</template>

<script>
import { ref } from 'vue'
import AppLayout from '../common/AppLayout.vue'
import HomeHero from '../home/HomeHero.vue'
import GitGraph from './GitGraph.vue'
import { Monitor, Operation, Reading } from '@element-plus/icons-vue'

export default {
  name: 'GitVisualizerHome',
  components: {
    AppLayout,
    HomeHero,
    GitGraph
  }
}
</script>

<style lang="scss" scoped>
.git-visualizer {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.visualization-container {
  margin-bottom: 40px;

  h2 {
    margin-bottom: 20px;
    color: var(--text-primary);
  }

  .graph-component {
    height: 600px;
    border: 1px solid var(--border-color);
    border-radius: var(--border-radius);
  }
}

.features-section {
  .feature-card {
    background: var(--background-white);
    padding: 24px;
    border-radius: var(--border-radius);
    text-align: center;
    height: 100%;
    transition: transform 0.3s ease, box-shadow 0.3s ease;

    &:hover {
      transform: translateY(-5px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    }

    .feature-icon {
      font-size: 48px;
      color: var(--primary-color);
      margin-bottom: 16px;
    }

    h3 {
      color: var(--text-primary);
      margin-bottom: 12px;
    }

    p {
      color: var(--text-secondary);
      font-size: 14px;
      line-height: 1.6;
    }
  }
}

@media (max-width: 768px) {
  .features-section {
    .el-col {
      margin-bottom: 20px;
    }
  }
}
</style>
