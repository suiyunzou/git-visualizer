`<template>
  <section class="hero">
    <div class="hero-content">
      <h1 class="hero-title">
        通过可视化方式
        <span class="highlight">轻松学习 Git</span>
      </h1>
      <p class="hero-description">
        无论你是初学者还是有经验的开发者，Git Visualizer 都能帮助你更好地理解和掌握 Git 的工作原理
      </p>
      <div class="hero-actions">
        <el-button type="primary" size="large" @click="startLearning">
          开始学习
          <el-icon class="el-icon--right"><ArrowRight /></el-icon>
        </el-button>
        <el-button size="large" @click="watchDemo">
          观看演示
          <el-icon class="el-icon--right"><VideoPlay /></el-icon>
        </el-button>
      </div>
    </div>
    <div class="hero-visual">
      <div class="git-preview">
        <!-- 这里将放置Git可视化预览 -->
        <svg ref="previewSvg" class="preview-svg"></svg>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ArrowRight, VideoPlay } from '@element-plus/icons-vue'
import * as d3 from 'd3'

const router = useRouter()
const previewSvg = ref(null)

const startLearning = () => {
  router.push('/tutorial')
}

const watchDemo = () => {
  // 实现演示视频逻辑
}

onMounted(() => {
  // 创建简单的预览动画
  const svg = d3.select(previewSvg.value)
  const width = 500
  const height = 300

  svg
    .attr('width', width)
    .attr('height', height)
    .attr('viewBox', [0, 0, width, height])

  // 创建示例数据
  const nodes = [
    { id: 1, label: 'main' },
    { id: 2, label: 'feature' },
    { id: 3, label: 'commit 1' },
    { id: 4, label: 'commit 2' }
  ]

  const links = [
    { source: 1, target: 3 },
    { source: 3, target: 4 },
    { source: 2, target: 4 }
  ]

  // 创建力导向图
  const simulation = d3.forceSimulation(nodes)
    .force('link', d3.forceLink(links).id(d => d.id))
    .force('charge', d3.forceManyBody().strength(-100))
    .force('center', d3.forceCenter(width / 2, height / 2))

  // 绘制连接线
  const link = svg.append('g')
    .selectAll('line')
    .data(links)
    .join('line')
    .attr('stroke', '#999')
    .attr('stroke-opacity', 0.6)
    .attr('stroke-width', 2)

  // 绘制节点
  const node = svg.append('g')
    .selectAll('circle')
    .data(nodes)
    .join('circle')
    .attr('r', 8)
    .attr('fill', '#2196f3')

  // 添加节点标签
  const label = svg.append('g')
    .selectAll('text')
    .data(nodes)
    .join('text')
    .text(d => d.label)
    .attr('font-size', 12)
    .attr('dx', 12)
    .attr('dy', 4)

  simulation.on('tick', () => {
    link
      .attr('x1', d => d.source.x)
      .attr('y1', d => d.source.y)
      .attr('x2', d => d.target.x)
      .attr('y2', d => d.target.y)

    node
      .attr('cx', d => d.x)
      .attr('cy', d => d.y)

    label
      .attr('x', d => d.x)
      .attr('y', d => d.y)
  })
})
</script>

<style lang="scss" scoped>
.hero {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 48px;
  padding: 48px 0;
  min-height: calc(100vh - 64px);
  align-items: center;

  &-content {
    animation: fadeIn 0.6s ease-out;
  }

  &-title {
    font-size: 3rem;
    line-height: 1.2;
    margin-bottom: 24px;
    
    .highlight {
      color: var(--primary-color);
      display: block;
    }
  }

  &-description {
    font-size: 1.25rem;
    color: var(--text-secondary);
    margin-bottom: 32px;
    max-width: 500px;
  }

  &-actions {
    display: flex;
    gap: 16px;
  }

  &-visual {
    .git-preview {
      background: var(--background-white);
      border-radius: var(--border-radius);
      padding: 24px;
      box-shadow: 0 4px 24px rgba(0, 0, 0, 0.1);
      
      .preview-svg {
        width: 100%;
        height: 300px;
      }
    }
  }
}

@media (max-width: 768px) {
  .hero {
    grid-template-columns: 1fr;
    padding: 24px 0;
    
    &-visual {
      order: -1;
    }
    
    &-title {
      font-size: 2rem;
    }
    
    &-description {
      font-size: 1rem;
    }
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>`
